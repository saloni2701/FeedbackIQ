import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../api/auth';
import { clearToken, getToken, setToken } from '../api/client';

interface AuthCtx {
  user: api.User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session when the page loads.
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .fetchMe()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  // The API client fires this when the server rejects the saved token.
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('feedbackiq:logout', onLogout);
    return () => window.removeEventListener('feedbackiq:logout', onLogout);
  }, []);

  const accept = useCallback((res: api.AuthResponse) => {
    setToken(res.accessToken);
    setUser(res.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => accept(await api.login(email, password)), [accept]);
  const register = useCallback(
    async (name: string, email: string, password: string) => accept(await api.register(name, email, password)),
    [accept],
  );
  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
