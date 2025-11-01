import { logger } from "../utils/logger";
import { ICoreRepo, IResults } from "../types/core.types";
import { HttpException } from "../utils/http-exception";
import { Model, ModelStatic, Op, Transaction, Includeable } from "sequelize";

export class CoreRepo<T extends Model> implements ICoreRepo<T> {
  public model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  async withTransaction<R>(
    callback: (transaction: Transaction) => Promise<R>
  ): Promise<R> {
    if (!this.model.sequelize) {
      throw new Error("Sequelize instance is not available on the model.");
    }

    const transaction = await this.model.sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async withRetry<R>(operation: () => Promise<R>, maxRetries = 5): Promise<R> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Check if it's a database lock error or timeout
        const isRetryableError =
          error.message?.includes("SQLITE_BUSY") ||
          error.message?.includes("database is locked") ||
          error.message?.includes("SequelizeTimeoutError") ||
          error.name === "SequelizeDatabaseError" ||
          error.name === "SequelizeTimeoutError" ||
          error.original?.code === "SQLITE_BUSY";

        if (isRetryableError && attempt < maxRetries) {
          // Exponential backoff with jitter: wait longer between retries
          const baseDelay = 500; // Start with 500ms
          const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 1000; // Add up to 1s random jitter
          const delay = Math.min(exponentialDelay + jitter, 10000); // Cap at 10s

          logger.warn(
            `Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${Math.round(delay)}ms...`,
            { error: error.message, operation: operation.name }
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // For non-retryable errors or max retries reached, throw immediately
        throw error;
      }
    }

    throw lastError!;
  }

  async save(
    data: Partial<T>,
    options?: { transaction?: Transaction }
  ): Promise<T> {
    return this.withRetry(async () => {
      try {
        return await this.model.create(data as any, {
          validate: false,
          transaction: options?.transaction,
        });
      } catch (error: any) {
        logger.error("Error creating entity:", error);
        throw new HttpException("Create failed", 500, error.message);
      }
    });
  }

  async update(
    id: string | number,
    data: Partial<T>,
    transaction?: Transaction
  ): Promise<T | null> {
    return this.withRetry(async () => {
      try {
        const entity = await this.model.findByPk(id);
        if (!entity) throw new HttpException("Entity not found", 404);
        return await entity.update(data, { transaction });
      } catch (error: any) {
        logger.error("Error updating entity:", error);
        throw new HttpException(
          "Update failed",
          error.status || 500,
          error.message
        );
      }
    });
  }

  async updateMany(
    filter: Record<string, any>,
    data: Partial<T>
  ): Promise<void> {
    try {
      await this.model.update(data, { where: filter as any });
    } catch (error: any) {
      logger.error("Error updating many:", error);
      throw new HttpException(
        "Update many failed",
        error.status || 500,
        error.message
      );
    }
  }

  async deleteMany(
    ids: Array<string | number>,
    fields?: object,
    transaction?: Transaction
  ): Promise<void> {
    return this.withRetry(async () => {
      try {
        const entities = await this.model.findAll({
          where: { id: { [Op.in]: ids }, ...fields } as any,
        });

        const foundIds = entities.map((e) => e.get("id"));
        const missingIds = ids.filter((id) => !foundIds.includes(id));

        if (missingIds.length > 0) {
          throw new HttpException(
            "Some entities not found",
            404,
            `${missingIds}`
          );
        }

        await this.model.destroy({
          where: { id: { [Op.in]: ids }, ...fields } as any,
          transaction,
        });
      } catch (error: any) {
        logger.error("Error deleting many:", error);
        throw new HttpException(
          "Delete many failed",
          error.status || 500,
          error.message
        );
      }
    });
  }

  async delete(id: string | number, transaction?: Transaction): Promise<void> {
    try {
      const entity = await this.model.findOne({
        where: { id } as any,
      });
      if (!entity) throw new HttpException("Entity not found", 404);
      await entity.destroy({ transaction });
    } catch (error: any) {
      logger.error("Error deleting entity:", error);
      throw new HttpException(
        error.message || "Delete failed",
        error.status || 500
      );
    }
  }

  async getById(
    id: string | number,
    includeModel: Includeable[] = [],
    attributes: any = []
  ): Promise<T | null> {
    try {
      return await this.model.findByPk(id, {
        include: includeModel,
        ...(Array.isArray(attributes) && attributes.length
          ? { attributes }
          : {}),
      });
    } catch (error: any) {
      logger.error("Error fetching by ID:", error);
      throw new HttpException("Fetch by ID failed", 404, error.message);
    }
  }

  async getAll(
    query: Record<string, any>,
    includeModel: any = [],
    attributes: any = [],
    paranoid = true
  ): Promise<IResults<T>> {
    try {
      const {
        search,
        search_key,
        page = 1,
        limit = 10,
        sort = "desc",
        sortKey = "createdAt",
        fields,
      } = query;

      const offset = (Number(page) - 1) * Number(limit);
      const queryFields: any = {};

      if (search && search_key) {
        queryFields[search_key] = {
          [Op.like]: `%${search}%`,
          [Op.not]: null,
        };
      }

      if (fields) {
        for (const [key, value] of Object.entries(fields)) {
          if (value) queryFields[key] = value;
        }
      }

      const count = await this.model.count({
        where: queryFields,
        include: includeModel,
      });

      const { rows } = await this.model.findAndCountAll({
        limit: Number(limit),
        offset,
        where: queryFields,
        order: [[sortKey, sort]],
        include: includeModel,
        paranoid,
        ...(Array.isArray(attributes) && attributes.length
          ? { attributes }
          : {}),
      });

      const jsonRows = rows.map((row) => {
        if (row instanceof Model) {
          return row.toJSON() as T;
        }
        return row;
      });

      return { count, rows: jsonRows, success: true };
    } catch (error: any) {
      logger.error("Error fetching all:", error);
      throw new HttpException(
        "Erreur lors de la récupération des données",
        500,
        error.message
      );
    }
  }

  async getOne(
    fields: Record<string, any>,
    includeModel: any = [],
    attributes: any = []
  ): Promise<T | null> {
    try {
      return await this.model
        .findOne({
          where: { ...fields } as any,
          include: includeModel,
          ...(Array.isArray(attributes) && attributes.length
            ? { attributes }
            : {}),
        })
        .then((entity) => {
          if (!entity) return null;
          return entity.toJSON() as T;
        });
    } catch (error: any) {
      logger.error("Error fetching one:", error);
      throw new HttpException("Fetch one failed", 500, error.message);
    }
  }

  async findByIds(
    ids: string[] | number[],
    fields: Record<string, any>,
    includeModel: any = [],
    attributes: any = []
  ): Promise<T[]> {
    try {
      const entities = await this.model.findAll({
        where: { id: ids, ...fields } as any,
        include: includeModel,
        ...(Array.isArray(attributes) && attributes.length
          ? { attributes }
          : {}),
      });

      const foundIds = entities.map((e) => e.get("id") as string | number);
      const missingIds = ids.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new HttpException(
          "Some entities not found",
          404,
          `${missingIds}`
        );
      }

      return entities;
    } catch (error: any) {
      logger.error("Error finding by IDs:", error);
      throw new HttpException(
        "Find by IDs failed",
        error.status || 500,
        error.message
      );
    }
  }

  async count(
    query: Record<string, any>,
    includeModel: any = [],
    attributes: any = []
  ): Promise<number> {
    try {
      return await this.model.count({
        where: query,
        include: includeModel,
        ...(Array.isArray(attributes) && attributes.length
          ? { attributes }
          : {}),
      });
    } catch (error: any) {
      logger.error("Error counting:", error);
      throw new HttpException("Count failed", 500, error.message);
    }
  }

  async upsert(
    data: Partial<T>,
    options?: { transaction?: Transaction }
  ): Promise<T> {
    return this.withRetry(async () => {
      try {
        return await this.model
          .upsert(data as any, {
            returning: true,
            transaction: options?.transaction,
          })
          .then(([instance]) => instance);
      } catch (error: any) {
        logger.error("Error upserting entity:", error);
        throw new HttpException("Upsert failed", 500, error.message);
      }
    });
  }
}
