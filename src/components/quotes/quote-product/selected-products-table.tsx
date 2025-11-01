import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/text-formatter";
import QuoteStockWarnings from "../quote-stock-warnings";
import ProductImage from "./product-image";

interface SelectedProductsTableProps {
  selectedProducts: any[];
  stockWarnings: any[];
  onRemoveProduct: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdateTva: (productId: number, tva: number) => void;
  onBrowseProducts: () => void;
}

export default function SelectedProductsTable({
  selectedProducts,
  stockWarnings,
  onRemoveProduct,
  onUpdateQuantity,
  onUpdateTva,
  onBrowseProducts,
}: SelectedProductsTableProps) {
  const calculateProductTotal = (price: string, quantity: number) => {
    return parseFloat(price) * quantity;
  };

  // Check if a product has stock warning
  const hasStockWarning = (productId: number) => {
    return stockWarnings.some((warning) => warning.product_id === productId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Produits
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={onBrowseProducts}
          >
            Parcourir les produits
          </Button>
        </CardTitle>
        {stockWarnings.length > 0 ? (
          <QuoteStockWarnings warnings={stockWarnings} />
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 text-xs border rounded-t-md gap-4 p-3 bg-gray-50 border-b font-medium text-gray-600">
          <div className="col-span-5">DÉSIGNATION</div>
          <div className="col-span-1 text-center">QTÉ</div>
          <div className="col-span-2 text-center">TVA</div>
          <div className="col-span-2 text-center">PU HT</div>
          <div className="col-span-2 text-center">TOTAL HT</div>
        </div>

        {/* Table Body */}
        <div className="min-h-fit border rounded-b-md">
          {selectedProducts.length > 0 ? (
            selectedProducts.map((product) => {
              // Create unique key for variable products to avoid key conflicts
              const uniqueKey = product.variation_id
                ? `${product.parent_product_id || product.id}-${product.variation_id}`
                : product.id.toString();

              return (
                <div
                  key={uniqueKey}
                  className="grid grid-cols-12 gap-4 py-3 px-1.5 border-b last:border-none items-center hover:bg-gray-50"
                >
                  {/* Product Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <ProductImage images={product.images} />
                    <div className="flex-1">
                      <div className="font-medium text-sm line-clamp-2">
                        {product.name}
                        {product.variation_id && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Variation
                          </span>
                        )}
                      </div>
                      {/* {product.variation_attributes &&
                        product.variation_attributes.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Variante:{" "}
                            {product.variation_attributes.map(
                              (attr: any, index: number) => (
                                <span key={index}>
                                  {attr.name}: {attr.option}
                                  {index <
                                  product.variation_attributes.length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              )
                            )}
                          </div>
                        )} */}
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        Stock: {product.stock_quantity || 0} disponible(s)
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 justify-end flex">
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) =>
                        onUpdateQuantity(
                          product.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className={`h-9 w-fit max-w-[4.75rem] text-center ${
                        hasStockWarning(product.id)
                          ? "border-red-300 focus:border-red-500"
                          : ""
                      }`}
                    />
                  </div>

                  {/* TVA */}
                  <div className="col-span-2 flex justify-center items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={product.tva}
                      onChange={(e) =>
                        onUpdateTva(product.id, parseInt(e.target.value) || 1)
                      }
                      className="h-9 w-[4rem] shrink-0 text-center"
                    />
                    <span className="text-gray-500">%</span>
                  </div>

                  {/* Price per unit */}
                  <div className="col-span-2 text-xs text-center font-medium">
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          product.is_on_sale
                            ? "text-red-600 text-xs font-semibold"
                            : ""
                        }
                      >
                        {formatCurrency(product.price)}
                      </span>
                      {product.is_on_sale && product.regular_price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatCurrency(product.regular_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-1 text-xs text-center font-medium">
                    {formatCurrency(
                      calculateProductTotal(product.price, product.quantity)
                    )}
                  </div>

                  {/* Delete button */}
                  <div className="col-span-1 ml-2.5 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveProduct(product.id)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="grid grid-cols-12 gap-4 p-3 items-center">
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-gray-400">--</div>
              </div>
              <div className="col-span-1 text-center text-gray-400">--</div>
              <div className="col-span-2 text-center text-gray-400">--</div>
              <div className="col-span-2 text-center text-gray-400">--</div>
              <div className="col-span-2 text-center text-gray-400">--</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
