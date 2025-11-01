import { BaseWooService } from "./base-woo.service";
import {
  CreateProductDto,
  CreateVariationDto,
  UpdateVariationDto,
  CreateWooProductDto,
} from "../../types/product.types";
import { InferCreationAttributes } from "sequelize";
import { Product } from "../../models";

export class WooProductService extends BaseWooService {
  private readonly endpoint = "/wp-json/wc/v3/products";

  async getProducts(
    params?: Record<string, any>
  ): Promise<InferCreationAttributes<Product>[]> {
    const response = await this.api.get(this.endpoint, { params });
    return response.data;
  }

  async getProduct(id: number): Promise<InferCreationAttributes<Product>> {
    const response = await this.api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async createProduct(
    productData: CreateWooProductDto
  ): Promise<InferCreationAttributes<Product>> {
    const response = await this.api.post(this.endpoint, productData);
    return response.data;
  }

  async updateProduct(
    id: number,
    productData: CreateProductDto
  ): Promise<InferCreationAttributes<Product>> {
    const response = await this.api.put(`${this.endpoint}/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: number): Promise<any> {
    const response = await this.api.delete(`${this.endpoint}/${id}`);
    return response.data;
  }

  async batchDeleteProducts(productIds: number[]): Promise<any> {
    const response = await this.api.post(
      `${this.endpoint}/batch`,
      this.createBatchDeletePayload(productIds)
    );
    return response.data;
  }

  // Product Variations
  async getProductVariations(productId: number): Promise<any[]> {
    const response = await this.api.get(
      `${this.endpoint}/${productId}/variations`
    );
    return response.data;
  }

  async getProductVariation(
    productId: number,
    variationId: number
  ): Promise<any> {
    const response = await this.api.get(
      `${this.endpoint}/${productId}/variations/${variationId}`
    );
    return response.data;
  }

  async createProductVariation(
    productId: number,
    variationData: CreateVariationDto
  ): Promise<any> {
    const response = await this.api.post(
      `${this.endpoint}/${productId}/variations`,
      variationData
    );
    return response.data;
  }

  async updateProductVariation(
    productId: number,
    variationId: number,
    variationData: CreateVariationDto
  ): Promise<any> {
    const response = await this.api.put(
      `${this.endpoint}/${productId}/variations/${variationId}`,
      variationData
    );
    return response.data;
  }

  async deleteProductVariation(
    productId: number,
    variationId: number
  ): Promise<any> {
    const response = await this.api.delete(
      `${this.endpoint}/${productId}/variations/${variationId}`
    );
    return response.data;
  }

  async batchCreateProductVariations(
    productId: number,
    variations: CreateVariationDto[]
  ): Promise<any> {
    const response = await this.api.post(
      `${this.endpoint}/${productId}/variations/batch`,
      {
        create: variations,
      }
    );
    return response.data;
  }

  async batchUpdateProductVariations(
    productId: number,
    variations: UpdateVariationDto[]
  ): Promise<any> {
    const response = await this.api.post(
      `${this.endpoint}/${productId}/variations/batch`,
      {
        update: variations,
      }
    );
    return response.data;
  }

  async batchOperationsProductVariations(
    productId: number,
    operations: {
      create?: CreateVariationDto[];
      update?: UpdateVariationDto[];
      delete?: number[];
    }
  ): Promise<any> {
    const response = await this.api.post(
      `${this.endpoint}/${productId}/variations/batch`,
      operations
    );
    return response.data;
  }
}
