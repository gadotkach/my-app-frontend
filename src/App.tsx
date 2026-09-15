import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Integrations from "./pages/Integrations";
import Calculator from "./pages/Calculator";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Pricing from "./pages/Pricing";
import Expired from "./pages/Expired";
import Dashboard from "./pages/Dashboard";
import { useAuthStore } from "./stores/authStore";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RequireActiveSubscription({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  if (
    user.subscription_status === "none" ||
    user.subscription_status === "expired"
  ) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />    
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/expired" element={<Expired />} />
        <Route
          element={
            <RequireAuth>
              <RequireActiveSubscription>
                <Layout />
              </RequireActiveSubscription>
            </RequireAuth>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/calculator" element={<Calculator />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
