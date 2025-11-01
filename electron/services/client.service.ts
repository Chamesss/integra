import {
  CreateClientDto,
  ClientQueryDto,
  UpdateClientDto,
} from "../types/client.types";
import { Client } from "../models";
import { CoreRepo } from "../repositories/core.repo";
import { CoreService } from "./core.service";
import { IResult, IResults, QueryParams } from "../types/core.types";
import { logger } from "../utils/logger";

export class ClientService extends CoreService<
  Client,
  CreateClientDto,
  ClientQueryDto,
  UpdateClientDto
> {
  constructor(repo: CoreRepo<Client>) {
    super(repo);
  }

  async getAllClients(queryParams: QueryParams): Promise<IResults<Client>> {
    try {
      const clients = await this.repo.getAll(queryParams);
      return {
        ...clients,
        success: true,
      };
    } catch (error: any) {
      logger.error("Error fetching all clients:", error);
      return {
        success: false,
        error: error?.message || "Failed to fetch clients",
        message: "Fetch failed",
        count: 0,
        rows: [],
      };
    }
  }

  async create(data: CreateClientDto): Promise<IResult<Client>> {
    try {
      const createdClient = await this.repo.save(data);
      return {
        success: true,
        data: createdClient,
        message: "Client créé avec succès",
      };
    } catch (error: any) {
      logger.error("Error creating client:", error);
      return {
        success: false,
        error: error?.message || "Failed to create client",
        message: "Creation failed",
      };
    }
  }

  async updateClient(data: UpdateClientDto): Promise<IResult<Client>> {
    const { id, ...updateData } = data;
    try {
      const updatedClient = await this.repo.update(id, updateData);
      if (!updatedClient) {
        return {
          success: false,
          message: "Client non trouvé",
        };
      } else {
        return {
          success: true,
          data: updatedClient,
          message: "Client mis à jour avec succès",
        };
      }
    } catch (error: any) {
      logger.error("Error updating client:", error);
      return {
        success: false,
        error: error?.message || "Failed to update client",
        message: "Update failed",
      };
    }
  }

  async deleteClient(id: number): Promise<IResult<void>> {
    try {
      await this.repo.delete(id.toString());
      return {
        success: true,
        message: "Client supprimé avec succès",
      };
    } catch (error: any) {
      logger.error("Error deleting client:", error);
      return {
        success: false,
        error: error?.message || "Failed to delete client",
        message: "Deletion failed",
      };
    }
  }

  async batchDelete(ids: number[]): Promise<IResult<void>> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        message: "Aucun ID de client fourni pour la suppression.",
      };
    }

    try {
      // First, find which clients actually exist by using the model directly
      const existingClients = await this.repo.model.findAll({
        where: { id: ids },
        attributes: ["id"],
      });

      const existingIds = existingClients.map(
        (client) => client.get("id") as number
      );
      const missingIds = ids.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        return {
          success: false,
          message: "Aucun client trouvé pour la suppression",
        };
      }

      // Only delete existing clients
      await this.repo.deleteMany(existingIds, {});

      let message = `${existingIds.length} client(s) supprimé(s) avec succès`;
      if (missingIds.length > 0) {
        message += ` (${missingIds.length} client(s) déjà supprimé(s))`;
      }

      return {
        success: true,
        message,
      };
    } catch (error: any) {
      logger.error("Error deleting clients in batch:", error);
      return {
        success: false,
        error: error?.message || "Failed to delete clients in batch",
        message: "Batch deletion failed",
      };
    }
  }
}
