import { QueryParams } from "./core.types";

export enum InvoiceStatus {
  Draft = "draft",
  Paid = "paid",
  Unpaid = "unpaid",
  Overdue = "overdue",
  Cancelled = "cancelled",
  Sent = "sent",
}

export interface InvoiceProduct {
  product_id: number;
  name: string;
  price: string;
  quantity: number;
  ttc: string;
  tht: string;
  tax_rate: string;
  // Snapshot data to preserve original product info at time of invoice
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
    variation_id?: number; // For variable products
    variation_attributes?: any[]; // Variation attributes
  };
}

export interface InvoiceClient {
  client_id: number;
  name: string;
  type: "individual" | "company";
  phone: string;
  address: string;
  tva?: string | null;
  // Snapshot data to preserve original client info
  client_snapshot: {
    id: number;
    name: string;
    type: "individual" | "company";
    phone: string;
    address: string;
    tva?: string | null;
  };
}

export interface CreateInvoiceDto {
  quote_id?: number; // Optional: if creating from quote
  client_id: number;
  products: {
    product_id: number;
    quantity: number;
    price?: string; // Optional override price
    name?: string; // Display name (especially for variations)
    tva?: number; // Tax rate for this specific product
    variation_id?: number; // For variable products
    parent_product_id?: number; // Original product ID when using variations
    variation_attributes?: any[]; // Variation attributes for variable products
  }[];
  discount?: string;
  discount_type?: "percentage" | "fixed";
  tax_rate?: string;
  timbre_fiscal?: string; // 1 TND timbre fiscal
  notes?: string;
  due_date?: Date | string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {
  id: number;
}

export interface InvoiceQueryDto extends QueryParams {
  search?: string;
  status?: InvoiceStatus;
  client_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface StockValidationResult {
  valid: boolean;
  errors: StockValidationError[];
}

export interface StockValidationError {
  product_id: number;
  product_name: string;
  requested_quantity: number;
  available_quantity: number;
  shortage: number;
}

export interface InvoiceFormData {
  due_date: string;
  discount_percentage: number;
  tax_percentage: number;
  timbre_fiscal: number;
}

export interface InvoiceTotals {
  subtotalHT: number;
  discountAmount: number;
  discountPercentage: number;
  subtotalAfterDiscount: number;
  tvaBreakdown: Record<number, { rate: number; base: number; amount: number }>;
  totalTvaAmount: number;
  timbreFiscal: number;
  total: number;
}
