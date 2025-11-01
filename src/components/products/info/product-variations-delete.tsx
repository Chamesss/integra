import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { Edit, EllipsisVertical, Trash, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  productId: number;
  variationId: string;
  sku: string;
  setIsEditMode?: React.Dispatch<React.SetStateAction<boolean>>;
  refetch?: () => void;
}

export default function ProductVariationsDelete({
  productId,
  variationId,
  sku,
  setIsEditMode,
  refetch,
}: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { mutate: deleteVariation, isPending } = useMutation();
  const { showToast } = useToastLoader();

  const handleDeleteVariation = () => {
    const toastId = "delete-product-variation";
    showToast("loading", "Suppression de la variation en cours...", {
      id: toastId,
      duration: Infinity,
    });
    deleteVariation(
      {
        method: "variation:delete",
        data: { productId, variationId },
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            showToast("success", "Variation supprimée avec succès", {
              id: toastId,
              duration: 3000,
            });
            setIsOpen(false);
            refetch?.();
          } else {
            showToast("error", "Échec de la suppression de la variation", {
              id: toastId,
              duration: 5000,
            });
          }
        },
        onError: (error) => {
          console.error(error);
          showToast("error", "Erreur lors de la suppression de la variation", {
            id: toastId,
            duration: 5000,
          });
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <Trash className="w-5 h-5 text-red-500" />
            Supprimer
          </DropdownMenuItem>
          {setIsEditMode ? (
            <DropdownMenuItem onClick={() => setIsEditMode(true)}>
              <Edit className="w-4 h-4 mr-1" />
              Modifier
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la variation</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col flex-1 mt-4 items-center gap-4">
            <Trash2 className="h-12 w-12 text-gray-700" />
            <div className="w-full px-4">
              <div className="space-y-4 text-center">
                Êtes-vous sûr de vouloir supprimer la variation
                <strong> {sku} </strong> ?
                <p className="text-sm text-gray-500 mt-2">
                  Cette action est irréversible.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVariation}
              disabled={isPending}
            >
              {isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
