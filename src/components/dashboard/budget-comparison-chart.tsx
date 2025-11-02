import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTick } from "./custom-tick";
import { CustomTooltip } from "./custom-tooltip";

interface MonthlyComparison {
  month: string;
  quotes: number;
  invoices: number;
}

interface BudgetComparisonChartProps {
  data: MonthlyComparison[];
  loading?: boolean;
}

export default function BudgetComparisonChart({
  data,
  loading,
}: BudgetComparisonChartProps) {
  if (loading) {
    return (
      <Card className="border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-[300px] bg-muted/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // If no data, show placeholder with minimal values
  const chartData =
    data.length > 0
      ? data
      : [
          { month: "Jan", quotes: 0, invoices: 0 },
          { month: "Fév", quotes: 0, invoices: 0 },
          { month: "Mar", quotes: 0, invoices: 0 },
          { month: "Avr", quotes: 0, invoices: 0 },
          { month: "Mai", quotes: 0, invoices: 0 },
          { month: "Juin", quotes: 0, invoices: 0 },
          { month: "Juil", quotes: 0, invoices: 0 },
        ];

  return (
    <Card className="border shadow-none">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 space-y-2 sm:space-y-0">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Comparaison Devis vs Factures
        </CardTitle>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Devis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">Factures</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
            />
            <YAxis
              tick={<CustomTick />}
              tickLine
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip content={CustomTooltip} />
            <Bar
              dataKey="quotes"
              name="Devis"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="invoices"
              name="Factures"
              fill="#f97316"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
