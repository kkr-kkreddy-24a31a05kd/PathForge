import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pathforge_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if checking auth/me or login
      const isAuthCheck = error.config.url.includes('/auth/me') || error.config.url.includes('/auth/login');
      if (!isAuthCheck) {
        localStorage.removeItem('pathforge_token');
        localStorage.removeItem('pathforge_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
