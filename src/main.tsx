import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { IntroProvider } from "./context/IntroContext";
import "./index.css";

// Register Service Worker for offline asset & API caching
if ("serviceWorker" in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log("[MentorHUB SW] New content available, auto-updating...");
    },
    onOfflineReady() {
      console.log("[MentorHUB SW] App is ready to work offline with full local caching.");
    },
  });
}

import { ErrorBoundary } from "./components/ui/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <IntroProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </IntroProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
