import React from "react";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useMutation } from "@/hooks/useMutation";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { Employee } from "@electron/models";

interface EmployeeBulkDeleteProps {
  isBulkDeleteMode: boolean | null;
  setIsBulkDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  selectedEmployees: Set<number>;
  setSelectedEmployees: React.Dispatch<React.SetStateAction<Set<number>>>;
  employees?: Employee[];
  refetch: () => void;
}

export default function EmployeeBulkDelete({
  isBulkDeleteMode,
  setIsBulkDeleteMode,
  selectedEmployees,
  setSelectedEmployees,
  employees = [],
  refetch,
}: EmployeeBulkDeleteProps) {
  const { showToast } = useToastLoader(false);

  const { mutate: deleteEmployees, isPending } = useMutation<
    { ids: number[] },
    any
  >();

  const handleDelete = async () => {
    if (selectedEmployees.size === 0) return;
    const toastId = "delete-employees-toast";
    showToast("loading", "Suppression des employés en cours...", {
      id: toastId,
      duration: Infinity,
    });

    deleteEmployees(
      {
        method: "employee:batchDelete",
        data: { ids: Array.from(selectedEmployees) },
      },
      {
        onSuccess: (result) => {
          console.log(result);
          if (result.success) {
            showToast("success", result.message, {
              id: toastId,
              duration: 3000,
            });
            setSelectedEmployees(new Set());
            setIsBulkDeleteMode(false);
            refetch();
          } else {
            showToast(
              "error",
              result.message || "Échec de la suppression des employés.",
              {
                id: toastId,
                duration: 3000,
              }
            );
          }
        },
        onError: (error: any) => {
          showToast(
            "error",
            error.message || "Erreur lors de la suppression des employés.",
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
        onDelete={handleDelete}
        label="Supprimer les employés"
        loading={isPending}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Supprimer les employés sélectionnés
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Êtes-vous sûr de vouloir supprimer ces catégories ?
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {Array.from(selectedEmployees).map((id: number) => {
            const employee = employees.find((e) => e.id === id);
            return (
              <li key={id} className="font-semibold">
                {employee ? employee.name : "Employé inconnu"}
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
