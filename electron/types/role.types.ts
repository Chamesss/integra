export interface RoleDto {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleCreateDto {
  name: string;
}

export interface RoleQueryDto {
  id?: string;
  name?: string;
}

export interface RoleUpdateDto {
  id: string;
  name?: string;
}
export interface RoleService {
  save(data: RoleCreateDto): Promise<RoleDto>;
  update(id: string, data: RoleUpdateDto): Promise<RoleDto | null>;
  getOne(query: RoleQueryDto): Promise<RoleDto | null>;
  getAll(query?: RoleQueryDto): Promise<RoleDto[]>;
  delete(id: string): Promise<void>;
}
