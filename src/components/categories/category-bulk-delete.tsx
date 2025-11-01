import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { Category } from "electron/models/category";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";

interface Props {
  isBulkDeleteMode: boolean | null;
  setIsBulkDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  selectedCategories: Set<number>;
  setSelectedCategories: React.Dispatch<React.SetStateAction<Set<number>>>;
  categories?: Category[];
  refetch: () => void;
}

export default function CategoryBulkDelete({
  isBulkDeleteMode,
  setIsBulkDeleteMode,
  selectedCategories,
  setSelectedCategories,
  categories = [],
  refetch,
}: Props) {
  const { showToast } = useToastLoader();
  const { mutate: deleteCategories, isPending } = useMutation<
    { ids: number[] },
    Category[]
  >();

  const handleBulkDelete = async () => {
    if (selectedCategories.size === 0) return;
    const toastId = "delete-categories-toast";
    showToast("loading", "Suppression des catégories en cours...", {
      id: toastId,
      duration: Infinity,
    });
    deleteCategories(
      {
        method: "category:batchDelete",
        data: { ids: Array.from(selectedCategories) },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", result.message, {
              id: toastId,
              duration: 3000,
            });
            setSelectedCategories(new Set());
            setIsBulkDeleteMode(false);
            refetch();
          } else {
            showToast(
              "error",
              result.message || "Échec de la suppression des catégories.",
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
            error.message || "Erreur lors de la suppression des catégories.",
            {
              id: "delete-categories-toast",
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
        label="Supprimer les catégories"
        loading={isPending}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Supprimer les catégories sélectionnées
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Êtes-vous sûr de vouloir supprimer ces catégories ?
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {Array.from(selectedCategories).map((id: number) => {
            const category = categories.find((c) => c.id === id);
            return (
              <li key={id} className="font-semibold">
                {category ? category.name : "Catégorie inconnue"}
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
