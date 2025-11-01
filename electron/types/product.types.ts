export enum ProductStatus {
  Draft = "draft",
  Pending = "pending",
  Private = "private",
  Publish = "publish",
}
export enum StockStatus {
  InStock = "instock",
  OutOfStock = "outofstock",
  OnBackOrder = "onbackorder",
}

export enum CatalogVisibility {
  Visible = "visible",
  Catalog = "catalog",
  Search = "search",
  Hidden = "hidden",
}

export enum ProductType {
  Simple = "simple",
  Variable = "variable",
}

export enum BackOrderStatus {
  No = "no",
  Notify = "notify",
  Yes = "yes",
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  type: ProductType;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  status: ProductStatus;
  featured: boolean;
  catalog_visibility: CatalogVisibility;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string;
  date_on_sale_from_gmt: string;
  date_on_sale_to: string;
  date_on_sale_to_gmt: string;
  stock_quantity: number;
  stock_status: StockStatus;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  images: {
    id?: number;
    date_created?: string;
    date_created_gmt?: string;
    date_modified?: string;
    date_modified_gmt?: string;
    src?: string;
    name?: string;
    alt?: string;
  }[];
}

export interface CreateProductDto {
  id?: number;
  name?: string;
  type?: ProductType; // type of the product (simple, variable, etc.)
  price?: string;

  // price management
  regular_price?: string; // normal price with no discount
  sale_price?: string; // price with discount
  date_on_sale_from?: string;
  date_on_sale_to?: string;

  // stock management
  manage_stock?: boolean; // whether WooCommerce manage stock automatically
  stock_quantity?: number; // quantity of stock available
  stock_status?: StockStatus;
  backorders?: BackOrderStatus; // backOrder status (to be seen)

  // product details
  weight?: string; // product weight
  dimensions?: {
    length?: string; // product length
    width?: string; // product width
    height?: string; // product height
  };
  attributes?: {
    id?: number; // attribute ID
    name?: string; // name of the attribute
    position?: number; // position of the attribute
    visible?: boolean; // whether the attribute is visible on the product page
    variation?: boolean; // whether the attribute is used for variations
    options: string[]; // options for the attribute
  }[];

  default_attributes?: {
    id: number; // attribute ID
    option: string; // default option for the attribute
  }[];

  description?: string;
  short_description?: string;
  tags?: number[];
  sku?: string;
  categories?: number[];
  images?: {
    file: File | null | string; // file or base64 string of the image
    preview?: string;
    filename?: string; // name of the image file
  }[];
  status?: ProductStatus;
  catalog_visibility?: CatalogVisibility;
  featured?: boolean;
}

export interface UpdateProductDto {
  id?: number;
  name?: string;
  type?: ProductType;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  categories?: {
    id: number;
  }[];
  images?: Product["images"];
  status?: ProductStatus;
  stock_quantity?: number;
  stock_status?: StockStatus;
  catalog_visibility?: CatalogVisibility;
  featured?: boolean;
  date_on_sale_from?: string;
  date_on_sale_from_gmt?: string;
  date_on_sale_to?: string;
  date_on_sale_to_gmt?: string;
}

export interface ProductQueryDto {
  id?: number;
  name?: string;
  slug?: string;
  status?: ProductStatus;
  stock_status?: StockStatus;
  catalog_visibility?: CatalogVisibility;
  category_ids?: number[];
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateWooProductDto
  extends Omit<CreateProductDto, "images" | "categories" | "tags"> {
  images?: {
    src: string;
  }[];
  categories?: {
    id: number;
  }[];
  tags?: {
    id: number;
  }[];
}

// Product Variation Types
export interface ProductVariation {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string;
  date_on_sale_from_gmt: string;
  date_on_sale_to: string;
  date_on_sale_to_gmt: string;
  on_sale: boolean;
  status: ProductStatus;
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number;
  stock_status: StockStatus;
  backorders: BackOrderStatus;
  backorders_allowed: boolean;
  backordered: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_class: string;
  shipping_class_id: number;
  image: {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  };
  attributes: {
    id: number;
    name: string;
    option: string;
  }[];
  menu_order: number;
  meta_data: any[];
}

export interface CreateVariationDto {
  id?: string;
  description?: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  date_on_sale_from?: string;
  date_on_sale_to?: string;
  status?: ProductStatus;
  virtual?: boolean;
  downloadable?: boolean;
  downloads?: any[];
  download_limit?: number;
  download_expiry?: number;
  tax_status?: string;
  tax_class?: string;
  manage_stock?: boolean;
  stock_quantity?: number;
  stock_status?: StockStatus;
  backorders?: BackOrderStatus;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  shipping_class?: string;
  image?: {
    id: number;
  };
  attributes: {
    id: number;
    name: string;
    option: string;
  }[];
  menu_order?: number;
  meta_data?: any[];
}

export interface UpdateVariationDto {
  id: number;
  description?: string;
  sku?: string;
  regular_price?: string;
  sale_price?: string;
  date_on_sale_from?: string;
  date_on_sale_to?: string;
  status?: ProductStatus;
  virtual?: boolean;
  downloadable?: boolean;
  downloads?: any[];
  download_limit?: number;
  download_expiry?: number;
  tax_status?: string;
  tax_class?: string;
  manage_stock?: boolean;
  stock_quantity?: number;
  stock_status?: StockStatus;
  backorders?: BackOrderStatus;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  shipping_class?: string;
  image?: {
    id: number;
  };
  attributes?: {
    id: number;
    name: string;
    option: string;
  }[];
  menu_order?: number;
  meta_data?: any[];
}

export interface VariationQueryParams {
  context?: string;
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: "asc" | "desc";
  orderby?: string;
  parent?: number[];
  parent_exclude?: number[];
  slug?: string;
  status?: ProductStatus;
  sku?: string;
  tax_class?: string;
  on_sale?: boolean;
  min_price?: string;
  max_price?: string;
  stock_status?: StockStatus;
}
