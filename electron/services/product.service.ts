import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from "../types/product.types";
import { CoreRepo } from "../repositories/core.repo";
import { CoreService } from "./core.service";
import { Product } from "../models";
import { WooCommerceService } from "../api/woocommerce.service";
import { IResult, IResults, QueryParams } from "../types/core.types";
import { InferCreationAttributes, Op } from "sequelize";
import { convertBase64ToBuffer } from "../../src/utils/base64";
import { logger } from "../utils/logger";
import { syncManager } from "../utils/sync-manager";

export class ProductService extends CoreService<
  Product,
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto
> {
  private woo: WooCommerceService;

  constructor(repo: CoreRepo<Product>) {
    super(repo);
    this.woo = new WooCommerceService();
  }

  async syncProductsFromWoo(
    queryParams: QueryParams
  ): Promise<IResults<Product>> {
    try {
      // Use sync manager to prevent concurrent product sync operations
      return await syncManager.executeSyncOperation("products", () =>
        this._performProductSync(queryParams)
      );
    } catch (error: any) {
      logger.warn(
        "Failed to sync products from WooCommerce, falling back to local data:",
        error.message
      );

      // Check if it's a network-related error
      const isNetworkError = this._isNetworkError(error);

      if (isNetworkError) {
        // Fallback to local database
        logger.info("Network error detected, returning local products");
        const localProducts = await this.getAll(queryParams);
        return {
          ...localProducts,
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

  private async _performProductSync(
    queryParams: QueryParams
  ): Promise<IResults<Product>> {
    return this.repo.withTransaction(async (transaction) => {
      try {
        // Fetch all products from WooCommerce with pagination
        let remoteProducts: InferCreationAttributes<Product>[] = [];
        let page = 1;
        const perPage = 100;

        while (true) {
          const batch = await this.woo.getProducts({ per_page: perPage, page });
          if (!Array.isArray(batch) || batch.length === 0) break;
          remoteProducts = remoteProducts.concat(batch);
          if (batch.length < perPage) break;
          page++;
        }

        const remoteIds = remoteProducts.map((prod) => prod.id);

        // Get local products to identify ones to delete
        const localRecords = await this.repo.getAll({
          paranoid: false,
          transaction,
        });
        const localIds = localRecords.rows.map((r) => r.id);
        const idsToDelete = localIds.filter((id) => !remoteIds.includes(id));

        // Process products in dependency order (parents before children)
        const total = remoteProducts.length;
        const processed = new Set<number>();
        let maxIterations = total * 2; // Prevent infinite loops
        let iterations = 0;

        while (processed.size < total && iterations < maxIterations) {
          let progress = 0;
          iterations++;

          for (const prod of remoteProducts) {
            if (processed.has(prod.id)) continue;

            const parentId = prod.parent_id;
            const parentOK =
              parentId == null || parentId === 0 || processed.has(parentId);

            if (parentOK) {
              const data: InferCreationAttributes<Product> = {
                id: prod.id,
                name: prod.name,
                type: prod.type,
                attributes: prod.attributes?.map((attr) => ({
                  id: attr.id,
                  name: attr.name,
                  options: attr.options,
                  variation: attr.variation,
                  visible: attr.visible,
                  position: attr.position,
                })),
                slug: prod.slug,
                permalink: prod.permalink,
                date_created: prod.date_created,
                date_created_gmt: prod.date_created_gmt,
                date_modified: prod.date_modified,
                date_modified_gmt: prod.date_modified_gmt,
                status: prod.status,
                featured: prod.featured,
                catalog_visibility: prod.catalog_visibility,
                description: prod.description,
                short_description: prod.short_description,
                sku: prod.sku,
                price: prod.price,
                regular_price: prod.regular_price,
                sale_price: prod.sale_price,
                date_on_sale_from: prod.date_on_sale_from,
                date_on_sale_from_gmt: prod.date_on_sale_from_gmt,
                date_on_sale_to: prod.date_on_sale_to,
                date_on_sale_to_gmt: prod.date_on_sale_to_gmt,
                stock_quantity: prod.stock_quantity,
                stock_status: prod.stock_status,
                parent_id: parentId || null,
                category_ids: prod.categories?.map((c) => c.id),
                backorders: prod.backorders,
                manage_stock: prod.manage_stock,
                weight: prod.weight,
                tags: prod.tags?.map((t) => ({
                  id: t.id,
                  name: t.name,
                  slug: t.slug,
                })),
                images: prod.images?.map((img) => ({
                  id: img.id,
                  src: img.src,
                  name: img.name,
                  alt: img.alt,
                })),
                categories: prod.categories?.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                })),
              };

              try {
                // Use repository upsert method with retry logic
                await this.repo.upsert(data, { transaction });
                processed.add(prod.id);
                progress++;
              } catch (error: any) {
                logger.error(`Error upserting product ${prod.id}:`, error);
                throw error;
              }
            }
          }

          if (progress === 0) {
            logger.warn(
              `No progress made in iteration ${iterations}, remaining products may have dependency issues`
            );
            break;
          }
        }

        // Delete products that no longer exist in WooCommerce
        if (idsToDelete.length > 0) {
          const chunkSize = 500;
          let deletedCount = 0;

          for (let i = 0; i < idsToDelete.length; i += chunkSize) {
            const chunk = idsToDelete.slice(i, i + chunkSize);
            try {
              const res = await this.repo.model.destroy({
                where: { id: { [Op.in]: chunk } },
                force: true,
                transaction,
              });
              deletedCount += res;
            } catch (error: any) {
              logger.error(`Error deleting product chunk:`, error);
              throw error;
            }
          }

          logger.info(
            `Deleted ${deletedCount} products that no longer exist in WooCommerce`
          );
        }

        // Get final results
        const allProducts = await this.repo.getAll({ ...queryParams });

        return {
          count: allProducts.count,
          rows: allProducts.rows,
          success: true,
          message: `Sync completed. Processed: ${processed.size}/${total}, Deleted: ${idsToDelete.length}.`,
        };
      } catch (error: any) {
        logger.error("Error syncing products:", error);
        throw error;
      }
    });
  }

  async getProduct(id: number): Promise<IResult<Product>> {
    if (!id) {
      return {
        success: false,
        message: "ID de produit manquant.",
      };
    }

    return this.getById(id).then((product) => {
      if (!product) {
        return {
          success: false,
          message: "Produit non trouvé.",
        };
      }
      return {
        success: true,
        data: product,
        message: "Produit récupéré avec succès.",
      };
    });
  }

  async create(data: CreateProductDto): Promise<IResult<Product>> {
    try {
      const { id, images, ...updateData } = data;

      // convert images base64 to buffer
      const convertedImages = await Promise.all(
        images?.map(async (img) => {
          if (!img.file) return null;
          const base64File = await convertBase64ToBuffer(img.file as string);
          return {
            filename: img.filename || "image.jpg", // use provided filename or fallback
            preview: img.preview,
            file: base64File, // use base64 string directly
          };
        }) || []
      );

      const newImages: { src: string }[] = [];

      // upload images to WooCommerce
      if (convertedImages.length > 0) {
        const uploadedImages = await Promise.all(
          convertedImages.map(async (img) => {
            if (!img || !img.file) return null;
            return this.woo.uploadMediaFromBuffer(img.file, img.filename);
          })
        );

        for (const uploaded of uploadedImages) {
          if (uploaded) {
            newImages.push({ src: uploaded.source_url });
          }
        }
      }

      const newProduct = {
        ...updateData,
        images: newImages || [],
        categories: data.categories?.map((c) => ({ id: c })) || [],
        tags: data.tags?.map((t) => ({ id: t })) || [],
      };

      const wooProduct = await this.woo.createProduct(newProduct);
      const product = await this.repo.save({
        ...wooProduct,
      });

      return {
        success: true,
        data: product,
        message: "Produit créée avec succès.",
      };
    } catch (error: any) {
      logger.error("Error creating product:", error);

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Échec de la création de produit.";
      return {
        success: false,
        message: msg,
      };
    }
  }

  async updateProduct(data: UpdateProductDto): Promise<IResult<Product>> {
    const { id, ...updateData } = data;
    if (!id) {
      return {
        success: false,
        message: "ID du produit manquant.",
      };
    }

    try {
      const cleanedData = await this.cleanDataForWooCommerce(updateData);

      // Update in WooCommerce first
      const wooResult = await this.woo.updateProduct(id, cleanedData);

      // Update locally with the WooCommerce result to ensure sync
      await this.repo.update(id, wooResult);

      // Fetch the updated product to ensure we have the latest data
      const freshProduct = await this.repo.getById(id);

      return {
        success: true,
        data: freshProduct as Product,
        message: "Produit mis à jour avec succès.",
      };
    } catch (error: any) {
      logger.error("Error updating product:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Échec de la mise à jour du produit.";
      return {
        success: false,
        message: msg,
      };
    }
  }

  private async cleanDataForWooCommerce(data: any): Promise<any> {
    const cleanedData = { ...data };

    // Handle images - Upload new images via media endpoint and use existing ones
    if (cleanedData.images && Array.isArray(cleanedData.images)) {
      const processedImages = [];

      for (const img of cleanedData.images) {
        if (!img) continue;

        // Handle existing images with src/preview (no upload needed)
        if (!img.file && img.preview) {
          processedImages.push({
            src: img.preview,
            name: img.filename || "",
            alt: img.alt || "",
          });
          continue;
        }

        // Handle new images with base64 data - upload via media endpoint
        if (
          img.file &&
          typeof img.file === "string" &&
          img.file.startsWith("data:")
        ) {
          try {
            // Check size limit before processing
            const base64Data = img.file.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");

            if (buffer.length > 1048576) {
              logger.warn(
                `Skipping large image: ${img.filename} (${buffer.length} bytes)`
              );
              continue;
            }

            // Upload via media endpoint using the new base64 method
            logger.info(`Uploading image: ${img.filename}`);
            const mediaResult = await this.woo.media.uploadMediaFromBase64(
              img.file,
              img.filename || "image.jpg"
            );

            processedImages.push({
              id: mediaResult.id,
              src: mediaResult.source_url,
              name: img.filename || "",
              alt: img.alt || "",
            });

            logger.info(`Image uploaded successfully: ${mediaResult.id}`);
          } catch (uploadError: any) {
            logger.error(
              `Failed to upload image ${img.filename}:`,
              uploadError
            );
            // Continue without this image rather than failing the entire update
          }
          continue;
        }

        // Handle images that already have an ID (existing WooCommerce images)
        if (img.id) {
          processedImages.push({
            id: img.id,
            src: img.src || img.preview,
            name: img.filename || img.name || "",
            alt: img.alt || "",
          });
          continue;
        }
      }

      cleanedData.images = processedImages;
      logger.info(`Processed ${processedImages.length} images for WooCommerce`);
    }

    // Handle categories - ensure they're in the correct format
    if (cleanedData.categories !== undefined) {
      if (Array.isArray(cleanedData.categories)) {
        cleanedData.categories = cleanedData.categories
          .map((cat: any) => {
            if (typeof cat === "number") {
              return { id: cat };
            }
            if (typeof cat === "object" && cat.id) {
              return { id: Number(cat.id) };
            }
            if (typeof cat === "string" && !isNaN(Number(cat))) {
              return { id: Number(cat) };
            }
            return null;
          })
          .filter(Boolean);
      } else if (typeof cleanedData.categories === "number") {
        // Handle single category as number
        cleanedData.categories = [{ id: cleanedData.categories }];
      } else if (
        typeof cleanedData.categories === "string" &&
        !isNaN(Number(cleanedData.categories))
      ) {
        // Handle single category as string number
        cleanedData.categories = [{ id: Number(cleanedData.categories) }];
      } else {
        delete cleanedData.categories;
      }
    }

    // Handle tags - ensure they're in the correct format
    if (cleanedData.tags !== undefined) {
      if (Array.isArray(cleanedData.tags)) {
        cleanedData.tags = cleanedData.tags
          .map((tag: any) => {
            if (typeof tag === "number") {
              return { id: tag };
            }
            if (typeof tag === "object" && tag.id) {
              return { id: Number(tag.id) };
            }
            if (typeof tag === "string" && !isNaN(Number(tag))) {
              return { id: Number(tag) };
            }
            return null;
          })
          .filter(Boolean);
      } else if (typeof cleanedData.tags === "number") {
        // Handle single tag as number
        cleanedData.tags = [{ id: cleanedData.tags }];
      } else if (
        typeof cleanedData.tags === "string" &&
        !isNaN(Number(cleanedData.tags))
      ) {
        // Handle single tag as string number
        cleanedData.tags = [{ id: Number(cleanedData.tags) }];
      } else {
        delete cleanedData.tags;
      }
    }

    // Handle attributes - ensure they're properly formatted
    if (cleanedData.attributes && Array.isArray(cleanedData.attributes)) {
      cleanedData.attributes = cleanedData.attributes
        .map((attr: any) => {
          if (!attr || !attr.id) return null;

          return {
            id: Number(attr.id),
            position: Number(attr.position) || 0,
            visible: Boolean(attr.visible),
            variation: Boolean(attr.variation),
            options: Array.isArray(attr.options)
              ? attr.options.filter(Boolean)
              : [],
          };
        })
        .filter(Boolean);
    }

    // Handle dimensions - ensure they're properly formatted or removed if empty
    if (cleanedData.dimensions) {
      const dims = cleanedData.dimensions;
      if (!dims.length && !dims.width && !dims.height) {
        delete cleanedData.dimensions;
      } else {
        cleanedData.dimensions = {
          length: dims.length || "",
          width: dims.width || "",
          height: dims.height || "",
        };
      }
    }

    // Handle stock fields - ensure proper types for all product types
    if (cleanedData.manage_stock !== undefined) {
      cleanedData.manage_stock = Boolean(cleanedData.manage_stock);
    }

    if (cleanedData.stock_quantity !== undefined) {
      cleanedData.stock_quantity = Number(cleanedData.stock_quantity) || 0;
    }

    // Handle pricing fields - for variable products, remove pricing fields as they're handled by variations
    if (cleanedData.type === "variable") {
      // Variable products don't have direct pricing - pricing is handled by variations
      delete cleanedData.regular_price;
      delete cleanedData.sale_price;
      delete cleanedData.price;
    } else {
      // For simple products, ensure pricing fields are strings or empty
      ["regular_price", "sale_price", "price"].forEach((priceField) => {
        if (cleanedData[priceField] !== undefined) {
          cleanedData[priceField] = String(cleanedData[priceField] || "");
        }
      });
    }

    // Handle boolean fields
    ["featured", "virtual", "downloadable"].forEach((boolField) => {
      if (cleanedData[boolField] !== undefined) {
        cleanedData[boolField] = Boolean(cleanedData[boolField]);
      }
    });

    // Handle date fields - ensure proper format or remove if empty
    ["date_on_sale_from", "date_on_sale_to"].forEach((dateField) => {
      if (cleanedData[dateField] !== undefined) {
        if (!cleanedData[dateField] || cleanedData[dateField] === "") {
          delete cleanedData[dateField];
        } else {
          // Ensure the date is valid and format it properly
          try {
            const date = new Date(cleanedData[dateField]);
            if (isNaN(date.getTime())) {
              // Invalid date, remove it
              delete cleanedData[dateField];
            } else {
              // WooCommerce expects dates in YYYY-MM-DD format
              cleanedData[dateField] = date.toISOString().split("T")[0];
            }
          } catch (error) {
            // If date parsing fails, remove the field
            delete cleanedData[dateField];
          }
        }
      }
    });

    // Handle GMT date fields - remove them as they're auto-generated by WooCommerce
    ["date_on_sale_from_gmt", "date_on_sale_to_gmt"].forEach((dateField) => {
      delete cleanedData[dateField];
    });

    // Remove any undefined, null, or empty string values that might cause issues
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === undefined || cleanedData[key] === null) {
        delete cleanedData[key];
      }
    });

    // Remove fields that shouldn't be sent to WooCommerce during update
    const fieldsToRemove = [
      "id",
      "date_created",
      "date_modified",
      "permalink",
      "total_sales",
    ];
    fieldsToRemove.forEach((field) => delete cleanedData[field]);

    return cleanedData;
  }

  async deleteProduct(id: number): Promise<IResult<Product>> {
    if (!id) {
      return {
        success: false,
        message: "ID de produit manquant.",
      };
    }

    return this.woo
      .deleteProduct(id)
      .then(() => this.repo.delete(id))
      .then(() => ({
        success: true,
        message: "Produit supprimée avec succès.",
      }))
      .catch((error: any) => {
        logger.error("Error deleting product:", error);
        const msg =
          error?.response?.data?.message ||
          error?.message ||
          "Échec de la suppression de produit.";
        return {
          success: false,
          message: msg,
        };
      });
  }

  async batchDelete(ids: number[]): Promise<IResult<Product>> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "Aucun ID de produit fourni pour la suppression.",
      };
    }

    return this.woo
      .batchDeleteProducts(ids)
      .then(() => this.repo.deleteMany(ids, {}))
      .then(() => ({
        success: true,
        message: "Produits supprimées avec succès.",
      }))
      .catch((error: any) => {
        logger.error("Error deleting products:", error);
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
