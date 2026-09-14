import { api } from "./client";

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface SyncProductsResult {
  synced: number;
  created: number;
  updated: number;
}

export const productsApi = {
  async list(): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  async syncFromOzon(): Promise<SyncProductsResult> {
    const { data } = await api.post<SyncProductsResult>(
      "/integrations/ozon/sync/products"
    );
    return data;
  },
};
