import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTick } from "./custom-tick";
import { CustomTooltip } from "./custom-tooltip";

interface MonthlyData {
  month: string;
  revenue: number;
  previousRevenue: number;
}

interface BalanceChartProps {
  data: MonthlyData[];
  loading?: boolean;
}

export default function BalanceChart({ data, loading }: BalanceChartProps) {
  if (loading) {
    return (
      <Card className="border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
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
          { month: "Jan", revenue: 0, previousRevenue: 0 },
          { month: "Fév", revenue: 0, previousRevenue: 0 },
          { month: "Mar", revenue: 0, previousRevenue: 0 },
          { month: "Avr", revenue: 0, previousRevenue: 0 },
          { month: "Mai", revenue: 0, previousRevenue: 0 },
          { month: "Juin", revenue: 0, previousRevenue: 0 },
        ];

  return (
    <Card className="border shadow-none">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 space-y-2 sm:space-y-0">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Vue d'ensemble du chiffre d'affaires
        </CardTitle>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-violet-500" />
            <span className="text-muted-foreground">Période actuelle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-500" />
            <span className="text-muted-foreground">Période précédente</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={<CustomTick />}
              tickLine
              stroke="#64748b"
              fontSize={12}
            />
            <Tooltip content={CustomTooltip} />
            <Area
              type="monotone"
              dataKey="previousRevenue"
              name="Période précédente"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#colorPrevious)"
              strokeDasharray="5 5"
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Période actuelle"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
