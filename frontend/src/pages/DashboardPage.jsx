/**
 * pages/DashboardPage.jsx
 *
 * Personal performance dashboard showing:
 * - Stats overview (quizzes, accuracy, streak)
 * - Performance trend chart
 * - Weak topics
 * - Recent quiz history
 * - Badges
 * - Daily goal progress
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import {
  Brain, Target, Clock, TrendingUp, Flame, Star,
  AlertTriangle, BookMarked, ChevronRight, Trophy, Zap
} from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }              = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/users/dashboard");
      setData(res.data.dashboard);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
    </div>
  );

  const { stats, streak, dailyGoal, weakTopics, badges, recentResults, trendData } = data || {};
  const goalProgress = dailyGoal ? Math.min(100, Math.round((dailyGoal.todayDone / dailyGoal.target) * 100)) : 0;

  return (
    <div className="page-container animate-fade">
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Here's your performance overview
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/quiz")}>
          <Brain size={16} /> Start Quiz
        </button>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
        <StatCard icon={<Brain size={20} color="var(--accent)" />} label="Quizzes Done"
          value={stats?.totalQuizzes || 0} color="var(--accent)" />
        <StatCard icon={<Target size={20} color="var(--success)" />} label="Avg Accuracy"
          value={`${stats?.averageAccuracy || 0}%`} color="var(--success)" />
        <StatCard icon={<Clock size={20} color="var(--info)" />} label="Avg Time/Q"
          value={`${stats?.averageTimePerQ || 0}s`} color="var(--info)" />
        <StatCard icon={<Flame size={20} color="var(--danger)" />} label="Current Streak"
          value={`${streak?.current || 0}d`} color="var(--danger)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* ── Performance Trend ─────────────────────────────── */}
        <div className="card">
          <h3 style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={18} color="var(--accent)" /> Performance Trend
          </h3>
          {trendData && trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  stroke="var(--text-muted)"
                  fontSize={11}
                />
                <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px" }}
                  formatter={(v) => [`${v}%`, "Accuracy"]}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              Complete more quizzes to see your trend
            </div>
          )}
        </div>

        {/* ── Daily Goal + Streak ────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Zap size={18} color="var(--warning)" /> Daily Goal
              </h3>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {dailyGoal?.todayDone || 0}/{dailyGoal?.target || 10}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${goalProgress}%` }} />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.75rem" }}>
              {goalProgress >= 100 ? "🎉 Goal reached!" : `${(dailyGoal?.target || 10) - (dailyGoal?.todayDone || 0)} questions to go`}
            </p>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Flame size={18} color="var(--danger)" /> Streak
            </h3>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div>
                <div className="stat-value" style={{ color: "var(--danger)" }}>{streak?.current || 0}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current</div>
              </div>
              <div>
                <div className="stat-value" style={{ color: "var(--text-secondary)" }}>{streak?.longest || 0}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Longest</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* ── Weak Topics ───────────────────────────────────── */}
        <div className="card">
          <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={18} color="var(--warning)" /> Weak Topics
          </h3>
          {weakTopics && weakTopics.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {weakTopics.slice(0, 4).map((t) => (
                <div key={t.subtopic}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{t.subtopic}</span>
                    <span style={{ fontSize: "0.8rem", color: t.accuracy < 40 ? "var(--danger)" : "var(--warning)", fontFamily: "var(--font-mono)" }}>
                      {t.accuracy}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div style={{
                      height: "100%",
                      width: `${t.accuracy}%`,
                      background: t.accuracy < 40 ? "var(--danger)" : "var(--warning)",
                      borderRadius: "100px",
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost" onClick={() => navigate("/quiz")} style={{ marginTop: "0.5rem", fontSize: "0.82rem" }}>
                Practice Weak Topics <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No weak topics yet. Keep practicing!
            </p>
          )}
        </div>

        {/* ── Recent Results ─────────────────────────────────── */}
        <div className="card">
          <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Trophy size={18} color="var(--info)" /> Recent Quizzes
          </h3>
          {recentResults && recentResults.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {recentResults.map((r) => (
                <div key={r._id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.75rem",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{r.topic}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.9rem",
                      color: r.accuracy >= 70 ? "var(--success)" : r.accuracy >= 50 ? "var(--warning)" : "var(--danger)",
                    }}>
                      {r.accuracy}%
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                      {r.score}/{r.totalQuestions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No quizzes yet. Start your first one!</p>
          )}
        </div>
      </div>

      {/* ── Badges ──────────────────────────────────────────── */}
      {badges && badges.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Star size={18} color="var(--warning)" /> Your Badges
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {badges.map(({ badge, awardedAt }) => badge && (
              <div key={awardedAt} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.9rem",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
              }}>
                <span style={{ fontSize: "1.2rem" }}>{badge.icon}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small helper components ────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "var(--radius-md)",
          background: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {icon}
        </div>
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
