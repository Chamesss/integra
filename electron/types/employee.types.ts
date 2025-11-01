import { EmployeeContractType, EmployeeStatus } from "../models/employee";

export interface CreateEmployeeDto {
  name: string;
  phone: string;
  email: string;
  address: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: EmployeeStatus;
  picture?: string | null;
  contract_type?: EmployeeContractType;
}

export interface UpdateEmployeeDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: EmployeeStatus;
  picture?: string | null;
  contract_type?: EmployeeContractType;
}

export interface EmployeeQueryDto {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  status?: EmployeeStatus;
  contract_type?: EmployeeContractType;
  search?: string;
  search_key?: string;
  page?: number;
  limit?: number;
  sortKey?: string;
  sort?: "asc" | "desc";
  fields?: Record<string, any>;
}

export { EmployeeStatus };
