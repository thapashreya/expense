import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize errors so callers always get `error.message`
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.status = err.response?.status;
    return Promise.reject(error);
  },
);

// Keep the existing fetch-based helper for backward-compat (auth context uses it)
export async function apiRequest(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }
  return data;
}

/* ─── Income ──────────────────────────────────────────────────── */
export const incomeApi = {
  getAll: () => api.get('/transactions/income').then((r) => r.data.income),
  create: (payload) => api.post('/transactions/income', payload).then((r) => r.data.income),
  update: (id, payload) =>
    api.put(`/transactions/income/${id}`, payload).then((r) => r.data.income),
  remove: (id) => api.delete(`/transactions/income/${id}`),
};

/* ─── Expenses ────────────────────────────────────────────────── */
export const expenseApi = {
  getAll: () => api.get('/transactions/expenses').then((r) => r.data.expenses),
  create: (payload) => api.post('/transactions/expenses', payload).then((r) => r.data.expense),
  update: (id, payload) =>
    api.put(`/transactions/expenses/${id}`, payload).then((r) => r.data.expense),
  remove: (id) => api.delete(`/transactions/expenses/${id}`),
};

/* ─── Dashboard summary ───────────────────────────────────────── */
export const summaryApi = {
  get: () => api.get('/transactions/summary').then((r) => r.data),
};

/* ─── Reports (deep analytics) ───────────────────────────────── */
export const reportsApi = {
  get: (months = 12) =>
    api.get(`/transactions/reports?months=${months}`).then((r) => r.data),
};
