import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Invoice } from "@/hooks/useInvoices";
import { PDFService } from "@/services/pdf.service";
import { toast } from "sonner";
import { calculateTaxSummary } from "@/utils/price-calculation";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import ClientInfoCard from "@/components/shared/ClientInfoCard";
import ProductsList from "@/components/shared/ProductsList";
import FinancialSummary from "@/components/shared/FinancialSummary";
import DocumentHeader from "@/components/shared/DocumentHeader";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceDetails({ invoice, isOpen, onClose }: Props) {
  if (!invoice) return null;

  const discountPercentage = parseFloat(invoice.discount) || 0;
  const taxSummary = calculateTaxSummary(
    invoice.products_snapshot,
    discountPercentage
  );
  const taxEntries = Object.entries(taxSummary);

  const statusConfig = {
    draft: {
      label: "Brouillon",
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800",
    },
    sent: {
      label: "Envoyée",
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800",
    },
    paid: {
      label: "Payée",
      variant: "default" as const,
      className: "bg-green-100 text-green-800",
    },
    overdue: {
      label: "En retard",
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800",
    },
  };

  const companyInfo = useCompanyInfo();

  const handleDownloadPdf = async () => {
    try {
      await PDFService.generateInvoicePDF(invoice, companyInfo);
      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  // Prepare additional info for client card
  const additionalInfo = [];
  if (invoice.due_date) {
    additionalInfo.push({
      label: "Échéance le",
      value: dateToMonthDayYearTime(new Date(invoice.due_date)),
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] w-[95vw] overflow-y-auto scrollbar p-3 sm:p-6">
        <DocumentHeader
          title="Facture"
          documentRef={invoice.ref}
          id={invoice.id}
          status={invoice.status}
          statusConfig={statusConfig}
          onDownloadPdf={handleDownloadPdf}
        />

        <div className="flex flex-col gap-4 mt-4 sm:gap-6">
          <ClientInfoCard
            clientSnapshot={invoice.client_snapshot}
            createdAt={invoice.createdAt}
            taxRate={invoice.tax_rate}
            notes={invoice.notes}
            additionalInfo={additionalInfo}
            documentType="invoice"
          />

          <div className="flex-1 space-y-4 sm:space-y-6">
            <ProductsList products={invoice.products_snapshot} type="invoice" />

            <FinancialSummary
              taxEntries={taxEntries}
              ttc={invoice.ttc}
              discount={invoice.discount}
              discountType={invoice.discount_type}
              taxSummary={taxSummary}
              timbreFiscal={invoice.timbre_fiscal}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
