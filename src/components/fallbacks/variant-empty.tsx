import { AlertCircle } from "lucide-react";

export default function VariantEmpty() {
  return (
    <div className="max-w-4xl">
      <div className="border border-orange-200 bg-orange-50 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Attributs de variation requis
            </h3>
            <p className="text-orange-700 mb-4 text-sm">
              Ce produit est de type "variable" mais n'a pas d'attributs
              configurés pour les variations. Vous devez d'abord configurer les
              attributs (couleur, taille, etc.) avant de créer des variations.
            </p>
            <p className="text-orange-700 mb-4 text-sm">
              Pour configurer les attributs&nbsp;: cliquez sur{" "}
              <span className="font-medium">Modifier</span>
              <span className="mx-1.5">→</span>
              <span className="font-medium">
                Section&nbsp;«&nbsp;Attributs&nbsp;»
              </span>
              <span className="mx-1.5">→</span>
              <span className="font-medium">Configurer</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
