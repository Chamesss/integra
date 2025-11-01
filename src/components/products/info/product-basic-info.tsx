import { Badge } from "@/components/ui/badge";
import { Tag, Star } from "lucide-react";
import { Product } from "electron/models/product";
import { ProductStatus } from "@electron/types/product.types";
import InfoSection from "./info-section";

interface Props {
  product: Product;
}

export default function ProductBasicInfo({ product }: Props) {
  const getStatusBadge = (status: string) => {
    const statusColors = {
      publish: "bg-emerald-50 text-emerald-700 border-emerald-200",
      draft: "bg-slate-50 text-slate-700 border-slate-200",
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      private: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-slate-50 text-slate-700 border-slate-200"
    );
  };

  // const getCatalogVisibilityText = (visibility: string) => {
  //   const visibilityMap = {
  //     visible: "Visible",
  //     catalog: "Catalogue seulement",
  //     search: "Recherche seulement",
  //     hidden: "Masqué",
  //   };
  //   return (
  //     visibilityMap[visibility as keyof typeof visibilityMap] || "Non défini"
  //   );
  // };

  const status = {
    [ProductStatus.Publish]: "Publié",
    [ProductStatus.Draft]: "Brouillon",
    [ProductStatus.Pending]: "En attente",
    [ProductStatus.Private]: "Privé",
  };

  return (
    <InfoSection title="Informations générales" icon={Tag} color="blue">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-xl text-gray-900">
            {product.name}
          </h3>
          {product.sku ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">SKU:</span>
              <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                {product.sku || "Non défini"}
              </code>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getStatusBadge(product.status)}>
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  product.status === "publish"
                    ? "bg-emerald-500"
                    : product.status === "draft"
                      ? "bg-slate-500"
                      : product.status === "pending"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                }`}
              />
              {status[product.status as keyof typeof status] ||
                "Statut inconnu"}
            </Badge>

            {product.featured && (
              <Badge
                variant="outline"
                className="border-amber-200 text-amber-700 bg-amber-50"
              >
                <Star className="w-3 h-3 mr-1 fill-current" />
                En vedette
              </Badge>
            )}

            {/* <Badge
            variant="outline"
            className="border-gray-200 text-gray-700 bg-gray-50"
          >
            <Eye className="w-3 h-3 mr-1" />
            {getCatalogVisibilityText(product.catalog_visibility)}
          </Badge> */}
          </div>
        </div>

        {product.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Description</h4>
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-a:text-blue-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {product.short_description && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">
              Description courte
            </h4>
            <div
              className="text-sm text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          </div>
        )}
      </div>
    </InfoSection>
  );
}
