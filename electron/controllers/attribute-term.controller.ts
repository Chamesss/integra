import { CoreRepo } from "../repositories/core.repo";
import { AttributeTerm } from "../models/attribute-term";
import { AttributeTermService } from "../services/attribute-term.service";
import { IResult, QueryParams } from "../types/core.types";
import {
  CreateAttributeTermDto,
  UpdateAttributeTermDto,
  AttributeTermQueryDto,
  BatchUpdateAttributeTermsDto,
} from "../types/attribute.types";
import { AttributeTermRepo } from "../repositories/attribute-term.repo";
import { Attribute } from "../models";
import { AttributeService } from "../services/attribute.service";

export class AttributeTermController {
  private attributeTermRepo: CoreRepo<AttributeTerm>;
  private attributeTermService: AttributeTermService;
  private attributeRepo: CoreRepo<Attribute>;
  private attributeService: AttributeService;

  constructor() {
    this.attributeTermRepo = new AttributeTermRepo();
    this.attributeTermService = new AttributeTermService(
      this.attributeTermRepo
    );
    this.attributeRepo = new CoreRepo(Attribute);
    this.attributeService = new AttributeService(this.attributeRepo);
  }

  async syncAndGetAttributeTerms(object: {
    attributeId: number;
    queryParams: QueryParams;
  }) {
    const { attributeId, queryParams } = object;
    return this.attributeTermService.syncAttributeTermsFromWoo(
      attributeId,
      queryParams
    );
  }

  async createAttributeTerm(data: CreateAttributeTermDto) {
    return this.attributeTermService.create(data);
  }

  async deleteAttributeTerm(object: { id: number }) {
    const id = object.id;
    return this.attributeTermService.deleteAttributeTerm(id);
  }

  async batchDeleteAttributeTerms(object: { ids: number[] }) {
    const ids = object.ids;
    return this.attributeTermService.batchDelete(ids);
  }

  async updateAttributeTerm(data: UpdateAttributeTermDto) {
    return this.attributeTermService.updateAttributeTerm(data);
  }

  async getAllAttributeTerms(queryParams: AttributeTermQueryDto) {
    return this.attributeTermService.getAll(queryParams);
  }

  async getAttributeTermById(object: { id: string }) {
    const id = object.id;
    return this.attributeTermService.getById(id);
  }

  async getAttributeTermsByAttributeId(object: {
    attributeId: number;
    queryParams: AttributeTermQueryDto;
  }) {
    const { attributeId, queryParams } = object;
    return this.attributeTermService.getAttributeTermsByAttributeId(
      attributeId,
      queryParams
    );
  }

  async batchUpdateProductAttributeTerms(object: {
    attributeId: number;
    termsData: BatchUpdateAttributeTermsDto;
  }): Promise<IResult<null>> {
    const { attributeId, termsData } = object;
    const response =
      await this.attributeTermService.batchUpdateProductAttributeTerms(
        attributeId,
        termsData
      );
    await this.attributeService.syncAttributesFromWoo({
      limit: 9999,
    });
    return response;
  }
}
