/**
 * utils/api.js
 *
 * Configured Axios instance for all API calls.
 * Automatically attaches the JWT token to every request.
 * Handles 401 errors by redirecting to login.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",  // Proxied to http://localhost:5000/api by Vite
  headers: { "Content-Type": "application/json" },
  timeout: 15000,  // 15 second timeout
});

// ── Request Interceptor ────────────────────────────────────────
// Attaches the JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────
// If the server returns 401 (token expired/invalid), log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — clear local storage and go to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
