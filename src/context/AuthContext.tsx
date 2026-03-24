import React, { createContext, useContext, useEffect, useState } from "react";
import { MockUser } from "data/mockData";

type AuthContextType = {
  user: MockUser | null;
  token: string | null;
  loading: boolean;
  login: (user: MockUser, token: string | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
};

const STORAGE_KEY = "pulse-admin-session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setUser(null);
        setToken(null);
        return;
      }

      const session = JSON.parse(raw) as { user: MockUser; token: string | null };
      setUser(session.user);
      setToken(session.token ?? null);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (nextUser: MockUser, nextToken: string | null) => {
    setUser(nextUser);
    setToken(nextToken);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken }),
    );
  };

  const logout = async () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  const hasRole = (role: string) => Boolean(user?.roles?.includes(role));

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
