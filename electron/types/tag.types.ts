import { Tag } from "../models";
import { InferCreationAttributes } from "sequelize";

export interface CreateTagDto {
  name: string;
  description?: string;
}

export interface UpdateTagDto extends Partial<CreateTagDto> {
  id: number;
}

export interface TagQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface TagDto extends InferCreationAttributes<Tag> {}

export interface TagService {
  save(data: CreateTagDto): Promise<TagDto>;
  update(id: string, data: UpdateTagDto): Promise<TagDto | null>;
  getOne(query: TagQueryDto): Promise<TagDto | null>;
  getAll(query?: TagQueryDto): Promise<TagDto[]>;
  delete(id: string): Promise<void>;
}
