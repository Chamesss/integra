import { CoreRepo } from "../repositories/core.repo";
import { Tag } from "../models";
import { IResult, IResults, QueryParams } from "../types/core.types";
import { TagService } from "../services/tag.service";
import { TagRepo } from "../repositories/tag.repo";
import { CreateTagDto, TagDto, UpdateTagDto } from "../types/tag.types";

export class TagController {
  private tagRepo: CoreRepo<Tag>;
  private tagService: TagService;

  constructor() {
    this.tagRepo = new TagRepo();
    this.tagService = new TagService(this.tagRepo);
  }

  async syncAndGetTags(queryParams: QueryParams): Promise<IResults<TagDto>> {
    return this.tagService.syncTagsFromWoo(queryParams);
  }

  async getAllTags(queryParams: QueryParams): Promise<IResults<TagDto>> {
    return this.tagService.getAllTags(queryParams);
  }

  async createTags(data: CreateTagDto): Promise<IResult<TagDto>> {
    return this.tagService.create(data);
  }

  async deleteTag(object: { id: number }) {
    const id = object.id;
    return this.tagService.deleteTag(id);
  }

  async batchDeleteTags(object: { ids: number[] }) {
    const ids = object.ids;
    return this.tagService.batchDelete(ids);
  }

  async updateTag(data: UpdateTagDto) {
    return this.tagService.updateTag(data);
  }
}
