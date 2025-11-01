import { User } from "../models";
import {
  UserCreateDto,
  UserDto,
  UserQueryDto,
  UserUpdateDto,
} from "../types/user.types";
import { Transaction } from "sequelize";
import { CoreService } from "./core.service";
import { CoreRepo } from "../repositories/core.repo";
import jwt from "jsonwebtoken";
import { RoleService } from "./role.service";
import { RoleRepo } from "../repositories/role.repo";
import { IResult } from "../types/core.types";
import { logger } from "../utils/logger";
import bcrypt from "bcryptjs";
import { EXPIRES, JWT_SECRET } from "../config";

export class UserService extends CoreService<
  User,
  UserCreateDto,
  UserQueryDto,
  UserUpdateDto
> {
  private Role = new RoleService(new RoleRepo());

  constructor(repo: CoreRepo<User>) {
    super(repo);
  }

  // Override save to hash password and check for existing user
  async register(
    data: UserCreateDto,
    transaction?: Transaction
  ): Promise<IResult<UserDto>> {
    try {
      const existing = await this.repo.getOne({
        name: data.name,
      });
      if (existing) {
        throw new Error("Un utilisateur existe déjà avec ce nom");
      }
      const adminRole = await this.Role.getByName("admin");
      if (!adminRole) {
        throw new Error("Le rôle 'admin' n'existe pas");
      }
      const saltRounds = 10;
      const hashed = await bcrypt.hash(data.password, saltRounds);
      const user = await super.save(
        {
          ...data,
          password: hashed,
          roleId: adminRole.id,
        } as any,
        transaction
      );
      return {
        success: true,
        data: user,
        message: "Utilisateur créé avec succès",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Échec de la création de l'utilisateur",
        message:
          error instanceof Error
            ? error.message
            : "Échec de la création de l'utilisateur",
      };
    }
  }

  // Additional methods: login
  async login(name: string, password: string): Promise<IResult<UserDto>> {
    try {
      const user = await this.repo.getOne(
        { name },
        ["Role"],
        ["id", "name", "email", "password", "roleId"]
      );
      if (!user) {
        return {
          success: false,
          error: "Aucun utilisateur trouvé",
          message: "Aucun utilisateur trouvé",
        };
      }
      const match = await bcrypt.compare(password, (user as any).password);
      if (!match) {
        return {
          success: false,
          message: "Mot de passe incorrect",
          error: "Mot de passe incorrect",
        };
      }
      const payload = { userId: user.id, email: (user as any).email };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES });
      //  remove password from user data
      const { password: _, ...userData } = user;
      return {
        success: true,
        token,
        data: userData,
        message: "Connexion réussie, redirection en cours...",
      };
    } catch (error: any) {
      logger.error("Login error:", error);
      return {
        success: false,
        error:
          error.message || "Une erreur s'est produite lors de la connexion",
        message:
          error.message || "Une erreur s'est produite lors de la connexion",
      };
    }
  }

  // getUser by token
  async getUserFromToken(token: string): Promise<IResult<UserDto>> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const user = await this.getById(
        payload.userId,
        [],
        ["id", "name", "email"]
      );
      if (!user)
        return {
          success: false,
          error: "Aucun utilisateur trouvé",
          message: "Aucun utilisateur trouvé",
        };
      return {
        success: true,
        data: user,
        message: "Utilisateur récupéré avec succès",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Session expirée, veuillez vous reconnecter",
        message: err.message || "Session expirée, veuillez vous reconnecter",
      };
    }
  }
}
