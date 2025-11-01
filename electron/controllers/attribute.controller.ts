import { CoreRepo } from "../repositories/core.repo";
import { Attribute, AttributeTerm } from "../models";
import { AttributeService } from "../services/attribute.service";
import { QueryParams } from "../types/core.types";
import {
  CreateAttributeDto,
  CreateAttributeWithTermsDto,
  UpdateAttributeDto,
} from "../types/attribute.types";
import { AttributeRepo } from "../repositories/attribute.repo";

export class AttributeController {
  private attributeRepo: CoreRepo<Attribute>;
  private attributeService: AttributeService;

  constructor() {
    this.attributeRepo = new AttributeRepo();
    this.attributeService = new AttributeService(this.attributeRepo);
  }

  async syncAndGetAttributes(queryParams: QueryParams) {
    return this.attributeService.syncAttributesFromWoo(queryParams);
  }

  async createAttribute(data: CreateAttributeDto) {
    return this.attributeService.createAttribute(data);
  }

  async createAttributeWithTerms(data: CreateAttributeWithTermsDto) {
    return this.attributeService.createAttributeWithTerms(data);
  }

  async deleteAttribute(object: { id: number }) {
    const id = object.id;
    return this.attributeService.deleteAttribute(id);
  }

  async batchDeleteAttributes(object: { ids: number[] }) {
    const ids = object.ids;
    return this.attributeService.batchDelete(ids);
  }

  async updateAttribute(data: UpdateAttributeDto) {
    return this.attributeService.updateAttribute(data);
  }

  async getAllAttributes(queryParams: QueryParams) {
    return this.attributeService.getAll(queryParams, [
      {
        model: AttributeTerm,
        as: "terms",
      },
    ]);
  }

  async getAttributeById(object: { id: string }) {
    const id = object.id;
    return this.attributeService.getById(id);
  }
}
