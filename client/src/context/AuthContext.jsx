import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'guraneza_token';
const USER_KEY = 'guraneza_user';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  const persist = (nextUser, nextToken) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setToken(nextToken || null);
    setUser(nextUser || null);
  };

  // Revalidate the saved session against the API on first load.
  useEffect(() => {
    const verify = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false);
        return;
      }
      try {
        const { user: freshUser } = await authAPI.me();
        persist(freshUser, localStorage.getItem(TOKEN_KEY));
      } catch {
        persist(null, null);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);
    persist(data.user, data.token);
    return data;
  };

  const register = async (payload) => {
    const data = await authAPI.register(payload);
    persist(data.user, data.token);
    return data;
  };

  const loginWithToken = (nextToken, nextUser) => {
    persist(nextUser, nextToken);
  };

  const logout = () => persist(null, null);

  const updateUser = (updated) => {
    const next = { ...user, ...updated };
    persist(next, token);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!user && !!token,
      isAdmin: user?.role === 'admin',
      isSeller: user?.role === 'seller',
      login,
      register,
      loginWithToken,
      logout,
      updateUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
