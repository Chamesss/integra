import { Product } from "@electron/models/product";
import {
  BackOrderStatus,
  CatalogVisibility,
  CreateProductDto,
  ProductStatus,
  ProductType,
  StockStatus,
} from "@electron/types/product.types";
import { CircleDollarSign, Info, Package, Tags, Truck } from "lucide-react";

export const getProductDefaultValue = (
  product: Product | undefined
): CreateProductDto => {
  // Helper function to convert date to YYYY-MM-DD format for HTML date inputs
  const formatDateForInput = (
    dateString: string | null | undefined
  ): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    } catch {
      return "";
    }
  };

  return {
    id: product?.id || 0,
    name: product?.name || "",
    type: product?.type || ProductType.Simple,

    // pricing management
    regular_price: product?.regular_price || "",
    sale_price: product?.sale_price || "",
    date_on_sale_from: formatDateForInput(product?.date_on_sale_from),
    date_on_sale_to: formatDateForInput(product?.date_on_sale_to),

    // stock management
    manage_stock: product?.manage_stock || false,
    stock_quantity: product?.stock_quantity || 0,
    stock_status: product?.stock_status || StockStatus.InStock,
    backorders: product?.backorders || BackOrderStatus.No,

    // product details
    weight: product?.weight || "",
    dimensions: {
      length: product?.dimensions?.length || "",
      width: product?.dimensions?.width || "",
      height: product?.dimensions?.height || "",
    },
    attributes:
      product?.attributes?.map((attr) => ({
        id: attr.id || 0,
        position: attr.position || 0,
        visible: attr.visible || false,
        variation: attr.variation || false,
        options: attr.options || [],
      })) || [],

    default_attributes:
      product?.default_attributes?.map((attr) => ({
        id: attr.id || 0,
        option: attr.option || "",
      })) || [],

    description: product?.description || "",
    short_description: product?.short_description || "",
    tags:
      product?.tags
        ?.map((tag) => tag.id)
        .filter((id): id is number => typeof id === "number") || [],
    sku: product?.sku || "",
    categories: product?.categories?.map((category) => category.id) || [],
    images:
      product?.images?.map((image) => ({
        file: null,
        preview: image.src || "",
      })) || [],
    status: product?.status || ProductStatus.Publish,
    catalog_visibility:
      product?.catalog_visibility || CatalogVisibility.Visible,
    featured: product?.featured || false,
  };
};

export const steps = [
  {
    id: "general",
    title: "Informations Générales",
    icon: Info,
  },
  {
    id: "pricing",
    title: "Tarification",
    icon: CircleDollarSign,
  },
  {
    id: "inventory",
    title: "Inventaire",
    icon: Package,
  },
  {
    id: "shipping",
    title: "Expédition",
    icon: Truck,
  },
  {
    id: "attributes",
    title: "Attributs",
    icon: Tags,
  },
];

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideIn = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: -20, opacity: 0, transition: { duration: 0.2 } },
};

export const stepFields: Record<string, string[]> = {
  general: ["name", "description", "categories"],
  pricing: [
    "regular_price",
    "sale_price",
    "date_on_sale_from",
    "date_on_sale_to",
  ],
  inventory: ["sku", "manage_stock", "stock_quantity"],
  shipping: ["weight", "dimensions"],
  attributes: ["attributes"],
};

export const productStatusFields: Record<ProductStatus, string> = {
  [ProductStatus.Draft]: "Enregistrer comme brouillon",
  [ProductStatus.Pending]: "Publier le produit",
  [ProductStatus.Publish]: "Publier le produit",
  [ProductStatus.Private]: "Enregistrer comme privée",
};
