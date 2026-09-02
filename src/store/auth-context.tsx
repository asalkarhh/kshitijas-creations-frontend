import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authenticationApi } from '../api/authentication';
import { ADMIN_TOKEN_STORAGE_KEY } from '../api/client';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { AdminUser, LoginRequest } from '../types/api';

export const sanitizeAdminRedirect = (redirectPath?: string | null): string => {
  if (!redirectPath || typeof redirectPath !== 'string') return '/admin';
  if (
    redirectPath.startsWith('/admin') &&
    !redirectPath.startsWith('//') &&
    !redirectPath.includes(':')
  ) {
    return redirectPath;
  }
  return '/admin';
};

interface AuthContextValue {
  admin: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setAdmin(null);
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: ['admin'] });
  }, [queryClient]);

  const refreshAdmin = useCallback(async () => {
    try {
      const user = await authenticationApi.getMe();
      setAdmin(user);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const token = sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
        if (token) {
          if (isMounted) setAccessToken(token);
          const user = await authenticationApi.getMe();
          if (isMounted) {
            setAdmin(user);
          }
        }
      } catch {
        if (isMounted) {
          try {
            sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
          } catch {
            // ignore
          }
          setAdmin(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    const handleUnauthorized = () => {
      if (isMounted) {
        logout();
      }
    };

    window.addEventListener('kc:auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('kc:auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await authenticationApi.login(credentials);
      const token = response.accessToken || response.token;
      if (!token) {
        throw new Error('No access token returned by authentication service.');
      }

      sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
      setAccessToken(token);

      // Fetch authoritative user from /auth/me or response
      if (response.admin || response.user) {
        setAdmin(response.admin || response.user || null);
      } else {
        const user = await authenticationApi.getMe();
        setAdmin(user);
      }
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      accessToken,
      isAuthenticated: Boolean(admin && accessToken),
      isInitializing,
      login,
      logout,
      refreshAdmin,
    }),
    [admin, accessToken, isInitializing, login, logout, refreshAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoadingSpinner label="Validating administrator session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname + location.search }} to="/admin/login" />;
  }

  return <>{children}</>;
};

export const PublicOnlyAdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();
  const state = location.state as { from?: string } | undefined;
  const targetRedirect = sanitizeAdminRedirect(state?.from);

  if (isInitializing) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <LoadingSpinner label="Checking session" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate replace to={targetRedirect} />;
  }

  return <>{children}</>;
};
