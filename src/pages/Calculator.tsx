import { FormEvent, useState } from "react";
import {
  analyticsApi,
  CalculatorRequest,
  CalculatorResponse,
} from "../api/analytics";

const TAX_SYSTEMS = [
  { code: "", label: "Без налога" },
  { code: "NPD", label: "НПД (4% / 6%)" },
  { code: "USN_INCOME", label: "УСН «Доходы» (6%)" },
  { code: "USN_INCOME_EXPENSE", label: "УСН «Доходы − расходы» (15%)" },
  { code: "PSN", label: "ПСН (патент)" },
];

function formatMoney(value: string): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 2,
  }).format(parseFloat(value));
}

function formatPercent(value: string): string {
  return `${parseFloat(value).toFixed(2)}%`;
}

export default function Calculator() {
  // Обязательные
  const [costPrice, setCostPrice] = useState("500");
  const [targetPrice, setTargetPrice] = useState("1500");
  const [quantity, setQuantity] = useState("1");

  // Расходы площадки
  const [commissionPercent, setCommissionPercent] = useState("22");
  const [logisticsCost, setLogisticsCost] = useState("91");
  const [acquiringPercent, setAcquiringPercent] = useState("1.5");
  const [storageCost, setStorageCost] = useState("0");
  const [sppPercent, setSppPercent] = useState("5");

  // Налоги
  const [taxSystem, setTaxSystem] = useState("");
  const [taxRate, setTaxRate] = useState("6");
  const [insuranceContributions, setInsuranceContributions] = useState("0");

  const [result, setResult] = useState<CalculatorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload: CalculatorRequest = {
        cost_price: costPrice,
        target_price: targetPrice,
        quantity: parseInt(quantity, 10) || 1,
        commission_percent: commissionPercent,
        logistics_cost: logisticsCost,
        acquiring_percent: acquiringPercent,
        storage_cost: storageCost,
        spp_percent: sppPercent,
      };
      if (taxSystem) {
        payload.tax_system = taxSystem;
        payload.tax_rate = taxRate;
        payload.insurance_contributions = insuranceContributions;
      }
      const data = await analyticsApi.calculate(payload);
      setResult(data);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Ошибка расчёта";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  const isProfitable = result && parseFloat(result.net_profit) >= 0;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Калькулятор юнит-экономики</h1>
      <p className="text-gray-600 mb-6">
        Оцените прибыльность товара до закупки. Введите себестоимость и планируемую цену —
        увидите чистую прибыль, маржу и рекомендованную цену.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Форма --- */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Параметры товара</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Себестоимость, ₽
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Планируемая цена, ₽
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <h3 className="text-sm font-semibold text-gray-700 pt-2">
              Расходы площадки
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комиссия, %
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Логистика, ₽
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={logisticsCost}
                  onChange={(e) => setLogisticsCost(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Эквайринг, %
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={acquiringPercent}
                  onChange={(e) => setAcquiringPercent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Хранение, ₽
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={storageCost}
                  onChange={(e) => setStorageCost(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  СПП, %
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sppPercent}
                  onChange={(e) => setSppPercent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700 pt-2">
              Налоги
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Система налогообложения
              </label>
              <select
                value={taxSystem}
                onChange={(e) => setTaxSystem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TAX_SYSTEMS.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {taxSystem && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ставка, %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Страховые взносы, ₽
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={insuranceContributions}
                    onChange={(e) => setInsuranceContributions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2.5 rounded-md font-medium"
            >
              {loading ? "Расчёт..." : "Рассчитать"}
            </button>
          </form>
        </div>

        {/* --- Результат --- */}
        <div className="space-y-4">
          {!result && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              Введите параметры и нажмите «Рассчитать» — увидите результат.
            </div>
          )}

          {result && (
            <>
              {/* Warning */}
              {result.warning && (
                <div
                  className={`px-4 py-3 rounded-md border ${
                    isProfitable
                      ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {result.warning}
                </div>
              )}

              {/* Ключевые метрики */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-xs text-gray-500 mb-1">Чистая прибыль</div>
                  <div
                    className={`text-xl font-bold ${
                      isProfitable ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatMoney(result.net_profit)}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-xs text-gray-500 mb-1">Маржа</div>
                  <div
                    className={`text-xl font-bold ${
                      isProfitable ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatPercent(result.margin_percent)}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="text-xs text-gray-500 mb-1">ROI</div>
                  <div
                    className={`text-xl font-bold ${
                      isProfitable ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatPercent(result.roi_percent)}
                  </div>
                </div>
              </div>

              {/* Детализация */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900">Детализация расчёта</h2>
                </div>
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    <Row label="Цена продажи" value={formatMoney(result.gross_price)} />
                    <Row
                      label="СПП"
                      value={`− ${formatMoney(result.spp_amount)}`}
                      accent="text-gray-500"
                    />
                    <Row label="Цена после СПП" value={formatMoney(result.net_price)} bold />
                    <Row
                      label="Комиссия площадки"
                      value={`− ${formatMoney(result.commission)}`}
                      accent="text-orange-600"
                    />
                    <Row
                      label="Логистика"
                      value={`− ${formatMoney(result.logistics)}`}
                      accent="text-orange-600"
                    />
                    <Row
                      label="Эквайринг"
                      value={`− ${formatMoney(result.acquiring)}`}
                      accent="text-orange-600"
                    />
                    <Row
                      label="Хранение"
                      value={`− ${formatMoney(result.storage)}`}
                      accent="text-orange-600"
                    />
                    <Row
                      label="Payout от площадки"
                      value={formatMoney(result.payout)}
                      bold
                    />
                    <Row
                      label="Себестоимость"
                      value={`− ${formatMoney(result.cogs)}`}
                      accent="text-gray-500"
                    />
                    <Row
                      label="Валовая прибыль"
                      value={formatMoney(result.gross_profit)}
                      bold
                    />
                    <Row
                      label="Налог"
                      value={`− ${formatMoney(result.tax_amount)}`}
                      accent="text-gray-500"
                    />
                    <Row
                      label="Чистая прибыль"
                      value={formatMoney(result.net_profit)}
                      accent={isProfitable ? "text-green-600" : "text-red-600"}
                      bold
                    />
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: string;
  bold?: boolean;
}) {
  return (
    <tr>
      <td className="px-5 py-2 text-gray-600">{label}</td>
      <td
        className={`px-5 py-2 text-right ${accent || "text-gray-900"} ${
          bold ? "font-semibold" : ""
        }`}
      >
        {value}
      </td>
    </tr>
  );
}