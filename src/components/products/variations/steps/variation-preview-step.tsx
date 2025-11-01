import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Shuffle } from "lucide-react";
import VariationItem from "./variation-item";
import { Variation } from "../types";

interface Props {
  variations: Variation[];
  isGenerating: boolean;
  onRegenerate: () => void;
  onUpdateVariation: (variationId: string, field: string, value: any) => void;
  onDeleteVariation: (variationId: string) => void;
}

export default function VariationPreviewStep({
  variations,
  isGenerating,
  onRegenerate,
  onUpdateVariation,
  onDeleteVariation,
}: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Variations générées
              <Badge variant="secondary">{variations.length}</Badge>
            </div>
            <Button
              onClick={onRegenerate}
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {isGenerating ? "Génération..." : "Régénérer"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {variations.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium text-gray-900 mb-2">
                Aucune variation générée
              </h3>
              <p className="text-sm text-gray-500">
                Sélectionnez des attributs avec des termes valides pour générer
                des variations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variations.map((variation) => (
                <VariationItem
                  key={variation.id}
                  variation={variation}
                  onUpdate={onUpdateVariation}
                  onDelete={onDeleteVariation}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
