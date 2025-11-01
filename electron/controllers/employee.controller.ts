import { IpcMainInvokeEvent } from "electron";
import { EmployeeService } from "../services/employee.service";
import { EmployeeRepo } from "../repositories/employee.repo";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeQueryDto,
} from "../types/employee.types";
import { logger } from "../utils/logger";

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    const employeeRepo = new EmployeeRepo();
    this.employeeService = new EmployeeService(employeeRepo);
  }

  async getAll(
    _event: IpcMainInvokeEvent,
    query: EmployeeQueryDto
  ): Promise<any> {
    try {
      const result = await this.employeeService.getAllWithFilters(query);
      return {
        success: true,
        rows: result.rows,
        count: result.count,
        message: "Employés récupérés avec succès",
      };
    } catch (error: any) {
      logger.error("Error fetching employees:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération des employés",
      };
    }
  }

  async getById(_event: IpcMainInvokeEvent, id: number): Promise<any> {
    try {
      const result = await this.employeeService.getById(id);
      if (!result) {
        return {
          success: false,
          message: "Employé non trouvé",
        };
      }
      return {
        success: true,
        data: result,
        message: "Employé récupéré avec succès",
      };
    } catch (error: any) {
      logger.error("Error fetching employee by ID:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération de l'employé",
      };
    }
  }

  async create(
    _event: IpcMainInvokeEvent,
    data: CreateEmployeeDto
  ): Promise<any> {
    try {
      const result = await this.employeeService.save(data);
      return {
        success: true,
        data: result,
        message: "Employé créé avec succès",
      };
    } catch (error: any) {
      logger.error("Error creating employee:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la création de l'employé",
      };
    }
  }

  async update(
    _event: IpcMainInvokeEvent,
    id: number,
    data: UpdateEmployeeDto
  ): Promise<any> {
    try {
      const result = await this.employeeService.update(id.toString(), data);
      return {
        success: true,
        data: result,
        message: "Employé mis à jour avec succès",
      };
    } catch (error: any) {
      logger.error("Error updating employee:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour de l'employé",
      };
    }
  }

  async delete(_event: IpcMainInvokeEvent, data: { id: number }): Promise<any> {
    logger.info(`employee.controller.delete called with id=${data.id}`);
    return await this.employeeService.deleteEmployee(data.id);
  }

  async batchDelete(
    _event: IpcMainInvokeEvent,
    data: { ids: number[] }
  ): Promise<any> {
    return this.employeeService.batchDelete(data.ids);
  }
}
