import { AttributeTerm, Attribute } from "../models";
import { InferCreationAttributes } from "sequelize";

export enum AttributeType {
  Select = "select",
  Text = "text",
  Number = "number",
  Date = "date",
}

export interface AttributeDto extends InferCreationAttributes<Attribute> {}

export interface CreateAttributeDto {
  id?: number;
  name: string;
  slug?: string;
  type?: AttributeType;
  order_by?: "menu_order" | "name" | "name_num" | "id";
  has_archives?: boolean;
}

export interface UpdateAttributeDto extends Partial<CreateAttributeDto> {
  id: number;
}

export interface AttributeQueryDto {
  page?: number;
  per_page?: number;
  search?: string;
  order?: "asc" | "desc";
  orderby?: "id" | "name" | "slug" | "menu_order";
}

export interface AttributeTermDto
  extends InferCreationAttributes<AttributeTerm> {}

export interface CreateAttributeTermDto {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  menu_order?: number;
  attribute_id?: number;
}

export interface UpdateAttributeTermDto
  extends Partial<CreateAttributeTermDto> {
  id: number;
}

export interface AttributeTermQueryDto {
  page?: number;
  per_page?: number;
  search?: string;
  order?: "asc" | "desc";
  orderby?: "id" | "name" | "slug" | "menu_order";
  attribute_id?: number;
}

export interface CreateAttributeWithTermsDto {
  name: string;
  slug?: string;
  type?: AttributeType;
  order_by?: "menu_order" | "name" | "name_num" | "id";
  has_archives?: boolean;
  terms: CreateAttributeTermDto[];
}

export interface BatchUpdateAttributeTermsDto {
  create: CreateAttributeTermDto[];
  update: UpdateAttributeTermDto[];
  delete: number[];
}
