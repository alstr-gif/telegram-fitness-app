import axios from 'axios';

// Use Railway API URL in production, or localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://telegram-fitness-app-production.up.railway.app/api');

// Debug: Log the API URL being used
console.log('🔍 API Base URL:', API_BASE_URL);
console.log('🔍 VITE_API_URL env var:', import.meta.env.VITE_API_URL);
console.log('🔍 NODE_ENV:', import.meta.env.MODE);
console.log('🔍 DEV mode:', import.meta.env.DEV);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const fullUrl = config.baseURL && config.url ? config.baseURL + config.url : 'unknown';
  console.log('🔍 API Request:', config.method?.toUpperCase(), fullUrl);
  return config;
});

// Add response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const fullUrl = error.config?.baseURL && error.config?.url 
      ? error.config.baseURL + error.config.url 
      : 'unknown';
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: fullUrl,
    });
    return Promise.reject(error);
  }
);

export default api;



