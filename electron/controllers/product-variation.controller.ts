import { logger } from "../utils/logger";
import { ProductVariationService } from "../services/product-variation.service";
import {
  CreateVariationDto,
  VariationQueryParams,
} from "../types/product.types";

export class ProductVariationController {
  private productVariationService: ProductVariationService;

  constructor() {
    this.productVariationService = new ProductVariationService();
  }

  async createVariations(data: {
    productId: number;
    variations: CreateVariationDto[];
  }) {
    try {
      return await this.productVariationService.createVariations(
        data.productId,
        data.variations
      );
    } catch (error) {
      logger.error("Error creating variations:", error);
      throw error;
    }
  }

  async getProductVariations(params: {
    productId: number;
    query?: VariationQueryParams;
  }) {
    try {
      return await this.productVariationService.getProductVariations(
        params.productId
      );
    } catch (error) {
      logger.error("Error getting product variations:", error);
      throw error;
    }
  }

  async updateVariation(data: {
    productId: number;
    variationId: number;
    variationData: CreateVariationDto;
  }) {
    try {
      return await this.productVariationService.updateVariation(
        data.productId,
        data.variationId,
        data.variationData
      );
    } catch (error) {
      logger.error("Error updating variation:", error);
      throw error;
    }
  }

  async deleteVariation(params: { productId: number; variationId: number }) {
    try {
      return await this.productVariationService.deleteVariation(
        params.productId,
        params.variationId
      );
    } catch (error) {
      logger.error("Error deleting variation:", error);
      throw error;
    }
  }

  async syncVariations(params: { productId: number }) {
    try {
      return await this.productVariationService.syncVariations(
        params.productId
      );
    } catch (error) {
      logger.error("Error syncing variations:", error);
      throw error;
    }
  }

  async convertToVariableProduct(params: { productId: number }) {
    try {
      return await this.productVariationService.convertToVariableProduct(
        params.productId
      );
    } catch (error) {
      logger.error("Error converting to variable product:", error);
      throw error;
    }
  }

  async updateProductAttributes(data: {
    productId: number;
    attributes: Array<{
      id: number;
      name: string;
      variation: boolean;
      visible: boolean;
      options: string[];
    }>;
  }) {
    try {
      return await this.productVariationService.updateProductAttributes(
        data.productId,
        data.attributes
      );
    } catch (error) {
      logger.error("Error updating product attributes:", error);
      throw error;
    }
  }
}
