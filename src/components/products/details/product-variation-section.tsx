import { Product } from "@electron/models";
import ProductVariationsManager from "../variations/product-variations-manager";
import { Package, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import ProductVariationCreator from "../variations/product-variation-creator";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { Variation } from "../variations/types";

interface Props {
  product: Product;
  refetch: () => void;
  isLoading: boolean;
  refetchVariants: () => void;
  variations: Variation[];
}

export default function ProductVariationSection({
  product,
  refetch,
  isLoading,
  refetchVariants,
  variations,
}: Props) {
  const [isVariationCreatorOpen, setIsVariationCreatorOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const isVariableProduct = product.type === "variable";

  const { mutate: editProduct, isPending: isConverting } = useMutation();
  const { showToast } = useToastLoader();

  const handleConvertToVariable = async () => {
    const toastId = "product-convert-toast";
    const data = {
      id: product.id,
      type: "variable",
    };

    showToast("loading", "Conversion du produit en cours...", {
      id: toastId,
      duration: Infinity,
    });

    editProduct(
      {
        method: "product:update",
        data,
      },
      {
        onSuccess: () => {
          showToast("success", "Produit converti avec succès !", {
            duration: 3000,
            id: toastId,
          });
          setIsConvertModalOpen(false);
          refetch();
          refetchVariants();
        },
        onError: (error) => {
          showToast("error", "Erreur lors de la conversion du produit !", {
            duration: 3000,
            id: toastId,
          });
          console.error("Error updating product:", product.id, " :", error);
        },
      }
    );
  };

  return (
    <>
      <div className="p-4 sm:p-6">
        {isVariableProduct ? (
          <ProductVariationsManager
            product={product}
            onCreateVariations={() => setIsVariationCreatorOpen(true)}
            variations={variations}
            isLoading={isLoading}
            refetch={refetchVariants}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Produit simple
              </h3>
              <p className="text-gray-500 mb-6">
                Ce produit est de type "simple". Pour gérer des variations, vous
                devez d'abord le convertir en produit variable.
              </p>
              <Button
                onClick={() => setIsConvertModalOpen(true)}
                disabled={isConverting}
              >
                <Settings className="w-4 h-4 mr-2" />
                {isConverting ? "Conversion..." : "Convertir en variable"}
              </Button>
            </div>
          </div>
        )}

        {isVariableProduct && (
          <ProductVariationCreator
            product={product}
            isOpen={isVariationCreatorOpen}
            onClose={() => setIsVariationCreatorOpen(false)}
            onSuccess={refetchVariants}
            existingVariations={variations}
          />
        )}
      </div>

      {/* Conversion Confirmation Modal */}
      <Dialog open={isConvertModalOpen} onOpenChange={setIsConvertModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Convertir en produit variable
            </DialogTitle>
            <DialogDescription>
              Cette action convertira ce produit simple en produit variable.
              Cette opération est irréversible et permettra de créer des
              variations basées sur les attributs du produit.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">
                Qu'est-ce qui va changer ?
              </h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Le type de produit passera de "simple" à "variable"</li>
                <li>
                  • Vous pourrez créer des variations avec différents attributs
                </li>
                <li>• Les paramètres actuels seront conservés</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConvertModalOpen(false)}
              disabled={isConverting}
            >
              Annuler
            </Button>
            <Button onClick={handleConvertToVariable} disabled={isConverting}>
              {isConverting ? "Conversion..." : "Convertir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
