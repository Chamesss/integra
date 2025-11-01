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
import {
  EllipsisVertical,
  Eye,
  Download,
  FileText,
  Printer,
} from "lucide-react";
import { useChangeInvoiceStatus, type Invoice } from "@/hooks/useInvoices";
import { toast } from "sonner";
import ClientIcon from "@/components/ui/client-icon";
import { cn } from "@/lib/utils";
import { PDFService } from "@/services/pdf.service";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

interface Props {
  invoice: Invoice;
  selectedInvoices: Set<number>;
  toggleSelectInvoice: (invoiceId: number) => void;
  invoices: Invoice[];
  refetch: () => void;
  onViewDetails: (invoice: Invoice) => void;
}

export default function InvoiceTableRow({
  invoice,
  selectedInvoices,
  toggleSelectInvoice,
  refetch,
  onViewDetails,
}: Props) {
  const { changeStatus } = useChangeInvoiceStatus();
  const companyInfo = useCompanyInfo();

  const isSelected = selectedInvoices.has(invoice.id);

  const getStatusBadge = (status: string) => {
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

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = (newStatus: string) => {
    changeStatus(invoice.id, newStatus, {
      onSuccess: () => refetch(),
    });
  };

  const handleDownloadPDF = async () => {
    try {
      await PDFService.generateInvoicePDF(invoice, companyInfo);
      toast.success("PDF généré avec succès");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handlePrintPDF = async () => {
    try {
      await PDFService.printInvoicePDF(invoice, companyInfo);
      toast.success("Impression lancée");
    } catch (error) {
      console.error("Error printing PDF:", error);
      toast.error("Erreur lors de l'impression du PDF");
    }
  };

  const handleViewDetails = () => onViewDetails(invoice);

  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer group transition-all",
          isSelected && "bg-blue-pale hover:bg-blue-pale/70"
        )}
      >
        <TableCell className="w-12 py-3 pl-3 relative">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelectInvoice(invoice.id)}
            aria-label={`Select invoice ${invoice.ref}`}
          />
          {isSelected && <span className="absolute inset-0 w-1 bg-selected" />}
        </TableCell>

        <TableCell className="font-medium">#{invoice.ref}</TableCell>

        <TableCell>
          <div className="flex items-center gap-3">
            <ClientIcon type={invoice.client_snapshot.type} size="sm" />
            <div className="space-y-1">
              <div className="font-medium">{invoice.client_snapshot.name}</div>
              <div className="text-xs text-gray-500 capitalize">
                {invoice.client_snapshot.type === "individual"
                  ? "Particulier"
                  : "Entreprise"}
              </div>
            </div>
          </div>
        </TableCell>

        <TableCell>{getStatusBadge(invoice.status)}</TableCell>

        <TableCell className="font-medium">
          {formatCurrency(invoice.ttc)}
        </TableCell>

        <TableCell className="text-muted-foreground">
          {dateToMonthDayYearTime(invoice.createdAt)}
        </TableCell>

        <TableCell className="text-muted-foreground">
          <div className="text-sm">
            {invoice.products_snapshot.length} article
            {invoice.products_snapshot.length > 1 ? "s" : ""}
          </div>
        </TableCell>

        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 transition-opacity"
              >
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handlePrintPDF}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimer PDF
              </DropdownMenuItem>

              {["draft", "sent"].includes(invoice.status) ? (
                <>
                  <DropdownMenuSeparator />

                  {invoice.status === "draft" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("sent")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Marquer comme envoyée
                    </DropdownMenuItem>
                  )}

                  {invoice.status === "sent" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange("paid")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Marquer comme payée
                    </DropdownMenuItem>
                  )}
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    </>
  );
}
