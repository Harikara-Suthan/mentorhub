import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api/client";
import { AuthUser } from "../types";

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
    try {
      const raw = localStorage.getItem("maa_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem("maa_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("maa_token");
      if (!token) return;
      const res = await api.get("/auth/me");
      if (res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem("maa_user", JSON.stringify(res.data.data));
      }
    } catch {
      // ignore
    }
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem("maa_user", JSON.stringify(updated));
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
    const token = localStorage.getItem("maa_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("maa_user", JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem("maa_token");
        localStorage.removeItem("maa_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem("maa_token", token);
    localStorage.setItem("maa_user", JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("maa_token");
    localStorage.removeItem("maa_user");
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
