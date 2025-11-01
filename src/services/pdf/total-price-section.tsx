import { Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  formatAmountInWords,
  formatCurrency,
} from "../../utils/text-formatter";

const styles = StyleSheet.create({
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 20,
    gap: 20,
  },
  amountInWords: {
    flex: 1,
    paddingTop: 10,
  },
  amountInWordsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    color: "#758084",
  },
  amountInWordsText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
  },
  totalSection: {
    width: "20%",
  },
  totalBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  totalHeader: {
    backgroundColor: "#FAFAFA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  totalBody: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase",
    color: "#758084",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
});

interface BottomSectionProps {
  amount: string;
}

export default function BottomSection({ amount }: BottomSectionProps) {
  return (
    <View wrap={false} style={styles.bottomSection}>
      <View style={styles.amountInWords}>
        <Text style={styles.amountInWordsTitle}>MONTANT EN LETTRES</Text>
        <Text style={styles.amountInWordsText}>
          {formatAmountInWords(parseFloat(amount))}
        </Text>
      </View>
      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <View style={styles.totalHeader}>
            <Text style={styles.totalLabel}>NET À PAYER</Text>
          </View>
          <View style={styles.totalBody}>
            <Text style={styles.totalAmount}>{formatCurrency(amount)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
