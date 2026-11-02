import axios from 'axios';
import { serverStatus } from './serverStatus';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// A cold Render instance takes ~50s to boot, so allow generous time before
// giving up, and retry transient gateway errors that occur while it boots.
const TIMEOUT_MS = 90_000;
const MAX_RETRIES = 3;
const RETRYABLE_STATUS = new Set([502, 503, 504]);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Request interceptor — attach JWT token + start "slow request" tracking
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config._statusId === undefined) config._statusId = serverStatus.start();
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => {
    serverStatus.end(response.config._statusId, true);
    return response;
  },
  async (error) => {
    const config = error.config || {};
    const status = error.response?.status;

    // Server still booting (no response / gateway error) → back off and retry
    const transient = !error.response || RETRYABLE_STATUS.has(status);
    if (transient && error.code !== 'ERR_CANCELED' && (config._retries || 0) < MAX_RETRIES) {
      config._retries = (config._retries || 0) + 1;
      await sleep(1500 * 2 ** (config._retries - 1)); // 1.5s, 3s, 6s
      return api(config);
    }

    // Access token expired → refresh once (shared across parallel requests)
    const isAuthCall = /\/api\/auth\/(login|register|refresh)/.test(config.url || '');
    if (status === 401 && !config._retry && !isAuthCall) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        config._retry = true;
        try {
          refreshPromise ??= axios
            .post(`${API_BASE_URL}/api/auth/refresh`, { refresh_token: refreshToken }, { timeout: TIMEOUT_MS })
            .finally(() => { refreshPromise = null; });
          const res = await refreshPromise;
          localStorage.setItem('access_token', res.data.access_token);
          if (res.data.refresh_token) localStorage.setItem('refresh_token', res.data.refresh_token);
          config.headers.Authorization = `Bearer ${res.data.access_token}`;
          return api(config);
        } catch (refreshErr) {
          // Only sign out if the refresh token itself was rejected — not when
          // the server is simply unreachable.
          if (refreshErr.response && [401, 403].includes(refreshErr.response.status)) {
            serverStatus.end(config._statusId, true);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('aura_user');
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }
      }
    }

    serverStatus.end(config._statusId, !!error.response && !RETRYABLE_STATUS.has(status));
    return Promise.reject(error);
  }
);

/**
 * Fire-and-forget ping so a sleeping backend starts booting the moment the
 * app opens — while the user is still typing their password.
 */
export function warmUpServer() {
  const started = Date.now();
  return axios
    .get(`${API_BASE_URL}/api/health`, { timeout: TIMEOUT_MS })
    .then(() => { serverStatus.markOnline(); return Date.now() - started; })
    .catch(() => null);
}

/** Pull a human-readable message out of a FastAPI error response. */
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg.replace(/^Value error, /, '');
  if (!err?.response) return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
}

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

export const apiFor = { expense: expenseAPI, income: incomeAPI, investment: investmentAPI };

export default api;
