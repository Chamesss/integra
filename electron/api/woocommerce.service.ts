import { WooProductService } from "./services/woo-product.service";
import { WooCategoryService } from "./services/woo-category.service";
import { WooAttributeService } from "./services/woo-attribute.service";
import {
  AttributeTermDto,
  BatchUpdateAttributeTermsDto,
  CreateAttributeTermDto,
} from "../types/attribute.types";
import { WooMediaService } from "./utils/woo-media";
import {
  CreateVariationDto,
  UpdateVariationDto,
  CreateWooProductDto,
} from "@electron/types/product.types";
import { WooTagService } from "./services/woo-tag.service";

export class WooCommerceService {
  public readonly products: WooProductService;
  public readonly categories: WooCategoryService;
  public readonly attributes: WooAttributeService;
  public readonly tags: WooTagService; // Using attributes service for tags
  public readonly media: WooMediaService;

  constructor() {
    this.products = new WooProductService();
    this.categories = new WooCategoryService();
    this.attributes = new WooAttributeService();
    this.tags = new WooTagService(); // Reusing categories service for tags
    this.media = new WooMediaService();
  }

  // Legacy methods for backward compatibility
  // Products
  async getProducts(params?: Record<string, any>) {
    return this.products.getProducts(params);
  }

  async getProduct(id: number) {
    return this.products.getProduct(id);
  }

  async createProduct(productData: CreateWooProductDto) {
    return this.products.createProduct(productData);
  }

  async updateProduct(id: number, productData: any) {
    return this.products.updateProduct(id, productData);
  }

  async deleteProduct(id: number) {
    return this.products.deleteProduct(id);
  }

  async batchDeleteProducts(productIds: number[]) {
    return this.products.batchDeleteProducts(productIds);
  }

  // Categories
  async getCategories(params?: Record<string, any>) {
    return this.categories.getCategories(params);
  }

  async getCategory(id: number) {
    return this.categories.getCategory(id);
  }

  async createCategory(categoryData: any) {
    return this.categories.createCategory(categoryData);
  }

  async updateCategory(id: number, categoryData: any) {
    return this.categories.updateCategory(id, categoryData);
  }

  async deleteCategory(id: number) {
    return this.categories.deleteCategory(id);
  }

  async batchDeleteCategories(categoryIds: number[]) {
    return this.categories.batchDeleteCategories(categoryIds);
  }

  // Attributes
  async getProductAttributes(params?: Record<string, any>) {
    return this.attributes.getProductAttributes(params);
  }

  async getProductAttribute(id: number) {
    return this.attributes.getProductAttribute(id);
  }

  async createProductAttribute(attributeData: CreateAttributeTermDto) {
    return this.attributes.createProductAttribute(attributeData);
  }

  async updateProductAttribute(id: number, attributeData: any) {
    return this.attributes.updateProductAttribute(id, attributeData);
  }

  async deleteProductAttribute(id: number) {
    return this.attributes.deleteProductAttribute(id);
  }

  async batchDeleteProductAttributes(attributeIds: number[]) {
    return this.attributes.batchDeleteProductAttributes(attributeIds);
  }

  // Attribute Terms
  async getProductAttributeTerms(
    attributeId: number,
    params?: Record<string, any>
  ) {
    return this.attributes.getProductAttributeTerms(attributeId, params);
  }

  async createProductAttributeTerm(attributeId: number, termData: any) {
    return this.attributes.createProductAttributeTerm(attributeId, termData);
  }

  async batchCreateProductAttributeTerms(
    attributeId: number,
    termsData: CreateAttributeTermDto[]
  ): Promise<{
    create: AttributeTermDto[];
  }> {
    return this.attributes.batchCreateProductAttributeTerms(
      attributeId,
      termsData
    );
  }

  async updateProductAttributeTerm(
    attributeId: number,
    termId: number,
    termData: any
  ) {
    return this.attributes.updateProductAttributeTerm(
      attributeId,
      termId,
      termData
    );
  }

  async deleteProductAttributeTerm(attributeId: number, termId: number) {
    return this.attributes.deleteProductAttributeTerm(attributeId, termId);
  }

  async batchDeleteProductAttributeTerms(
    attributeId: number,
    termIds: number[]
  ) {
    return this.attributes.batchDeleteProductAttributeTerms(
      attributeId,
      termIds
    );
  }

  async batchUpdateProductAttributeTerms(
    attributeId: number,
    termsData: BatchUpdateAttributeTermsDto
  ): Promise<{
    create: AttributeTermDto[];
    update: AttributeTermDto[];
    delete: AttributeTermDto[];
  }> {
    return this.attributes.batchUpdateProductAttributeTerms(
      attributeId,
      termsData
    );
  }

  // tags

  async getTags(params?: Record<string, any>) {
    return this.tags.getTags(params);
  }

  async getTagById(id: number) {
    return this.tags.getTag(id);
  }

  async createTag(tagData: any) {
    return this.tags.createTag(tagData);
  }

  async updateTag(id: number, tagData: any) {
    return this.tags.updateTag(id, tagData);
  }

  async deleteTag(id: number) {
    return this.tags.deleteTag(id);
  }

  async batchDeleteTags(tagIds: number[]) {
    return this.tags.batchDeleteTags(tagIds);
  }

  // Media
  async uploadMediaFromPath(filePath: string) {
    return this.media.uploadMediaFromPath(filePath);
  }

  async uploadMediaFromBuffer(fileBuffer: Buffer, fileName: string) {
    return this.media.uploadMediaFromBuffer(fileBuffer, fileName);
  }

  // Product Variations
  async getProductVariations(productId: number): Promise<any[]> {
    return this.products.getProductVariations(productId);
  }

  async getProductVariation(
    productId: number,
    variationId: number
  ): Promise<any> {
    return this.products.getProductVariation(productId, variationId);
  }

  async createProductVariation(
    productId: number,
    variationData: CreateVariationDto
  ): Promise<any> {
    return this.products.createProductVariation(productId, variationData);
  }

  async updateProductVariation(
    productId: number,
    variationId: number,
    variationData: CreateVariationDto
  ): Promise<any> {
    return this.products.updateProductVariation(
      productId,
      variationId,
      variationData
    );
  }

  async deleteProductVariation(
    productId: number,
    variationId: number
  ): Promise<any> {
    return this.products.deleteProductVariation(productId, variationId);
  }

  async batchCreateProductVariations(
    productId: number,
    variations: CreateVariationDto[]
  ): Promise<any> {
    return this.products.batchCreateProductVariations(productId, variations);
  }

  async batchUpdateProductVariations(
    productId: number,
    variations: UpdateVariationDto[]
  ): Promise<any> {
    return this.products.batchUpdateProductVariations(productId, variations);
  }

  async batchOperationsProductVariations(
    productId: number,
    operations: {
      create?: CreateVariationDto[];
      update?: UpdateVariationDto[];
      delete?: number[];
    }
  ): Promise<any> {
    return this.products.batchOperationsProductVariations(
      productId,
      operations
    );
  }
}
