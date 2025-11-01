/**
 * Simple utility functions for formatting discount and checking discount existence
 * These are lightweight helpers that don't do any calculations, just formatting
 */

/**
 * Format discount display text
 */
export function formatDiscountText(
  discount: string,
  discountType: "percentage" | "fixed"
): string {
  const discountValue = parseFloat(discount) || 0;
  if (discountValue <= 0) return "";

  return discountType === "percentage"
    ? `${discountValue}%`
    : `${discountValue} TND`;
}

/**
 * Check if there's a discount to display
 */
export function hasDiscount(discount: string): boolean {
  return parseFloat(discount) > 0;
}
