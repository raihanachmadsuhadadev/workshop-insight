"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AxiosError } from "axios";

import { api, setAuthToken, TOKEN_KEY, USER_KEY, type ApiResponse, type AuthUser, type UserRole } from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<AuthUser | null>;
  hasRole: (role: UserRole) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? "Login gagal. Periksa email dan password.";
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const fetchMe = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      clearSession();
      return null;
    }

    setAuthToken(storedToken);
    setToken(storedToken);

    try {
      const response = await api.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
      const nextUser = response.data.data.user;

      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);

      return nextUser;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    async function bootstrapAuth() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser) as AuthUser);
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      await fetchMe();
      setIsLoading(false);
    }

    bootstrapAuth();
  }, [fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post<ApiResponse<{ token: string; user: AuthUser }>>(
          "/auth/login",
          {
            email,
            password,
          },
        );
        const { token: nextToken, user: nextUser } = response.data.data;

        persistSession(nextToken, nextUser);

        return nextUser;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Local session still needs to be cleared if the token has expired.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      fetchMe,
      hasRole: (role) => user?.role === role,
    }),
    [fetchMe, isLoading, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
