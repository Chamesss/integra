import { sequelize } from "../database/db";
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { QuoteStatus } from "../types/quote.types";

const REF_PREFIX = "dev";

export class Quote extends Model<
  InferAttributes<Quote>,
  InferCreationAttributes<Quote>
> {
  declare id: number;
  declare ref: string;
  declare client_id: number;
  declare status: QuoteStatus;
  declare tht: string;
  declare ttc: string;
  declare discount: string;
  declare discount_type: "percentage" | "fixed";
  declare tax_rate: string;
  declare notes?: string;
  declare valid_until?: Date;
  declare created_by?: string;

  declare client_snapshot: {
    id: number;
    name: string;
    type: "individual" | "company";
    phone: string;
    address: string;
    tva?: string | null;
  };

  declare products_snapshot: {
    product_id: number;
    name: string;
    price: string;
    quantity: number;
    ttc: string;
    tht: string;
    tax_rate: string;
    product_snapshot: {
      id: number;
      name: string;
      price: string;
      regular_price: string;
      sale_price: string;
      stock_quantity: number;
      stock_status: string;
      sku: string;
      image: string | null;
    };
  }[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt?: Date;
}

Quote.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ref: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    client_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(QuoteStatus)),
      allowNull: false,
      defaultValue: QuoteStatus.Draft,
    },
    tht: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    ttc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    discount_type: {
      type: DataTypes.ENUM("percentage", "fixed"),
      allowNull: false,
      defaultValue: "percentage",
    },
    tax_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 19.0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valid_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    client_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    products_snapshot: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
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
  },
  {
    tableName: "quotes",
    sequelize,
    modelName: "Quote",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: true,
    deletedAt: "deletedAt",
    hooks: {
      async beforeCreate(quote: Quote) {
        const latestQuote = await Quote.findOne({
          order: [["id", "DESC"]],
          paranoid: false,
        });

        if (!latestQuote) {
          quote.ref = `${REF_PREFIX}-001`;
        } else {
          const lastRefNumber = parseInt(latestQuote.ref.split("-")[1], 10);
          const newRefNumber = lastRefNumber + 1;
          const paddedNumber = String(newRefNumber).padStart(3, "0");
          quote.ref = `${REF_PREFIX}-${paddedNumber}`;
        }
      },
    },
  }
);

export type QuoteAttributes = InferAttributes<Quote>;
