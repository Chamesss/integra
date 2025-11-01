export interface UserDto {
  id: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  Role?: {
    id: string;
    name: string;
  } | null;
  roleId?: string;
  banned?: boolean;
}

export interface UserCreateDto {
  email: string;
  name: string;
  password: string;
  avatar?: string;
  roleId?: string;
}

export interface UserQueryDto {
  id?: string;
  email?: string;
  name?: string;
  roleId?: string;
  banned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserUpdateDto {
  id: string;
  email?: string;
  name?: string;
  password?: string;
  avatar?: string;
  roleId?: string;
  banned?: boolean;
}

export interface UserLoginDto {
  name: string;
  password: string;
}

export interface UserLoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface UserFromTokenResponse {
  success: boolean;
  user?: UserDto;
  error?: string;
}

export interface UserService {
  save(data: UserCreateDto): Promise<UserDto>;
  update(id: string, data: UserUpdateDto): Promise<UserDto | null>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<UserDto | null>;
  getAll(query: UserQueryDto): Promise<UserDto[]>;
  getOne(fields: Partial<UserQueryDto>): Promise<UserDto | null>;
  login(data: UserLoginDto): Promise<UserLoginResponse>;
  getUserFromToken(token: string): Promise<UserFromTokenResponse>;
}
