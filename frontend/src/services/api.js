import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const newToken = res.data.access_token;
          localStorage.setItem('access_token', newToken);
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api(error.config);
        } catch {
          // Refresh failed — force logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── API Functions ───────────────────────────────────────────────────────────

export const incomeAPI = {
  list: (month, year) => api.get(`/api/income/?month=${month}&year=${year}`),
  create: (data) => api.post('/api/income/', data),
  update: (uuid, data) => api.put(`/api/income/${uuid}`, data),
  delete: (uuid) => api.delete(`/api/income/${uuid}`),
};

export const expenseAPI = {
  list: (month, year) => api.get(`/api/expenses/?month=${month}&year=${year}`),
  create: (data) => api.post('/api/expenses/', data),
  update: (uuid, data) => api.put(`/api/expenses/${uuid}`, data),
  delete: (uuid) => api.delete(`/api/expenses/${uuid}`),
};

export const categoryAPI = {
  list: () => api.get('/api/categories/'),
  create: (data) => api.post('/api/categories/', data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

export const analyticsAPI = {
  monthly: (month, year) => api.get(`/api/analytics/monthly?month=${month}&year=${year}`),
  trends: (months = 6) => api.get(`/api/analytics/trends?months=${months}`),
};

export const investmentAPI = {
  list: (month, year) => api.get(`/api/investments/?month=${month}&year=${year}`),
  create: (data) => api.post('/api/investments/', data),
  update: (uuid, data) => api.patch(`/api/investments/${uuid}`, data),
  delete: (uuid) => api.delete(`/api/investments/${uuid}`),
};

export default api;
