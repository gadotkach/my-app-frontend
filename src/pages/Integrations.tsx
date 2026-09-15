import { FormEvent, useEffect, useState } from "react";
import {
  integrationsApi,
  MarketplaceAccount,
  SyncResult,
  SyncSalesResult,
} from "../api/integrations";

export default function Integrations() {
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Ozon
  const [ozonClientId, setOzonClientId] = useState("");
  const [ozonApiKey, setOzonApiKey] = useState("");
  const [ozonConnecting, setOzonConnecting] = useState(false);
  const [ozonSyncing, setOzonSyncing] = useState<"products" | "sales" | null>(null);

  // WB
  const [wbApiKey, setWbApiKey] = useState("");
  const [wbConnecting, setWbConnecting] = useState(false);
  const [wbSyncing, setWbSyncing] = useState<"products" | "sales" | null>(null);

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

  function extractError(err: unknown, fallback: string): string {
    return (
      (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
      fallback
    );
  }

  const ozonConnected = accounts.some((a) => a.marketplace_code === "ozon");
  const wbConnected = accounts.some((a) => a.marketplace_code === "wildberries");

  // --- Ozon handlers ---

  async function handleConnectOzon(e: FormEvent) {
    e.preventDefault();
    setOzonConnecting(true);
    setError(null);
    setMessage(null);
    try {
      await integrationsApi.connectOzon(ozonClientId, ozonApiKey);
      setOzonClientId("");
      setOzonApiKey("");
      setMessage("Ozon успешно подключён");
      await loadAccounts();
    } catch (err) {
      setError(extractError(err, "Ошибка подключения Ozon"));
    } finally {
      setOzonConnecting(false);
    }
  }

  async function handleSyncOzonProducts() {
    setOzonSyncing("products");
    setError(null);
    setMessage(null);
    try {
      const result: SyncResult = await integrationsApi.syncProducts();
      setMessage(
        `Ozon — товары: всего ${result.synced}, создано ${result.created}, обновлено ${result.updated}`
      );
    } catch (err) {
      setError(extractError(err, "Ошибка синхронизации товаров Ozon"));
    } finally {
      setOzonSyncing(null);
    }
  }

  async function handleSyncOzonSales() {
    setOzonSyncing("sales");
    setError(null);
    setMessage(null);
    try {
      const { from, to } = lastNDaysIso(30);
      const result: SyncSalesResult = await integrationsApi.syncSales(from, to);
      setMessage(
        `Ozon — продажи: всего ${result.synced}, создано ${result.created}, обновлено ${result.updated}`
      );
    } catch (err) {
      setError(extractError(err, "Ошибка синхронизации продаж Ozon"));
    } finally {
      setOzonSyncing(null);
    }
  }

  // --- WB handlers ---

  async function handleConnectWb(e: FormEvent) {
    e.preventDefault();
    setWbConnecting(true);
    setError(null);
    setMessage(null);
    try {
      await integrationsApi.connectWb(wbApiKey);
      setWbApiKey("");
      setMessage("Wildberries успешно подключён");
      await loadAccounts();
    } catch (err) {
      setError(extractError(err, "Ошибка подключения WB"));
    } finally {
      setWbConnecting(false);
    }
  }

  async function handleSyncWbProducts() {
    setWbSyncing("products");
    setError(null);
    setMessage(null);
    try {
      const result: SyncResult = await integrationsApi.syncWbProducts();
      setMessage(
        `WB — товары: всего ${result.synced}, создано ${result.created}, обновлено ${result.updated}`
      );
    } catch (err) {
      setError(extractError(err, "Ошибка синхронизации товаров WB"));
    } finally {
      setWbSyncing(null);
    }
  }

  async function handleSyncWbSales() {
    setWbSyncing("sales");
    setError(null);
    setMessage(null);
    try {
      const { from, to } = lastNDaysIso(30);
      const result: SyncSalesResult = await integrationsApi.syncWbSales(from, to);
      setMessage(
        `WB — продажи: всего ${result.synced}, создано ${result.created}, обновлено ${result.updated}`
      );
    } catch (err) {
      setError(extractError(err, "Ошибка синхронизации продаж WB"));
    } finally {
      setWbSyncing(null);
    }
  }

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

      {/* --- Ozon --- */}
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
                onClick={handleSyncOzonProducts}
                disabled={ozonSyncing !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm"
              >
                {ozonSyncing === "products" ? "Синхронизация..." : "Синхр. товары"}
              </button>
              <button
                onClick={handleSyncOzonSales}
                disabled={ozonSyncing !== null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm"
              >
                {ozonSyncing === "sales" ? "Синхронизация..." : "Синхр. продажи"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnectOzon} className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Введите Client-Id и Api-Key из личного кабинета Ozon Seller.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client-Id
              </label>
              <input
                type="text"
                value={ozonClientId}
                onChange={(e) => setOzonClientId(e.target.value)}
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
                value={ozonApiKey}
                onChange={(e) => setOzonApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={ozonConnecting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md"
            >
              {ozonConnecting ? "Подключение..." : "Подключить Ozon"}
            </button>
          </form>
        )}
      </div>

      {/* --- Wildberries --- */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Wildberries</h2>

        {wbConnected ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 font-medium">✓ Подключён</p>
              <p className="text-sm text-gray-500">
                Через API-токен (без Client-Id)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSyncWbProducts}
                disabled={wbSyncing !== null}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-md text-sm"
              >
                {wbSyncing === "products" ? "Синхронизация..." : "Синхр. товары"}
              </button>
              <button
                onClick={handleSyncWbSales}
                disabled={wbSyncing !== null}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-md text-sm"
              >
                {wbSyncing === "sales" ? "Синхронизация..." : "Синхр. продажи"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnectWb} className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Создайте токен в{" "}
              <a
                href="https://seller.wildberries.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                личном кабинете WB Партнёры
              </a>{" "}
              → Профиль → Интеграции по API. Выберите «Базовый токен» и права:
              Контент (RO) и Статистика (RO).
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API-токен
              </label>
              <input
                type="password"
                value={wbApiKey}
                onChange={(e) => setWbApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={wbConnecting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-md"
            >
              {wbConnecting ? "Подключение..." : "Подключить Wildberries"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// --- helpers ---

function lastNDaysIso(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}