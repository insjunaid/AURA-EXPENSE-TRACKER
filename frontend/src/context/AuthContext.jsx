import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const USER_CACHE_KEY = 'aura_user';

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  // Show the app instantly using the last known profile, then verify it in the
  // background. This means a sleeping backend no longer blocks the UI.
  const [user, setUser] = useState(() => (localStorage.getItem('access_token') ? readCachedUser() : null));
  const [loading, setLoading] = useState(() => !!localStorage.getItem('access_token') && !readCachedUser());

  const cacheUser = (u) => {
    setUser(u);
    if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_CACHE_KEY);
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem(USER_CACHE_KEY);
  }, []);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    let cancelled = false;
    api.get('/api/auth/me')
      .then((res) => { if (!cancelled) cacheUser(res.data); })
      .catch((err) => {
        // Only a real auth rejection signs the user out. A timeout or network
        // error (e.g. the server waking up) keeps the session intact.
        if (!cancelled && err.response && [401, 403].includes(err.response.status)) logout();
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveSession = ({ access_token, refresh_token, user: userData }) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setToken(access_token);
    cacheUser(userData);
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    saveSession(res.data);
    return res.data.user;
  };

  const register = async (name, email, password, currency = 'INR') => {
    const res = await api.post('/api/auth/register', { name, email, password, currency });
    saveSession(res.data);
    return res.data.user;
  };

  const updateProfile = async (updates) => {
    const res = await api.put('/api/auth/me', updates);
    cacheUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout, updateProfile,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
