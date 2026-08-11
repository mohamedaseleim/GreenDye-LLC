import axios from 'axios';
import { API_URL } from '../config';
import { clearAccessToken, getAccessToken } from './tokenStore';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`, timeout: 20000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  const language = localStorage.getItem('language') || 'en';
  config.headers['Accept-Language'] = language;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

apiClient.interceptors.response.use(response => response, error => {
  const publicAuth = ['/auth/login','/auth/register','/auth/forgot-password','/auth/reset-password','/auth/resend-verification'];
  const isPublicAuth = publicAuth.some(path => String(error.config?.url || '').startsWith(path));
  if (error.response?.status === 401 && !isPublicAuth) {
    clearAccessToken();
    window.dispatchEvent(new Event('green:session-expired'));
  }
  return Promise.reject(error);
});

export default apiClient;
