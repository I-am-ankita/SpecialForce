/**
 * App.jsx — Root component with routing setup
 *
 * Route structure:
 * /              → Redirect to /dashboard or /login
 * /login         → Login page
 * /signup        → Signup page
 * /dashboard     → Personal dashboard (protected)
 * /quiz          → Quiz selection
 * /quiz/:id      → Active quiz engine (protected)
 * /result/:id    → Quiz result review (protected)
 * /notes         → Notes & formula sheets (protected)
 * /practice      → Practice modules (protected)
 * /leaderboard   → Team leaderboard (protected)
 * /admin/*       → Admin panel (admin only)
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import QuizSelectPage from "./pages/QuizSelectPage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import NotesPage from "./pages/NotesPage";
import PracticePage from "./pages/PracticePage";
import AdminPage from "./pages/AdminPage";
import Layout from "./components/shared/Layout";
import LoadingScreen from "./components/shared/LoadingScreen";

// ── Protected Route wrapper ────────────────────────────────────
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

// ── Public Route (redirects logged-in users away) ─────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected routes inside shared Layout (sidebar + header) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="quiz" element={<QuizSelectPage />} />
        <Route path="quiz/start" element={<QuizPage />} /> {/* ← changed */}
        <Route path="quiz/retry" element={<QuizPage />} /> {/* ← added  */}
        <Route path="result/:id" element={<ResultPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        {/* Toast notifications — displayed on top of everything */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#1c2030",
              color: "#f1f3f9",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.9rem",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#1c2030" },
            },
            error: { iconTheme: { primary: "#ef4444", secondary: "#1c2030" } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
