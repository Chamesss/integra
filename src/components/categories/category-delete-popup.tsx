import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useMutation } from "@/hooks/useMutation";
import { Category } from "electron/models/category";

interface Props {
  isDeleteMode: boolean | null;
  setIsDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  categoryId: number | null;
  categories?: Category[];
  refetch: () => void;
}

export default function CategoryDeletePopup({
  isDeleteMode,
  setIsDeleteMode,
  categoryId,
  categories = [],
  refetch,
}: Props) {
  const { showToast } = useToastLoader();
  const { mutate: deleteCategory, isPending } = useMutation<
    { id: number },
    Category
  >();

  const handleDelete = async () => {
    if (!categoryId) return;
    const toastId = `delete-category-toast-${categoryId}`;
    showToast("loading", "Suppression de la catégorie en cours...", {
      id: toastId,
      duration: Infinity,
    });

    deleteCategory(
      {
        method: "category:delete",
        data: { id: Number(categoryId) },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", result.message, {
              id: toastId,
              duration: 3000,
            });
            setIsDeleteMode(false);
            refetch();
          } else {
            showToast(
              "error",
              result.message || "Échec de la suppression de la catégorie.",
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
              "Une erreur s'est produite lors de la suppression de la catégorie.",
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
          Supprimer la catégorie
        </h3>
        <p className="text-sm text-gray-700 mb-6 text-center">
          Êtes-vous sûr de vouloir supprimer cette catégorie{" "}
          <b>{categories.find((c) => c.id === categoryId)?.name || ""}</b> ?
          Cette action est irréversible.
        </p>
      </DeleteContainer>
    </PopUp>
  );
}
