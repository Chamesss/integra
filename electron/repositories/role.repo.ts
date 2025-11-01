import { CoreRepo } from "./core.repo";
import { Role } from "../models";

export class RoleRepo extends CoreRepo<Role> {
  constructor() {
    super(Role);
  }
}
