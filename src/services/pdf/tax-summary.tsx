import { calculateTaxSummary } from "@/utils/price-calculation";
import { formatCurrency } from "@/utils/text-formatter";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  taxSummaryContainer: {
    marginTop: 20,
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftTable: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
  },
  rightTable: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
    minHeight: 30,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    minHeight: 30,
    backgroundColor: "#fff",
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 30,
    backgroundColor: "#fff",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    maxHeight: 30,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#758084",
    textTransform: "uppercase",
    textAlign: "center",
  },
  tableText: {
    fontSize: 8,
    color: "#000",
    textAlign: "center",
  },
  leftCol: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 30,
  },
  leftColLast: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 30,
  },
  rightCol: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 30,
  },
  rightColLast: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 30,
  },
});

interface TaxSummaryProps {
  products: Array<{
    name: string;
    quantity: number;
    price: string;
    tax_rate: string;
    tht: string;
    ttc: string;
  }>;
  discount: string;
  type: "quote" | "invoice";
  fiscalValue?: string; // Timbre fiscal value from settings
}

export default function TaxSummary({
  products,
  discount,
  type,
  fiscalValue = "1.000", // Default fallback
}: TaxSummaryProps) {
  const discountPercentage = parseFloat(discount) || 0;
  const taxSummary = calculateTaxSummary(products, discountPercentage);
  const taxEntries = Object.entries(taxSummary);

  return (
    <View wrap={false} style={styles.taxSummaryContainer}>
      <View style={styles.leftTable}>
        <View style={styles.tableHeader}>
          <View style={styles.leftCol}>
            <Text style={styles.tableHeaderText}>TAUX</Text>
          </View>
          <View style={styles.leftCol}>
            <Text style={styles.tableHeaderText}>BASE</Text>
          </View>
          <View style={styles.leftColLast}>
            <Text style={styles.tableHeaderText}>MONTANT</Text>
          </View>
        </View>
        {taxEntries.map(([taxRate, values], index) => {
          const isLastRow = index === taxEntries.length - 1;
          return (
            <View
              key={`left-${taxRate}`}
              style={isLastRow ? styles.tableRowLast : styles.tableRow}
            >
              <View style={styles.leftCol}>
                <Text style={styles.tableText}>{taxRate}%</Text>
              </View>
              <View style={styles.leftCol}>
                <Text style={styles.tableText}>
                  {formatCurrency(values.base)}
                </Text>
              </View>
              <View style={styles.leftColLast}>
                <Text style={styles.tableText}>
                  {formatCurrency(values.montant)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.rightTable}>
        <View style={styles.tableHeader}>
          <View style={styles.rightCol}>
            <Text style={styles.tableHeaderText}>TOTAL H.T</Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.tableHeaderText}>TOTAL REMISE</Text>
          </View>
          <View
            style={type === "invoice" ? styles.rightCol : styles.rightColLast}
          >
            <Text style={styles.tableHeaderText}>TOTAL TVA</Text>
          </View>
          {type === "invoice" && (
            <View style={styles.rightColLast}>
              <Text style={styles.tableHeaderText}>TIMBRE FISCAL</Text>
            </View>
          )}
        </View>
        <View style={styles.tableRowLast}>
          <View style={styles.rightCol}>
            <Text style={styles.tableText}>
              {formatCurrency(
                Object.values(taxSummary).reduce(
                  (acc, curr) => acc + curr.totalHt,
                  0
                )
              )}
            </Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.tableText}>
              {formatCurrency(
                Object.values(taxSummary).reduce(
                  (acc, curr) => acc + curr.totalRemise,
                  0
                )
              )}
            </Text>
          </View>
          <View
            style={type === "invoice" ? styles.rightCol : styles.rightColLast}
          >
            <Text style={styles.tableText}>
              {formatCurrency(
                Object.values(taxSummary).reduce(
                  (acc, curr) => acc + curr.totalTva,
                  0
                )
              )}
            </Text>
          </View>
          {type === "invoice" && (
            <View style={styles.rightColLast}>
              <Text style={styles.tableText}>
                {formatCurrency(parseFloat(fiscalValue) || 1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
