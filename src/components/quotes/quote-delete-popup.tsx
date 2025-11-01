import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useMutation } from "@/hooks/useMutation";
import { Quote } from "electron/types/quote.types";

interface Props {
  isDeleteMode: boolean | null;
  setIsDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  quoteId: number | null;
  quotes?: Quote[];
  refetch: () => void;
}

export default function QuoteDeletePopup({
  isDeleteMode,
  setIsDeleteMode,
  quoteId,
  quotes = [],
  refetch,
}: Props) {
  const { showToast } = useToastLoader(false);
  const { mutate: deleteQuote, isPending } = useMutation<
    { id: number },
    void
  >();

  const handleDelete = () => {
    if (!quoteId) return;
    const toastId = `delete-quote-toast-${quoteId}`;
    showToast("loading", "Suppression du devis en cours...", {
      id: toastId,
      duration: Infinity,
    });

    deleteQuote(
      {
        method: "quote:delete",
        data: { id: quoteId },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast(
              "success",
              result.message || "Devis supprimé avec succès",
              {
                id: toastId,
                duration: 3000,
              }
            );
            setIsDeleteMode(false);
            refetch();
          } else {
            showToast(
              "error",
              result.message || "La suppression du devis a échoué",
              {
                id: toastId,
                duration: 3000,
              }
            );
          }
        },
        onError: (error) => {
          console.log("Delete error:", error);
          showToast(
            "error",
            error.message || "La suppression du devis a échoué",
            {
              id: toastId,
              duration: 3000,
            }
          );
        },
      }
    );
  };

  const quote = quotes.find((q) => q.id === quoteId);

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
          Supprimer le devis
        </h3>
        <p className="text-sm text-gray-700 mb-6 text-center">
          Êtes-vous sûr de vouloir supprimer le devis{" "}
          <b>#{quoteId?.toString().padStart(4, "0")}</b> pour{" "}
          <b>{quote?.client_snapshot?.name || "client inconnu"}</b> ? Cette
          action est irréversible.
        </p>
      </DeleteContainer>
    </PopUp>
  );
}
