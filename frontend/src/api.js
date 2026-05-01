import axios from 'axios';

const api = axios.create({
  // In production (Railway), the frontend is served by FastAPI on the same domain
  // In development, Vite runs on 5173 and FastAPI on 8000
  baseURL: import.meta.env.DEV ? 'http://localhost:8000/api' : '/api',
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
