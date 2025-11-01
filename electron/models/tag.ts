import { sequelize } from "../database/db";
import { DataTypes, Model } from "sequelize";

export class Tag extends Model {
  public declare id: number;
  public declare name: string;
  public declare slug: string;
  public declare description?: string;
  public declare count: number;
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

Tag.init(
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
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "tags",
    sequelize,
    modelName: "Tag",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: false,
    deletedAt: "deletedAt",
  }
);

// Relations will be defined in models/index.ts to avoid circular imports
