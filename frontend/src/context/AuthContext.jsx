import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/queueService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('queueCureToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authApi.me();
        if (mounted) setUser(data.user);
      } catch {
        localStorage.removeItem('queueCureToken');
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, [token]);

  async function login(credentials) {
    const data = await authApi.login(credentials);
    localStorage.setItem('queueCureToken', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem('queueCureToken');
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, clinicId: user?.clinic?._id || user?.clinic?.id, loading, login, logout }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
