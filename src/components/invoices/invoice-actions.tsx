import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Eye, DollarSign } from "lucide-react";
import { PDFService, InvoiceData } from "@/services/pdf.service";
import { useMutation } from "@/hooks/useMutation";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";

interface InvoiceActionsProps {
  invoice: InvoiceData;
  onStatusChange?: (newStatus: string) => void;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  onStatusChange,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const companyInfo = useCompanyInfo();

  const changeStatusMutation = useMutation("invoice:changeStatus");

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await PDFService.downloadInvoicePDF(invoice, undefined, companyInfo);
      // Success notification would be handled by parent component
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const result = await changeStatusMutation.mutateAsync({
        method: "invoice:changeStatus",
        data: { id: invoice.id, status: newStatus },
      });

      if (result.success) {
        onStatusChange?.(newStatus);
      }
    } catch (error: any) {
      console.error("Error changing status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(parseFloat(amount));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const PDFDownloadComponent = PDFService.createInvoiceDownloadLink(
    invoice,
    undefined,
    companyInfo
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facture {invoice.ref}
            </CardTitle>
            <CardDescription>
              Créée le {formatDate(invoice.createdAt)}
              {invoice.due_date &&
                ` • Échéance: ${formatDate(invoice.due_date)}`}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Client</h3>
            <p className="font-medium">{invoice.client_snapshot.name}</p>
            {invoice.client_snapshot.address && (
              <p className="text-sm text-gray-600">
                {invoice.client_snapshot.address}
              </p>
            )}
            {invoice.client_snapshot.phone && (
              <p className="text-sm text-gray-600">
                Tél: {invoice.client_snapshot.phone}
              </p>
            )}
            {invoice.client_snapshot.tva && (
              <p className="text-sm text-gray-600">
                TVA: {invoice.client_snapshot.tva}
              </p>
            )}
          </div>
          <div className="text-right">
            <h3 className="font-semibold mb-2">Montant Total</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(invoice.ttc)}
            </p>
            <p className="text-sm text-gray-600">TTC</p>
          </div>
        </div>

        {/* Products Summary */}
        <div>
          <h3 className="font-semibold mb-2">
            Produits ({invoice.products_snapshot.length})
          </h3>
          <div className="space-y-2">
            {invoice.products_snapshot.slice(0, 3).map((product, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{product.name}</span>
                <span className="text-sm text-gray-600">
                  {product.quantity} × {formatCurrency(product.price)} ={" "}
                  {formatCurrency(product.ttc)}
                </span>
              </div>
            ))}
            {invoice.products_snapshot.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{invoice.products_snapshot.length - 3} autres produits
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? "Génération..." : "Télécharger PDF"}
          </Button>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {PDFDownloadComponent}
          </div>

          {invoice.status === "draft" && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("sent")}
              disabled={changeStatusMutation.isPending}
            >
              Marquer comme envoyée
            </Button>
          )}

          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <Button
              onClick={() => handleStatusChange("paid")}
              disabled={changeStatusMutation.isPending}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="h-4 w-4" />
              Marquer comme payée
            </Button>
          )}
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-gray-700 italic">{invoice.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceActions;
