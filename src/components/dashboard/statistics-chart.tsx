import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { DashboardStats } from "./types";

interface StatisticsChartProps {
  stats: DashboardStats;
}

export default function StatisticsChart({ stats }: StatisticsChartProps) {
  // Convert quote status data into chart format
  const data = [
    {
      name: "Actifs",
      value: stats.quoteStatusCounts.active || 0,
      color: "#3b82f6",
    },
    {
      name: "Acceptés",
      value: stats.quoteStatusCounts.accepted || 0,
      color: "#22c55e",
    },
    {
      name: "Brouillons",
      value: stats.quoteStatusCounts.draft || 0,
      color: "#f59e0b",
    },
    {
      name: "Rejetés",
      value: stats.quoteStatusCounts.rejected || 0,
      color: "#ef4444",
    },
    {
      name: "Expirés",
      value: stats.quoteStatusCounts.expired || 0,
      color: "#64748b",
    },
  ].filter((item) => item.value > 0);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Show placeholder if no data
  const hasData = data.length > 0 && total > 0;
  const chartData = hasData
    ? data
    : [{ name: "Aucune donnée", value: 1, color: "#e2e8f0" }];

  return (
    <Card className="border shadow-none flex-1 flex">
      <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold">
          Statistiques des Devis
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
          Répartition des devis par statut
        </p>

        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8">
          <div className="relative shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xs text-muted-foreground">Total devis</span>
              <span className="text-xl sm:text-2xl font-bold">
                {hasData ? total : 0}
              </span>
            </div>
          </div>

          <div className="w-full space-y-2 sm:space-y-3">
            {hasData ? (
              chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground text-xs  truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-medium ml-4 text-xs shrink-0">
                    {item.value}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs sm:text-sm text-muted-foreground py-4">
                Aucun devis disponible
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
