import { companyInfo } from "@/config";
import { CompanyInfo } from "../pdf.service";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  footerText: {
    fontSize: 8,
    lineHeight: 1.3,
    textAlign: "center",
    color: "#333",
  },
});

export default function PdfFooter({
  companyInfo: userCompanyInfo,
}: {
  companyInfo?: CompanyInfo;
}) {
  const companyName = userCompanyInfo?.name || companyInfo.name;
  const companyAddress = userCompanyInfo?.address || companyInfo.address;
  const companyPhone = userCompanyInfo?.phone || companyInfo.phone;
  const companyEmail = userCompanyInfo?.email || companyInfo.email;
  const companyRib = userCompanyInfo?.rib || null;

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {companyName}
        {"\n"}
        {companyAddress}
        {"\n"}
        TÉLÉPHONE: {companyPhone}
        {"\n"}
        EMAIL: {companyEmail}
        {"\n"}
        {companyRib ? `RIB: ${companyRib}` : null}
      </Text>
    </View>
  );
}
