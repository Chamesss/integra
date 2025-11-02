import { WooCommerceService } from "../api/woocommerce.service";
import { CoreService } from "./core.service";
import { CoreRepo } from "../repositories/core.repo";
import { IResult, IResults, QueryParams } from "../types/core.types";
import { Category } from "../models";
import { InferAttributes, Op } from "sequelize";
import { CreateCategoryDto } from "../types/category.types";
import { syncManager } from "../utils/sync-manager";
import { logger } from "../utils/logger";

export class CategoryService extends CoreService<Category, any, any, any> {
  private woo: WooCommerceService;

  constructor(repo: CoreRepo<Category>) {
    super(repo);
    this.woo = new WooCommerceService();
  }

  async syncCategoriesFromWoo(
    queryParams: QueryParams
  ): Promise<IResults<Category>> {
    try {
      // Try to sync from WooCommerce
      return await syncManager.executeSyncOperation("categories", () =>
        this._performCategorySync(queryParams)
      );
    } catch (error: any) {
      logger.warn(
        "Failed to sync categories from WooCommerce, falling back to local data:",
        error.message
      );

      // Check if it's a network-related error
      const isNetworkError = this._isNetworkError(error);

      if (isNetworkError) {
        // Fallback to local database
        logger.info("Network error detected, returning local categories");
        const localCategories = await this.getAll(queryParams);
        return {
          ...localCategories,
          success: true,
          message:
            "Données locales (Hors ligne) - Dernière synchronisation interrompue",
        };
      }

      // For non-network errors, throw the original error
      throw error;
    }
  }

  private _isNetworkError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || "";
    const networkErrorKeywords = [
      "network",
      "fetch",
      "getaddrinfo",
      "enotfound",
      "econnrefused",
      "timeout",
      "offline",
      "internet",
      "connection",
      "unreachable",
    ];

    return networkErrorKeywords.some((keyword) =>
      errorMessage.includes(keyword)
    );
  }

  private async _performCategorySync(
    queryParams: QueryParams
  ): Promise<IResults<Category>> {
    return this.repo.withTransaction(async (transaction) => {
      try {
        logger.info("Starting category sync from WooCommerce...");

        // Fetch all categories from WooCommerce in batches
        let remoteCategories: InferAttributes<Category>[] = [];
        let page = 1;
        const perPage = 100;

        while (true) {
          const batch = await this.woo.getCategories({
            per_page: perPage,
            page,
          });
          if (!Array.isArray(batch) || batch.length === 0) break;
          remoteCategories = remoteCategories.concat(batch);
          if (batch.length < perPage) break;
          page++;
        }

        const remoteIds = remoteCategories.map((cat) => cat.id);
        logger.info(
          `Found ${remoteCategories.length} categories from WooCommerce`
        );

        // Process categories in hierarchy order (parents first)
        const total = remoteCategories.length;
        const processed = new Set<number>();
        let iterations = 0;
        const maxIterations = total + 10; // Safety valve

        while (processed.size < total && iterations < maxIterations) {
          let progress = 0;

          for (const cat of remoteCategories) {
            if (processed.has(cat.id)) continue;

            const parentId = cat.parent;
            const parentOK =
              parentId == null || parentId === 0 || processed.has(parentId);

            if (parentOK) {
              const data = {
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                parent: cat.parent === 0 ? null : cat.parent,
                description: cat.description,
                display: cat.display,
                image: cat.image,
                count: cat.count,
              };

              await Category.upsert(data, { transaction });
              processed.add(cat.id);
              progress++;
            }
          }

          if (progress === 0) {
            logger.warn(
              "No progress made in category processing, breaking loop"
            );
            break;
          }

          iterations++;
        }

        logger.info(`Processed ${processed.size} categories`);

        // Clean up deleted categories
        const localRecords = await Category.findAll({
          attributes: ["id"],
          paranoid: false,
          transaction,
        });

        const localIds = localRecords.map((r) => r.get("id") as number);
        const idsToDelete = localIds.filter((id) => !remoteIds.includes(id));

        let deletedCount = 0;
        if (idsToDelete.length > 0) {
          logger.info(`Deleting ${idsToDelete.length} obsolete categories`);

          // Delete in smaller chunks to prevent locks
          const chunkSize = 100;
          for (let i = 0; i < idsToDelete.length; i += chunkSize) {
            const chunk = idsToDelete.slice(i, i + chunkSize);
            const result = await Category.destroy({
              where: { id: { [Op.in]: chunk } },
              force: true,
              transaction,
            });
            deletedCount += result;
          }
        }

        logger.info(
          `Category sync completed. Processed: ${processed.size}, Deleted: ${deletedCount}`
        );

        // Return the synced data
        const allCategories = await this.repo.getAll({ ...queryParams });
        return {
          count: allCategories.count,
          rows: allCategories.rows,
          success: true,
          message: `Sync completed successfully. Processed: ${processed.size}, Deleted: ${deletedCount}`,
        };
      } catch (error: any) {
        logger.error("Error syncing categories:", error);
        throw error; // Let the transaction wrapper handle rollback
      }
    });
  }

  async create(data: CreateCategoryDto): Promise<IResult<Category>> {
    try {
      const { id, ...updateData } = data;
      const wooCategory = await this.woo.createCategory(updateData);
      await this.repo.save({
        id: wooCategory.id,
        name: wooCategory.name,
        slug: wooCategory.slug,
        parent: wooCategory.parent,
        description: wooCategory.description,
        display: wooCategory.display,
        image: wooCategory.image,
        count: wooCategory.count,
      } as Partial<Category>);

      return {
        success: true,
        data: wooCategory,
        message: "Catégorie créée avec succès.",
      };
    } catch (error: any) {
      logger.error("Error creating category:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Échec de la création de la catégorie.";
      return {
        success: false,
        message: msg,
      };
    }
  }

  async updateCategory(data: CreateCategoryDto): Promise<IResult<Category>> {
    const { id, ...updateData } = data;
    if (!id) {
      return {
        success: false,
        message: "ID de la catégorie manquant.",
      };
    }
    return this.woo
      .updateCategory(id, updateData)
      .then(() => this.repo.update(id, updateData))
      .then((updatedCategory) => ({
        success: true,
        data: updatedCategory as Category,
        message: "Catégorie mise à jour avec succès.",
      }))
      .catch((error: any) => {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Échec de la mise à jour de la catégorie.";
        return {
          success: false,
          message: msg,
        };
      });
  }

  async deleteCategory(id: number): Promise<IResult<Category>> {
    if (!id) {
      return {
        success: false,
        message: "ID de la catégorie manquant.",
      };
    }

    return this.woo
      .deleteCategory(id)
      .then(() => this.repo.delete(id))
      .then(() => ({
        success: true,
        message: "Catégorie supprimée avec succès.",
      }))
      .catch((error: any) => {
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Échec de la suppression de la catégorie.";
        return {
          success: false,
          message: msg,
        };
      });
  }

  async batchDelete(ids: number[]): Promise<IResult<Category>> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "Aucun ID de catégorie fourni pour la suppression.",
      };
    }

    return this.woo
      .batchDeleteCategories(ids)
      .then(() => this.repo.deleteMany(ids, {}))
      .then(() => ({
        success: true,
        message: "Catégories supprimées avec succès.",
      }))
      .catch((error: any) => {
        return {
          success: false,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Échec de la suppression des catégories.",
        };
      });
  }
}
