import { formatCurrency } from "@/utils/text-formatter";

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "white",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      {payload.map((item: any) => (
        <div
          key={item.dataKey}
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: item.color,
            marginBottom: 4,
            whiteSpace: "nowrap",
          }}
        >
          {item.name}: {formatCurrency(item.value?.toString() ?? "0")}
        </div>
      ))}
    </div>
  );
};
