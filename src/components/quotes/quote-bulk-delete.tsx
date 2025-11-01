import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { Quote } from "electron/types/quote.types";

interface Props {
  isBulkDeleteMode: boolean | null;
  setIsBulkDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  selectedQuotes: Set<number>;
  setSelectedQuotes: React.Dispatch<React.SetStateAction<Set<number>>>;
  quotes: Quote[];
  refetch: () => void;
}

export default function QuoteBulkDelete({
  isBulkDeleteMode,
  setIsBulkDeleteMode,
  selectedQuotes,
  setSelectedQuotes,
  quotes,
  refetch,
}: Props) {
  const { showToast } = useToastLoader();
  const { mutate: batchDeleteQuotes, isPending } = useMutation<
    { ids: number[] },
    Quote[]
  >();

  const handleBulkDelete = async () => {
    if (selectedQuotes.size === 0) return;
    const toastId = "delete-quotes-toast";
    showToast("loading", "Suppression des devis en cours...", {
      id: toastId,
      duration: Infinity,
    });
    batchDeleteQuotes(
      {
        method: "quote:batchDelete",
        data: { ids: Array.from(selectedQuotes) },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", result.message, {
              id: toastId,
              duration: 3000,
            });
            setSelectedQuotes(new Set());
            setIsBulkDeleteMode(false);
            refetch();
          } else {
            showToast(
              "error",
              result.message || "Échec de la suppression des devis.",
              {
                id: toastId,
                duration: 3000,
              }
            );
          }
        },
        onError: (error) => {
          console.log("Bulk delete error:", error);
          showToast(
            "error",
            error.message || "Échec de la suppression des devis.",
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
      selected={isBulkDeleteMode}
      setSelected={setIsBulkDeleteMode}
      className="max-w-md"
    >
      <DeleteContainer
        onClose={() => setIsBulkDeleteMode(false)}
        onDelete={handleBulkDelete}
        label="Supprimer les devis"
        loading={isPending}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Supprimer les devis sélectionnés
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Êtes-vous sûr de vouloir supprimer ces devis ?
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {Array.from(selectedQuotes).map((id: number) => {
            const quote = quotes.find((q) => q.id === id);
            return (
              <li key={id} className="font-semibold">
                {quote
                  ? `#${quote.id.toString().padStart(4, "0")} - ${
                      quote.client_snapshot?.name || "Client inconnu"
                    }`
                  : "Devis inconnu"}
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
