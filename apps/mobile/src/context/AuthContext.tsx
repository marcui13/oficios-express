import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setAuthToken } from "@/services/api";
import { UserSummary, LoginRequestPayload, RegisterRequestPayload } from "@oficios/shared";

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginRequestPayload) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterRequestPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (payload: LoginRequestPayload) => {
    setIsLoading(true);
    const res = await api.login(payload);
    setIsLoading(false);

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      setAuthToken(res.data.token);
      return { success: true };
    }
    return { success: false, error: res.error || "Error al iniciar sesión" };
  };

  const register = async (payload: RegisterRequestPayload) => {
    setIsLoading(true);
    const res = await api.register(payload);
    setIsLoading(false);

    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      setAuthToken(res.data.token);
      return { success: true };
    }
    return { success: false, error: res.error || "Error al registrarse" };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
