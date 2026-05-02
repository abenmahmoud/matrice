import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const TOKEN_KEY = "matrice_admin_token";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type AdminContextType = {
  token: string | null;
  isLoggedIn: boolean;
  login: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  adminHeaders: () => Record<string, string>;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (password: string) => {
    try {
      const res = await fetch(`${BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json() as { error: string };
        return { ok: false, error: data.error };
      }
      const data = await res.json() as { token: string };
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      return { ok: true };
    } catch {
      return { ok: false, error: "Erreur de connexion au serveur" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  const adminHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    ...(token ? { "x-admin-token": token } : {}),
  }), [token]);

  return (
    <AdminContext.Provider value={{ token, isLoggedIn: !!token, login, logout, adminHeaders }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
