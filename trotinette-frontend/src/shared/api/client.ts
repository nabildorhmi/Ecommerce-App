import axios from 'axios';
import i18n from 'i18next';
import { useAuthStore } from '../../features/auth/store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: inject auth token + Accept-Language on every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // i18n may not be initialized yet on first render; fall back to 'fr'
  config.headers['Accept-Language'] = i18n.language ?? 'fr';
  return config;
});

// Response interceptor: clear auth on 401 and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
