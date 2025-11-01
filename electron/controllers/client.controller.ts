import { CoreRepo } from "../repositories/core.repo";
import { Client } from "../models";
import { IResult, IResults, QueryParams } from "../types/core.types";
import { ClientService } from "../services/client.service";
import { ClientRepo } from "../repositories/client.repo";
import { CreateClientDto, UpdateClientDto } from "../types/client.types";

export class ClientController {
  private clientRepo: CoreRepo<Client>;
  private clientService: ClientService;

  constructor() {
    this.clientRepo = new ClientRepo();
    this.clientService = new ClientService(this.clientRepo);
  }

  async getAllClients(queryParams: QueryParams): Promise<IResults<Client>> {
    return this.clientService.getAllClients(queryParams);
  }

  async createClient(data: CreateClientDto): Promise<IResult<Client>> {
    return this.clientService.create(data);
  }

  async deleteClient(object: { id: number }) {
    const id = object.id;
    return this.clientService.deleteClient(id);
  }

  async batchDeleteClients(object: { ids: number[] }) {
    const ids = object.ids;
    return this.clientService.batchDelete(ids);
  }

  async updateClient(data: UpdateClientDto) {
    return this.clientService.updateClient(data);
  }
}
