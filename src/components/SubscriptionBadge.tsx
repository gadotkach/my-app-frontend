import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

function daysLeft(isoDate: string): number {
  const end = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
}

export default function SubscriptionBadge() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const { subscription_status, trial_ends_at, subscription_ends_at } = user;

  if (subscription_status === "trialing" && trial_ends_at) {
    const days = daysLeft(trial_ends_at);
    return (
      <Link
        to="/pricing"
        className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition"
        title={`Trial закончится ${new Date(trial_ends_at).toLocaleDateString("ru-RU")}`}
      >
        Trial: {days} дн.
      </Link>
    );
  }

  if (subscription_status === "active" && subscription_ends_at) {
    return (
      <Link
        to="/pricing"
        className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition"
      >
        Подписка активна до {new Date(subscription_ends_at).toLocaleDateString("ru-RU")}
      </Link>
    );
  }

  return (
    <Link
      to="/pricing"
      className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition"
    >
      Оформить подписку
    </Link>
  );
}
