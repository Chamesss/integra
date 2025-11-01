import { Model } from "sequelize";

export type IResults<
  T,
  K = undefined,
  Key extends string = "additionalData"
> = {
  count: number;
  rows: T[];
  message?: string;
  error?: string;
  status?: number;
  success: boolean;
} & {
  [P in Key]?: K;
};

export interface IResult<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  status?: number;
  token?: string;
}

export interface ICoreRepo<T extends Model> {
  save(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  updateMany(filter: Record<string, any>, data: Partial<T>): Promise<void>;
  deleteMany(ids: string[], fields: object): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string, includeModel?: any, attributes?: any): Promise<T | null>;
  getAll(
    query: Record<string, any>,
    includeModel?: any,
    attributes?: any,
    paranoid?: boolean
  ): Promise<IResults<T>>;
  getOne(
    fields: Record<string, any>,
    includeModel?: any,
    attributes?: any
  ): Promise<T | null>;
  findByIds(
    ids: string[],
    fields: Record<string, any>,
    includeModel?: any,
    attributes?: any
  ): Promise<T[]>;
  count(
    query: Record<string, any>,
    includeModel?: any,
    attributes?: any
  ): Promise<number>;
  upsert(data: Partial<T>, options?: { transaction?: any }): Promise<T>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortKey?: string;
  sort?: "asc" | "desc";
  [key: string]: any;
}
