import { WooCommerceService } from "../api/woocommerce.service";
import { Product } from "../models";
import { ProductService } from "./product.service";
import { ProductRepo } from "../repositories/product.repo";
import { sequelize } from "../database/db";
import { Transaction } from "sequelize";
import { IResult, IResults } from "../types/core.types";
import { ProductType, CreateVariationDto } from "../types/product.types";
import { logger } from "../utils/logger";

interface VariationResponse {
  id: number;
  sku: string;
  regular_price: string;
  stock_quantity: number;
  enabled: boolean;
  attributes: { [key: string]: string };
}

export class ProductVariationService {
  private woo: WooCommerceService;
  private productService: ProductService;

  constructor() {
    this.woo = new WooCommerceService();
    this.productService = new ProductService(new ProductRepo());
  }

  /**
   * Create multiple product variations
   */
  async createVariations(
    productId: number,
    variations: CreateVariationDto[]
  ): Promise<IResult<VariationResponse[]>> {
    const transaction = await sequelize.transaction();

    try {
      // Get the product
      const product = await this.productService.getById(productId.toString());

      if (!product) {
        return {
          success: false,
          message: "Product not found",
          error: "Product not found",
          data: [],
        };
      }

      // Convert product to variable if it's simple
      if (product.type === ProductType.Simple) {
        const conversionResult = await this.convertToVariableProduct(
          productId,
          transaction
        );
        if (!conversionResult.success) {
          await transaction.rollback();
          return {
            success: false,
            message: "Failed to convert product to variable",
            error: conversionResult.error,
            data: [],
          };
        }
      }

      // Validate and ensure unique SKUs
      const validatedVariations = await this.ensureUniqueSKUs(variations);

      try {
        // Create variations in WooCommerce
        const wooVariations = await this.woo.batchCreateProductVariations(
          productId,
          validatedVariations
        );

        // Handle batch errors
        if (wooVariations?.create?.some((item: any) => item.error)) {
          const errors = wooVariations.create
            .filter((item: any) => item.error)
            .map((item: any) => `${item.error.code}: ${item.error.message}`)
            .join(", ");

          await transaction.rollback();
          return {
            success: false,
            message: `WooCommerce errors: ${errors}`,
            error: errors,
            data: [],
          };
        }

        if (!wooVariations || !wooVariations.create) {
          await transaction.rollback();
          return {
            success: false,
            message: "Failed to create variations in WooCommerce",
            error: "WooCommerce API error",
            data: [],
          };
        }

        const variationResponses: VariationResponse[] =
          wooVariations.create.map((variation: any) => ({
            id: variation.id,
            sku: variation.sku || "",
            regular_price: variation.regular_price || "",
            stock_quantity: variation.stock_quantity || 0,
            enabled: variation.status === "publish",
            attributes: variation.attributes.reduce((acc: any, attr: any) => {
              acc[attr.name] = attr.option;
              return acc;
            }, {}),
          }));

        await transaction.commit();

        return {
          success: true,
          message: "Variations created successfully",
          data: variationResponses,
        };
      } catch (error) {
        logger.error("Error creating variations in WooCommerce:", error);
        await transaction.rollback();
        return {
          success: false,
          message: "Failed to create variations",
          error: error instanceof Error ? error.message : "Unknown error",
          data: [],
        };
      }
    } catch (error) {
      await transaction.rollback();
      logger.error("Error creating variations:", error);
      return {
        success: false,
        message: "Failed to create variations",
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
      };
    }
  }

  /**
   * Get all variations for a product
   */
  async getProductVariations(
    productId: number
  ): Promise<IResults<VariationResponse>> {
    try {
      const wooVariations = await this.woo.getProductVariations(productId);

      const variationResponses: VariationResponse[] = wooVariations.map(
        (variation: any) => ({
          id: variation.id,
          sku: variation.sku || "",
          regular_price: variation.regular_price || "",
          stock_quantity: variation.stock_quantity || 0,
          enabled: variation.status === "publish",
          attributes: variation.attributes,
        })
      );

      return {
        success: true,
        message: "Variations retrieved successfully",
        rows: variationResponses,
        count: variationResponses.length,
      };
    } catch (error) {
      logger.error("Error getting product variations:", error);
      return {
        success: false,
        message: "Failed to get product variations",
        error: error instanceof Error ? error.message : "Unknown error",
        rows: [],
        count: 0,
      };
    }
  }

  /**
   * Update a specific variation
   */
  async updateVariation(
    productId: number,
    variationId: number,
    variationData: CreateVariationDto
  ): Promise<IResult<VariationResponse>> {
    try {
      const updatedVariation = await this.woo.updateProductVariation(
        productId,
        variationId,
        variationData
      );

      const variationResponse: VariationResponse = {
        id: updatedVariation.id,
        sku: updatedVariation.sku || "",
        regular_price: updatedVariation.regular_price || "",
        stock_quantity: updatedVariation.stock_quantity || 0,
        enabled: updatedVariation.status === "publish",
        attributes: updatedVariation.attributes,
      };

      return {
        success: true,
        message: "Variation updated successfully",
        data: variationResponse,
      };
    } catch (error) {
      logger.error("Error updating variation:", error);
      return {
        success: false,
        message: "Failed to update variation",
        error: error instanceof Error ? error.message : "Unknown error",
        data: {} as VariationResponse,
      };
    }
  }

  /**
   * Delete a specific variation
   */
  async deleteVariation(
    productId: number,
    variationId: number
  ): Promise<IResult<void>> {
    try {
      await this.woo.deleteProductVariation(productId, variationId);

      return {
        success: true,
        message: "Variation deleted successfully",
        data: undefined,
      };
    } catch (error) {
      logger.error("Error deleting variation:", error);
      return {
        success: false,
        message: "Failed to delete variation",
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  }

  /**
   * Sync variations from WooCommerce
   */
  async syncVariations(
    productId: number
  ): Promise<IResults<VariationResponse>> {
    try {
      return await this.getProductVariations(productId);
    } catch (error) {
      logger.error("Error syncing variations:", error);
      return {
        success: false,
        message: "Failed to sync variations",
        error: error instanceof Error ? error.message : "Unknown error",
        rows: [],
        count: 0,
      };
    }
  }

  /**
   * Convert a simple product to variable product
   */
  async convertToVariableProduct(
    productId: number,
    transaction?: Transaction
  ): Promise<IResult<Product>> {
    try {
      const updateData = {
        type: ProductType.Variable,
      };

      const updatedProduct = await this.woo.updateProduct(
        productId,
        updateData
      );

      if (updatedProduct) {
        // Update local database
        const product = await Product.findByPk(productId, { transaction });
        if (product) {
          await product.update({ type: ProductType.Variable }, { transaction });
          return {
            success: true,
            message: "Product converted to variable successfully",
            data: product,
          };
        }
      }

      return {
        success: false,
        message: "Failed to convert product to variable",
        error: "Product not found in local database",
        data: {} as Product,
      };
    } catch (error) {
      logger.error("Error converting to variable product:", error);
      return {
        success: false,
        message: "Failed to convert product to variable",
        error: error instanceof Error ? error.message : "Unknown error",
        data: {} as Product,
      };
    }
  }

  /**
   * Ensure SKUs are unique by checking existing products and variations
   */
  private async ensureUniqueSKUs(
    variations: CreateVariationDto[]
  ): Promise<CreateVariationDto[]> {
    try {
      // Get all existing products to check SKU conflicts
      const existingProducts = await this.woo.getProducts({
        per_page: 100,
        search: "",
      });
      const existingSKUs = new Set(
        existingProducts
          .filter((p: any) => p.sku)
          .map((p: any) => p.sku.toLowerCase())
      );

      // Also get all existing variations across all products
      const allVariations = await Promise.all(
        existingProducts
          .filter((p: any) => p.type === "variable")
          .map(async (p: any) => {
            try {
              return await this.woo.getProductVariations(p.id);
            } catch {
              return [];
            }
          })
      );

      // Flatten and add variation SKUs to existing set
      allVariations.flat().forEach((v: any) => {
        if (v.sku) {
          existingSKUs.add(v.sku.toLowerCase());
        }
      });

      // Process each variation to ensure unique SKU
      return variations.map((variation) => {
        let uniqueSku = variation.sku || "";
        let counter = 1;

        // Keep generating new SKUs until we find a unique one
        while (uniqueSku && existingSKUs.has(uniqueSku.toLowerCase())) {
          const timestamp = Date.now().toString().slice(-4);
          const randomSuffix = Math.random()
            .toString(36)
            .substring(2, 4)
            .toUpperCase();
          uniqueSku = `${variation.sku || "VAR"}-${counter}-${timestamp}-${randomSuffix}`;
          counter++;
        }

        // Add the unique SKU to our set to avoid conflicts within this batch
        if (uniqueSku) {
          existingSKUs.add(uniqueSku.toLowerCase());
        }

        return {
          ...variation,
          sku: uniqueSku,
        };
      });
    } catch (error) {
      logger.error("Error ensuring unique SKUs:", error);
      // Fallback: just add timestamp and random suffix to each SKU
      return variations.map((variation) => {
        const timestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.random()
          .toString(36)
          .substring(2, 5)
          .toUpperCase();
        return {
          ...variation,
          sku: `${variation.sku}-${timestamp}-${randomSuffix}`,
        };
      });
    }
  }

  /**
   * Update product attributes for variation support
   */
  async updateProductAttributes(
    productId: number,
    attributes: Array<{
      id: number;
      name: string;
      variation: boolean;
      visible: boolean;
      options: string[];
    }>
  ): Promise<IResult<void>> {
    try {
      const updateData = {
        attributes: attributes.map((attr) => ({
          id: attr.id,
          name: attr.name,
          variation: attr.variation,
          visible: attr.visible,
          options: attr.options,
        })),
      };

      await this.woo.updateProduct(productId, updateData);

      return {
        success: true,
        message: "Product attributes updated successfully",
        data: undefined,
      };
    } catch (error) {
      logger.error("Error updating product attributes:", error);
      return {
        success: false,
        message: "Failed to update product attributes",
        error: error instanceof Error ? error.message : "Unknown error",
        data: undefined,
      };
    }
  }
}
