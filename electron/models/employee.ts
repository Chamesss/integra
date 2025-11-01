import { sequelize } from "../database/db";
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

export enum EmployeeStatus {
  Active = "active",
  Inactive = "inactive",
}

export enum EmployeeContractType {
  CDI = "CDI",
  CDD = "CDD",
  CIVP = "CIVP",
  STAGE = "STAGE",
  FREELANCE = "FREELANCE",
  APPRENTISSAGE = "APPRENTISSAGE",
  TEMPORAIRE = "TEMPORAIRE",
}

export class Employee extends Model<
  InferAttributes<Employee>,
  InferCreationAttributes<Employee>
> {
  declare id: number;
  declare name: string;
  declare phone: string;
  declare email: string;
  declare address: string;
  declare start_date: string | null;
  declare end_date: string | null;
  declare status: EmployeeStatus;
  declare picture: string | null; // base64
  declare contract_type: EmployeeContractType;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date | null;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    picture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contract_type: {
      type: DataTypes.ENUM(...Object.values(EmployeeContractType)),
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "employees",
    timestamps: true,
    paranoid: true,
  }
);
