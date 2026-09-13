import { FormEvent, useEffect, useState } from "react";
import {
  integrationsApi,
  MarketplaceAccount,
  SyncResult,
  SyncSalesResult,
} from "../api/integrations";

export default function Integrations() {
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>([]);
  const [clientId, setClientId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState<"products" | "sales" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadAccounts() {
    try {
      const data = await integrationsApi.listAccounts();
      setAccounts(data);
    } catch {
      setError("Не удалось загрузить список интеграций");
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setError(null);
    setMessage(null);
    try {
      await integrationsApi.connectOzon(clientId, apiKey);
      setClientId("");
      setApiKey("");
      setMessage("Ozon успешно подключён");
      await loadAccounts();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Ошибка подключения";
      setError(detail);
    } finally {
      setConnecting(false);
    }
  }

  async function handleSyncProducts() {
    setSyncing("products");
    setError(null);
    setMessage(null);
    try {
      const result: SyncResult = await integrationsApi.syncProducts();
      setMessage(
        `Товары синхронизированы: всего ${result.synced}, создано ${result.created}, обновлено ${result.updated}`
      );
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Ошибка синхронизации товаров";
      setError(detail);
    } finally {
      setSyncing(null);
    }
  }

  async function handleSyncSales() {
    setSyncing("sales");
    setError(null);
    setMessage(null);
    try {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const result: SyncSalesResult = await integrationsApi.syncSales(
        from.toISOString(),
        to.toISOString()
      );
      setMessage(
        `Продажи синхронизированы: всего ${result.synced}, создано ${result.created}, обновлено ${result.updated}`
      );
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Ошибка синхронизации продаж";
      setError(detail);
    } finally {
      setSyncing(null);
    }
  }

  const ozonConnected = accounts.some((a) => a.marketplace_code === "ozon");

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Интеграции</h1>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ozon</h2>

        {ozonConnected ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">✓ Подключён</p>
              <p className="text-sm text-gray-500">
                Client-Id: {accounts.find((a) => a.marketplace_code === "ozon")?.client_id}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSyncProducts}
                disabled={syncing !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm"
              >
                {syncing === "products" ? "Синхронизация..." : "Синхр. товары"}
              </button>
              <button
                onClick={handleSyncSales}
                disabled={syncing !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm"
              >
                {syncing === "sales" ? "Синхронизация..." : "Синхр. продажи"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Введите Client-Id и Api-Key из личного кабинета Ozon Seller.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client-Id
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Api-Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={connecting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md"
            >
              {connecting ? "Подключение..." : "Подключить Ozon"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
