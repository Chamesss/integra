import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, AlertCircle, Shuffle } from "lucide-react";
import { Product } from "electron/models/product";
import { AttributeConfig } from "../types";

interface Props {
  product: Product;
  attributeConfigs: AttributeConfig[];
  onToggleAttribute: (attrId: number) => void;
}

export default function AttributeConfigurationStep({
  product,
  attributeConfigs,
  onToggleAttribute,
}: Props) {
  const selectedAttributes = attributeConfigs.filter((attr) => attr.selected);
  const hasSelectedAttributes = selectedAttributes.length > 0;
  const hasValidTerms = selectedAttributes.every(
    (attr) => attr.terms.length > 0
  );

  const isVariableProduct = product.type === "variable";

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          {isVariableProduct
            ? 'Sélectionnez les attributs qui seront utilisés pour créer de nouvelles variations. Ce produit est déjà de type "variable".'
            : 'Sélectionnez les attributs qui seront utilisés pour créer les variations. Le produit sera automatiquement converti en type "variable".'}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Attributs disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attributeConfigs.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium text-gray-900 mb-2">
                Aucun attribut disponible
              </h3>
              <p className="text-sm text-gray-500">
                Ce produit n'a pas d'attributs configurés. Vous devez d'abord
                ajouter des attributs au produit.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {attributeConfigs.map((attr) => (
                <div
                  key={attr.id}
                  className={`border rounded-lg p-4 transition-all ${
                    attr.selected
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={attr.selected}
                        onCheckedChange={() => onToggleAttribute(attr.id)}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {attr.name}
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {attr.terms.map((term) => (
                            <Badge
                              key={term}
                              variant="outline"
                              className="text-xs"
                            >
                              {term}
                            </Badge>
                          ))}
                        </div>
                        {attr.terms.length === 0 && (
                          <p className="text-sm text-orange-600 mt-1">
                            Aucun terme défini pour cet attribut
                          </p>
                        )}
                      </div>
                    </div>
                    {attr.forVariation && (
                      <Badge variant="secondary" className="text-xs">
                        Déjà pour variations
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {hasSelectedAttributes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Résumé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>{selectedAttributes.length}</strong> attribut(s)
                sélectionné(s)
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedAttributes.map((attr) => (
                  <Badge key={attr.id} variant="outline">
                    {attr.name} ({attr.terms.length} terme(s))
                  </Badge>
                ))}
              </div>
              {hasValidTerms && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Environ{" "}
                  {selectedAttributes.reduce(
                    (acc, attr) => acc * attr.terms.length,
                    1
                  )}{" "}
                  variation(s) seront générées
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
