import { Product } from "@electron/models/product";
import {
  QuoteFormData,
  QuoteTotals,
  SelectedProduct,
} from "@electron/types/quote.types";
import { UseFormReturn } from "react-hook-form";

/**
 * Determines the correct price for a product based on sale dates and pricing rules
 *
 * Price Priority Logic:
 * 1. sale_price (if product is currently on sale based on date range)
 * 2. regular_price (the standard price)
 * 3. price (fallback field)
 *
 * Sale Date Logic:
 * - If date_on_sale_from is set, sale starts from that date
 * - If date_on_sale_to is set, sale ends on that date
 * - If no dates are set, sale is always active (if sale_price exists)
 *
 * @param product - The WooCommerce product object
 * @returns The correct price as a string
 */
export const getProductPrice = (product: Product): string => {
  const now = new Date();

  // Check if product has sale price and is currently on sale
  if (
    product.sale_price &&
    product.sale_price !== "" &&
    product.sale_price !== "0"
  ) {
    let isOnSale = true;

    // Check sale start date
    if (product.date_on_sale_from) {
      const saleStartDate = new Date(product.date_on_sale_from);
      if (now < saleStartDate) {
        isOnSale = false;
      }
    }

    // Check sale end date
    if (product.date_on_sale_to && isOnSale) {
      const saleEndDate = new Date(product.date_on_sale_to);
      if (now > saleEndDate) {
        isOnSale = false;
      }
    }

    // If product is on sale, use sale price
    if (isOnSale) {
      return product.sale_price;
    }
  }

  // Fallback to regular price, then price field
  if (
    product.regular_price &&
    product.regular_price !== "" &&
    product.regular_price !== "0"
  ) {
    return product.regular_price;
  }

  return product.price || "0";
};

/**
 * Checks if a product is currently on sale
 */
export const isProductOnSale = (product: Product): boolean => {
  const now = new Date();

  if (
    !product.sale_price ||
    product.sale_price === "" ||
    product.sale_price === "0"
  ) {
    return false;
  }

  // Check sale start date
  if (product.date_on_sale_from) {
    const saleStartDate = new Date(product.date_on_sale_from);
    if (now < saleStartDate) {
      return false;
    }
  }

  // Check sale end date
  if (product.date_on_sale_to) {
    const saleEndDate = new Date(product.date_on_sale_to);
    if (now > saleEndDate) {
      return false;
    }
  }

  return true;
};

/**
 * Gets the discount percentage if product is on sale
 */
export const getProductDiscountPercentage = (product: Product): number => {
  if (!isProductOnSale(product)) {
    return 0;
  }

  const regularPrice = parseFloat(product.regular_price || "0");
  const salePrice = parseFloat(product.sale_price || "0");

  if (regularPrice <= 0 || salePrice <= 0) {
    return 0;
  }

  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

export const calculateTotals = (
  selectedProducts: SelectedProduct[],
  methods: UseFormReturn<QuoteFormData>
): QuoteTotals => {
  const products = Array.isArray(selectedProducts) ? selectedProducts : [];

  // Calculate subtotal HT
  const subtotalHT = products.reduce((sum, product) => {
    return sum + parseFloat(product.price) * product.quantity;
  }, 0);

  const discountPercentage = methods.watch("discount_percentage") || 0;
  const discountAmount = subtotalHT * (discountPercentage / 100);
  const subtotalAfterDiscount = subtotalHT - discountAmount;

  // Group products by TVA rate and calculate TVA per rate
  const tvaBreakdown = products.reduce((acc, product) => {
    const tvaRate = product.tva || 19; // Default to 19% if no TVA specified
    const productTotal = parseFloat(product.price) * product.quantity;
    // Calculate the taxable base (after discount)
    const productTaxableBase = productTotal * (1 - discountPercentage / 100);
    const productTva = productTaxableBase * (tvaRate / 100);

    if (!acc[tvaRate]) {
      acc[tvaRate] = {
        rate: tvaRate,
        base: 0,
        amount: 0,
      };
    }

    acc[tvaRate].base += productTaxableBase;
    acc[tvaRate].amount += productTva;

    return acc;
  }, {} as Record<number, { rate: number; base: number; amount: number }>);

  const totalTvaAmount = Object.values(tvaBreakdown).reduce(
    (sum, tva) => sum + tva.amount,
    0
  );

  const total = subtotalAfterDiscount + totalTvaAmount;

  return {
    subtotalHT,
    discountAmount,
    discountPercentage,
    subtotalAfterDiscount,
    tvaBreakdown,
    totalTvaAmount,
    total,
  };
};
