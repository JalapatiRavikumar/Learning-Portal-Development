// ============================================================
// frontend/src/api/axiosInstance.js
// Axios pre-configured instance for all backend REST calls
// ============================================================
import axios from 'axios';

const axiosInstance = axios.create({
  // In dev, Vite proxies /api → http://localhost:5000
  // In production, set VITE_API_URL env var to the deployed backend URL
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT from localStorage ────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gvcc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 auto-logout ─────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and reload to login state
      localStorage.removeItem('gvcc_token');
      localStorage.removeItem('gvcc_user');
      // Dispatch a custom event so the App can update its auth state
      window.dispatchEvent(new Event('gvcc:logout'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
