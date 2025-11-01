import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, BarChart, Save, X } from "lucide-react";
import { Variation } from "./types";
import ProductVariationsDelete from "../info/product-variations-delete";
import { useState } from "react";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import FormInput from "@/components/ui/custom-ui/form-input";

interface VariationCardProps {
  variation: Variation;
  productId: number;
  refetch: () => void;
}

export default function VariationCard({
  variation,
  productId,
  refetch,
}: VariationCardProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  // Helper function to get initial edit data
  const getInitialEditData = () => ({
    sku: variation.sku || "",
    regular_price: variation.regular_price || "",
    stock_quantity: variation.stock_quantity || 0,
    enabled: variation.enabled !== false,
  });

  const [editData, setEditData] = useState(getInitialEditData);

  const { mutate: updateVariation, isPending: isSaving } = useMutation();
  const { showToast } = useToastLoader();

  const isActive = variation.enabled !== false;

  const handleSave = () => {
    const toastId = "variation-update-toast";

    showToast("loading", "Mise à jour de la variation...", {
      id: toastId,
      duration: Infinity,
    });

    // Convert frontend fields to WooCommerce format
    const wooCommerceData = {
      sku: editData.sku,
      regular_price: editData.regular_price,
      stock_quantity: Number(editData.stock_quantity),
      status: editData.enabled ? "publish" : "private", // Convert enabled to WooCommerce status
      manage_stock: true, // Ensure stock management is enabled
      stock_status:
        Number(editData.stock_quantity) > 0 ? "instock" : "outofstock", // Set stock status based on quantity
    };

    updateVariation(
      {
        method: "variation:update",
        data: {
          productId,
          variationId: variation.id,
          variationData: wooCommerceData,
        },
      },
      {
        onSuccess: () => {
          showToast("success", "Variation mise à jour avec succès!", {
            duration: 3000,
            id: toastId,
          });
          setIsEditMode(false);
          refetch();
        },
        onError: (error) => {
          showToast("error", "Erreur lors de la mise à jour de la variation!", {
            duration: 3000,
            id: toastId,
          });
          console.error("Error updating variation:", error);
        },
      }
    );
  };

  const handleCancel = () => {
    setEditData(getInitialEditData());
    setIsEditMode(false);
  };

  return (
    <div
      className={`border rounded-lg p-4 sm:p-6 transition-all ${
        isActive
          ? "border-green-200 bg-white"
          : "border-gray-200 bg-gray-50 opacity-75"
      }`}
    >
      <div className="space-y-4">
        {/* Status and attributes */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            {isActive ? (
              <Eye className="w-5 h-5 text-green-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-400" />
            )}
            <Badge
              variant={isActive ? "default" : "secondary"}
              className="text-xs"
            >
              {isActive ? "Activé" : "Désactivé"}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            {variation.attributes &&
              variation.attributes.map((attr) => (
                <Badge key={attr.id} variant="outline" className="text-sm">
                  <span className="text-gray-500 mr-1">{attr.name}:</span>
                  {String(attr.option)}
                </Badge>
              ))}
          </div>
        </div>

        {/* Variation details grid */}
        {isEditMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`sku-${variation.id}`}
                  className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  SKU
                </Label>
                <FormInput
                  id={`sku-${variation.id}`}
                  value={editData.sku}
                  onChange={(e) =>
                    setEditData({ ...editData, sku: e.target.value })
                  }
                  placeholder="SKU de la variation"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`price-${variation.id}`}
                  className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Prix régulier (TND)
                </Label>
                <FormInput
                  id={`price-${variation.id}`}
                  type="number"
                  step="0.1"
                  value={editData.regular_price}
                  onChange={(e) =>
                    setEditData({ ...editData, regular_price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`stock-${variation.id}`}
                  className="text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stock
                </Label>
                <FormInput
                  id={`stock-${variation.id}`}
                  type="number"
                  min="0"
                  value={editData.stock_quantity}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      stock_quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`enabled-${variation.id}`}
                  checked={editData.enabled}
                  onChange={(e) =>
                    setEditData({ ...editData, enabled: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor={`enabled-${variation.id}`} className="text-sm">
                  Variation activée
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </p>
              <code className="text-sm bg-gray-100 px-3 py-2 rounded-md block break-all">
                {variation.sku || "Non défini"}
              </code>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix régulier
              </p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {variation.regular_price || "0"}
                </span>
                <span className="text-gray-400">TND</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </p>
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4 text-gray-400" />
                <span className="font-semibold mr-4 text-gray-900">
                  {variation.stock_quantity || 0}
                </span>
                <Badge
                  variant="secondary"
                  className={getStockBadgeClass(
                    variation.stock_quantity || 0,
                    isActive
                  )}
                >
                  {getStockLabel(variation.stock_quantity || 0, isActive)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 w-fit flex items-center flex-col">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </p>
              <ProductVariationsDelete
                productId={productId}
                variationId={variation.id}
                sku={variation.sku}
                setIsEditMode={setIsEditMode}
                refetch={refetch}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStockBadgeClass(stock: number, enabled: boolean): string {
  if (!enabled) return "bg-gray-100 text-gray-600 border-gray-200";
  if (stock === 0) return "bg-red-100 text-red-700 border-red-200";
  if (stock <= 5) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function getStockLabel(stock: number, enabled: boolean): string {
  if (!enabled) return "Désactivé";
  if (stock === 0) return "Rupture";
  if (stock <= 5) return "Stock faible";
  return "En stock";
}
