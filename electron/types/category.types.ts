export enum CategoryDisplay {
  default = "default",
  products = "products",
  subcategories = "subcategories",
  both = "both",
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: CategoryDisplay;
  count: number;
  image: {
    id: number;
    date_created: Date;
    date_created_gmt: Date;
    date_modified: Date;
    date_modified_gmt: Date;
    src: string;
    name: string;
    alt: string;
  } | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface CreateCategoryDto {
  id?: number;
  name: string;
  description?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  id: number;
  name: string;
}
