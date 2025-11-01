import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@/hooks/useMutation";
import { useToastLoader } from "@/hooks/useToasterLoader";
import { Tag } from "@electron/models";

interface Props {
  selectedTag: Tag | null;
  setSelectedTag: (tag: Tag | null) => void;
  refetch?: () => void;
}

export default function TagDeletePopup({ selectedTag, setSelectedTag, refetch }: Props) {
  const { showToast } = useToastLoader();
  const { mutate: deleteTag, isPending } = useMutation();

  const handleDelete = () => {
    if (!selectedTag) return;

    const toastId = `delete-tag-toast-${selectedTag.id}`;
    showToast("loading", "Suppression du tag en cours...", {
      id: toastId,
      duration: Infinity,
    });

    deleteTag(
      {
        method: "tag:delete",
        data: { id: selectedTag.id },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            showToast("success", "Tag supprimé avec succès", {
              id: toastId,
              duration: 3000,
            });
            refetch?.();
          } else {
            showToast(
              "error",
              result.message || "La suppression du tag a échoué",
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
            error.message || "La suppression du tag a échoué",
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
    <Dialog open={!!selectedTag} onOpenChange={() => setSelectedTag(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le tag</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le tag "{selectedTag?.name}" ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setSelectedTag(null)}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
