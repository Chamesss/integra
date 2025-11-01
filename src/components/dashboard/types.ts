export interface DashboardStats {
  totalProducts: number;
  totalClients: number;
  totalQuotes: number;
  totalInvoices: number;
  activeQuotes: number;
  lowStockProducts: number;
  recentQuotesValue: number;
  recentInvoicesValue: number;
  productSimpleCount: number;
  productVariableCount: number;
  productActiveCount: number;
  clientIndividualCount: number;
  clientCompanyCount: number;
  quoteStatusCounts: Record<string, number>;
  invoiceStatusCounts: Record<string, number>;
}
