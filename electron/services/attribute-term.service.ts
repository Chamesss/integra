import { WooCommerceService } from "../api/woocommerce.service";
import { CoreService } from "./core.service";
import { CoreRepo } from "../repositories/core.repo";
import { IResult, IResults, QueryParams } from "../types/core.types";
import { AttributeTerm } from "../models";
import { Op, Transaction } from "sequelize";
import { sequelize } from "../database/db";
import {
  CreateAttributeTermDto,
  UpdateAttributeTermDto,
  AttributeTermQueryDto,
  BatchUpdateAttributeTermsDto,
} from "../types/attribute.types";
import { logger } from "../utils/logger";
import { syncManager } from "../utils/sync-manager";

export class AttributeTermService extends CoreService<
  AttributeTerm,
  CreateAttributeTermDto,
  AttributeTermQueryDto,
  UpdateAttributeTermDto
> {
  private woo: WooCommerceService;

  constructor(repo: CoreRepo<AttributeTerm>) {
    super(repo);
    this.woo = new WooCommerceService();
  }

  async syncAttributeTermsFromWoo(
    attributeId: number,
    queryParams: QueryParams
  ): Promise<IResults<AttributeTerm>> {
    return syncManager.executeSyncOperation("attributes", () =>
      this._performAttributeSync(attributeId, queryParams)
    );
  }

  async _performAttributeSync(
    attributeId: number,
    queryParams: QueryParams
  ): Promise<IResults<AttributeTerm>> {
    return this.repo.withTransaction(async (transaction) => {
      // Get all attribute terms for this attribute from WooCommerce
      const remoteTerms = await this.woo.getProductAttributeTerms(attributeId);

      logger.info(
        `Syncing ${remoteTerms.length} terms for attribute ID ${attributeId}`
      );
      // log the data
      const remoteIds = new Set(remoteTerms.map((term) => term.id));

      // Upsert remote terms
      if (remoteTerms.length > 0) {
        await Promise.all(
          remoteTerms.map((term) =>
            this.repo.upsert(
              {
                id: term.id,
                name: term.name,
                slug: term.slug,
                description: term.description || "",
                menu_order: term.menu_order || 0,
                count: term.count || 0,
                attribute_id: attributeId,
              },
              {
                transaction,
              }
            )
          )
        );
      }

      // Get all local term IDs for this attribute
      const localTerms = await AttributeTerm.findAll({
        where: { attribute_id: attributeId },
        attributes: ["id"],
        transaction,
      });
      const localIds = new Set(localTerms.map((term) => term.id));

      // Determine which local terms to delete
      const idsToDelete: number[] = [];
      for (const localId of localIds) {
        if (!remoteIds.has(localId)) {
          idsToDelete.push(localId);
        }
      }

      // Delete terms that no longer exist in WooCommerce
      if (idsToDelete.length > 0) {
        await AttributeTerm.destroy({
          where: { id: { [Op.in]: idsToDelete } },
          transaction,
        });
      }

      // Return paginated results from the updated local DB
      return this.repo.getAll({ ...queryParams, transaction });
    });
  }

  async create(
    data: CreateAttributeTermDto,
    options?: any
  ): Promise<IResult<AttributeTerm>> {
    try {
      // Create in WooCommerce first
      const wooData = {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        menu_order: data.menu_order || 0,
      };

      const wooTerm = await this.woo.createProductAttributeTerm(
        data.attribute_id as number,
        wooData
      );

      // Then create locally with WooCommerce ID
      const localData: CreateAttributeTermDto = {
        ...data,
        id: wooTerm.id,
      };

      const result = await this.save(localData, {
        ...options,
      });
      return {
        success: true,
        data: result,
        message: "Attribute term created successfully",
      };
    } catch (error: any) {
      logger.error("Error creating attribute term:", error);
      return {
        success: false,
        error: error?.message || error,
        message: "Failed to create attribute term",
      };
    }
  }

  async updateAttributeTerm(
    data: UpdateAttributeTermDto
  ): Promise<IResult<AttributeTerm>> {
    try {
      const { id, ...updateData } = data;

      // Update in WooCommerce first
      const wooData = {
        name: updateData.name,
        slug: updateData.slug,
        description: updateData.description,
        menu_order: updateData.menu_order,
      };

      // Get the attribute_id for this term
      const existingTerm = await this.repo.getById(id.toString());
      if (!existingTerm) {
        throw new Error(`Attribute term with id ${id} not found`);
      }

      await this.woo.updateProductAttributeTerm(
        (existingTerm as any).attribute_id,
        id,
        wooData
      );

      // Then update locally
      const updated = await this.repo.update(id.toString(), updateData as any);
      return {
        success: true,
        data: updated as AttributeTerm,
        message: "Attribute term updated successfully",
      };
    } catch (error: any) {
      logger.error("Error updating attribute term:", error);
      return {
        success: false,
        error: error?.message || error,
        message: "Failed to update attribute term",
      };
    }
  }

  async deleteAttributeTerm(id: number): Promise<IResult<void>> {
    try {
      // Get the attribute_id for this term
      const existingTerm = await this.repo.getById(id.toString());
      if (!existingTerm) {
        throw new Error(`Attribute term with id ${id} not found`);
      }

      // Delete from WooCommerce first
      await this.woo.deleteProductAttributeTerm(
        (existingTerm as any).attribute_id,
        id
      );

      // Then delete locally
      await this.repo.delete(id.toString());
      return {
        success: true,
        data: undefined,
        message: "Attribute term deleted successfully",
      };
    } catch (error: any) {
      logger.error("Error deleting attribute term:", error);
      return {
        success: false,
        error: error?.message || error,
        message: "Failed to delete attribute term",
      };
    }
  }

  async batchDelete(ids: number[]): Promise<IResult<void>> {
    let transaction: Transaction | null = null;
    try {
      transaction = await sequelize.transaction();

      for (const id of ids) {
        try {
          // Get the attribute_id for this term
          const existingTerm = await this.repo.getById(id.toString());
          if (existingTerm) {
            // Delete from WooCommerce
            await this.woo.deleteProductAttributeTerm(
              (existingTerm as any).attribute_id,
              id
            );
          }
        } catch (error: any) {
          console.warn(
            `Failed to delete attribute term ${id} from WooCommerce:`,
            error?.message || error
          );
          // Continue with local deletion even if WooCommerce deletion fails
        }
      }

      // Delete locally
      await AttributeTerm.destroy({
        where: { id: { [Op.in]: ids } },
        force: true,
        transaction,
      });

      await transaction.commit();
      return {
        success: true,
        data: undefined,
        message: "Attribute terms deleted successfully",
      };
    } catch (error: any) {
      if (transaction) await transaction.rollback();
      logger.error("Error batch deleting attribute terms:", error);
      return {
        success: false,
        error: error?.message || error,
        message: "Failed to batch delete attribute terms",
      };
    }
  }

  async getAttributeTermsByAttributeId(
    attributeId: number,
    queryParams: AttributeTermQueryDto
  ): Promise<IResults<AttributeTerm>> {
    const query = {
      ...queryParams,
      where: {
        ...(queryParams as any).where,
        attribute_id: attributeId,
      },
    };
    return this.repo.getAll(query);
  }

  async batchUpdateProductAttributeTerms(
    attributeId: number,
    termsData: BatchUpdateAttributeTermsDto
  ): Promise<IResult<null>> {
    try {
      await this.woo.batchUpdateProductAttributeTerms(attributeId, termsData);
      return {
        success: true,
        data: null,
        message: "Attribute terms updated successfully",
      };
    } catch (error: any) {
      logger.error("Error updating product attribute terms:", error);
      return {
        success: false,
        error: error?.message || error,
        message: "Failed to update product attribute terms",
      };
    }
  }
}
