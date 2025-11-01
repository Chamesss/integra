import { sequelize } from "../database/db";
import { DataTypes, Model } from "sequelize";

export class Client extends Model {
  public declare id: number;
  public declare name: string;
  public declare type: "individual" | "company";
  public declare phone: string;
  public declare address: string;
  public declare tva?: string | null;
  public declare creator_id?: string;
  public declare readonly deletedAt?: Date;
  public declare readonly creator?: {
    id: string;
    name: string;
    email: string;
  };
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("individual", "company"),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tva: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    creator_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "clients",
    sequelize,
    modelName: "Client",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: false,
    deletedAt: "deletedAt",
  }
);

// Relations will be defined in models/index.ts to avoid circular imports
