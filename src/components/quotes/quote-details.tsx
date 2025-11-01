import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Quote, QuoteStatus } from "@electron/types/quote.types";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import { calculateTaxSummary } from "@/utils/price-calculation";
import ClientInfoCard from "@/components/shared/ClientInfoCard";
import ProductsList from "@/components/shared/ProductsList";
import FinancialSummary from "@/components/shared/FinancialSummary";
import DocumentHeader from "@/components/shared/DocumentHeader";

interface Props {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuoteDetails({ quote, isOpen, onClose }: Props) {
  const discountPercentage = parseFloat(quote.discount) || 0;
  const taxSummary = calculateTaxSummary(
    quote.products_snapshot,
    discountPercentage
  );
  const taxEntries = Object.entries(taxSummary);

  const statusConfig = {
    [QuoteStatus.Draft]: {
      label: "Brouillon",
      variant: "secondary" as const,
    },
    [QuoteStatus.Active]: { label: "Actif", variant: "default" as const },
    [QuoteStatus.Accepted]: {
      label: "Accepté",
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    [QuoteStatus.Rejected]: {
      label: "Refusé",
      variant: "destructive" as const,
    },
    [QuoteStatus.Expired]: { label: "Expiré", variant: "outline" as const },
  };

  // Prepare additional info for client card
  const additionalInfo = [];
  if (quote.valid_until) {
    additionalInfo.push({
      label: "Valide jusqu'au",
      value: dateToMonthDayYearTime(new Date(quote.valid_until)),
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] w-[95vw] overflow-y-auto scrollbar p-3 sm:p-6">
        <DocumentHeader
          title="Devis"
          documentRef={quote.ref}
          id={quote.id}
          status={quote.status}
          statusConfig={statusConfig}
        />

        <div className="flex flex-col gap-4 mt-4 sm:gap-6">
          <ClientInfoCard
            clientSnapshot={quote.client_snapshot}
            createdAt={quote.createdAt}
            taxRate={quote.tax_rate}
            notes={quote.notes}
            additionalInfo={additionalInfo}
            documentType="quote"
          />

          <div className="flex-1 space-y-4 sm:space-y-6">
            <ProductsList products={quote.products_snapshot} type="quote" />

            <FinancialSummary
              taxEntries={taxEntries}
              ttc={quote.ttc}
              discount={quote.discount}
              discountType={quote.discount_type}
              taxSummary={taxSummary}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
