import { CategoryDisplay } from "../types/category.types";
import { sequelize } from "../database/db";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { Category as CategoryProperties } from "../types/category.types";

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare parent: number | null;
  declare description: string | null;
  declare display: CategoryDisplay;
  declare count: number;
  declare image: CategoryProperties["image"] | null;
  declare creator_id?: string | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date | null;
}

Category.init(
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
      unique: true,
    },
    parent: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    display: {
      type: DataTypes.ENUM(...Object.values(CategoryDisplay)),
      allowNull: false,
      defaultValue: CategoryDisplay.default,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const image = this.getDataValue("image") as
          | CategoryProperties["image"]
          | null;
        return image
          ? {
              id: image.id,
              date_created: image.date_created,
              date_created_gmt: image.date_created_gmt,
              date_modified: image.date_modified,
              date_modified_gmt: image.date_modified_gmt,
              src: image.src,
              name: image.name,
              alt: image.alt,
            }
          : null;
      },
      set(value: CategoryProperties["image"] | null) {
        this.setDataValue("image", value);
      },
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
    tableName: "categories",
    sequelize,
    modelName: "Category",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: true,
    deletedAt: "deletedAt",
  }
);
