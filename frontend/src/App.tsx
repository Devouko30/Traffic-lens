import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/AuthContext";
import { AppSidebar } from "./components/ui/sidebar";

// Lazy-load all pages — each becomes its own chunk, only downloaded when visited
const Landing   = lazy(() => import("./pages/Landing"));
const Login     = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Sites     = lazy(() => import("./pages/Sites"));

// Minimal inline fallback — no extra component needed
function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(212,255,51,0.15)", borderTopColor: "#D4FF33", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function PrivateLayout({ children, isAuthenticated, ready }: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  ready: boolean;
}) {
  if (!ready) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppSidebar>{children}</AppSidebar>;
}

export default function App() {
  const { isAuthenticated, ready } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}
