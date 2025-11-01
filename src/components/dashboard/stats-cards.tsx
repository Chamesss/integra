import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Users,
  FileText,
  Receipt,
  LucideIcon,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/utils/text-formatter";
import { DashboardStats } from "./types";

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

const STATS_CONFIG: Array<{
  key: string;
  title: string;
  icon: LucideIcon;
  iconColor: string;
  getValue: (stats: DashboardStats) => string;
  getComparison: (
    stats: DashboardStats
  ) => { percentage: number; label: string } | null;
  getMetadata: (stats: DashboardStats) => string;
}> = [
  {
    key: "products",
    title: "Total Produits",
    icon: ShoppingBag,
    iconColor: "text-violet-500",
    getValue: (s) => s.totalProducts.toString(),
    getComparison: (s) => {
      const total = s.totalProducts;
      const active = s.productActiveCount;
      if (total === 0) return null;
      const percentage = Math.round((active / total) * 100);
      return {
        percentage: percentage > 0 ? percentage : 0,
        label: "actifs",
      };
    },
    getMetadata: (s) =>
      `${s.productSimpleCount} simples • ${s.productVariableCount} variables`,
  },
  {
    key: "clients",
    title: "Total Clients",
    icon: Users,
    iconColor: "text-blue-500",
    getValue: (s) => s.totalClients.toString(),
    getComparison: (s) => {
      const total = s.totalClients;
      const companies = s.clientCompanyCount;
      if (total === 0) return null;
      const percentage = Math.round((companies / total) * 100);
      return {
        percentage: percentage > 0 ? percentage : 0,
        label: "entreprises",
      };
    },
    getMetadata: (s) =>
      `${s.clientIndividualCount} individuels • ${s.clientCompanyCount} entreprises`,
  },
  {
    key: "quotes",
    title: "Valeur des Devis",
    icon: FileText,
    iconColor: "text-emerald-500",
    getValue: (s) => formatCurrency(s.recentQuotesValue.toString()),
    getComparison: (s) => {
      const active = s.quoteStatusCounts.active || 0;
      const total = s.totalQuotes;
      if (total === 0) return null;
      const percentage = Math.round((active / total) * 100);
      return {
        percentage: percentage > 0 ? percentage : 0,
        label: "actifs",
      };
    },
    getMetadata: (s) =>
      `${s.totalQuotes} devis • ${s.quoteStatusCounts.accepted || 0} acceptés`,
  },
  {
    key: "invoices",
    title: "Valeur des Factures",
    icon: Receipt,
    iconColor: "text-orange-500",
    getValue: (s) => formatCurrency(s.recentInvoicesValue.toString()),
    getComparison: (s) => {
      const paid = s.invoiceStatusCounts.paid || 0;
      const total = s.totalInvoices;
      if (total === 0) return null;
      const percentage = Math.round((paid / total) * 100);
      return {
        percentage: percentage > 0 ? percentage : 0,
        label: "payées",
      };
    },
    getMetadata: (s) =>
      `${s.totalInvoices} factures • ${s.invoiceStatusCounts.paid || 0} payées`,
  },
];

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const skeletonCards = STATS_CONFIG.map((c) => (
    <Card key={`skeleton-${c.key}`} className="border shadow-none bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded-lg bg-muted animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 shadow-none">
        <div className="h-10 w-32 rounded bg-muted animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 rounded bg-muted animate-pulse" />
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-3 w-full rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  ));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {loading
        ? skeletonCards
        : STATS_CONFIG.map((c) => {
            const comparison = c.getComparison(stats);
            const value = c.getValue(stats);
            const metadata = c.getMetadata(stats);

            return (
              <Card
                key={c.key}
                className="border shadow-none bg-white hover:shadow-none"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {c.title}
                    </CardTitle>
                    <div className={`p-2 bg-gray-50 rounded-lg ${c.iconColor}`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-foreground tracking-tight">
                    {value}
                  </div>

                  {comparison && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          +{comparison.percentage}%
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {comparison.label}
                      </span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-1 border-t">
                    {metadata}
                  </div>
                </CardContent>
              </Card>
            );
          })}
    </div>
  );
}
