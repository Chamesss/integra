import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Variation } from "../types";
import FormInput from "@/components/ui/custom-ui/form-input";

interface Props {
  variation: Variation;
  onUpdate: (variationId: string, field: string, value: any) => void;
  onDelete: (variationId: string) => void;
}

export default function VariationItem({
  variation,
  onUpdate,
  onDelete,
}: Props) {
  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        variation.enabled
          ? "border-green-200 bg-white"
          : "border-gray-200 bg-gray-50 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Attribute combination */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onUpdate(variation.id, "enabled", !variation.enabled)
              }
              className="p-1 h-auto"
            >
              {variation.enabled ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            <div className="flex flex-wrap gap-1">
              {Object.entries(variation.attributes).map(([attr, value]) => (
                <Badge key={attr} variant="outline" className="text-xs">
                  <span className="text-gray-500">{attr}:</span> {value.option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Variation details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 uppercase">
                SKU
              </Label>
              <Input
                value={variation.sku}
                onChange={(e) => onUpdate(variation.id, "sku", e.target.value)}
                className="text-sm"
                disabled={!variation.enabled}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 uppercase">
                Prix (TND)
              </Label>
              <FormInput
                type="number"
                step="0.1"
                value={variation.regular_price}
                onChange={(e) =>
                  onUpdate(variation.id, "regular_price", e.target.value)
                }
                className="text-sm"
                disabled={!variation.enabled}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 uppercase">
                Stock
              </Label>
              <FormInput
                type="number"
                value={variation.stock_quantity}
                onChange={(e) =>
                  onUpdate(
                    variation.id,
                    "stock_quantity",
                    parseInt(e.target.value) || 0
                  )
                }
                className="text-sm"
                disabled={!variation.enabled}
              />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(variation.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
