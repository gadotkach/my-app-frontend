import { api } from "./client";

export interface AnalyticsSummary {
  period_from: string;
  period_to: string;
  sales_count: number;
  total_revenue: string;
  total_commission: string;
  total_logistics: string;
  net_profit: string;
}

export interface MarketplaceStats {
  marketplace_code: string;
  marketplace_name: string;
  sales_count: number;
  total_revenue: string;
  total_commission: string;
  total_logistics: string;
  net_profit: string;
}

export const analyticsApi = {
  async summary(from: Date, to: Date): Promise<AnalyticsSummary> {
    const { data } = await api.get<AnalyticsSummary>(
      `/analytics/summary?from=${from.toISOString()}&to=${to.toISOString()}`
    );
    return data;
  },

  async byMarketplace(from: Date, to: Date): Promise<MarketplaceStats[]> {
    const { data } = await api.get<MarketplaceStats[]>(
      `/analytics/by-marketplace?from=${from.toISOString()}&to=${to.toISOString()}`
    );
    return data;
  },
};
