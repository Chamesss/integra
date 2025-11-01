import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { Client } from "electron/models/client";

interface Props {
  isBulkDeleteMode: boolean | null;
  setIsBulkDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  selectedClients: Set<number>;
  setSelectedClients: React.Dispatch<React.SetStateAction<Set<number>>>;
  clients: Client[];
  refetch: () => void;
}

export default function ClientBulkDelete({
  isBulkDeleteMode,
  setIsBulkDeleteMode,
  selectedClients,
  setSelectedClients,
  clients,
  refetch,
}: Props) {
  const { showToast } = useToastLoader();
  const { mutate: batchDeleteClients, isPending } = useMutation<
    { ids: number[] },
    Client[]
  >();

  const handleBulkDelete = async () => {
    if (selectedClients.size === 0) return;
    const toastId = "delete-clients-toast";
    showToast("loading", "Suppression des clients en cours...", {
      id: toastId,
      duration: Infinity,
    });
    batchDeleteClients(
      {
        method: "client:batchDelete",
        data: { ids: Array.from(selectedClients) },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", result.message, {
              id: toastId,
              duration: 3000,
            });
            setSelectedClients(new Set());
            setIsBulkDeleteMode(false);
            refetch();
          } else {
            showToast(
              "error",
              result.message || "Échec de la suppression des clients.",
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
            error.message || "Erreur lors de la suppression des clients.",
            {
              id: "delete-clients-toast",
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
        label="Supprimer les clients"
        loading={isPending}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Supprimer les clients sélectionnés
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Êtes-vous sûr de vouloir supprimer ces clients ?
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {Array.from(selectedClients).map((id: number) => {
            const client = clients.find((c) => c.id === id);
            return (
              <li key={id} className="font-semibold">
                {client ? client.name : "Client inconnu"}
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
