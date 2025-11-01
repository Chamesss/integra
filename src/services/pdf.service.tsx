import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  PDFDownloadLink,
  pdf,
} from "@react-pdf/renderer";
import {
  PdfHeader,
  ProductsTable,
  TaxSummary,
  BottomSection,
  PdfFooter,
} from "./pdf";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 40,
    color: "#000",
  },
});

export interface InvoiceData {
  id: number;
  ref: string;
  status: "draft" | "sent" | "paid" | "overdue";
  createdAt: string | Date;
  due_date?: string | Date | null;
  tht: string;
  ttc: string;
  discount: string;
  discount_type: "percentage" | "fixed";
  tax_rate: string;
  timbre_fiscal: string;
  notes?: string;
  client_snapshot: {
    name: string;
    address?: string;
    phone?: string;
    tva?: string;
  };
  products_snapshot: Array<{
    name: string;
    quantity: number;
    price: string;
    tax_rate: string;
    tht: string;
    ttc: string;
  }>;
}

export interface QuoteData {
  id: number;
  ref: string;
  status: "draft" | "active" | "accepted" | "rejected" | "expired";
  createdAt: string | Date;
  valid_until?: string | Date | null;
  tht: string;
  ttc: string;
  discount: string;
  discount_type: "percentage" | "fixed";
  tax_rate: string;
  notes?: string;
  client_snapshot: {
    name: string;
    type: "individual" | "company";
    address?: string;
    phone?: string;
    tva?: string | null;
  };
  products_snapshot: Array<{
    name: string;
    quantity: number;
    price: string;
    tax_rate: string;
    tht: string;
    ttc: string;
  }>;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string; // base64
  fax?: string;
  tva?: string;
  rib?: string;
  mf?: string;
  fiscalValue?: string; // Timbre fiscal
}

const QuotePDF: React.FC<{ quote: QuoteData; companyInfo?: CompanyInfo }> = ({
  quote,
  companyInfo,
}) => {
  return (
    <Document title={`#${quote.ref}`}>
      <Page size="A4" style={styles.page}>
        <PdfHeader data={quote} type="quote" companyInfo={companyInfo} />
        <ProductsTable products={quote.products_snapshot} type="quote" />
        <TaxSummary
          products={quote.products_snapshot}
          discount={quote.discount}
          type="quote"
          fiscalValue={companyInfo?.fiscalValue}
        />
        <BottomSection amount={quote.ttc} />
        <PdfFooter companyInfo={companyInfo} />
      </Page>
    </Document>
  );
};

const InvoicePDF: React.FC<{
  invoice: InvoiceData;
  companyInfo?: CompanyInfo;
}> = ({ invoice, companyInfo }) => {
  return (
    <Document title={`#${invoice.ref}`}>
      <Page size="A4" style={styles.page}>
        <PdfHeader data={invoice} type="invoice" companyInfo={companyInfo} />
        <ProductsTable products={invoice.products_snapshot} type="invoice" />
        <TaxSummary
          products={invoice.products_snapshot}
          discount={invoice.discount}
          type="invoice"
          fiscalValue={companyInfo?.fiscalValue}
        />
        <BottomSection amount={invoice.ttc} />
        <PdfFooter companyInfo={companyInfo} />
      </Page>
    </Document>
  );
};

export class PDFService {
  static createInvoiceDownloadLink(
    invoice: InvoiceData,
    fileName?: string,
    companyInfo?: CompanyInfo
  ) {
    const defaultFileName = `facture-${invoice.ref}.pdf`;

    return (
      <PDFDownloadLink
        document={<InvoicePDF invoice={invoice} companyInfo={companyInfo} />}
        fileName={fileName || defaultFileName}
      >
        {({ loading }) =>
          loading ? "Génération du PDF..." : "Télécharger PDF"
        }
      </PDFDownloadLink>
    );
  }

  static createQuoteDownloadLink(
    quote: QuoteData,
    fileName?: string,
    companyInfo?: CompanyInfo
  ) {
    const defaultFileName = `devis-${quote.ref}.pdf`;

    return (
      <PDFDownloadLink
        document={<QuotePDF quote={quote} companyInfo={companyInfo} />}
        fileName={fileName || defaultFileName}
      >
        {({ loading }) =>
          loading ? "Génération du PDF..." : "Télécharger PDF"
        }
      </PDFDownloadLink>
    );
  }

  static async downloadInvoicePDF(
    invoice: InvoiceData,
    fileName?: string,
    companyInfo?: CompanyInfo
  ): Promise<void> {
    const defaultFileName = `facture-${invoice.ref}.pdf`;
    const doc = <InvoicePDF invoice={invoice} companyInfo={companyInfo} />;
    const blob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async downloadQuotePDF(
    quote: QuoteData,
    fileName?: string,
    companyInfo?: CompanyInfo
  ): Promise<void> {
    const defaultFileName = `devis-${quote.ref}.pdf`;
    const doc = <QuotePDF quote={quote} companyInfo={companyInfo} />;
    const blob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || defaultFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async printInvoicePDF(
    invoice: InvoiceData,
    companyInfo?: CompanyInfo
  ): Promise<void> {
    const blob = await pdf(
      <InvoicePDF invoice={invoice} companyInfo={companyInfo} />
    ).toBlob();

    const file = new File([blob], `#${invoice.ref}.pdf`, {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(file);

    const printWindow = window.open(url, invoice.ref);
    if (!printWindow) {
      URL.revokeObjectURL(url);
      throw new Error(
        "Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups."
      );
    }
  }

  static async printQuotePDF(
    quote: QuoteData,
    companyInfo?: CompanyInfo
  ): Promise<void> {
    const blob = await pdf(
      <QuotePDF quote={quote} companyInfo={companyInfo} />
    ).toBlob();

    const file = new File([blob], `#${quote.ref}.pdf`, {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(file);

    const printWindow = window.open(url, quote.ref);

    if (!printWindow) {
      URL.revokeObjectURL(url);
      throw new Error(
        "Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups."
      );
    }
  }

  static async generateInvoicePDF(
    invoice: InvoiceData,
    companyInfo?: CompanyInfo
  ): Promise<void> {
    return this.downloadInvoicePDF(invoice, undefined, companyInfo);
  }
}

export default PDFService;
