import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import App from "./App";
import { ToastProvider } from "./components/ui/toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./hooks/AuthContext";
import { Toaster } from "sonner";
import "./index.css";

// Point axios at the deployed backend when VITE_API_BASE_URL is set
// Falls back to relative paths (works with local vite proxy)
const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (apiBase) {
  axios.defaults.baseURL = apiBase;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 — token issue
        if ([401, 403].includes(error?.response?.status)) return false;
        return failureCount < 2;
      },
      staleTime: 10_000,
    },
    mutations: {
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
            <Toaster
              position="top-right"
              theme="dark"
              richColors
              toastOptions={{ style: { fontFamily: "system-ui, sans-serif" } }}
            />
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
