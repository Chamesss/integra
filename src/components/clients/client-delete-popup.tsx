import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useMutation } from "@/hooks/useMutation";
import { Client } from "@electron/models";

interface Props {
  isDeleteMode: boolean | null;
  setIsDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  clientId: number | null;
  clients?: Client[];
  refetch: () => void;
}

export default function ClientDeletePopup({
  isDeleteMode,
  setIsDeleteMode,
  clientId,
  clients = [],
  refetch,
}: Props) {
  const { showToast } = useToastLoader(false);
  const { mutate: deleteClient, isPending } = useMutation<
    { id: number },
    void
  >();

  const handleDelete = () => {
    if (!clientId) return;
    const toastId = `delete-client-toast-${clientId}`;
    showToast("loading", "Suppression du client en cours...", {
      id: toastId,
      duration: Infinity,
    });

    deleteClient(
      {
        method: "client:delete",
        data: { id: clientId },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast(
              "success",
              result.message || "Client supprimé avec succès",
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
              result.message || "La suppression du client a échoué",
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
            error.message || "La suppression du client a échoué",
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
          Supprimer le client
        </h3>
        <p className="text-sm text-gray-700 mb-6 text-center">
          Êtes-vous sûr de vouloir supprimer ce client{" "}
          <b>{clients.find((c) => c.id === clientId)?.name || ""}</b> ? Cette
          action est irréversible.
        </p>
      </DeleteContainer>
    </PopUp>
  );
}
