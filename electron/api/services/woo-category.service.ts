import { BaseWooService } from "./base-woo.service";
import { Category } from "../../models/category";
import { InferAttributes } from "sequelize";

export class WooCategoryService extends BaseWooService {
  private readonly endpoint = "/wp-json/wc/v3/products/categories";

  async getCategories(
    params?: Record<string, any>
  ): Promise<InferAttributes<Category>[]> {
    const response = await this.api.get(this.endpoint, { params });
    return response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await this.api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const response = await this.api.post(this.endpoint, categoryData);
    return response.data;
  }

  async updateCategory(
    id: number,
    categoryData: Partial<Category>
  ): Promise<Category> {
    const response = await this.api.put(`${this.endpoint}/${id}`, categoryData);
    return response.data;
  }

  async deleteCategory(id: number): Promise<any> {
    const response = await this.api.delete(`${this.endpoint}/${id}`, {
      params: { force: true },
    });
    return response.data;
  }

  async batchDeleteCategories(categoryIds: number[]): Promise<any> {
    const response = await this.api.post(
      `${this.endpoint}/batch`,
      this.createBatchDeletePayload(categoryIds)
    );
    return response.data;
  }
}
