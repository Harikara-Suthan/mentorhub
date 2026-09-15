import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";
import { AuthUser } from "../types";
import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeGetJSON,
  safeSetJSON,
} from "../utils/storage";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return safeGetJSON<AuthUser>("maa_user", null);
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = safeGetItem("maa_token");
      if (!token) return;
      const res = await api.get("/auth/me");
      if (res.data?.data) {
        setUser(res.data.data);
        safeSetJSON("maa_user", res.data.data);
      }
    } catch {
      // Keep existing cached user on background refresh failure
    }
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      safeSetJSON("maa_user", updated);
      return updated;
    });
  };

  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      const newUrl = e.detail?.avatarUrl || e.detail?.profilePicture;
      if (newUrl) {
        updateUser({ profilePicture: newUrl });
      }
    };
    window.addEventListener("maa_avatar_changed", handleAvatarUpdate);
    return () => window.removeEventListener("maa_avatar_changed", handleAvatarUpdate);
  }, []);

  useEffect(() => {
    const token = safeGetItem("maa_token");
    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fail-safe watchdog: Guarantee loading finishes in max 2.5s even if network stalls
    const watchdogTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 2500);

    api
      .get("/auth/me")
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.data) {
          setUser(res.data.data);
          safeSetJSON("maa_user", res.data.data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        // If 401 unauthorized, clear invalid credentials
        if (err?.response?.status === 401) {
          safeRemoveItem("maa_token");
          safeRemoveItem("maa_user");
          setUser(null);
        }
      })
      .finally(() => {
        clearTimeout(watchdogTimer);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(watchdogTimer);
    };
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data.data;
    safeSetItem("maa_token", token);
    safeSetJSON("maa_user", user);
    setUser(user);
  }

  function logout() {
    safeRemoveItem("maa_token");
    safeRemoveItem("maa_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
