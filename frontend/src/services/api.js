import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (!config.url.endsWith('/')) {
    config.url += '/';
  }

  const token = localStorage.getItem('uqo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('uqo_token');
      // Don't wipe the session for mock dev tokens — only real expired JWTs
      const isMockToken = token?.startsWith('mock-jwt-');
      if (!isMockToken) {
        localStorage.removeItem('uqo_token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('uqo_user');
        window.location.href = '/login?session=expired';
      }
    }

    return Promise.reject(error);
  }
);

export default api;