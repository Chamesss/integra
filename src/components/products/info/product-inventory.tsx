import { Badge } from "@/components/ui/badge";
import { BarChart, Package, Settings, AlertTriangle } from "lucide-react";
import { Product } from "electron/models/product";
// import { BackOrderStatus } from "@electron/types/product.types";
import InfoSection from "./info-section";

interface Props {
  product: Product;
}

export default function ProductInventory({ product }: Props) {
  const getStockStatusConfig = (status: string) => {
    const configs = {
      instock: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: "bg-emerald-500",
        label: "En stock",
      },
      outofstock: {
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: "bg-rose-500",
        label: "Rupture de stock",
      },
      onbackorder: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "bg-amber-500",
        label: "En attente de réapprovisionnement",
      },
    };
    return configs[status as keyof typeof configs] || configs.outofstock;
  };

  // For variable products, stock is managed at variation level
  if (product.type === "variable") {
    return (
      <InfoSection icon={BarChart} title="Inventaire" color="purple">
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-800">
                  Produit à variations
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Le stock de ce produit est géré individuellement par chaque
                  variation. Consultez les variations pour voir les quantités
                  disponibles.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">
                Paramètres généraux
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Les paramètres de gestion de stock sont configurés au niveau des
              variations individuelles.
            </div>
          </div>
        </div>
      </InfoSection>
    );
  }

  // For simple products, show normal stock information
  const stockConfig = getStockStatusConfig(product.stock_status);
  const isLowStock = product.stock_quantity && product.stock_quantity <= 5;

  return (
    <InfoSection icon={BarChart} title="Inventaire" color="purple">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gap-2 flex flex-col">
            <span className="text-sm font-medium text-gray-600">
              Quantité en stock
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-bold text-gray-900">
                  {product.stock_quantity || "0"}
                </span>
              </div>
              {isLowStock && (
                <div className="flex items-center gap-2 px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Stock faible</span>
                </div>
              )}
            </div>
          </div>

          <div className="gap-2 flex flex-col">
            <span className="text-sm font-medium text-gray-600">
              Statut du stock
            </span>
            <Badge variant="outline" className={stockConfig.color}>
              <div
                className={`w-2 h-2 rounded-full mr-2 ${stockConfig.icon}`}
              />
              {stockConfig.label}
            </Badge>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">
              Paramètres de gestion
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Gestion automatique</span>
            <Badge
              variant={product.manage_stock ? "default" : "secondary"}
              className="text-xs"
            >
              {product.manage_stock ? "Activée" : "Désactivée"}
            </Badge>
          </div>
        </div>

        {product.stock_status === "outofstock" && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-rose-800">
                  Produit en rupture de stock
                </h4>
                <p className="text-sm text-rose-700 mt-1">
                  Ce produit n'est actuellement pas disponible à la vente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </InfoSection>
  );
}
