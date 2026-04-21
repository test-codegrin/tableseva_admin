import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMeApi, loginApi } from "../api/authApi";
import {
  AUTH_STORAGE_KEY,
  AUTH_UNAUTHORIZED_EVENT,
} from "../constants/auth";
import type { LoginPayload, VendorProfile } from "../types/dataTypes";

interface AuthContextType {
  user: VendorProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoadingUser: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = () => localStorage.getItem(AUTH_STORAGE_KEY);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<VendorProfile | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    setIsLoadingUser(true);
    try {
      const data = await getMeApi();
      setUser(data.vendor);
    } catch {
      clearAuth();
    } finally {
      setIsLoadingUser(false);
    }
  }, [clearAuth, token]);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await loginApi(payload);
    if (!data?.token) {
      throw new Error("Token not found in login response");
    }

    localStorage.setItem(AUTH_STORAGE_KEY, data.token);
    setToken(data.token);
    setIsLoadingUser(true);
    try {
      const me = await getMeApi();
      setUser(me.vendor);
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setIsLoadingUser(false);
    }
  }, [clearAuth]);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsBootstrapping(false);
        return;
      }

      setToken(storedToken);
      setIsLoadingUser(true);
      try {
        const data = await getMeApi();
        setUser(data.vendor);
      } catch {
        clearAuth();
      } finally {
        setIsLoadingUser(false);
        setIsBootstrapping(false);
      }
    };

    void restoreSession();
  }, [clearAuth]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY && event.newValue === null) {
        setToken(null);
        setUser(null);
      }
    };

    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      isLoadingUser,
      login,
      logout,
      refreshUser,
    }),
    [isBootstrapping, isLoadingUser, login, logout, refreshUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
