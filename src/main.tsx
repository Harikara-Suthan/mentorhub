import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { IntroProvider } from "./context/IntroContext";
import { RootErrorBoundary } from "./components/ui/ErrorBoundary";
import "./index.css";

// Unregister any stale development-mode service workers to prevent white screens
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    });
  } else if (import.meta.env.PROD) {
    import("virtual:pwa-register").then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log("[MentorHUB SW] Updated content available.");
        },
      });
    }).catch(() => {});
  }
}

// Global safety net for early unhandled script errors
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    console.warn("[MentorHUB] Unhandled async rejection caught:", event.reason);
  });
}

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <IntroProvider>
              <App />
            </IntroProvider>
          </AuthProvider>
        </BrowserRouter>
      </RootErrorBoundary>
    </React.StrictMode>
  );
}
