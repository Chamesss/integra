import {
  CreateTagDto,
  TagDto,
  TagQueryDto,
  UpdateTagDto,
} from "../types/tag.types";
import { Tag } from "../models";
import { CoreRepo } from "../repositories/core.repo";
import { CoreService } from "./core.service";
import { IResult, IResults, QueryParams } from "../types/core.types";
import { WooCommerceService } from "../api/woocommerce.service";
import { syncManager } from "../utils/sync-manager";
import { logger } from "../utils/logger";

export class TagService extends CoreService<
  Tag,
  CreateTagDto,
  TagQueryDto,
  UpdateTagDto
> {
  private woo: WooCommerceService;

  constructor(repo: CoreRepo<Tag>) {
    super(repo);
    this.woo = new WooCommerceService();
  }

  async syncTagsFromWoo(queryParams: QueryParams): Promise<IResults<Tag>> {
    return syncManager.executeSyncOperation("tags", () =>
      this._performTagSync(queryParams)
    );
  }

  private async _performTagSync(
    queryParams: QueryParams
  ): Promise<IResults<Tag>> {
    return this.repo.withTransaction(async (transaction) => {
      try {
        logger.info("Starting tag sync from WooCommerce...");

        const remoteTags = await this.woo.getTags();
        const remoteTagIds = new Set(remoteTags.map((tag) => tag.id));

        logger.info(`Found ${remoteTags.length} tags from WooCommerce`);

        // Get local tags
        const localTags = await Tag.findAll({
          attributes: ["id"],
          transaction,
        });
        const localTagIds = new Set(
          localTags.map((tag) => tag.get("id") as number)
        );

        // Find tags to delete
        const idsToDelete = [...localTagIds].filter(
          (id) => !remoteTagIds.has(id)
        );

        // Delete obsolete tags
        let deletedCount = 0;
        if (idsToDelete.length > 0) {
          logger.info(`Deleting ${idsToDelete.length} obsolete tags`);

          // Delete in chunks to prevent locks
          const chunkSize = 100;
          for (let i = 0; i < idsToDelete.length; i += chunkSize) {
            const chunk = idsToDelete.slice(i, i + chunkSize);
            const result = await Tag.destroy({
              where: { id: chunk },
              transaction,
            });
            deletedCount += result;
          }
        }

        // Upsert remote tags
        let processedCount = 0;
        if (remoteTags.length > 0) {
          logger.info(`Processing ${remoteTags.length} tags`);

          // Process in chunks to prevent locks
          const chunkSize = 50;
          for (let i = 0; i < remoteTags.length; i += chunkSize) {
            const chunk = remoteTags.slice(i, i + chunkSize);

            for (const tag of chunk) {
              await Tag.upsert(
                {
                  id: tag.id,
                  name: tag.name,
                  slug: tag.slug,
                  description: tag.description || "",
                },
                { transaction }
              );
              processedCount++;
            }
          }
        }

        logger.info(
          `Tag sync completed. Processed: ${processedCount}, Deleted: ${deletedCount}`
        );

        const allTags = await this.repo.getAll({ ...queryParams });
        return {
          count: allTags.count,
          rows: allTags.rows,
          success: true,
          message: `Sync completed successfully. Processed: ${processedCount}, Deleted: ${deletedCount}`,
        };
      } catch (error: any) {
        logger.error("Error syncing tags:", error);
        throw error; // Let the transaction wrapper handle rollback
      }
    });
  }

  async getAllTags(queryParams: QueryParams): Promise<IResults<TagDto>> {
    try {
      const tags = await this.repo.getAll({ ...queryParams });
      return {
        ...tags,
        success: true,
      };
    } catch (error: any) {
      logger.error("Error fetching all tags:", error);
      return {
        success: false,
        error: error?.message || "Failed to fetch tags",
        message: "Fetch failed",
        count: 0,
        rows: [],
      };
    }
  }

  async create(data: CreateTagDto): Promise<IResult<TagDto>> {
    try {
      const WooTag = await this.woo.createTag(data);
      const createdTag = await this.repo.save({
        ...WooTag,
      });
      return {
        success: true,
        data: createdTag,
        message: "Tag created successfully",
      };
    } catch (error: any) {
      logger.error("Error creating tag:", error);
      return {
        success: false,
        error: error?.message || "Failed to create tag",
        message: "Creation failed",
      };
    }
  }

  async updateTag(data: UpdateTagDto): Promise<IResult<TagDto>> {
    const { id, ...updateData } = data;
    try {
      const WooUpdatedTag = await this.woo.updateTag(id, updateData);
      const updatedTag = await this.repo.update(id, {
        ...WooUpdatedTag,
      });
      if (!updatedTag) {
        return {
          success: false,
          message: "Tag not found",
        };
      } else {
        return {
          success: true,
          data: updatedTag,
          message: "Tag updated successfully",
        };
      }
    } catch (error: any) {
      logger.error("Error updating tag:", error);
      return {
        success: false,
        error: error?.message || "Failed to update tag",
        message: "Update failed",
      };
    }
  }

  async deleteTag(id: number): Promise<IResult<void>> {
    try {
      await this.woo.deleteTag(id);
      await this.repo.delete(id.toString());
      return {
        success: true,
        message: "Tag deleted successfully",
      };
    } catch (error: any) {
      logger.error("Error deleting tag:", error);
      return {
        success: false,
        error: error?.message || "Failed to delete tag",
        message: "Deletion failed",
      };
    }
  }

  async batchDelete(ids: number[]): Promise<IResult<void>> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "No IDs provided for deletion",
      };
    }

    try {
      await this.woo.batchDeleteTags(ids);
      await this.repo.deleteMany(ids.map((id) => id.toString()));
      return {
        success: true,
        message: "Tags deleted successfully",
      };
    } catch (error: any) {
      logger.error("Error deleting tags in batch:", error);
      return {
        success: false,
        error: error?.message || "Failed to delete tags in batch",
        message: "Batch deletion failed",
      };
    }
  }
}
