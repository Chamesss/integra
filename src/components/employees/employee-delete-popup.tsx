import React from "react";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { useMutation } from "@/hooks/useMutation";
import { Employee } from "@electron/models";

interface Props {
  isDeleteMode: boolean | null;
  setIsDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  employeeId: number | null;
  employees?: Employee[];
  refetch: () => void;
}

export default function EmployeeDeletePopup({
  isDeleteMode,
  setIsDeleteMode,
  employeeId,
  employees = [],
  refetch,
}: Props) {
  const { showToast } = useToastLoader(false);
  const { mutate: deleteEmployee, isPending } = useMutation<
    { id: number },
    Employee
  >();

  const handleDelete = async () => {
    if (!employeeId) return;
    const toastId = `delete-employee-toast-${employeeId}`;
    showToast("loading", "Suppression de l'employé en cours...", {
      id: toastId,
      duration: Infinity,
    });

    deleteEmployee(
      {
        method: "employee:delete",
        data: { id: Number(employeeId) },
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
              result.message || "Échec de la suppression de l'employé.",
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
              "Une erreur s'est produite lors de la suppression de l'employé.",
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
          Supprimer l'employé
        </h3>
        <p className="text-sm text-gray-700 mb-6 text-center">
          Êtes-vous sûr de vouloir supprimer cet employé{" "}
          <b>{employees.find((c) => c.id === employeeId)?.name || ""}</b> ?
          Cette action est irréversible.
        </p>
      </DeleteContainer>
    </PopUp>
  );
}
