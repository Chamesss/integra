import { useState, useEffect } from "react";
import useFetchAll from "@/hooks/useFetchAll";
import { Product } from "@electron/models/product";
import { Client } from "@electron/models/client";
import { Quote } from "@electron/types/quote.types";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentItems from "@/components/dashboard/recent-items";
import { DashboardStats } from "@/components/dashboard/types";
import { Invoice } from "@/hooks/useInvoices";
import OfflineBanner from "@/components/ui/offline-banner";

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

  // Fetch recent data (limited to 5 items each)
  const {
    data: products,
    isNativeLoading: loadingProducts,
    refetch: refetchProducts,
  } = useFetchAll<Product>({
    method: "product:getAll",
    search_key: "name",
    fetcherLimit: 5,
    queryOptions: { refetchOnWindowFocus: false },
  });

  const {
    data: clients,
    isNativeLoading: loadingClients,
    refetch: refetchClients,
  } = useFetchAll<Client>({
    method: "client:getAll",
    search_key: "name",
    fetcherLimit: 5,
    queryOptions: { refetchOnWindowFocus: false },
  });

  const {
    data: quotes,
    isNativeLoading: loadingQuotes,
    refetch: refetchQuotes,
  } = useFetchAll<Quote>({
    method: "quote:getAll",
    search_key: "id",
    fetcherLimit: 5,
    queryOptions: { refetchOnWindowFocus: false },
  });

  const {
    data: invoices,
    isNativeLoading: loadingInvoices,
    refetch: refetchInvoices,
  } = useFetchAll<Invoice>({
    method: "invoice:getAll",
    search_key: "id",
    fetcherLimit: 5,
    queryOptions: { refetchOnWindowFocus: false },
  });

  // Fetch all data for stats calculation (without limit)
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

  useEffect(() => {
    if (allProducts && allClients && allQuotes) {
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
      allInvoices?.rows.forEach((i: any) => {
        const status = i.status || "unknown";
        invoiceStatusCounts[status] = (invoiceStatusCounts[status] || 0) + 1;
      });
      const recentQuotes = allQuotes.rows.filter((q) => {
        const createdDate = new Date(q.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      });

      const recentQuotesValue = recentQuotes.reduce((sum, quote) => {
        return sum + parseFloat(quote.ttc || "0");
      }, 0);

      // Calculate invoice stats
      const recentInvoices =
        allInvoices?.rows.filter((i) => {
          const createdDate = new Date(i.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate >= thirtyDaysAgo;
        }) || [];

      const recentInvoicesValue = recentInvoices.reduce((sum, invoice) => {
        return sum + parseFloat(invoice.ttc || "0");
      }, 0);

      setStats({
        totalProducts: allProducts.rows.length,
        totalClients: allClients.rows.length,
        totalQuotes: allQuotes.rows.length,
        totalInvoices: allInvoices?.rows.length || 0,
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

  useEffect(() => {
    // refetch on mount
    refetchAllProducts();
    refetchAllClients();
    refetchAllQuotes();
    refetchAllInvoices();
    refetchProducts();
    refetchClients();
    refetchQuotes();
    refetchInvoices();
  }, []);

  // Sort recent items by creation date
  const recentProducts = products?.rows || [];
  const recentClients = clients?.rows || [];
  const recentQuotes =
    quotes?.rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) || [];
  const recentInvoices =
    invoices?.rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ) || [];

  return (
    <div className="p-6 space-y-6">
      <OfflineBanner />
      <DashboardHeader />
      <StatsCards
        stats={stats}
        loading={
          loadingAllProducts ||
          loadingAllClients ||
          loadingAllQuotes ||
          loadingAllInvoices
        }
      />
      {loadingProducts || loadingClients || loadingQuotes || loadingInvoices ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`recent-skel-${i}`}
              className="relative overflow-hidden rounded-md border border-gray-200 bg-white p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center animate-pulse" />
                  <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 flex-1 relative z-10">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 rounded-md bg-gray-100 animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="h-3 w-36 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-6 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="mt-6 h-9 w-full rounded-md bg-gray-100 animate-pulse relative z-10" />
            </div>
          ))}
        </div>
      ) : (
        <RecentItems
          recentProducts={recentProducts}
          recentClients={recentClients}
          recentQuotes={recentQuotes}
          recentInvoices={recentInvoices}
        />
      )}
    </div>
  );
}
