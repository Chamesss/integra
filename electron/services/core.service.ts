import { Transaction, Model } from "sequelize";
import { sequelize } from "../database/db";
import { CoreRepo } from "../repositories/core.repo";
import { IResults } from "../types/core.types";

export class CoreService<T extends Model, CreateDTO, QueryDTO, UpdateDTO> {
  protected readonly repo: CoreRepo<T>;

  constructor(repo: CoreRepo<T>) {
    this.repo = repo;
  }

  /**
   * Start a database transaction
   */
  async startTransaction(): Promise<Transaction> {
    return await sequelize.transaction();
  }
  async save(data: CreateDTO, transaction?: Transaction): Promise<T> {
    return this.repo.save(data as Partial<T>, { transaction });
  }

  async getAll(
    query: QueryDTO,
    includeModel: any = [],
    attributes: any = []
  ): Promise<IResults<T>> {
    return this.repo.getAll(
      query as Record<string, any>,
      includeModel,
      attributes
    );
  }

  async getById(
    id: string | number,
    includeModel: any = [],
    attributes: any = []
  ): Promise<T | null> {
    return this.repo.getById(id, includeModel, attributes).then((entity) => {
      if (!entity) {
        throw new Error(`Entity with id ${id} not found`);
      }
      return entity.toJSON() as T;
    });
  }

  async getOne(
    fields: Record<string, any>,
    includeModel: any = [],
    attributes: any = []
  ): Promise<T | null> {
    return this.repo.getOne(fields, includeModel, attributes);
  }

  async findByIds(
    ids: string[] | number[],
    fields: Record<string, any> = {},
    includeModel: any = [],
    attributes: any = []
  ): Promise<T[]> {
    return this.repo.findByIds(ids, fields, includeModel, attributes);
  }

  async update(
    id: string,
    data: UpdateDTO,
    transaction?: Transaction
  ): Promise<T | null> {
    return this.repo.update(id, data as Partial<T>, transaction);
  }

  async updateMany(
    filter: Record<string, string | string[] | number | Date | boolean>,
    data: UpdateDTO
  ) {
    return this.repo.updateMany(filter, data as Partial<T>);
  }

  async deleteMany(
    ids: string[] | number[],
    fields: object = {},
    transaction?: Transaction
  ): Promise<void> {
    await this.repo.deleteMany(ids, fields, transaction);
  }

  async delete(id: string | number, transaction?: Transaction): Promise<void> {
    await this.repo.delete(id, transaction);
  }

  async count(
    query: Record<string, any>,
    includeModel: any = []
  ): Promise<number> {
    return this.repo.count(query as Record<string, any>, includeModel);
  }
}
