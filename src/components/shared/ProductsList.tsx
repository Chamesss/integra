import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/text-formatter";

interface ProductSnapshot {
  name: string;
  quantity: number;
  price: string;
  tax_rate: string;
  tht: string;
  ttc: string;
  product_snapshot?: {
    sku?: string;
    image?: string | null;
  };
}

interface Props {
  products: ProductSnapshot[];
  type: "quote" | "invoice";
}

export default function ProductsList({ products, type }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Produits ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                <div className="flex-1">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">
                    {product.name}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    {product.product_snapshot?.sku && (
                      <div>
                        <span className="text-gray-500">SKU:</span>{" "}
                        {product.product_snapshot.sku}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Quantité:</span>{" "}
                      {product.quantity}
                    </div>
                    <div>
                      <span className="text-gray-500">Prix unitaire:</span>{" "}
                      {formatCurrency(parseFloat(product.price))}
                    </div>
                    <div>
                      <span className="text-gray-500">TVA:</span>{" "}
                      {product.tax_rate}%
                    </div>
                  </div>
                </div>

                {product.product_snapshot?.image && (
                  <img
                    src={product.product_snapshot.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md sm:ml-4 self-center"
                  />
                )}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Total ligne HT:</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(product.tht))}
                  </span>
                </div>
                {type === "invoice" ? (
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Total ligne TTC:</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(product.ttc))}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
