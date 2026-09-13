import { api } from "./client";

export interface MarketplaceAccount {
  id: number;
  marketplace_code: string;
  client_id: string;
  created_at: string;
}

export interface SyncResult {
  synced: number;
  created: number;
  updated: number;
}

export interface SyncSalesResult extends SyncResult {
  period_from: string;
  period_to: string;
}

export const integrationsApi = {
  async listAccounts(): Promise<MarketplaceAccount[]> {
    const { data } = await api.get<MarketplaceAccount[]>("/integrations/accounts");
    return data;
  },

  async connectOzon(clientId: string, apiKey: string): Promise<MarketplaceAccount> {
    const { data } = await api.post<MarketplaceAccount>("/integrations/ozon/connect", {
      marketplace_code: "ozon",
      client_id: clientId,
      api_key: apiKey,
    });
    return data;
  },

  async syncProducts(): Promise<SyncResult> {
    const { data } = await api.post<SyncResult>("/integrations/ozon/sync/products");
    return data;
  },

  async syncSales(fromIso: string, toIso: string): Promise<SyncSalesResult> {
    const { data } = await api.post<SyncSalesResult>(
      `/integrations/ozon/sync/sales?from=${fromIso}&to=${toIso}`
    );
    return data;
  },
};
