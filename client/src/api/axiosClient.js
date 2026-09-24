import axios from 'axios';

// Determine API base URL dynamically
const getBaseURL = () => {
  // 1. Explicit Vite environment variable
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL.trim();
    return raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`;
  }

  // 2. Local development fallback (Vite proxy forwards /api -> http://localhost:5000)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return '/api';
  }

  // 3. Default production Render backend URL
  return 'https://pathforge-api-ngmj.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
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

// Handle expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';

      const isAuthCheck =
        url.includes('/auth/me') ||
        url.includes('/auth/login');

      if (!isAuthCheck) {
        localStorage.removeItem('pathforge_token');
        localStorage.removeItem('pathforge_user');
      }
    }

    return Promise.reject(error);
  }
);

export default api;