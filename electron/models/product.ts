import { sequelize } from "../database/db";
import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import {
  BackOrderStatus,
  CatalogVisibility,
  ProductStatus,
  ProductType,
  StockStatus,
} from "../types/product.types";

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: number;
  declare name: string;
  declare slug: string;
  declare type: ProductType;
  declare permalink: string;
  declare date_created: string;
  declare date_created_gmt: string;
  declare date_modified: string;
  declare date_modified_gmt: string;
  declare status: ProductStatus;
  declare featured: boolean;
  declare catalog_visibility: CatalogVisibility;
  declare description: string;
  declare short_description: string;
  declare manage_stock: boolean;
  declare sku: string;
  declare price: string;
  declare regular_price: string;
  declare sale_price: string;
  declare date_on_sale_from: string | null;
  declare date_on_sale_from_gmt: string | null;
  declare date_on_sale_to: string | null;
  declare date_on_sale_to_gmt: string | null;
  declare backorders: BackOrderStatus;
  declare stock_quantity: number | null;
  declare stock_status: StockStatus;
  declare weight: string | null;
  declare attributes?: {
    id: number;
    name: string;
    options: string[];
    variation: boolean;
    visible: boolean;
    position?: number;
  }[];
  declare default_attributes?: {
    id: number;
    name: string;
    option: string;
  }[];
  declare dimensions?: {
    length?: string;
    width?: string;
    height?: string;
  };
  declare images: {
    id?: number;
    date_created?: string;
    date_created_gmt?: string;
    date_modified?: string;
    date_modified_gmt?: string;
    src?: string;
    name?: string;
    alt?: string;
  }[];
  declare parent_id: number | null;
  declare category_ids: number[];
  declare categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  declare attributes_ids?: number[]; // Optional field for attribute IDs
  declare tags: {
    id?: number;
    name: string;
    slug: string;
  }[]; // Optional field for tags
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date; // for soft deletes
}

Product.init(
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
      type: DataTypes.ENUM(...Object.values(ProductType)),
      allowNull: false,
      defaultValue: ProductType.Simple,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permalink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_created: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_created_gmt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_modified: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_modified_gmt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ProductStatus)),
      allowNull: false,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    catalog_visibility: {
      type: DataTypes.ENUM(...Object.values(CatalogVisibility)),
      defaultValue: "visible",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    regular_price: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    sale_price: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    date_on_sale_from: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_on_sale_from_gmt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_on_sale_to: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date_on_sale_to_gmt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    stock_status: {
      type: DataTypes.ENUM(...Object.values(StockStatus)),
      allowNull: false,
      defaultValue: "instock",
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        length: "",
        width: "",
        height: "",
      },
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    weight: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    manage_stock: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    backorders: {
      type: DataTypes.ENUM(...Object.values(BackOrderStatus)),
      allowNull: false,
      defaultValue: "no",
    },
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    category_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    categories: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    attributes_ids: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: true, // Enable soft deletes
    deletedAt: "deletedAt",
  }
);
