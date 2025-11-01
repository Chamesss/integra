import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { dateToMonthDayYearTime } from "@/utils/date-formatter";
import { formatCurrency } from "@/utils/text-formatter";
import { Quote, QuoteStatus } from "@electron/types/quote.types";
import {
  EllipsisVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Printer,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@/hooks/useMutation";
import { useCreateInvoiceFromQuote } from "@/hooks/useInvoices";
import { toast } from "sonner";
import QuoteDetails from "./quote-details";
import { useNavigate } from "react-router";
import ClientIcon from "@/components/ui/client-icon";
import { cn } from "@/lib/utils";
import { PDFService } from "@/services/pdf.service";
import useFetchAll from "@/hooks/useFetchAll";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

interface Props {
  quote: Quote;
  selectedQuotes: Set<number>;
  toggleSelectQuote: (quoteId: number) => void;
  quotes: Quote[];
  refetch: () => Promise<any>;
  setIsDeleteMode: React.Dispatch<React.SetStateAction<boolean | null>>;
  setSelectedQuoteId: React.Dispatch<React.SetStateAction<number | null>>;
  isOnline?: boolean;
}

export default function QuoteTableRow({
  quote,
  selectedQuotes,
  toggleSelectQuote,
  refetch,
  setIsDeleteMode,
  setSelectedQuoteId,
  isOnline = true,
}: Props) {
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [hasInvoice, setHasInvoice] = useState(false);
  const navigate = useNavigate();
  const companyInfo = useCompanyInfo();

  const { mutate: changeStatus } = useMutation<
    { id: number; status: QuoteStatus },
    Quote
  >();

  const { createFromQuote } = useCreateInvoiceFromQuote();

  // Check if this quote has an associated invoice
  const { data: invoicesData, refetch: refetchInvoice } = useFetchAll<any>({
    method: "invoice:findByQuote",
    queryParams: { quoteId: quote.id },
    uniqueKey: `quote-invoices-${quote.id}`,
    fetcherLimit: 10,
    disableDefaultFilters: true,
    queryOptions: {
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    if (invoicesData?.rows && invoicesData.rows.length > 0) setHasInvoice(true);
    else setHasInvoice(false);
  }, [invoicesData]);

  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      [QuoteStatus.Draft]: {
        label: "Brouillon",
        variant: "secondary" as const,
      },
      [QuoteStatus.Active]: { label: "Actif", variant: "default" as const },
      [QuoteStatus.Accepted]: { label: "Accepté", variant: "default" as const },
      [QuoteStatus.Rejected]: {
        label: "Refusé",
        variant: "destructive" as const,
      },
      [QuoteStatus.Expired]: { label: "Expiré", variant: "outline" as const },
    };

    const config = statusConfig[status];
    return (
      <Badge
        variant={config.variant}
        className={
          status === QuoteStatus.Accepted
            ? "bg-green-100 text-green-800 border-green-200"
            : ""
        }
      >
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = (newStatus: QuoteStatus) => {
    changeStatus(
      {
        method: "quote:changeStatus",
        data: { id: quote.id, status: newStatus },
      },
      {
        onSuccess: () => {
          toast.success("Statut du devis mis à jour");
          refetch();
        },
        onError: (error: any) => {
          toast.error(`Erreur: ${error.message}`);
        },
      }
    );
  };

  const handleCreateInvoice = () => {
    createFromQuote(quote.id, undefined, {
      onSuccess: async () => {
        await refetchInvoice();
        setTimeout(() => navigate(`/invoices`), 500);
      },
    });
  };

  const handleDownloadPDF = async () => {
    try {
      await PDFService.downloadQuotePDF(quote, undefined, companyInfo);
      toast.success("PDF téléchargé avec succès");
    } catch (error) {
      console.error("Erreur lors du téléchargement PDF:", error);
      toast.error("Erreur lors du téléchargement du PDF");
    }
  };

  const handlePrintPDF = async () => {
    try {
      await PDFService.printQuotePDF(quote, companyInfo);
      toast.success("Impression lancée");
    } catch (error) {
      console.error("Erreur lors de l'impression PDF:", error);
      toast.error("Erreur lors de l'impression du PDF");
    }
  };

  const isSelected = selectedQuotes.has(quote.id);

  return (
    <>
      <TableRow
        className={cn(
          "transition-all cursor-pointer group hover:bg-gray-50",
          isSelected && "bg-blue-pale hover:bg-blue-pale/70"
        )}
      >
        <TableCell className="py-3 pl-3 relative">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => !hasInvoice && toggleSelectQuote(quote.id)}
            disabled={hasInvoice}
            aria-label={`Select quote ${quote.id}`}
          />
          {isSelected && <span className="absolute inset-0 w-1 bg-selected" />}
        </TableCell>

        <TableCell>
          <div className="font-medium">#{quote.ref}</div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-3">
            <ClientIcon type={quote.client_snapshot.type} size="sm" />
            <div className="space-y-1">
              <div className="font-medium">{quote.client_snapshot.name}</div>
              <div className="text-xs text-gray-500 capitalize">
                {quote.client_snapshot.type === "individual"
                  ? "Particulier"
                  : "Entreprise"}
              </div>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-2">
            {getStatusBadge(quote.status)}
            {hasInvoice && (
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Lock className="w-3 h-3 mr-1" />
                Facturé
              </Badge>
            )}
          </div>
        </TableCell>

        <TableCell>
          <div className="space-y-1">
            <div className="font-medium">
              {formatCurrency(parseFloat(quote.ttc))}
            </div>
            <div className="text-xs text-gray-500">
              HT: {formatCurrency(parseFloat(quote.tht))}
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="text-sm">
            {quote.products_snapshot.length} article
            {quote.products_snapshot.length > 1 ? "s" : ""}
          </div>
        </TableCell>

        <TableCell>
          <div className="text-sm text-gray-600">
            {dateToMonthDayYearTime(new Date(quote.createdAt))}
          </div>
        </TableCell>

        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <EllipsisVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsViewingDetails(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintPDF}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer PDF
              </DropdownMenuItem>

              {hasInvoice && (
                <DropdownMenuItem disabled className="text-gray-400">
                  <Lock className="w-4 h-4 mr-2" />
                  Facture générée - Lecture seule
                </DropdownMenuItem>
              )}

              {!hasInvoice && (
                <>
                  <DropdownMenuItem
                    onClick={() =>
                      quote.id && navigate(`/quotes/edit/${quote.id}`)
                    }
                    disabled={!quote.id || !isOnline}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isOnline ? "Modifier" : "Modifier (Hors ligne)"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {quote.status === QuoteStatus.Accepted && (
                    <>
                      <DropdownMenuItem
                        onClick={handleCreateInvoice}
                        className="text-blue-600"
                        disabled={!isOnline}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {isOnline
                          ? "Générer une facture"
                          : "Générer une facture (Hors ligne)"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {quote.status !== QuoteStatus.Accepted && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(QuoteStatus.Accepted)}
                      className="text-green-600"
                      disabled={!isOnline}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isOnline ? "Accepter" : "Accepter (Hors ligne)"}
                    </DropdownMenuItem>
                  )}
                  {quote.status !== QuoteStatus.Rejected && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(QuoteStatus.Rejected)}
                      className="text-red-600"
                      disabled={!isOnline}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isOnline ? "Refuser" : "Refuser (Hors ligne)"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedQuoteId(quote.id);
                      setIsDeleteMode(true);
                    }}
                    className="text-red-500 focus:text-red-500 focus:bg-red-50"
                    disabled={!isOnline}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isOnline ? "Supprimer" : "Supprimer (Hors ligne)"}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <QuoteDetails
        quote={quote}
        isOpen={isViewingDetails}
        onClose={() => setIsViewingDetails(false)}
      />
    </>
  );
}
