import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Eye,
  EyeOff,
  DollarSign,
  Plus,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Product } from "electron/models/product";
import InfoSection from "./info-section";
import useFetchAll from "@/hooks/useFetchAll";
import { Variation } from "../variations/types";
import ProductVariationsDelete from "./product-variations-delete";

interface Props {
  product: Product;
  onCreateVariations: () => void;
}

export default function ProductVariations({
  product,
  onCreateVariations,
}: Props) {
  const isVariableProduct = product.type === "variable";

  // Check if product has variation attributes configured
  const variationAttributes =
    product.attributes?.filter(
      (attr) => attr.variation && attr.options && attr.options.length > 0
    ) || [];

  const hasVariationAttributes = variationAttributes.length > 0;

  const { data, isLoading } = useFetchAll<Variation>({
    method: "variation:getAll",
    queryParams: {
      productId: product.id,
    },
    queryOptions: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchInterval: 1000 * 60 * 60, // 1 hour
    },
    disableDefaultFilters: true,
  });

  const existingVariations: Variation[] = data?.rows || [];

  // If product is not variable type (future implementation)
  if (!isVariableProduct) {
    return (
      <InfoSection icon={Package} title="Variations de produit" color="purple">
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-900 mb-2">Produit simple</h3>
          <p className="text-sm text-gray-500 mb-4">
            Ce produit est de type "simple". Pour créer des variations, il doit
            d'abord être converti en produit variable.
          </p>
          <Button
            onClick={onCreateVariations}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurer les variations
          </Button>
        </div>
      </InfoSection>
    );
  }

  // If variable product but no variation attributes
  if (!hasVariationAttributes) {
    return (
      <InfoSection icon={Package} title="Variations de produit" color="purple">
        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">
                Attributs de variation requis
              </h4>
              <p className="text-sm text-orange-700">
                Ce produit est de type "variable" mais n'a pas d'attributs
                configurés pour les variations. Vous devez d'abord configurer
                les attributs (couleur, taille, etc.) avant de créer des
                variations.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <Button
            onClick={onCreateVariations}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurer les attributs
          </Button>
        </div>
      </InfoSection>
    );
  }

  // Variable product with attributes but no variations yet
  if (existingVariations.length === 0) {
    return (
      <InfoSection
        icon={Package}
        title="Variations de produit"
        color="purple"
        badge="Prêt pour création"
      >
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Attributs configurés
              </h4>
              <div className="space-y-2">
                {variationAttributes.map((attr) => (
                  <div key={attr.id} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {attr.name}
                    </Badge>
                    <span className="text-sm text-blue-700">
                      {attr.options?.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <h3 className="font-medium text-gray-900 mb-2">
            Prêt à créer des variations
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Les attributs sont configurés. Vous pouvez maintenant générer les
            variations possibles.
          </p>
          <Button
            onClick={onCreateVariations}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Générer les variations
          </Button>
        </div>
      </InfoSection>
    );
  }

  // Variable product with existing variations (future implementation)
  return (
    <InfoSection
      icon={Package}
      title="Variations de produit"
      color="purple"
      badge={existingVariations.length}
      headerAction={
        <Button
          onClick={onCreateVariations}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Gérer les variations
        </Button>
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Chargement des variations...
            </p>
          </div>
        ) : (
          existingVariations.map((variation) => (
            <div
              key={variation.id}
              className={`border rounded-lg p-4 transition-all ${
                variation.enabled !== false
                  ? "border-green-200 bg-white"
                  : "border-gray-200 bg-gray-50 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Attribute combination */}
                  <div className="flex items-center gap-2">
                    {variation.enabled !== false ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <div className="flex flex-wrap gap-1">
                      {variation.attributes &&
                        variation.attributes.map((attr) => (
                          <Badge
                            key={attr.id}
                            variant="outline"
                            className="text-xs"
                          >
                            <span className="text-gray-500">{attr.name}:</span>{" "}
                            {String(attr.option)}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  {/* Variation details */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="space-y-1 col-span-4">
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </p>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {variation.sku || "Non défini"}
                      </code>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Prix
                      </p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {variation.regular_price || "0"} TND
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Statut
                      </p>
                      <Badge
                        variant={
                          variation.enabled !== false ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {variation.enabled !== false ? "Activé" : "Désactivé"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <ProductVariationsDelete
                  productId={product.id}
                  variationId={variation.id}
                  sku={variation.sku}
                />
              </div>
            </div>
          ))
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {
                existingVariations.filter((v: any) => v.enabled !== false)
                  .length
              }{" "}
              variation(s) active(s) sur {existingVariations.length}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateVariations}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter des variations
            </Button>
          </div>
        </div>
      </div>
    </InfoSection>
  );
}

{
  /* <div className="space-y-1">
  <p className="text-xs font-medium text-gray-500 uppercase">Stock</p>
  <div className="flex items-center gap-2">
    <BarChart className="w-3 h-3 text-gray-400" />
    <span className="font-semibold text-gray-900">
      {variation.stock_quantity || 0}
    </span>
    <Badge
      variant="secondary"
      className={getStockBadge(
        variation.stock_quantity || 0,
        variation.enabled !== false
      )}
    >
      {getStockLabel(
        variation.stock_quantity || 0,
        variation.enabled !== false
      )}
    </Badge>
  </div>
</div>; */
}

// const getStockBadge = (stock: number, enabled: boolean) => {
//   if (!enabled) return "bg-gray-100 text-gray-600";
//   if (stock === 0) return "bg-red-100 text-red-700";
//   if (stock <= 5) return "bg-orange-100 text-orange-700";
//   return "bg-green-100 text-green-700";
// };

// const getStockLabel = (stock: number, enabled: boolean) => {
//   if (!enabled) return "Désactivé";
//   if (stock === 0) return "Rupture";
//   if (stock <= 5) return "Stock faible";
//   return "En stock";
// };
