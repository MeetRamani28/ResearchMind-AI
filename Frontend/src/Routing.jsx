import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import SettingsModal from "./components/SettingsModal";
import { useState } from "react";

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">
        Loading...
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const { isLoading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const hideSidebar =
    location.pathname === "/login" || location.pathname === "/register";

  if (isLoading && !hideSidebar) {
    return (
      <div className="h-screen flex items-center justify-center dark:bg-slate-950 dark:text-white">
        Loading interface...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {!hideSidebar && <Sidebar onOpenSettings={() => setShowSettings(true)} />}
      <main className="flex-1 overflow-y-auto w-full">{children}</main>
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

const Routing = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard/:chatId?"
            element={
              <ProtectedRoute allowedRoles={["USER", "RESEARCHER", "ADMIN"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default Routing;
