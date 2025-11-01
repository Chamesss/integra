import { WooCommerceService } from "../api/woocommerce.service";
import { CoreService } from "./core.service";
import { CoreRepo } from "../repositories/core.repo";
import { IResult, IResults, QueryParams } from "../types/core.types";
import {
  CreateAttributeDto,
  AttributeQueryDto,
  UpdateAttributeDto,
  CreateAttributeWithTermsDto,
} from "../types/attribute.types";
import { AttributeTermService } from "./attribute-term.service";
import { AttributeTermRepo } from "../repositories/attribute-term.repo";
import { Op, Transaction } from "sequelize";
import { Attribute, AttributeTerm } from "../models";
import { syncManager } from "../utils/sync-manager";
import { logger } from "../utils/logger";

export class AttributeService extends CoreService<
  Attribute,
  CreateAttributeDto,
  AttributeQueryDto,
  UpdateAttributeDto
> {
  private woo: WooCommerceService;
  private AttributeTerms = new AttributeTermService(new AttributeTermRepo());

  constructor(repo: CoreRepo<Attribute>) {
    super(repo);
    this.woo = new WooCommerceService();
  }

  // Fetch from WooCommerce and upsert into local DB
  async syncAttributesFromWoo(
    queryParams: QueryParams
  ): Promise<IResults<Attribute, AttributeTerm[], "terms">> {
    return syncManager.executeSyncOperation("attributes", () =>
      this._performAttributeSync(queryParams)
    );
  }

  private async _performAttributeSync(
    queryParams: QueryParams
  ): Promise<IResults<Attribute, AttributeTerm[], "terms">> {
    return this.repo.withTransaction(async (transaction) => {
      try {
        const remoteAttributes = await this.woo.getProductAttributes();
        const remoteAttributeIds = new Set(
          remoteAttributes.map((attr) => attr.id)
        );

        const localAttributes = await this.repo.model.findAll({
          attributes: ["id"],
          transaction,
        });
        const localAttributeIds = new Set(
          localAttributes.map((attr) => attr.id)
        );

        const idsToDelete = [...localAttributeIds].filter(
          (id) => !remoteAttributeIds.has(id)
        );

        if (idsToDelete.length > 0) {
          await this.repo.model.destroy({
            where: { id: idsToDelete },
            transaction,
          });
        }

        if (remoteAttributes.length > 0) {
          for (const attr of remoteAttributes) {
            await this.repo.upsert(
              {
                id: attr.id,
                name: attr.name,
                slug: attr.slug,
                type: attr.type,
                order_by: attr.order_by,
                has_archives: attr.has_archives,
              },
              { transaction }
            );
          }
        }

        // sync attribute terms for each attribute and return the results
        const terms = (await Promise.all(
          remoteAttributes.map(async (attr) => {
            const term = await this.woo.getProductAttributeTerms(attr.id);
            return term.map((t) => ({
              ...t,
              attribute_id: attr.id,
            }));
          })
        ).then((results) => results.flat())) as AttributeTerm[];
        const remoteIds = new Set(terms.map((term) => term.id));

        const localTerms = await this.AttributeTerms.getAll(
          {},
          [],
          transaction
        );
        const localIds = new Set(localTerms.rows.map((term) => term.id));

        const termIdsToDelete: number[] = [];
        for (const localId of localIds) {
          if (!remoteIds.has(localId)) {
            termIdsToDelete.push(localId);
          }
        }

        if (terms.length > 0) {
          for (const term of terms) {
            await AttributeTerm.upsert(
              {
                id: term.id,
                name: term.name,
                slug: term.slug,
                description: term.description || "",
                menu_order: term.menu_order || 0,
                count: term.count || 0,
                attribute_id: term.attribute_id,
              },
              {
                transaction,
              }
            );
          }
        }

        // Fixed: Use termIdsToDelete instead of idsToDelete
        if (termIdsToDelete.length > 0) {
          await AttributeTerm.destroy({
            where: { id: { [Op.in]: termIdsToDelete } }, // Fixed variable name
            transaction,
          });
        }

        const allAttributes = await this.repo.getAll({
          ...queryParams,
          transaction, // Add transaction if supported
        });

        return {
          count: allAttributes.count,
          rows: allAttributes.rows,
          terms: terms,
          success: true,
        };
      } catch (error: any) {
        logger.error("Error syncing attributes from WooCommerce:", error);
        return {
          error: "Failed to sync attributes from WooCommerce.",
          message: error?.message || "Sync failed",
          count: 0,
          rows: [],
          terms: [],
          success: false,
        };
      }
    });
  }

  async createAttribute(
    data: CreateAttributeDto,
    transaction?: Transaction
  ): Promise<IResult<Attribute>> {
    try {
      const wooAttribute = await this.woo.createProductAttribute(data);
      const [attribute] = await this.repo.model.upsert(
        {
          id: wooAttribute.id,
          name: wooAttribute.name,
          slug: wooAttribute.slug,
          type: wooAttribute.type,
          order_by: wooAttribute.order_by,
          has_archives: wooAttribute.has_archives,
        },
        {
          transaction,
        }
      );

      return {
        success: true,
        data: attribute,
        message: "Attribut créé avec succès.",
      };
    } catch (error: any) {
      logger.error("Error creating attribute:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Échec de la création de l'attribut.";
      throw new Error(msg);
    }
  }

  async createAttributeWithTerms(
    data: CreateAttributeWithTermsDto
  ): Promise<IResult<Attribute>> {
    return this.repo.withTransaction(async (transaction) => {
      const { terms, ...attributeData } = data;

      // 1. Create the attribute within the transaction
      const createdAttributeResult = await this.createAttribute(
        attributeData,
        transaction
      );

      if (!createdAttributeResult.success || !createdAttributeResult.data?.id) {
        throw new Error(
          createdAttributeResult.message || "Failed to create the attribute."
        );
      }
      const attribute = createdAttributeResult.data;
      const attributeId = attribute.id;

      // 2. Create terms for the attribute, if any
      if (terms && terms.length > 0) {
        // Create all terms in WooCommerce first
        const createdWooTerms = await this.woo.batchCreateProductAttributeTerms(
          attributeId,
          terms
        );

        // 3. Save the successfully created terms in the local DB
        await AttributeTerm.bulkCreate(
          createdWooTerms.create.map((term) => ({
            id: term.id,
            name: term.name,
            slug: term.slug,
            description: term.description || "",
            menu_order: term.menu_order || 0,
            attribute_id: attributeId,
          })),
          { transaction }
        );
      }

      // Refetch the attribute with its newly associated terms
      const finalAttribute = await this.repo.getById(attributeId, [
        { model: AttributeTerm, as: "terms" },
      ]);

      return {
        success: true,
        data: finalAttribute as Attribute,
        message: "Attribute and terms created successfully.",
      };
    });
  }

  async updateAttribute(data: UpdateAttributeDto): Promise<IResult<Attribute>> {
    const { id, ...updateData } = data;
    if (!id) {
      throw new Error("ID de l'attribut manquant.");
    }
    try {
      const result = await this.woo.updateProductAttribute(id, updateData);
      const updatedAttribute = await this.repo.update(id, result);
      if (!updatedAttribute) {
        throw new Error("Échec de la mise à jour de l'attribut.");
      }
      return {
        success: true,
        data: updatedAttribute,
        message: "Attribut mis à jour avec succès.",
      };
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Échec de la mise à jour de l'attribut.";
      throw new Error(msg);
    }
  }

  async deleteAttribute(id: number): Promise<IResult<Attribute>> {
    if (!id) {
      throw new Error("ID d'attribut manquant.");
    }

    try {
      await this.woo.deleteProductAttribute(id);
      await this.repo.delete(id);
      return {
        success: true,
        message: "Attribut supprimé avec succès.",
      };
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Échec de la suppression de l'attribut.";
      throw new Error(msg);
    }
  }

  async batchDelete(ids: number[]): Promise<IResult<Attribute>> {
    if (!ids || ids.length === 0) {
      throw new Error("Aucun ID d'attribut fourni pour la suppression.");
    }

    try {
      await this.woo.batchDeleteProductAttributes(ids);
      await this.repo.deleteMany(ids, {});
      return {
        success: true,
        message: "Attributs supprimés avec succès.",
      };
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Échec de la suppression des attributs.";
      throw new Error(msg);
    }
  }
}
