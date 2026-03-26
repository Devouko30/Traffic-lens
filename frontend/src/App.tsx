import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/AuthContext";
import { AppSidebar } from "./components/ui/sidebar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Sites from "./pages/Sites";

function PrivateRoute({ children, isAuthenticated, ready }: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  ready: boolean;
}) {
  if (!ready) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PrivateLayout({ children, isAuthenticated, ready }: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  ready: boolean;
}) {
  if (!ready) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppSidebar>{children}</AppSidebar>;
}

export default function App() {
  const { isAuthenticated, ready } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateLayout isAuthenticated={isAuthenticated} ready={ready}>
          <Dashboard />
        </PrivateLayout>
      } />
      <Route path="/analytics" element={
        <PrivateLayout isAuthenticated={isAuthenticated} ready={ready}>
          <Analytics />
        </PrivateLayout>
      } />
      <Route path="/sites" element={
        <PrivateLayout isAuthenticated={isAuthenticated} ready={ready}>
          <Sites />
        </PrivateLayout>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
