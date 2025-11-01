import {
  UserCreateDto,
  UserDto,
  UserLoginDto,
  UserLoginResponse,
} from "../types/user.types";
import { CoreRepo } from "../repositories/core.repo";
import { UserService } from "../services/auth.service";
import { User } from "../models";
import { UserRepo } from "../repositories/user.repo";
import { IResult } from "electron/types/core.types";

export class AuthController {
  private userRepo: CoreRepo<User>;
  private userService: UserService;

  constructor() {
    this.userRepo = new UserRepo();
    this.userService = new UserService(this.userRepo);
  }

  async login(props: UserLoginDto): Promise<UserLoginResponse> {
    const { name, password } = props;
    return this.userService.login(name, password);
  }

  async register(props: UserCreateDto): Promise<IResult<UserDto>> {
    return this.userService.register(props);
  }

  async getUser(token: string): Promise<IResult<UserDto>> {
    return this.userService.getUserFromToken(token);
  }
}
