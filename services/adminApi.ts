import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/* ============================
   Request Interceptor
   ============================ */
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================
   Response Interceptor
   ============================ */
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        const adminToken = localStorage.getItem('admin-token');
        if (adminToken) {
          localStorage.removeItem('admin-token');
          localStorage.removeItem('admin-user');
          localStorage.removeItem('admin-auth-storage');
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);