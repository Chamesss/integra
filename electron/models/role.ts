import { sequelize } from "../database/db";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

export class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  declare id?: number;
  declare name: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "roles",
    sequelize,
    modelName: "Role",
  }
);

export async function insertDefaultRoles() {
  const defaultRoles = [{ name: "admin" }, { name: "super_admin" }];
  for (const role of defaultRoles) {
    await Role.findOrCreate({ where: { name: role.name }, defaults: role });
  }
  return;
}
