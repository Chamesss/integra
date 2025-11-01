import { useState, useEffect } from "react";
import { SelectedProduct, StockWarning } from "@electron/types/quote.types";
import SelectedProductsTable from "./selected-products-table";
import ProductSelectionDialog from "./product-selection-dialog";
import { QuoteProductsSectionProps } from "./types";

export default function QuoteProductsSection({
  selectedProducts,
  setSelectedProducts,
  stockWarnings,
  setStockWarnings,
}: QuoteProductsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const removeProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity } : p))
    );
  };

  const updateTva = (productId: number, tva: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, tva } : p))
    );
  };

  const handleProductsSelected = (products: SelectedProduct[]) => {
    setSelectedProducts(products);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Check for stock warnings whenever selected products change
  useEffect(() => {
    const warnings: StockWarning[] = [];

    selectedProducts.forEach((product) => {
      const stockQuantity = product.stock_quantity || 0;
      if (product.quantity > stockQuantity) {
        warnings.push({
          product_id: product.id,
          product_name: product.name,
          requested_quantity: product.quantity,
          current_stock: stockQuantity,
          shortage: product.quantity - stockQuantity,
        });
      }
    });

    setStockWarnings(warnings);
  }, [selectedProducts, setStockWarnings]);

  return (
    <>
      <SelectedProductsTable
        selectedProducts={selectedProducts}
        stockWarnings={stockWarnings}
        onRemoveProduct={removeProduct}
        onUpdateQuantity={updateQuantity}
        onUpdateTva={updateTva}
        onBrowseProducts={handleDialogOpen}
      />

      <ProductSelectionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        selectedProducts={selectedProducts}
        onProductsSelected={handleProductsSelected}
      />
    </>
  );
}
