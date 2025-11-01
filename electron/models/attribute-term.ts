import { sequelize } from "../database/db";
import { DataTypes, Model } from "sequelize";

export class AttributeTerm extends Model {
  public declare id: number;
  public declare name: string;
  public declare slug: string;
  public declare description?: string;
  public declare menu_order: number;
  public declare count: number;
  public declare attribute_id: number;
  public declare creator_id?: string;
  public declare readonly deletedAt?: Date;
  public declare readonly attribute?: {
    id: number;
    name: string;
    slug: string;
    type: string;
  };
  public declare readonly creator?: {
    id: string;
    name: string;
    email: string;
  };
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

AttributeTerm.init(
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
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    menu_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    attribute_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "attributes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    tableName: "attribute_terms",
    sequelize,
    modelName: "AttributeTerm",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: false,
    deletedAt: "deletedAt",
  }
);

// Relations will be defined in models/index.ts to avoid circular imports
