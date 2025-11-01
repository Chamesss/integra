type Products = {
  name: string;
  quantity: number;
  price: string;
  tax_rate: string;
  tht: string;
  ttc: string;
};

export const calculateTaxSummary = (
  products: Products[],
  discountPercentage: number
) => {
  return products.reduce(
    (acc, product) => {
      const taxRate = parseFloat(product.tax_rate);
      const tht = parseFloat(product.tht);

      const productDiscountAmount = tht * (discountPercentage / 100);
      const taxableBase = tht - productDiscountAmount;
      const tva = taxableBase * (taxRate / 100);

      if (!acc[taxRate]) {
        acc[taxRate] = {
          base: 0,
          montant: 0,
          totalHt: 0,
          totalRemise: 0,
          totalTva: 0,
        };
      }

      acc[taxRate].base += taxableBase;
      acc[taxRate].montant += tva;
      acc[taxRate].totalHt += tht;
      acc[taxRate].totalRemise += productDiscountAmount;
      acc[taxRate].totalTva += tva;

      return acc;
    },
    {} as Record<
      number,
      {
        base: number;
        montant: number;
        totalHt: number;
        totalRemise: number;
        totalTva: number;
      }
    >
  );
};
