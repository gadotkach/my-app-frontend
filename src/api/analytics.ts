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

export interface CalculatorRequest {
  cost_price: string;
  target_price: string;
  quantity?: number;
  commission_percent?: string;
  logistics_cost?: string;
  acquiring_percent?: string;
  storage_cost?: string;
  spp_percent?: string;
  tax_system?: string | null;
  tax_rate?: string | null;
  insurance_contributions?: string | null;
  vat_enabled?: boolean;
  vat_rate?: string;
}

export interface CalculatorResponse {
  gross_price: string;
  spp_amount: string;
  net_price: string;
  commission: string;
  logistics: string;
  acquiring: string;
  storage: string;
  marketplace_costs_total: string;
  payout: string;
  cogs: string;
  gross_profit: string;
  tax_amount: string;
  net_profit: string;
  margin_percent: string;
  roi_percent: string;
  profit_per_unit: string;
  warning: string | null;
}

export const analyticsApi = {
  async summary(from: Date, to: Date): Promise<AnalyticsSummary> {
    const { data } = await api.get<AnalyticsSummary>(
      `/analytics/summary?from=${from.toISOString()}&to=${to.toISOString()}`
    );
    return data;
  },

  async calculate(payload: CalculatorRequest): Promise<CalculatorResponse> {
    const { data } = await api.post<CalculatorResponse>(
      "/analytics/calculator",
      payload
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
