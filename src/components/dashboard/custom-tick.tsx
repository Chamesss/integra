export const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      style={{
        whiteSpace: "nowrap",
        fontSize: "10px", // 👈 Make text smaller
        fill: "#64748b", // 👈 Color
        fontWeight: 500, // 👈 Optional styling
      }}
    >
      {payload.value >= 1000
        ? `${payload.value / 1000}k TND`
        : `${payload.value} TND`}
    </text>
  );
};
