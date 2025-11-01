import { AnalyticsService } from "../services/analytics.service";

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  async getMonthlyRevenue(params: { months?: number }) {
    return this.analyticsService.getMonthlyRevenue(params.months || 6);
  }

  async getMonthlyComparison(params: { months?: number }) {
    return this.analyticsService.getMonthlyComparison(params.months || 7);
  }

  async getAnalyticsSummary() {
    return this.analyticsService.getAnalyticsSummary();
  }
}
