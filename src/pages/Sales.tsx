import { useEffect, useState } from "react";
import { salesApi, Sale, SyncSalesResult } from "../api/sales";

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSales() {
    setLoading(true);
    try {
      const data = await salesApi.list();
      setSales(data);
      setError(null);
    } catch {
      setError("Не удалось загрузить продажи");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSales();
  }, []);

  async function handleSync() {
    setSyncing(true);
    setError(null);
    setMessage(null);
    try {
      const result: SyncSalesResult = await salesApi.syncFromOzon(30);
      setMessage(
        `Синхронизировано: всего ${result.synced}, создано ${result.created}, обновлено ${result.updated}`
      );
      await loadSales();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Ошибка синхронизации. Проверьте подключение Ozon.";
      setError(detail);
    } finally {
      setSyncing(false);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatMoney(value: string): string {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(parseFloat(value));
  }

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Продажи</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-md text-sm"
        >
          {syncing ? "Синхронизация..." : "Синхронизировать с Ozon"}
        </button>
      </div>

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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Загрузка...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Продаж пока нет. Нажмите «Синхронизировать с Ozon».
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Заказ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Цена
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Комиссия
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Логистика
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Продано
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">
                    {s.external_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">
                    {formatMoney(s.price)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">
                    {formatMoney(s.commission)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">
                    {formatMoney(s.logistics_cost)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(s.sold_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && sales.length > 0 && (
        <p className="text-sm text-gray-500 mt-4">
          Всего продаж: <span className="font-medium">{sales.length}</span>
        </p>
      )}
    </div>
  );
}
