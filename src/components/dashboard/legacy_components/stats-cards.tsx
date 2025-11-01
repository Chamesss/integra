import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  Users,
  FileText,
  Receipt,
  Clock,
  LucideIcon,
} from "lucide-react";
import { formatCurrency } from "@/utils/text-formatter";
import { DashboardStats } from "./types";

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

interface BreakdownItem {
  label: string;
  value: number | string;
  highlight?: boolean;
}

interface SubInfo {
  items: BreakdownItem[];
  color: string;
  icon?: LucideIcon;
  title?: string;
}

const STATS_CONFIG: Array<{
  key: string;
  title: string;
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
  highlightColor: string;
  iconColor: string;
  getValue: (stats: DashboardStats) => number;
  getSubInfo: (stats: DashboardStats) => SubInfo | null;
}> = [
  {
    key: "products",
    title: "Produits",
    icon: ShoppingBag,
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    highlightColor: "bg-blue-500/5",
    iconColor: "text-blue-600",
    getValue: (s) => s.totalProducts,
    getSubInfo: (s) => ({
      items: [
        { label: "Simples", value: s.productSimpleCount },
        { label: "Variables", value: s.productVariableCount },
        { label: "Actifs", value: s.productActiveCount },
      ],
      color: "text-gray-600",
      title: `Simples ${s.productSimpleCount} • Variables ${s.productVariableCount} • Actifs ${s.productActiveCount}`,
    }),
  },
  {
    key: "clients",
    title: "Clients",
    icon: Users,
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    highlightColor: "bg-green-500/5",
    iconColor: "text-green-600",
    getValue: (s) => s.totalClients,
    getSubInfo: (s) => ({
      items: [
        { label: "Individuels", value: s.clientIndividualCount },
        { label: "Entreprises", value: s.clientCompanyCount },
      ],
      color: "text-gray-600",
      title: `Individuels ${s.clientIndividualCount} • Entreprises ${s.clientCompanyCount}`,
    }),
  },
  {
    key: "quotes",
    title: "Devis",
    icon: FileText,
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    highlightColor: "bg-purple-500/5",
    iconColor: "text-purple-600",
    getValue: (s) => s.totalQuotes,
    getSubInfo: (s) => {
      const map: Record<string, string> = {
        draft: "Brouillons",
        active: "Actifs",
        accepted: "Acceptés",
        rejected: "Rejetés",
        expired: "Expirés",
      };
      const items: BreakdownItem[] = Object.entries(s.quoteStatusCounts || {})
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ label: map[k] || capitalize(k), value: v }));
      if (!items.length) return null;
      return {
        items,
        color: "text-gray-600",
        icon: s.activeQuotes > 0 ? Clock : undefined,
        title: items.map((i) => `${i.label} ${i.value}`).join(" • "),
      };
    },
  },
  {
    key: "invoices",
    title: "Factures",
    icon: Receipt,
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
    highlightColor: "bg-orange-500/5",
    iconColor: "text-orange-600",
    getValue: (s) => s.totalInvoices,
    getSubInfo: (s) => {
      const map: Record<string, string> = {
        draft: "Brouillons",
        paid: "Payées",
        sent: "Envoyées",
        unpaid: "Impayées",
        overdue: "En retard",
        cancelled: "Annulées",
      };
      const statusItems: BreakdownItem[] = Object.entries(
        s.invoiceStatusCounts || {}
      )
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ label: map[k] || capitalize(k), value: v }));
      const valueItem: BreakdownItem = {
        label: "Ce mois",
        value: formatCurrency(s.recentInvoicesValue.toString()),
      };
      return {
        items: [...statusItems, valueItem],
        color: "text-gray-600",
        title: [...statusItems, valueItem]
          .map((i) => `${i.label} ${i.value}`)
          .join(" • "),
      };
    },
  },
];

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const skeletonCards = STATS_CONFIG.map((c) => (
    <Card
      key={`skeleton-${c.key}`}
      className={`relative overflow-hidden border ${c.borderColor} rounded-xl`}
    >
      {/* Accent top light gradient strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Subtle colored highlight overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${c.highlightColor}`}
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)" }}
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
        <div
          className={`p-2 rounded-lg ${c.bgColor} flex items-center justify-center animate-pulse`}
        >
          <div className="h-5 w-5 rounded bg-white/40" />
        </div>
      </CardHeader>
      <CardContent className="pt-1 relative z-10">
        <div className="h-7 w-20 rounded bg-gray-100 animate-pulse mb-2" />
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-16 rounded bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading
        ? skeletonCards
        : STATS_CONFIG.map((c) => {
            const sub = c.getSubInfo(stats);
            return (
              <Card
                key={c.key}
                className={`relative overflow-hidden border ${c.borderColor} rounded-xl transition-all duration-200`}
                title={sub?.title}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                  }}
                />
                <div
                  className={`absolute inset-0 pointer-events-none ${c.highlightColor}`}
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,250,0.7)" }}
                />

                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-base font-semibold text-gray-800">
                    {c.title}
                  </CardTitle>
                  <div
                    className={`p-2 ${c.bgColor} rounded-lg ${c.iconColor} flex items-center justify-center`}
                  >
                    <c.icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="pt-1 relative z-10">
                  <div className="text-2xl font-bold text-gray-900">
                    {c.getValue(stats)}
                  </div>

                  {sub?.items && sub.items.length > 0 && (
                    <div
                      className={`mt-2.5 ${sub.color} text-xs flex flex-wrap items-center gap-x-2.5`}
                    >
                      {sub.items.map((it) => (
                        <div
                          key={`${c.key}-${it.label}`}
                          className="flex items-center"
                        >
                          <span className="mx-1.5 text-gray-300">•</span>
                          <span
                            className={`whitespace-nowrap ${it.highlight ? "text-red-600 font-medium" : "text-gray-600"}`}
                          >
                            {it.label}
                          </span>
                          <span
                            className={`ml-1 font-medium ${it.highlight ? "text-red-600" : "text-gray-700"}`}
                          >
                            {it.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
    </div>
  );
}
