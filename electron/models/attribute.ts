import { sequelize } from "../database/db";
import { DataTypes, Model } from "sequelize";

export class Attribute extends Model {
  public declare id: number;
  public declare name: string;
  public declare slug: string;
  public declare type: string;
  public declare order_by: string;
  public declare has_archives: boolean;
  public declare creator_id?: string;
  public declare readonly deletedAt?: Date;
  public declare readonly creator?: {
    id: string;
    name: string;
    email: string;
  };
  public declare readonly terms?: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    menu_order: number;
    count: number;
    attribute_id: number;
  }>;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Attribute.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "select",
    },
    order_by: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "menu_order",
    },
    has_archives: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "attributes",
    sequelize,
    modelName: "Attribute",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: false,
    deletedAt: "deletedAt",
  }
);

// Relations will be defined in models/index.ts to avoid circular imports
