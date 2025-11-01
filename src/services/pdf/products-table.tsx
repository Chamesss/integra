import { formatCurrency } from "@/utils/text-formatter";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  table: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    minHeight: 25,
    backgroundColor: "#fff",
    alignItems: "stretch",
  },
  tableRowLast: {
    flexDirection: "row",
    minHeight: 25,
    backgroundColor: "#fff",
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
    alignItems: "stretch",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#758084",
    textTransform: "uppercase",
    textAlign: "center",
  },
  tableText: {
    fontSize: 9,
    color: "#000",
  },
  colDesignation: {
    width: "40%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    justifyContent: "center",
    flexGrow: 1,
  },
  colDesignationLast: {
    width: "40%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    justifyContent: "center",
    flexGrow: 1,
  },
  colQty: {
    width: "10%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    justifyContent: "center",
    flexGrow: 1,
  },
  colQtyLast: {
    width: "10%",
    paddingHorizontal: 8,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  colTva: {
    width: "10%",
    paddingHorizontal: 8,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  colTvaLast: {
    width: "10%",
    paddingHorizontal: 8,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  colPuHt: {
    width: "20%",
    paddingHorizontal: 8,
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  colPuHtLast: {
    width: "20%",
    paddingHorizontal: 8,
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  colTotalHt: {
    width: "20%",
    paddingHorizontal: 8,
    textAlign: "right",
    alignItems: "center",
    justifyContent: "center",
  },
  colTotalHtLast: {
    width: "20%",
    paddingHorizontal: 8,
    textAlign: "right",
    alignItems: "center",
    justifyContent: "center",
  },
  // TTC columns for invoices
  colTotalHtInvoice: {
    width: "16%",
    paddingHorizontal: 8,
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  colTotalHtInvoiceLast: {
    width: "16%",
    paddingHorizontal: 8,
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  colTotalTtc: {
    width: "20%",
    paddingHorizontal: 8,
    textAlign: "right",
    alignItems: "center",
    justifyContent: "center",
  },
  colTotalTtcLast: {
    width: "20%",
    paddingHorizontal: 8,
    textAlign: "right",
    alignItems: "center",
    justifyContent: "center",
  },
});

interface ProductsTableProps {
  products: Array<{
    name: string;
    quantity: number;
    price: string;
    tax_rate: string;
    tht: string;
    ttc: string;
  }>;
  type: "invoice" | "quote";
}

export default function ProductsTable({ products, type }: ProductsTableProps) {
  const isInvoice = type === "invoice";

  return (
    <View wrap={false} style={styles.table}>
      <View style={styles.tableHeader}>
        <View style={styles.colDesignation}>
          <Text style={styles.tableHeaderText}>DÉSIGNATION</Text>
        </View>
        <View style={styles.colQty}>
          <Text style={styles.tableHeaderText}>QTÉ</Text>
        </View>
        <View style={styles.colTva}>
          <Text style={styles.tableHeaderText}>TVA</Text>
        </View>
        <View style={styles.colPuHt}>
          <Text style={styles.tableHeaderText}>PU HT</Text>
        </View>
        <View style={isInvoice ? styles.colTotalHtInvoice : styles.colTotalHt}>
          <Text style={styles.tableHeaderText}>TOTAL HT</Text>
        </View>
        {isInvoice && (
          <View style={styles.colTotalTtc}>
            <Text style={styles.tableHeaderText}>TOTAL TTC</Text>
          </View>
        )}
      </View>
      {products.map((product, index) => {
        const isLastRow = index === products.length - 1;
        return (
          <View
            key={index}
            style={isLastRow ? styles.tableRowLast : styles.tableRow}
          >
            <View
              style={
                isLastRow ? styles.colDesignationLast : styles.colDesignation
              }
            >
              <Text style={styles.tableText}>{product.name}</Text>
            </View>
            <View style={isLastRow ? styles.colQtyLast : styles.colQty}>
              <Text style={styles.tableText}>{product.quantity}</Text>
            </View>
            <View style={isLastRow ? styles.colTvaLast : styles.colTva}>
              <Text style={styles.tableText}>{product.tax_rate}%</Text>
            </View>
            <View style={isLastRow ? styles.colPuHtLast : styles.colPuHt}>
              <Text style={styles.tableText}>
                {formatCurrency(product.price)}
              </Text>
            </View>
            <View
              style={
                isInvoice
                  ? isLastRow
                    ? styles.colTotalHtInvoiceLast
                    : styles.colTotalHtInvoice
                  : isLastRow
                    ? styles.colTotalHtLast
                    : styles.colTotalHt
              }
            >
              <Text style={styles.tableText}>
                {formatCurrency(product.tht)}
              </Text>
            </View>
            {isInvoice && (
              <View
                style={isLastRow ? styles.colTotalTtcLast : styles.colTotalTtc}
              >
                <Text style={styles.tableText}>
                  {formatCurrency(product.ttc)}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
