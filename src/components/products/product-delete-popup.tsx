import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useMutation } from "@/hooks/useMutation";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "electron/models/product";

interface Props {
  isDeleteMode: boolean | null;
  setIsDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  productId: number | null;
  products?: Product[];
  refetch?: () => void;
  redirect?: () => void;
}

export default function ProductDeletePopup({
  isDeleteMode,
  setIsDeleteMode,
  productId,
  products = [],
  refetch,
  redirect,
}: Props) {
  const { showToast } = useToastLoader();
  const queryClient = useQueryClient();
  const { mutate: deleteProduct, isPending } = useMutation<
    { id: number },
    Product
  >();

  const handleDelete = async () => {
    if (!productId) return;
    const toastId = "delete-product-toast";
    showToast("loading", "Suppression du produit en cours...", {
      id: toastId,
      duration: Infinity,
    });

    deleteProduct(
      {
        method: "product:delete",
        data: { id: Number(productId) },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", result.message, {
              id: toastId,
              duration: 3000,
            });
            setIsDeleteMode(false);

            queryClient.refetchQueries({
              queryKey: ["product:getAll"],
            });

            queryClient.refetchQueries({
              queryKey: ["category:getAll"],
            });
            redirect?.();
            refetch?.();
          } else {
            showToast(
              "error",
              result.message || "Échec de la suppression de produit.",
              {
                id: toastId,
                duration: 3000,
              }
            );
          }
        },
        onError: (error) => {
          showToast(
            "error",
            error?.message ||
              "Une erreur s'est produite lors de la suppression de produit.",
            {
              id: toastId,
              duration: 3000,
            }
          );
        },
      }
    );
  };

  return (
    <PopUp
      selected={isDeleteMode}
      setSelected={setIsDeleteMode}
      className="max-w-md"
    >
      <DeleteContainer
        loading={isPending}
        onClose={() => setIsDeleteMode(false)}
        onDelete={handleDelete}
      >
        <h3 className="text-lg font-semibold mb-2 text-center">
          Supprimer le produit
        </h3>
        <p className="text-sm text-gray-700 mb-6 text-center">
          Êtes-vous sûr de vouloir supprimer ce produit{" "}
          <b>{products.find((c) => c.id === productId)?.name || ""}</b> ? Cette
          action est irréversible.
        </p>
      </DeleteContainer>
    </PopUp>
  );
}
