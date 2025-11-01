import { Product } from "@electron/models";
import { QuoteAttributes } from "@electron/models/quote";

export enum QuoteStatus {
  Draft = "draft",
  Active = "active",
  Accepted = "accepted",
  Rejected = "rejected",
  Expired = "expired",
}

export interface QuoteProduct {
  product_id: number;
  name: string;
  price: string;
  quantity: number;
  ttc: string;
  tht: string;
  tax_rate: string;
  // Snapshot data to preserve original product info
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
}

export interface QuoteClient {
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

// export interface Quote {
//   id: number;
//   client_id: number;
//   status: QuoteStatus;
//   tht: string;
//   ttc: string;
//   client: QuoteClient;
//   products: QuoteProduct[];
//   discount: string;
//   discount_type: "percentage" | "fixed";
//   tax_rate: string;
//   notes?: string;
//   valid_until?: Date;
//   created_by?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export interface Quote extends QuoteAttributes {}

export interface CreateQuoteDto {
  client_id: number;
  products: {
    product_id: number;
    quantity: number;
    price?: string; // Optional override price
    name?: string; // Display name (especially for variations)
    tva?: number; // Tax rate for this specific product
    variation_id?: string; // For variable products - variation ID
    variation_attributes?: Array<{ name: string; option: string }>; // Variation attributes
  }[];
  discount?: string;
  discount_type?: "percentage" | "fixed";
  tax_rate?: string;
  notes?: string;
  valid_until?: Date | string;
  status?: QuoteStatus;
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {
  id: number;
}

export interface QuoteQueryDto {
  search?: string;
  status?: QuoteStatus;
  client_id?: number;
  date_from?: string;
  date_to?: string;
}

// Stock warning interface
export interface StockWarning {
  product_id: number;
  product_name: string;
  requested_quantity: number;
  current_stock: number;
  shortage: number;
}

export interface QuoteFormData {
  valid_until: string;
  discount_percentage: number;
  tax_percentage: number;
}

export interface QuoteTotals {
  subtotalHT: number;
  discountAmount: number;
  discountPercentage: number;
  subtotalAfterDiscount: number;
  tvaBreakdown: Record<number, { rate: number; base: number; amount: number }>;
  totalTvaAmount: number;
  total: number;
}

export interface SelectedProduct {
  id: number;
  name: string;
  quantity: number;
  price: string;
  stock_quantity?: number;
  images?: Product["images"];
  tva?: number;
  regular_price?: string; // To show original price if on sale
  is_on_sale?: boolean; // To show sale indicator
  variation_id?: string; // For variable products - variation ID
  parent_product_id?: number; // For variable products - parent product ID
  variation_attributes?: Array<{ name: string; option: string }>; // Variation attributes
}
