import { TagDto } from "../../types/tag.types";
import { BaseWooService } from "./base-woo.service";

export class WooTagService extends BaseWooService {
  private readonly endpoint = "/wp-json/wc/v3/products/tags";

  async getTags(params?: Record<string, any>): Promise<TagDto[]> {
    const response = await this.api.get(this.endpoint, { params });
    return response.data;
  }

  async getTag(id: number): Promise<TagDto> {
    const response = await this.api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async createTag(tagData: any): Promise<TagDto> {
    const response = await this.api.post(this.endpoint, tagData);
    return response.data;
  }

  async updateTag(id: number, tagData: any): Promise<TagDto> {
    const response = await this.api.put(`${this.endpoint}/${id}`, tagData);
    return response.data;
  }

  async deleteTag(id: number) {
    const response = await this.api.delete(`${this.endpoint}/${id}`, {
      data: { force: true },
    });
    return response.data;
  }

  async batchDeleteTags(tagIds: number[]) {
    const response = await this.api.post(
      `${this.endpoint}/batch`,
      this.createBatchDeletePayload(tagIds)
    );
    return response.data;
  }
}
