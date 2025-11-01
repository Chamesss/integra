import { Role } from "../models";
import { CoreRepo } from "../repositories/core.repo";
import {
  RoleCreateDto,
  RoleQueryDto,
  RoleUpdateDto,
} from "../types/role.types";
import { CoreService } from "./core.service";

export class RoleService extends CoreService<
  Role,
  RoleCreateDto,
  RoleQueryDto,
  RoleUpdateDto
> {
  constructor(repo: CoreRepo<Role>) {
    super(repo);
  }

  async getByName(name: string): Promise<Role | null> {
    return this.repo.getOne({ name }).then((role) => {
      if (!role) {
        return null;
      }
      return role;
    });
  }
}
