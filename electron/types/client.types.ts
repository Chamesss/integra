import { Client } from "../models";
import { InferCreationAttributes } from "sequelize";

export interface CreateClientDto {
  name: string;
  type: "individual" | "company";
  phone: string;
  address: string;
  tva?: string | null;
}

export interface UpdateClientDto extends Partial<CreateClientDto> {
  id: number;
}

export interface ClientQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ClientDto extends InferCreationAttributes<Client> {}

export interface ClientService {
  save(data: CreateClientDto): Promise<ClientDto>;
  update(id: string, data: UpdateClientDto): Promise<ClientDto | null>;
  getOne(query: ClientQueryDto): Promise<ClientDto | null>;
  getAll(query?: ClientQueryDto): Promise<ClientDto[]>;
  delete(id: string): Promise<void>;
}
