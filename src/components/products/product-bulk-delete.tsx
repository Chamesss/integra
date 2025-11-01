import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "electron/models/product";

interface Props {
  isBulkDeleteMode: boolean | null;
  setIsBulkDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  selectedProducts: Set<number>;
  setSelectedProducts: React.Dispatch<React.SetStateAction<Set<number>>>;
  products?: Product[];
  refetch?: () => void;
}

export default function ProductBulkDelete({
  isBulkDeleteMode,
  setIsBulkDeleteMode,
  selectedProducts,
  setSelectedProducts,
  products = [],
  refetch,
}: Props) {
  const { showToast } = useToastLoader();
  const queryClient = useQueryClient();
  const { mutate: deleteCategories, isPending } = useMutation<
    { ids: number[] },
    Product[]
  >();

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    showToast("loading", "Suppression des produits en cours...", {
      id: "delete-products-toast",
      duration: Infinity,
    });
    deleteCategories(
      {
        method: "product:batchDelete",
        data: { ids: Array.from(selectedProducts) },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", result.message, {
              id: "delete-products-toast",
              duration: 3000,
            });
            setSelectedProducts(new Set());
            setIsBulkDeleteMode(false);

            queryClient.refetchQueries({
              queryKey: ["product:getAll"],
            });

            queryClient.refetchQueries({
              queryKey: ["category:getAll"],
            });

            refetch?.();
          } else {
            showToast(
              "error",
              result.message || "Échec de la suppression des produits.",
              {
                id: "delete-products-toast",
                duration: 3000,
              }
            );
          }
        },
        onError: (error) => {
          showToast(
            "error",
            error.message || "Erreur lors de la suppression des produits.",
            {
              id: "delete-products-toast",
              duration: 3000,
            }
          );
        },
      }
    );
  };

  return (
    <PopUp
      selected={isBulkDeleteMode}
      setSelected={setIsBulkDeleteMode}
      className="max-w-md"
    >
      <DeleteContainer
        onClose={() => setIsBulkDeleteMode(false)}
        onDelete={handleBulkDelete}
        label="Supprimer les produits"
        loading={isPending}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Supprimer les produits sélectionnées
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Êtes-vous sûr de vouloir supprimer ces produits ?
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {Array.from(selectedProducts).map((id: number) => {
            const product = products.find((c) => c.id === id);
            return (
              <li key={id} className="font-semibold">
                {product ? product.name : "Produit inconnue"}
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-gray-700 mt-3">
          Cette action est irréversible.
        </p>
      </DeleteContainer>
    </PopUp>
  );
}
