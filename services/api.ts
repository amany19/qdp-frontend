import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

const API_URL = API_BASE_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/* ============================
   Request Interceptor
   ============================ */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const isAdminRequest = config.url?.includes('/admin/');

      const token = isAdminRequest
        ? localStorage.getItem('admin-token')
        : localStorage.getItem('accessToken');

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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      const isAdminRequest = error.config?.url?.includes('/admin/');

      // Only handle unauthorized if token actually existed
      if (status === 401 || status === 403) {
        if (isAdminRequest) {
          const adminToken = localStorage.getItem('admin-token');

          if (adminToken) {
            localStorage.removeItem('admin-token');
            localStorage.removeItem('admin-user');
            localStorage.removeItem('admin-auth-storage');
            window.location.href = '/admin/login';
          }
        } else {
          const userToken = localStorage.getItem('accessToken');

          if (userToken) {
            localStorage.removeItem('accessToken');
            window.location.href = '/auth/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);