import { Role } from "./role";
import { User } from "./user";
import { Attribute } from "./attribute";
import { AttributeTerm } from "./attribute-term";
import { Product } from "./product";
import { Category } from "./category";
import { Tag } from "./tag";
import { Client } from "./client";
import { Quote } from "./quote";
import { Invoice } from "./invoice";
import { Employee } from "./employee";

export function registerModels() {
  // User and Role relationships
  User.belongsTo(Role, { foreignKey: "roleId" });
  Role.hasMany(User, { foreignKey: "roleId" });

  // Attribute relationships
  Attribute.hasMany(AttributeTerm, {
    foreignKey: "attribute_id",
    as: "terms",
  });

  Product.belongsToMany(Category, {
    through: "ProductCategories",
    foreignKey: "productId",
  });
  Category.belongsToMany(Product, {
    through: "ProductCategories",
    foreignKey: "categoryId",
  });

  // Attribute relationships

  Attribute.belongsTo(User, {
    foreignKey: "creator_id",
    as: "creator",
  });

  // AttributeTerm relationships
  AttributeTerm.belongsTo(Attribute, {
    foreignKey: "attribute_id",
    as: "attribute",
  });

  AttributeTerm.belongsTo(User, {
    foreignKey: "creator_id",
    as: "creator",
  });

  // User reverse relationships
  User.hasMany(Attribute, {
    foreignKey: "creator_id",
    as: "createdAttributes",
  });

  User.hasMany(AttributeTerm, {
    foreignKey: "creator_id",
    as: "createdAttributeTerms",
  });

  // Product relationships with attributes, product can have multiple attributes
  Product.belongsToMany(Attribute, {
    through: "ProductAttributes",
    foreignKey: "productId",
    as: "attributesData",
  });

  Product.belongsToMany(Tag, {
    through: "ProductTags",
    foreignKey: "productId",
    as: "tagsData",
  });

  // Client relationships
  Client.belongsTo(User, {
    foreignKey: "creator_id",
    as: "creator",
  });

  User.hasMany(Client, {
    foreignKey: "creator_id",
    as: "createdClients",
  });

  // Quote relationships
  Quote.belongsTo(Client, {
    foreignKey: "client_id",
    as: "client",
  });

  Quote.belongsTo(User, {
    foreignKey: "created_by",
    as: "creator",
  });

  Client.hasMany(Quote, {
    foreignKey: "client_id",
    as: "quotes",
  });

  User.hasMany(Quote, {
    foreignKey: "created_by",
    as: "createdQuotes",
  });

  // Invoice relationships
  Client.hasMany(Invoice, {
    foreignKey: "client_id",
    as: "invoices",
  });

  Invoice.belongsTo(Client, {
    foreignKey: "client_id",
    as: "client",
  });

  Quote.hasMany(Invoice, {
    foreignKey: "quote_id",
    as: "invoices",
  });

  Invoice.belongsTo(Quote, {
    foreignKey: "quote_id",
    as: "quote",
  });

  User.hasMany(Invoice, {
    foreignKey: "created_by",
    as: "createdInvoices",
  });
}

export {
  Role,
  User,
  Attribute,
  AttributeTerm,
  Product,
  Category,
  Tag,
  Client,
  Quote,
  Invoice,
  Employee,
};
