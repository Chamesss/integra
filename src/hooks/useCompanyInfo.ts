import { useAppSelector } from "@/redux/store";
import { selectSettings } from "@/redux/slices/settings.slice";
import { convertSettingsToCompanyInfo } from "@/utils/pdf-settings";
import { companyInfo } from "@/config";
import { CompanyInfo } from "@/services/pdf.service";

export function useCompanyInfo(): CompanyInfo {
  const settings = useAppSelector(selectSettings);

  // If settings are empty (not configured), use default config
  const hasConfiguredSettings = settings.name || settings.email;

  if (!hasConfiguredSettings) {
    return {
      name: companyInfo.name,
      email: companyInfo.email,
      website: companyInfo.website,
      phone: companyInfo.phone,
      address: companyInfo.address,
      logo: companyInfo.logoPrimary,
      tva: companyInfo.tva,
      fiscalValue: "1.000", // Default timbre fiscal
    };
  }

  return convertSettingsToCompanyInfo(settings);
}
