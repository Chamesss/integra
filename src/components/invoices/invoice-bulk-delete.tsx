import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";
import PopUp from "../ui/custom-ui/pop-up";
import DeleteContainer from "../ui/custom-ui/search-delete-item";
import { Invoice } from "@/hooks/useInvoices";
import { useToastLoader } from "@/hooks/useToasterLoader";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedInvoices: Set<number>;
  onSuccess: () => void;
  invoices: Invoice[];
}

export default function InvoiceBulkDelete({
  isOpen,
  onClose,
  selectedInvoices,
  onSuccess,
  invoices,
}: Props) {
  const { mutate: deleteInvoices, isPending } = useMutation();
  const { showToast } = useToastLoader();

  const handleDelete = async () => {
    if (selectedInvoices.size === 0) return;
    const toastId = "delete-invoices-toast";
    showToast("loading", "Suppression des factures en cours...", {
      id: toastId,
      duration: Infinity,
    });
    try {
      deleteInvoices(
        {
          method: "invoice:batchDelete",
          data: { ids: Array.from(selectedInvoices) },
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              showToast("success", "Factures supprimées avec succès", {
                id: toastId,
                duration: 3000,
              });
              onSuccess();
              onClose();
            } else {
              showToast(
                "error",
                res.message || "Échec de la suppression des factures.",
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
              `Erreur lors de la suppression des factures : ${error.message}`,
              {
                id: toastId,
                duration: 3000,
              }
            );
          },
        }
      );
    } catch (error) {
      console.error("Error deleting invoices:", error);
      toast.error("Erreur lors de la suppression des factures");
    }
  };

  return (
    <PopUp selected={isOpen} setSelected={onClose} className="max-w-md">
      <DeleteContainer
        onClose={() => onClose()}
        onDelete={handleDelete}
        label="Supprimer les factures sélectionnées"
        loading={isPending}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">
          Supprimer les factures sélectionnées
        </h3>
        <p className="text-sm text-gray-700 mb-3">
          Êtes-vous sûr de vouloir supprimer ces factures ?
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {Array.from(selectedInvoices).map((id: number) => {
            const invoice = invoices.find((c) => c.id === id);
            return (
              <li key={id} className="font-semibold">
                {invoice ? invoice.ref : "Facture inconnue"}
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

  // return (
  //   <Dialog open={isOpen} onOpenChange={onClose}>
  //     <DialogContent>
  //       <DialogHeader>
  //         <DialogTitle className="flex items-center gap-2">
  //           <Trash2 className="h-5 w-5 text-destructive" />
  //           Supprimer les factures
  //         </DialogTitle>
  //         <DialogDescription>
  //           Êtes-vous sûr de vouloir supprimer {selectedInvoices.size} facture
  //           {selectedInvoices.size > 1 ? "s" : ""} ? Cette action ne peut pas
  //           être annulée.
  //         </DialogDescription>
  //       </DialogHeader>

  //       <DialogFooter>
  //         <Button variant="outline" onClick={onClose}>
  //           Annuler
  //         </Button>
  //         <Button
  //           variant="destructive"
  //           onClick={handleDelete}
  //           disabled={bulkDeleteMutation.isPending}
  //         >
  //           {bulkDeleteMutation.isPending ? "Suppression..." : "Supprimer"}
  //         </Button>
  //       </DialogFooter>
  //     </DialogContent>
  //   </Dialog>
  // );
}
