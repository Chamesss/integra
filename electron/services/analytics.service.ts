import { IResult } from "../types/core.types";
import { Op } from "sequelize";
import { Invoice } from "../models/invoice";
import { Quote } from "../models/quote";
import { logger } from "../utils/logger";

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

export class AnalyticsService {
  constructor() {}

  /**
   * Get monthly revenue data for the balance chart
   * Shows current period vs previous period
   */
  async getMonthlyRevenue(months: number = 6): Promise<IResult<MonthlyData[]>> {
    try {
      const now = new Date();
      const monthlyData: MonthlyData[] = [];

      // Get data for each month
      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const prevMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - i - 1,
          1
        );
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0);

        // Get current month invoices using Sequelize model directly
        const currentInvoices = await Invoice.findAll({
          where: {
            createdAt: {
              [Op.between]: [monthStart, monthEnd],
            },
          },
        });

        // Get previous month invoices
        const previousInvoices = await Invoice.findAll({
          where: {
            createdAt: {
              [Op.between]: [prevMonthStart, prevMonthEnd],
            },
          },
        });

        const currentRevenue = currentInvoices.reduce(
          (sum: number, inv: Invoice) => sum + parseFloat(inv.ttc || "0"),
          0
        );

        const previousRevenue = previousInvoices.reduce(
          (sum: number, inv: Invoice) => sum + parseFloat(inv.ttc || "0"),
          0
        );

        // Format month name
        const monthName = monthStart.toLocaleDateString("fr-FR", {
          month: "short",
        });
        const day = monthStart.getDate();

        monthlyData.push({
          month: `${day} ${monthName}`,
          revenue: Math.round(currentRevenue),
          previousRevenue: Math.round(previousRevenue),
        });
      }

      return {
        success: true,
        data: monthlyData,
        message: "Monthly revenue data retrieved successfully",
      };
    } catch (error) {
      logger.error("Error getting monthly revenue:", error);
      return {
        success: false,
        error: "Failed to retrieve monthly revenue data",
        message: "Failed to retrieve monthly revenue data",
      };
    }
  }

  /**
   * Get monthly comparison between quotes and invoices
   */
  async getMonthlyComparison(
    months: number = 7
  ): Promise<IResult<MonthlyComparison[]>> {
    try {
      const now = new Date();
      const monthlyData: MonthlyComparison[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        // Get quotes for this month
        const quotes = await Quote.findAll({
          where: {
            createdAt: {
              [Op.between]: [monthStart, monthEnd],
            },
          },
        });

        // Get invoices for this month
        const invoices = await Invoice.findAll({
          where: {
            createdAt: {
              [Op.between]: [monthStart, monthEnd],
            },
          },
        });

        const quotesRevenue = quotes.reduce(
          (sum: number, quote: Quote) => sum + parseFloat(quote.ttc || "0"),
          0
        );

        const invoicesRevenue = invoices.reduce(
          (sum: number, inv: Invoice) => sum + parseFloat(inv.ttc || "0"),
          0
        );

        const monthName = monthStart.toLocaleDateString("fr-FR", {
          month: "short",
        });

        monthlyData.push({
          month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          quotes: Math.round(quotesRevenue),
          invoices: Math.round(invoicesRevenue),
        });
      }

      return {
        success: true,
        data: monthlyData,
        message: "Monthly comparison data retrieved successfully",
      };
    } catch (error) {
      logger.error("Error getting monthly comparison:", error);
      return {
        success: false,
        error: "Failed to retrieve monthly comparison data",
        message: "Failed to retrieve monthly comparison data",
      };
    }
  }

  /**
   * Get comprehensive analytics summary
   */
  async getAnalyticsSummary(): Promise<IResult<AnalyticsSummary>> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get current month revenue
      const currentMonthInvoices = await Invoice.findAll({
        where: {
          createdAt: {
            [Op.gte]: monthStart,
          },
          status: {
            [Op.in]: ["paid", "sent"],
          },
        },
      });

      // Get last month revenue
      const lastMonthInvoices = await Invoice.findAll({
        where: {
          createdAt: {
            [Op.between]: [lastMonthStart, lastMonthEnd],
          },
          status: {
            [Op.in]: ["paid", "sent"],
          },
        },
      });

      const totalRevenue = currentMonthInvoices.reduce(
        (sum: number, inv: Invoice) => sum + parseFloat(inv.ttc || "0"),
        0
      );

      const totalRevenueLastMonth = lastMonthInvoices.reduce(
        (sum: number, inv: Invoice) => sum + parseFloat(inv.ttc || "0"),
        0
      );

      // Get total counts
      const allQuotesCount = await Quote.count({});
      const allInvoicesCount = await Invoice.count({});

      // Get monthly data
      const monthlyRevenueResult = await this.getMonthlyRevenue(6);
      const monthlyComparisonResult = await this.getMonthlyComparison(7);

      return {
        success: true,
        data: {
          totalRevenue: Math.round(totalRevenue),
          totalRevenueLastMonth: Math.round(totalRevenueLastMonth),
          totalQuotes: allQuotesCount,
          totalInvoices: allInvoicesCount,
          monthlyRevenue: monthlyRevenueResult.data || [],
          monthlyComparison: monthlyComparisonResult.data || [],
        },
        message: "Analytics summary retrieved successfully",
      };
    } catch (error) {
      logger.error("Error getting analytics summary:", error);
      return {
        success: false,
        error: "Failed to retrieve analytics summary",
        message: "Failed to retrieve analytics summary",
      };
    }
  }
}
