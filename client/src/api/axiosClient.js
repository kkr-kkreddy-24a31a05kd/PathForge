import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pathforge-api-ngmj.onrender.com/api',
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