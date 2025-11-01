import { AppSettings } from "@/redux/slices/settings.slice";
import { CompanyInfo } from "@/services/pdf.service";

export function convertSettingsToCompanyInfo(
  settings: AppSettings
): CompanyInfo {
  return {
    name: settings.name,
    email: settings.email,
    website: settings.website,
    logo: settings.logo,
    phone: settings.phone,
    fax: settings.fax,
    address: settings.address,
    rib: settings.rib,
    tva: settings.tax_id,
    mf: settings.tax_id, // Matricule fiscal same as tax_id
    fiscalValue: settings.fiscal_value,
  };
}

export function createInvoiceWithSettings(
  invoiceData: any,
  settings: AppSettings,
  fileName?: string
) {
  const companyInfo = convertSettingsToCompanyInfo(settings);

  // Return the PDF service with settings applied
  return {
    invoiceData,
    companyInfo,
    fileName: fileName || `facture-${invoiceData.ref}.pdf`,
  };
}

export function createQuoteWithSettings(
  quoteData: any,
  settings: AppSettings,
  fileName?: string
) {
  const companyInfo = convertSettingsToCompanyInfo(settings);

  return {
    quoteData,
    companyInfo,
    fileName: fileName || `devis-${quoteData.ref}.pdf`,
  };
}
