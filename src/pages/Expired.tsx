import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function Expired() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Пробный период закончился
        </h1>
        <p className="text-gray-600 mb-8">
          {user
            ? `Привет, ${user.name}. Чтобы продолжить, оформите подписку.`
            : "Чтобы продолжить, оформите подписку."}
        </p>

        <Link
          to="/pricing"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition mb-3"
        >
          Оформить подписку
        </Link>

        <button
          onClick={logout}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md transition"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
