import { Trash2 } from "lucide-react";
import React from "react";
import { Button } from "../button";

interface DeleteContainerProps {
  children: React.ReactNode;
  onDelete: () => void;
  onClose?: () => void;
  label?: string;
  loading?: boolean;
}

export default function DeleteContainer({
  children,
  onDelete,
  onClose,
  label = "Supprimer",
  loading = false,
}: DeleteContainerProps) {
  return (
    <div className="flex flex-col flex-1 mt-4 items-center gap-4">
      <Trash2 className="h-12 w-12 text-gray-700" />
      <div className="w-full px-4">{children}</div>
      <div className="w-full">
        <div className="flex flex-row gap-2">
          <Button
            onClick={onClose}
            variant="ghost"
            className="border flex flex-1 h-10"
          >
            Annuler
          </Button>
          <Button
            data-slot="delete-button"
            aria-label="Supprimer"
            type="button"
            className="border h-10 flex flex-1 hover:bg-red-600/70 bg-red-600"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? "Suppression..." : label}
          </Button>
        </div>
      </div>
    </div>
  );
}
