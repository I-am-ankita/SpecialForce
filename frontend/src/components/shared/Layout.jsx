/**
 * components/shared/Layout.jsx
 *
 * Main app shell with sidebar navigation and content area.
 * The <Outlet /> renders the current page's content.
 */

import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Brain,
  Trophy,
  BookOpen,
  Dumbbell,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/quiz", icon: Brain, label: "Quiz" },
  { to: "/history", icon: History, label: "History" },
  { to: "/notes", icon: BookOpen, label: "Notes" },
  { to: "/practice", icon: Dumbbell, label: "Practice" },
];

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        style={{
          width: sidebarOpen ? "240px" : "68px",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Logo + Toggle */}
        <div
          style={{
            padding: "1.25rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--border)",
            minHeight: "64px",
          }}
        >
          {sidebarOpen && (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Zap size={22} color="var(--accent)" fill="var(--accent)" />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Special Force
              </span>
            </div>
          )}
          {!sidebarOpen && (
            <Zap
              size={22}
              color="var(--accent)"
              fill="var(--accent)"
              style={{ margin: "0 auto" }}
            />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              marginLeft: sidebarOpen ? "auto" : 0,
            }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          <div
            className="section-title"
            style={{
              padding: "0 0.5rem",
              display: sidebarOpen ? "block" : "none",
            }}
          >
            Main Menu
          </div>

          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.75rem",
                borderRadius: "var(--radius-md)",
                color: isActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                background: isActive ? "var(--accent-dim)" : "transparent",
                borderLeft: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                marginBottom: "2px",
                transition: "all var(--transition)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textDecoration: "none",
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && label}
            </NavLink>
          ))}

          {/* Leaderboard — admin only */}
          {isAdmin && (
            <NavLink
              to="/leaderboard"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.75rem",
                borderRadius: "var(--radius-md)",
                color: isActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                background: isActive ? "var(--accent-dim)" : "transparent",
                borderLeft: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                marginBottom: "2px",
                transition: "all var(--transition)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textDecoration: "none",
              })}
            >
              <Trophy size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && "Leaderboard"}
            </NavLink>
          )}

          {/* Admin link */}
          {isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.75rem",
                borderRadius: "var(--radius-md)",
                color: isActive ? "var(--warning)" : "var(--text-secondary)",
                background: isActive ? "var(--warning-dim)" : "transparent",
                borderLeft: isActive
                  ? "2px solid var(--warning)"
                  : "2px solid transparent",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.9rem",
                marginTop: "0.5rem",
                marginBottom: "2px",
                transition: "all var(--transition)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textDecoration: "none",
              })}
            >
              <Settings size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && "Admin Panel"}
            </NavLink>
          )}
        </nav>

        {/* User section at bottom */}
        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          {sidebarOpen ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--accent-dim)",
                  border: "2px solid var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
                >
                  {user?.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--danger)",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px",
                  display: "flex",
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "var(--danger)",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "8px",
                borderRadius: "8px",
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          background: "var(--bg-base)",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
