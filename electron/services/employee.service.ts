import { CoreService } from "./core.service";
import { Employee } from "../models/employee";
import { EmployeeRepo } from "../repositories/employee.repo";
import { IResult, IResults } from "../types/core.types";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto,
} from "../types/employee.types";
import { logger } from "../utils/logger";
import { HttpException } from "../utils/http-exception";

export class EmployeeService extends CoreService<
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto
> {
  constructor(repo: EmployeeRepo) {
    super(repo);
  }

  async getAllWithFilters(
    query: EmployeeQueryDto,
    includeModel: any = [],
    attributes: any = []
  ): Promise<IResults<Employee>> {
    try {
      const { status, ...restQuery } = query;

      // Handle status filtering
      if (status) {
        if (!restQuery.fields) restQuery.fields = {};
        restQuery.fields.status = status;
      }

      return await this.repo.getAll(
        restQuery as Record<string, any>,
        includeModel,
        attributes
      );
    } catch (error: any) {
      logger.error("Error fetching employees with filters:", error);
      throw new HttpException(
        error.message || "Erreur lors de la récupération des employés",
        error.status || 500
      );
    }
  }

  async deleteEmployee(id: number): Promise<IResult<Employee>> {
    if (!id) {
      return {
        success: false,
        message: "Aucun ID d'employé fourni pour la suppression.",
      };
    }

    try {
      logger.info(`employee.service.deleteEmployee called with id=${id}`);
      // Ensure we pass the id in its original numeric form to the repo
      await this.repo.delete(id);
      return {
        success: true,
        message: "Employé supprimé avec succès.",
      };
    } catch (error: any) {
      logger.error("Error deleting employee:", error);
      return {
        success: false,
        message: error?.message || "Échec de la suppression de l'employé.",
      };
    }
  }

  async batchDelete(ids: number[]): Promise<IResult<void>> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "Aucun ID d'employé fourni pour la suppression.",
      };
    }

    try {
      // First, find which employees actually exist by using the model directly
      const existingEmployees = await this.repo.model.findAll({
        where: { id: ids },
        attributes: ["id"],
      });

      const existingIds = existingEmployees.map(
        (employee) => employee.get("id") as number
      );
      const missingIds = ids.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        return {
          success: false,
          message: "Aucun employé trouvé pour la suppression",
        };
      }

      // Only delete existing employees
      await this.repo.deleteMany(existingIds, {});

      let message = `${existingIds.length} employé(s) supprimé(s) avec succès`;
      if (missingIds.length > 0) {
        message += ` (${missingIds.length} employé(s) déjà supprimé(s))`;
      }

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      logger.error("Error deleting employees in batch:", error);
      return {
        success: false,
        error: error?.message || "Failed to delete employees in batch",
        message: "Batch deletion failed",
      };
    }
  }
}
