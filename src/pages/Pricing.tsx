import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const PRICE_RUB = 990;

export default function Pricing() {
  const user = useAuthStore((s) => s.user);

  function handleSubscribe() {
    alert(
      "Оплата будет подключена в следующей итерации.\n\nЦена: " +
        PRICE_RUB +
        " ₽/мес"
    );
  }

  const canReturnToCabinet =
    user &&
    (user.subscription_status === "trialing" ||
      user.subscription_status === "active");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Тариф для селлера
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Один кабинет для всех маркетплейсов
          </p>

          <div className="text-center mb-8">
            <span className="text-5xl font-bold text-gray-900">{PRICE_RUB} ₽</span>
            <span className="text-gray-500 ml-2">/ мес</span>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Подключение Ozon, WB, Яндекс.Маркет</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Авто-синхронизация товаров и продаж</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Финансовая аналитика</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span className="text-gray-700">Экспорт в 1С</span>
            </li>
          </ul>

          {user ? (
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition"
            >
              Оформить подписку
            </button>
          ) : (
            <Link
              to="/register"
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition"
            >
              Зарегистрироваться и попробовать
            </Link>
          )}

          {canReturnToCabinet && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              <Link to="/" className="text-blue-600 hover:underline">
                ← Вернуться в кабинет
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
