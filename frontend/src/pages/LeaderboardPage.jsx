/**
 * pages/LeaderboardPage.jsx
 *
 * Team leaderboard with:
 * - Rank by accuracy, quiz count, or streak
 * - Top 3 podium display
 * - Full table with stats
 * - Admin: team analytics section
 */


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Trophy, Medal, Flame, Brain, Target, BarChart2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function LeaderboardPage() {
  const { isAdmin, user }         = useAuth();
  const navigate                  = useNavigate();

  // Redirect non-admin users away
  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin]);

  if (!isAdmin) return null;
  const [leaderboard, setLeaderboard] = useState([]);
  const [analytics, setAnalytics]     = useState(null);
  const [metric, setMetric]           = useState("accuracy");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetchData();
  }, [metric]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lbRes] = await Promise.all([
        api.get(`/leaderboard?metric=${metric}&limit=15`),
      ]);
      setLeaderboard(lbRes.data.leaderboard);

      if (isAdmin) {
        const analyticsRes = await api.get("/users/team-analytics");
        setAnalytics(analyticsRes.data.analytics);
      }
    } catch {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const metricValue = (entry) => {
    if (metric === "accuracy") return `${entry.averageAccuracy}%`;
    if (metric === "quizzes")  return `${entry.totalQuizzes} quizzes`;
    if (metric === "streak")   return `${entry.streak}d streak`;
    return "";
  };

  const top3    = leaderboard.slice(0, 3);
  const restOf  = leaderboard.slice(3);
  const myRank  = leaderboard.findIndex((e) => e._id === user?._id) + 1;

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container animate-fade">
      <div style={{ marginBottom: "2rem" }}>
        <h1>Team Leaderboard</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          See how you rank against the team
        </p>
      </div>

      {/* ── Metric Selector ───────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {[
          { key: "accuracy", icon: <Target size={15} />, label: "Accuracy" },
          { key: "quizzes",  icon: <Brain  size={15} />, label: "Quizzes"  },
          { key: "streak",   icon: <Flame  size={15} />, label: "Streak"   },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`btn ${metric === key ? "btn-primary" : "btn-ghost"}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── My Rank Banner ────────────────────────────────────── */}
      {myRank > 0 && (
        <div style={{
          background: "var(--accent-dim)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-lg)",
          padding: "0.85rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.9rem",
        }}>
          <Trophy size={18} color="var(--accent)" />
          <span>Your current rank: <strong style={{ color: "var(--accent)" }}>#{myRank}</strong></span>
        </div>
      )}

      {/* ── Top 3 Podium ─────────────────────────────────────── */}
      {top3.length >= 3 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "end",
        }}>
          {/* 2nd place */}
          <PodiumCard entry={top3[1]} rank={2} metric={metricValue(top3[1])} />
          {/* 1st place */}
          <PodiumCard entry={top3[0]} rank={1} metric={metricValue(top3[0])} tall />
          {/* 3rd place */}
          <PodiumCard entry={top3[2]} rank={3} metric={metricValue(top3[2])} />
        </div>
      )}

      {/* ── Full Ranking Table ───────────────────────────────── */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Full Rankings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {leaderboard.map((entry, i) => {
            const isMe = entry._id === user?._id;
            return (
              <div key={entry._id} style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.85rem",
                background: isMe ? "var(--accent-dim)" : i % 2 === 0 ? "transparent" : "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                transition: "background var(--transition)",
              }}>
                <div style={{
                  width: "32px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: i < 3 ? ["var(--warning)", "var(--text-secondary)", "#cd7f32"][i] : "var(--text-muted)",
                  fontSize: i < 3 ? "1rem" : "0.85rem",
                  textAlign: "center",
                }}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                </div>

                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: isMe ? "var(--accent)" : "var(--bg-hover)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: isMe ? "white" : "var(--text-secondary)",
                  flexShrink: 0,
                }}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                    {entry.name} {isMe && <span style={{ fontSize: "0.75rem", color: "var(--accent)" }}>(You)</span>}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {entry.totalQuizzes} quizzes · {entry.streak}d streak
                  </div>
                </div>

                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: i < 3 ? ["var(--warning)", "var(--text-secondary)", "#cd7f32"][i] : "var(--text-primary)",
                }}>
                  {metricValue(entry)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Admin: Team Analytics ─────────────────────────────── */}
      {isAdmin && analytics && (
        <div>
          <h2 style={{ marginBottom: "1rem" }}>Team Analytics</h2>

          <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
            {[
              { label: "Team Members",  val: analytics.totalMembers,     icon: "👥" },
              { label: "Avg Accuracy",  val: `${analytics.avgAccuracy}%`, icon: "🎯" },
              { label: "Avg Quizzes",   val: analytics.avgQuizzes,        icon: "📝" },
            ].map(({ label, val, icon }) => (
              <div key={label} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem" }}>{icon}</div>
                <div className="stat-value" style={{ marginTop: "0.5rem" }}>{val}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Team Weak Areas Bar Chart */}
          {analytics.teamWeakTopics.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertTriangle size={18} color="var(--warning)" /> Team Weak Areas
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.teamWeakTopics} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} unit="%" />
                  <YAxis type="category" dataKey="subtopic" width={130} stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    formatter={(v) => [`${v}%`, "Avg Accuracy"]}
                  />
                  <Bar dataKey="accuracy" fill="var(--danger)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PodiumCard({ entry, rank, metric, tall }) {
  const colors = { 1: "var(--warning)", 2: "var(--text-secondary)", 3: "#cd7f32" };
  const emojis = { 1: "🥇", 2: "🥈", 3: "🥉" };
  return (
    <div className="card" style={{
      textAlign: "center",
      border: `2px solid ${colors[rank]}40`,
      paddingTop: tall ? "2rem" : "1.25rem",
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{emojis[rank]}</div>
      <div style={{
        width: "48px", height: "48px", borderRadius: "50%",
        background: `${colors[rank]}30`, border: `2px solid ${colors[rank]}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 0.5rem",
        fontSize: "1.1rem", fontWeight: 700, color: colors[rank],
      }}>
        {entry.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{entry.name}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "1.1rem",
        color: colors[rank], marginTop: "0.4rem", fontWeight: 600,
      }}>{metric}</div>
    </div>
  );
}
