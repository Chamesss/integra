import { CoreRepo } from "./core.repo";
import { User } from "../models";

export class UserRepo extends CoreRepo<User> {
  constructor() {
    super(User);
  }
}
