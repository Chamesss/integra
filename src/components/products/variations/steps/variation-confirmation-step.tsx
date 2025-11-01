import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { Product } from "electron/models/product";
import { AttributeConfig, Variation } from "../types";

interface Props {
  product: Product;
  selectedAttributes: AttributeConfig[];
  variations: Variation[];
}

export default function VariationConfirmationStep({
  product,
  selectedAttributes,
  variations,
}: Props) {
  const enabledVariationsCount = variations.filter((v) => v.enabled).length;
  const isVariableProduct = product.type === "variable";

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="w-4 h-4" />
        <AlertDescription>
          {isVariableProduct
            ? "Confirmez l'ajout des nouvelles variations. Cette action va :"
            : "Confirmez la création des variations. Cette action va :"}
          <ul className="list-disc list-inside mt-2 space-y-1">
            {!isVariableProduct && (
              <li>Convertir le produit en type "variable"</li>
            )}
            <li>
              Mettre à jour les attributs avec les paramètres de variation
            </li>
            <li>
              {isVariableProduct ? "Ajouter" : "Créer"} {enabledVariationsCount}{" "}
              variation(s)
              {isVariableProduct ? " supplémentaire(s)" : ""}
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Résumé des modifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Attributs de variation :</h4>
              <div className="flex flex-wrap gap-1">
                {selectedAttributes.map((attr) => (
                  <Badge key={attr.id} variant="outline">
                    {attr.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Variations à créer :</h4>
              <p className="text-sm text-gray-600">
                {enabledVariationsCount} variation(s) activée(s) sur{" "}
                {variations.length} au total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
