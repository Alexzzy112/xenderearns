import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = config.url?.startsWith('/admin/') ? localStorage.getItem('adminToken') : localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAdmin = error.config?.url?.startsWith('/admin/');
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const productAPI = {
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  purchase: (productId) => api.post('/products/purchase', { productId }),
  getUserInvestments: () => api.get('/products/user/investments'),
};

export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  getTransactions: (page) => api.get(`/wallet/transactions?page=${page || 1}`),
};

export const paymentAPI = {
  initializeDeposit: (data) => api.post('/payments/initialize', data),
  verifyDeposit: (reference) => api.post('/payments/verify', { reference }),
  createVirtualAccount: () => api.post('/payments/virtual-account'),
};

export const withdrawalAPI = {
  request: (data) => api.post('/withdrawals', data),
  getUserWithdrawals: () => api.get('/withdrawals'),
};

export const earningAPI = {
  getEarnings: () => api.get('/earnings'),
  getStats: () => api.get('/earnings/stats'),
};

export const adminAPI = {
  login: (data) => api.post('/admin/login', data),
  getStats: () => api.get('/admin/stats'),
  getUsers: (page) => api.get(`/admin/users?page=${page || 1}`),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPayments: () => api.get('/admin/payments'),
  deletePayment: (id) => api.delete(`/admin/payments/${id}`),
  confirmDeposit: (transactionId) => api.put('/admin/payments/confirm', { transactionId }),
  getInvestmentStats: () => api.get('/admin/investment-stats'),
  getWithdrawals: (status) => api.get(`/admin/withdrawals${status ? `?status=${status}` : ''}`),
  approveWithdrawal: (id) => api.put(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id, note) => api.put(`/admin/withdrawals/${id}/reject`, { adminNote: note }),
  reverseWithdrawal: (id) => api.put(`/admin/withdrawals/${id}/reverse`),
  createProduct: (data) => api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  verifyKyc: (userId, verified) => api.put('/admin/kyc/verify', { userId, verified }),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
  addBankAccount: (data) => api.post('/users/bank-accounts', data),
  getBankAccounts: () => api.get('/users/bank-accounts'),
  uploadKyc: (data) => api.post('/users/kyc', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default api;
