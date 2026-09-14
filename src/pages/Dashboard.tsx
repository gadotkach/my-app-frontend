import { useEffect, useState } from "react";
import { analyticsApi, AnalyticsSummary, MarketplaceStats } from "../api/analytics";

const PERIODS = [
  { label: "7 дней", days: 7 },
  { label: "30 дней", days: 30 },
  { label: "90 дней", days: 90 },
];

function periodDates(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { from, to };
}

function formatMoney(value: string): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byMarketplace, setByMarketplace] = useState<MarketplaceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { from, to } = periodDates(days);
        const [s, m] = await Promise.all([
          analyticsApi.summary(from, to),
          analyticsApi.byMarketplace(from, to),
        ]);
        setSummary(s);
        setByMarketplace(m);
      } catch {
        setError("Не удалось загрузить аналитику");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  const cards = summary
    ? [
        { label: "Продаж", value: summary.sales_count.toString(), accent: "text-blue-600" },
        { label: "Выручка", value: formatMoney(summary.total_revenue), accent: "text-green-600" },
        { label: "Комиссия", value: formatMoney(summary.total_commission), accent: "text-orange-600" },
        { label: "Чистая прибыль", value: formatMoney(summary.net_profit), accent: "text-purple-600" },
      ]
    : [];

  return (
    <div className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-1.5 rounded-md text-sm ${
                days === p.days
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-lg shadow-sm">
          Загрузка...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((c) => (
              <div key={c.label} className="bg-white rounded-lg shadow-sm p-5">
                <div className="text-sm text-gray-500 mb-1">{c.label}</div>
                <div className={`text-2xl font-bold ${c.accent}`}>{c.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">По площадкам</h2>
            </div>
            {byMarketplace.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                За выбранный период продаж нет.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Площадка
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Продаж
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Выручка
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Комиссия
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Прибыль
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {byMarketplace.map((m) => (
                    <tr key={m.marketplace_code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {m.marketplace_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {m.sales_count}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">
                        {formatMoney(m.total_revenue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {formatMoney(m.total_commission)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600 text-right">
                        {formatMoney(m.net_profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
