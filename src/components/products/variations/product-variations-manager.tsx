import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { Product } from "electron/models/product";
import { Variation } from "./types";
import VariationCard from "./product-variation-card";
import VariationsLoadingSkeleton from "@/components/skeletons/variants-section-skeleton";
import VariantEmpty from "@/components/fallbacks/variant-empty";
import { VariationCardStatsType, VariationCardStatsValues } from "./constants";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  onCreateVariations: () => void;
  variations: Variation[];
  refetch: () => void;
  isLoading: boolean;
}

export default function ProductVariationsManager({
  product,
  onCreateVariations,
  variations,
  refetch,
  isLoading,
}: Props) {
  const variationAttributes =
    product.attributes?.filter(
      (attr) => attr.variation && attr.options && attr.options.length > 0
    ) || [];

  const hasVariationAttributes = variationAttributes.length > 0;
  if (isLoading) return <VariationsLoadingSkeleton />;
  if (variations.length > 0) {
    const stats = VariationCardStatsValues(
      variations,
      variationAttributes.length
    );

    return (
      <div className="w-full space-y-6 relative">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((info) => (
            <VariationCardStats key={info.title} info={info} />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col p-4 sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Gestion des variations
            </h3>
            <p className="text-sm text-gray-500">
              Gérez les variations de votre produit
            </p>
            <span className="text-sm text-gray-500">
              {variations.filter((v) => v.enabled !== false).length}{" "}
              variation(s) active(s) sur {variations.length}
            </span>
          </div>
          <Button onClick={onCreateVariations} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ajouter variations</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>

        <div className="space-y-4">
          {variations.map((variation) => (
            <VariationCard
              key={variation.id}
              variation={variation}
              productId={product.id}
              refetch={refetch}
            />
          ))}
        </div>
      </div>
    );
  }
  if (hasVariationAttributes && variations.length === 0) {
    return (
      <div className="max-w-4xl">
        <div className="border border-blue-200 bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <Package className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Attributs configurés - Prêt pour création
              </h3>
              <div className="space-y-3 mb-4">
                {variationAttributes.map((attr) => (
                  <div key={attr.id} className="flex items-center gap-3">
                    <Badge variant="outline" className="font-medium">
                      {attr.name}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {attr.options?.map((option, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-white border rounded"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-blue-700 mb-4">
                Les attributs sont configurés. Vous pouvez maintenant générer
                les variations possibles.
              </p>
              <Button
                onClick={onCreateVariations}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Générer les variations
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <VariantEmpty />;
}

const VariationCardStats = ({
  info,
}: {
  info: VariationCardStatsType[number];
}) => (
  <div className={cn("border rounded-lg p-4", info.bgColor, info.borderColor)}>
    <div className="flex items-center gap-2 mb-2">
      <info.Icon className={cn("w-4 h-4", info.iconColor)} />
      <span className={cn("text-xs sm:text-sm font-medium", info.textColor)}>
        {info.title}
      </span>
    </div>
    <p className={cn("text-xl sm:text-2xl font-bold", info.textColor)}>
      {info.count}
    </p>
  </div>
);
