import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token'));
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch {
          // Token invalid — clear everything
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveTokens = (accessToken, refresh) => {
    setToken(accessToken);
    setRefreshToken(refresh);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refresh);
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { access_token, refresh_token, user: userData } = res.data;
    saveTokens(access_token, refresh_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, currency = 'INR') => {
    const res = await api.post('/api/auth/register', { name, email, password, currency });
    const { access_token, refresh_token, user: userData } = res.data;
    saveTokens(access_token, refresh_token);
    setUser(userData);
    return userData;
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const updateProfile = async (updates) => {
    const res = await api.put('/api/auth/me', updates);
    setUser(res.data);
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
