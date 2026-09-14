import { api } from "./client";

export interface Sale {
  id: number;
  marketplace_id: number;
  product_id: number | null;
  delivery_service_id: number | null;
  external_id: string;
  quantity: number;
  price: string;
  commission: string;
  logistics_cost: string;
  sold_at: string;
  created_at: string;
}

export interface SyncSalesResult {
  synced: number;
  created: number;
  updated: number;
  period_from: string;
  period_to: string;
}

export const salesApi = {
  async list(): Promise<Sale[]> {
    const { data } = await api.get<Sale[]>("/sales");
    return data;
  },

  async syncFromOzon(daysBack: number = 30): Promise<SyncSalesResult> {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - daysBack);
    const { data } = await api.post<SyncSalesResult>(
      `/integrations/ozon/sync/sales?from=${from.toISOString()}&to=${to.toISOString()}`
    );
    return data;
  },
};
