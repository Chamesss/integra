import { Truck, Weight, Ruler } from "lucide-react";
import { Product } from "electron/models/product";
import InfoSection from "./info-section";

interface Props {
  product: Product;
}

export default function ProductShipping({ product }: Props) {
  const hasShippingInfo = product.weight || product.dimensions;

  if (!hasShippingInfo) {
    return null;
  }

  return (
    <InfoSection icon={Truck} title="Expédition" color="cyan">
      <div className="space-y-4">
        {product.weight && (
          <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Weight className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Poids du produit
              </p>
              <p className="text-lg font-bold text-gray-900">
                {product.weight} kg
              </p>
            </div>
          </div>
        )}

        {product.dimensions && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">
                Dimensions
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Longueur
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {product.dimensions.length || "N/A"}
                </p>
                {product.dimensions.length && (
                  <p className="text-xs text-gray-500">cm</p>
                )}
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Largeur
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {product.dimensions.width || "N/A"}
                </p>
                {product.dimensions.width && (
                  <p className="text-xs text-gray-500">cm</p>
                )}
              </div>

              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Hauteur
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {product.dimensions.height || "N/A"}
                </p>
                {product.dimensions.height && (
                  <p className="text-xs text-gray-500">cm</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </InfoSection>
  );
}
