import axios from 'axios';

// Use Railway API URL in production, or localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://telegram-fitness-app-production.up.railway.app/api');

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
  return config;
});

// Add response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;



