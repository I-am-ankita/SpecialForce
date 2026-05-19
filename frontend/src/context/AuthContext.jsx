/**
 * context/AuthContext.jsx
 *
 * Provides authentication state globally across the React app.
 * Wraps the entire app so any component can access:
 *   - user (current user data)
 *   - isAuthenticated
 *   - login(), logout(), signup()
 *
 * Uses React Context + localStorage for persistence across page reloads.
 */

import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

// Create the context object
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage so they stay logged in on refresh
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(true);

  // On mount, verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch fresh user data using the stored token
  const verifyToken = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch {
      // Token is invalid — clear everything
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ── Login ──────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: userData } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // ── Signup ─────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    const res = await api.post("/auth/signup", { name, email, password });
    const { token, user: userData } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ── Refresh user data ──────────────────────────────────────
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook — use this in any component instead of useContext(AuthContext)
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
