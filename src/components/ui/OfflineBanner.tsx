import React, { useState, useEffect, useRef } from "react";
import { WifiOff, Wifi, RefreshCw, Database, ServerCrash, DatabaseZap } from "lucide-react";

type ConnectionState = "ONLINE" | "OFFLINE" | "BACKEND_UNAVAILABLE" | "DATABASE_UNAVAILABLE";

export function OfflineBanner() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    typeof navigator !== "undefined" && !navigator.onLine ? "OFFLINE" : "ONLINE"
  );
  const [showRestored, setShowRestored] = useState(false);
  const [checking, setChecking] = useState(false);
  
  // We'll use a ref to prevent rapid polling
  const lastCheck = useRef<number>(0);

  const checkHealth = async (): Promise<ConnectionState> => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return "OFFLINE";
    }

    try {
      const res = await fetch("/api/health", { method: "GET", cache: "no-store" });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.database === "disconnected") {
          return "DATABASE_UNAVAILABLE";
        }
        return "ONLINE";
      } else if (res.status === 503) {
         // Our health endpoint returns 503 if DB is disconnected
         const data = await res.json().catch(() => null);
         if (data && data.database === "disconnected") {
           return "DATABASE_UNAVAILABLE";
         }
         return "BACKEND_UNAVAILABLE";
      } else {
        return "BACKEND_UNAVAILABLE";
      }
    } catch (err) {
      return "BACKEND_UNAVAILABLE";
    }
  };

  const handleCheckConnection = async () => {
    setChecking(true);
    const newState = await checkHealth();
    
    setConnectionState((prev) => {
      if (newState === "ONLINE" && prev !== "ONLINE") {
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 4000);
      }
      return newState;
    });
    
    setChecking(false);
  };

  useEffect(() => {
    function handleOnline() {
      handleCheckConnection();
    }
    function handleOffline() {
      setConnectionState("OFFLINE");
      setShowRestored(false);
    }
    
    function handleCacheFallback() {
      // Don't immediately flap to error if we are currently online.
      // Do a health check first, debounced.
      const now = Date.now();
      if (now - lastCheck.current > 5000) {
        lastCheck.current = now;
        handleCheckConnection();
      }
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("mentorhub:offline-fallback", handleCacheFallback);

    // Initial check on mount
    handleCheckConnection();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("mentorhub:offline-fallback", handleCacheFallback);
    };
  }, []);

  if (showRestored) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in slide-in-from-top duration-200">
        <div className="flex items-center gap-2 mx-auto">
          <Wifi size={15} className="animate-pulse" />
          <span>Connection restored — Live institutional data synchronized.</span>
        </div>
      </div>
    );
  }

  if (connectionState === "ONLINE") {
    return null;
  }

  let config = {
    bgClass: "bg-amber-600 border-amber-700",
    icon: <WifiOff size={13} className="text-white" />,
    title: "Offline Mode",
    message: "You are offline. Displaying cached records.",
  };

  if (connectionState === "BACKEND_UNAVAILABLE") {
    config = {
      bgClass: "bg-rose-600 border-rose-700",
      icon: <ServerCrash size={13} className="text-white" />,
      title: "Backend Unavailable",
      message: "Cannot reach the server. Some features may be limited.",
    };
  } else if (connectionState === "DATABASE_UNAVAILABLE") {
    config = {
      bgClass: "bg-orange-600 border-orange-700",
      icon: <DatabaseZap size={13} className="text-white" />,
      title: "Database Unavailable",
      message: "Database connection lost. Read-only cached mode active.",
    };
  }

  return (
    <div className={`${config.bgClass} text-white px-4 py-2.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 shadow-md transition-all border-b z-50 relative`}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center shrink-0">
          {config.icon}
        </div>
        <div>
          <span className="font-bold mr-1.5">{config.title}:</span>
          <span>{config.message}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <div className="hidden sm:flex items-center gap-1 text-[11px] bg-black/20 px-2 py-1 rounded-md">
          <Database size={12} />
          <span>Local Cache Active</span>
        </div>
        <button
          onClick={handleCheckConnection}
          disabled={checking}
          className="inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-50 active:scale-95 px-2.5 py-1 rounded-md font-semibold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={12} className={checking ? "animate-spin" : ""} />
          <span>{checking ? "Checking..." : "Check Connection"}</span>
        </button>
      </div>
    </div>
  );
}
