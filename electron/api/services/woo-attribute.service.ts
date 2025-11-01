import { BaseWooService } from "./base-woo.service";
import {
  AttributeDto,
  AttributeTermDto,
  BatchUpdateAttributeTermsDto,
  CreateAttributeDto,
  CreateAttributeTermDto,
} from "../../types/attribute.types";

export class WooAttributeService extends BaseWooService {
  private readonly endpoint = "/wp-json/wc/v3/products/attributes";

  // ==================== PRODUCT ATTRIBUTES ====================

  async getProductAttributes(
    params?: Record<string, any>
  ): Promise<AttributeDto[]> {
    const response = await this.api.get(this.endpoint, { params });
    return response.data;
  }

  async getProductAttribute(id: number): Promise<AttributeDto> {
    const response = await this.api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async createProductAttribute(
    attributeData: Partial<CreateAttributeDto>
  ): Promise<AttributeDto> {
    const response = await this.api.post(this.endpoint, attributeData);
    return response.data;
  }

  async updateProductAttribute(
    id: number,
    attributeData: Partial<CreateAttributeDto>
  ): Promise<AttributeDto> {
    const response = await this.api.put(
      `${this.endpoint}/${id}`,
      attributeData
    );
    return response.data;
  }

  async deleteProductAttribute(id: number): Promise<any> {
    const response = await this.api.delete(`${this.endpoint}/${id}`, {
      params: { force: true },
    });
    return response.data;
  }

  async batchDeleteProductAttributes(attributeIds: number[]): Promise<any> {
    const response = await this.api.post(
      `${this.endpoint}/batch`,
      this.createBatchDeletePayload(attributeIds)
    );
    return response.data;
  }

  // ==================== PRODUCT ATTRIBUTE TERMS ====================

  async getProductAttributeTerms(
    attributeId: number,
    params?: Record<string, any>
  ): Promise<AttributeTermDto[]> {
    const response = await this.api.get(
      `${this.endpoint}/${attributeId}/terms`,
      { params }
    );
    return response.data;
  }

  async createProductAttributeTerm(
    attributeId: number,
    termData: Partial<CreateAttributeTermDto>
  ): Promise<AttributeTermDto> {
    const response = await this.api.post(
      `${this.endpoint}/${attributeId}/terms`,
      termData
    );
    return response.data;
  }

  async batchCreateProductAttributeTerms(
    attributeId: number,
    termsData: Partial<CreateAttributeTermDto>[]
  ): Promise<{
    create: AttributeTermDto[];
  }> {
    const response = await this.api.post(
      `${this.endpoint}/${attributeId}/terms/batch`,
      { create: termsData }
    );
    return response.data;
  }

  async updateProductAttributeTerm(
    attributeId: number,
    termId: number,
    termData: Partial<CreateAttributeTermDto>
  ): Promise<AttributeTermDto> {
    const response = await this.api.put(
      `${this.endpoint}/${attributeId}/terms/${termId}`,
      termData
    );
    return response.data;
  }

  async deleteProductAttributeTerm(
    attributeId: number,
    termId: number
  ): Promise<void> {
    const response = await this.api.delete(
      `${this.endpoint}/${attributeId}/terms/${termId}`,
      { params: { force: true } }
    );
    return response.data;
  }

  async batchDeleteProductAttributeTerms(
    attributeId: number,
    termIds: number[]
  ): Promise<void> {
    const response = await this.api.post(
      `${this.endpoint}/${attributeId}/terms/batch`,
      this.createBatchDeletePayload(termIds)
    );
    return response.data;
  }

  async batchUpdateProductAttributeTerms(
    attributeId: number,
    termsData: BatchUpdateAttributeTermsDto
  ): Promise<{
    create: AttributeTermDto[];
    update: AttributeTermDto[];
    delete: AttributeTermDto[];
  }> {
    const response = await this.api.post(
      `${this.endpoint}/${attributeId}/terms/batch`,
      termsData
    );
    return response.data;
  }
}
