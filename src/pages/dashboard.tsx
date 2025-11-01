import { useState, useEffect } from "react";
import useFetchAll from "@/hooks/useFetchAll";
import { Product } from "@electron/models/product";
import { Client } from "@electron/models/client";
import { Quote } from "@electron/types/quote.types";
import { Invoice } from "@/hooks/useInvoices";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardGreeting from "@/components/dashboard/dashboard-greeting";
import StatsCards from "@/components/dashboard/stats-cards";
import BalanceChart from "@/components/dashboard/balance-chart";
import BudgetComparisonChart from "@/components/dashboard/budget-comparison-chart";
import StatisticsChart from "@/components/dashboard/statistics-chart";
import { DashboardStats } from "@/components/dashboard/types";
import OfflineBanner from "@/components/ui/offline-banner";

interface MonthlyData {
  month: string;
  revenue: number;
  previousRevenue: number;
}

interface MonthlyComparison {
  month: string;
  quotes: number;
  invoices: number;
}

interface AnalyticsSummary {
  totalRevenue: number;
  totalRevenueLastMonth: number;
  totalQuotes: number;
  totalInvoices: number;
  monthlyRevenue: MonthlyData[];
  monthlyComparison: MonthlyComparison[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalClients: 0,
    totalQuotes: 0,
    totalInvoices: 0,
    activeQuotes: 0,
    lowStockProducts: 0,
    recentQuotesValue: 0,
    recentInvoicesValue: 0,
    productSimpleCount: 0,
    productVariableCount: 0,
    productActiveCount: 0,
    clientIndividualCount: 0,
    clientCompanyCount: 0,
    quoteStatusCounts: {},
    invoiceStatusCounts: {},
  });

  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyData[]>(
    []
  );
  const [monthlyComparisonData, setMonthlyComparisonData] = useState<
    MonthlyComparison[]
  >([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Fetch all data for stats calculation
  const {
    data: allProducts,
    isNativeLoading: loadingAllProducts,
    refetch: refetchAllProducts,
  } = useFetchAll<Product>({
    method: "product:getAll",
    search_key: "name",
    fetcherLimit: 10000,
    queryOptions: { refetchOnWindowFocus: false },
  });

  const {
    data: allClients,
    isNativeLoading: loadingAllClients,
    refetch: refetchAllClients,
  } = useFetchAll<Client>({
    method: "client:getAll",
    search_key: "name",
    fetcherLimit: 10000,
    queryOptions: { refetchOnWindowFocus: false },
  });

  const {
    data: allQuotes,
    isNativeLoading: loadingAllQuotes,
    refetch: refetchAllQuotes,
  } = useFetchAll<Quote>({
    method: "quote:getAll",
    search_key: "id",
    fetcherLimit: 10000,
    queryOptions: { refetchOnWindowFocus: false },
  });

  const {
    data: allInvoices,
    isNativeLoading: loadingAllInvoices,
    refetch: refetchAllInvoices,
  } = useFetchAll<Invoice>({
    method: "invoice:getAll",
    search_key: "id",
    fetcherLimit: 10000,
    queryOptions: { refetchOnWindowFocus: false },
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const result = await window.ipcRenderer.invoke("analytics:getSummary");
        console.log("Analytics result:", result);
        if (result.success && result.data) {
          const analyticsData: AnalyticsSummary = result.data;
          console.log("Monthly Revenue Data:", analyticsData.monthlyRevenue);
          console.log(
            "Monthly Comparison Data:",
            analyticsData.monthlyComparison
          );
          setMonthlyRevenueData(analyticsData.monthlyRevenue);
          setMonthlyComparisonData(analyticsData.monthlyComparison);
        } else {
          console.error("Analytics fetch failed:", result.error);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Calculate stats from fetched data
  useEffect(() => {
    if (allProducts && allClients && allQuotes && allInvoices) {
      const lowStock = allProducts.rows.filter(
        (p) => (p.stock_quantity || 0) < 10
      ).length;
      const activeQuotes = allQuotes.rows.filter(
        (q) => q.status === "active" || q.status === "draft"
      ).length;

      // Product breakdown
      const productSimpleCount = allProducts.rows.filter(
        (p) => p.type === "simple"
      ).length;
      const productVariableCount = allProducts.rows.filter(
        (p) => p.type === "variable"
      ).length;
      const productActiveCount = allProducts.rows.filter(
        (p) => p.status === "publish"
      ).length;

      // Client breakdown
      const clientIndividualCount = allClients.rows.filter(
        (c) => c.type === "individual"
      ).length;
      const clientCompanyCount = allClients.rows.filter(
        (c) => c.type === "company"
      ).length;

      // Quote status counts
      const quoteStatusCounts: Record<string, number> = {};
      allQuotes.rows.forEach((q) => {
        quoteStatusCounts[q.status] = (quoteStatusCounts[q.status] || 0) + 1;
      });

      // Invoice status counts
      const invoiceStatusCounts: Record<string, number> = {};
      allInvoices.rows.forEach((i: any) => {
        const status = i.status || "unknown";
        invoiceStatusCounts[status] = (invoiceStatusCounts[status] || 0) + 1;
      });

      // Calculate recent values (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentQuotes = allQuotes.rows.filter((q) => {
        const createdDate = new Date(q.createdAt);
        return createdDate >= thirtyDaysAgo;
      });

      const recentQuotesValue = recentQuotes.reduce((sum, quote) => {
        return sum + parseFloat(quote.ttc || "0");
      }, 0);

      const recentInvoices = allInvoices.rows.filter((i) => {
        const createdDate = new Date(i.createdAt);
        return createdDate >= thirtyDaysAgo;
      });

      const recentInvoicesValue = recentInvoices.reduce((sum, invoice) => {
        return sum + parseFloat(invoice.ttc || "0");
      }, 0);

      setStats({
        totalProducts: allProducts.rows.length,
        totalClients: allClients.rows.length,
        totalQuotes: allQuotes.rows.length,
        totalInvoices: allInvoices.rows.length,
        activeQuotes,
        lowStockProducts: lowStock,
        recentQuotesValue,
        recentInvoicesValue,
        productSimpleCount,
        productVariableCount,
        productActiveCount,
        clientIndividualCount,
        clientCompanyCount,
        quoteStatusCounts,
        invoiceStatusCounts,
      });
    }
  }, [allProducts, allClients, allQuotes, allInvoices]);

  // Refetch all data on mount
  useEffect(() => {
    refetchAllProducts();
    refetchAllClients();
    refetchAllQuotes();
    refetchAllInvoices();
  }, []);

  const isLoading =
    loadingAllProducts ||
    loadingAllClients ||
    loadingAllQuotes ||
    loadingAllInvoices;

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-6">
      <OfflineBanner />
      <DashboardHeader />

      <DashboardGreeting />

      <StatsCards stats={stats} loading={isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2">
          <BalanceChart data={monthlyRevenueData} loading={analyticsLoading} />
        </div>
        <div className="flex flex-1">
          <StatisticsChart stats={stats} />
        </div>
      </div>

      <div>
        <BudgetComparisonChart
          data={monthlyComparisonData}
          loading={analyticsLoading}
        />
      </div>
    </div>
  );
}
