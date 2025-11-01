import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { InvoiceData, QuoteData, CompanyInfo } from "../pdf.service";
import { companyInfo } from "@/config";

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR");
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logoSection: {
    width: "40%",
  },
  logoImage: {
    width: 60,
    height: 32,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#333",
  },
  documentDetails: {
    width: "45%",
    alignItems: "flex-end",
    borderRadius: 6,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f8f9fa",
    width: "100%",
    borderRadius: 6,
  },
  detailsHeader: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  detailsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  detailHeaderCol: {
    width: "33.33%",
    padding: 8,
    fontSize: 8,
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    textAlign: "center",
    textTransform: "uppercase",
    color: "#758084",
  },
  detailHeaderColLast: {
    width: "33.33%",
    padding: 8,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    color: "#758084",
  },
  detailCol: {
    width: "33.33%",
    padding: 8,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    textAlign: "center",
  },
  detailColLast: {
    width: "33.33%",
    padding: 8,
    fontSize: 9,
    textAlign: "center",
  },
  clientSection: {
    marginBottom: 30,
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  clientRow: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 9,
    alignItems: "center",
  },
  clientLabel: {
    width: "35%",
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: 8,
  },
  clientValue: {
    width: "65%",
    fontWeight: "bold",
    color: "#000",
    fontSize: 9,
  },
  documentTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginTop: 30,
  },
});

export default function PdfHeader({
  data,
  type,
  companyInfo: userCompanyInfo,
}: {
  data: QuoteData | InvoiceData;
  type: "quote" | "invoice";
  companyInfo?: CompanyInfo;
}) {
  // Use userCompanyInfo if provided, otherwise fallback to default companyInfo
  const logoSrc = userCompanyInfo?.logo || companyInfo.logoPrimary;
  const companyName = userCompanyInfo?.name || companyInfo.name;
  const companyWebsite = userCompanyInfo?.website || companyInfo.website;
  const companyEmail = userCompanyInfo?.email || companyInfo.email;
  const companyPhone = userCompanyInfo?.phone || companyInfo.phone;
  return (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        <View
          style={{
            width: 75,
            height: 75,
            marginBottom: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 14.4,
              aspectRatio: 1,
              padding: 1.5,
            }}
            src={logoSrc}
          />
        </View>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.companyInfo}>
          {companyWebsite}
          {"\n"}
        </Text>
        <Text style={styles.companyInfo}>
          {companyEmail}
          {"\n"}
        </Text>
        <Text style={styles.companyInfo}>
          {companyPhone}
          {"\n"}
        </Text>
        <Text style={styles.documentTitle}>
          {type === "quote" ? "Devis" : "Facture"}
        </Text>
      </View>

      {/* Document details box */}
      <View style={styles.documentDetails}>
        <View style={styles.detailsBox}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailHeaderCol}>
              N° {type === "quote" ? "DEVIS" : "FACTURE"}
            </Text>
            <Text style={styles.detailHeaderCol}>DATE</Text>
            <Text style={styles.detailHeaderColLast}>CODE CLIENT</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailCol}>{data.ref}</Text>
            <Text style={styles.detailCol}>{formatDate(data.createdAt)}</Text>
            <Text style={styles.detailColLast}>
              CL{data.id.toString().padStart(4, "0")}
            </Text>
          </View>
        </View>
        <View style={styles.clientSection}>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>CODE TVA:</Text>
            <Text style={styles.clientValue}>
              {data.client_snapshot.tva || "-"}
            </Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>ÉTABLISSEMENT:</Text>
            <Text style={styles.clientValue}>
              {data.client_snapshot.name || "-"}
            </Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>TÉLÉPHONE:</Text>
            <Text style={styles.clientValue}>
              {data.client_snapshot.phone || "-"}
            </Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>ADRESSE:</Text>
            <Text style={styles.clientValue}>
              {data.client_snapshot.address || "-"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
