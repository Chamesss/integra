import { sequelize } from "../database/db";
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { InvoiceStatus } from "../types/invoice.types";

const REF_PREFIX = "fac";

export class Invoice extends Model<
  InferAttributes<Invoice>,
  InferCreationAttributes<Invoice>
> {
  declare id: number;
  declare ref: string;
  declare quote_id?: number; // Optional: if created from quote
  declare client_id: number;
  declare status: InvoiceStatus;
  declare tht: string;
  declare ttc: string;
  declare discount: string;
  declare discount_type: "percentage" | "fixed";
  declare tax_rate: string;
  declare timbre_fiscal: string; // 1 TND timbre fiscal
  declare notes?: string;
  declare due_date?: Date;
  declare paid_date?: Date;
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

Invoice.init(
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
    quote_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "quotes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    client_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(InvoiceStatus)),
      allowNull: false,
      defaultValue: InvoiceStatus.Draft,
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
    timbre_fiscal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 1.0, // 1 TND
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    paid_date: {
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
    tableName: "invoices",
    sequelize,
    modelName: "Invoice",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    paranoid: true,
    deletedAt: "deletedAt",
    hooks: {
      async beforeCreate(invoice: Invoice) {
        const latestInvoice = await Invoice.findOne({
          order: [["id", "DESC"]],
          paranoid: false,
        });

        if (!latestInvoice) {
          invoice.ref = `${REF_PREFIX}-001`;
        } else {
          const lastRefNumber = parseInt(latestInvoice.ref.split("-")[1], 10);
          const newRefNumber = lastRefNumber + 1;
          const paddedNumber = String(newRefNumber).padStart(3, "0");
          invoice.ref = `${REF_PREFIX}-${paddedNumber}`;
        }
      },
    },
  }
);

export type InvoiceAttributes = InferAttributes<Invoice>;
