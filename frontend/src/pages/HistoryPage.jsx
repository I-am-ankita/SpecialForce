/**
 * pages/HistoryPage.jsx
 *
 * Shows all saved quiz attempts split into:
 * - Test Zone: timed quizzes
 * - Practice Zone: practice/retry sessions
 *
 * Features:
 * - Filter by topic, date, score
 * - View detailed result
 * - Retry wrong questions
 * - Performance summary cards
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  Clock,
  Target,
  Brain,
  RotateCcw,
  ChevronRight,
  Trophy,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  X,
} from "lucide-react";

const ZONE_TABS = [
  { id: "all", label: "All Attempts", icon: "📋" },
  { id: "test", label: "Test Zone", icon: "⏱️" },
  { id: "practice", label: "Practice Zone", icon: "🎯" },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState("all");
  const [filterTopic, setFilterTopic] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/history?page=${page}&limit=20`);
      setResults(res.data.results);
      setTotalPages(res.data.pages);

      // Calculate summary from results
      if (res.data.results.length > 0) {
        const all = res.data.results;
        const avgAcc = Math.round(
          all.reduce((s, r) => s + r.accuracy, 0) / all.length,
        );
        const best = Math.max(...all.map((r) => r.accuracy));
        const worst = Math.min(...all.map((r) => r.accuracy));
        setSummary({ total: res.data.total, avgAcc, best, worst });
      }
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // Filter results
  const filtered = results.filter((r) => {
    const topicMatch = filterTopic ? r.topic === filterTopic : true;
    const zoneMatch =
      zone === "all"
        ? true
        : zone === "test"
          ? !r.autoSubmitted === false || r.totalTimeTaken > 0
          : zone === "practice"
            ? r.quizTitle?.toLowerCase().includes("retry") ||
              r.autoSubmitted === false
            : true;
    return topicMatch;
  });

  // Group by date
  const grouped = filtered.reduce((acc, result) => {
    const date = new Date(result.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(result);
    return acc;
  }, {});

  // Get unique topics for filter
  const topics = [...new Set(results.map((r) => r.topic).filter(Boolean))];

  const getAccuracyColor = (acc) => {
    if (acc >= 80) return "var(--success)";
    if (acc >= 60) return "var(--warning)";
    return "var(--danger)";
  };

  const getAccuracyBg = (acc) => {
    if (acc >= 80) return "var(--success-dim)";
    if (acc >= 60) return "var(--warning-dim)";
    return "var(--danger-dim)";
  };

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page-container animate-fade">
      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Calendar size={26} color="var(--accent)" /> My Quiz History
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginTop: "0.25rem",
            fontSize: "0.9rem",
          }}
        >
          All your saved attempts — review, retry, and track improvement
        </p>
      </div>

      {/* ── Summary Cards ────────────────────────────────────── */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
          {[
            {
              label: "Total Attempts",
              value: summary.total,
              icon: <Brain size={18} color="var(--accent)" />,
              color: "var(--accent)",
              bg: "var(--accent-dim)",
            },
            {
              label: "Avg Accuracy",
              value: `${summary.avgAcc}%`,
              icon: <Target size={18} color="var(--info)" />,
              color: "var(--info)",
              bg: "rgba(56,189,248,0.15)",
            },
            {
              label: "Best Score",
              value: `${summary.best}%`,
              icon: <TrendingUp size={18} color="var(--success)" />,
              color: "var(--success)",
              bg: "var(--success-dim)",
            },
            {
              label: "Lowest Score",
              value: `${summary.worst}%`,
              icon: <TrendingDown size={18} color="var(--danger)" />,
              color: "var(--danger)",
              bg: "var(--danger-dim)",
            },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="card" style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 0.6rem",
                }}
              >
                {icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color,
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: "0.25rem",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Zone Tabs ─────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1.25rem",
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-lg)",
          padding: "0.25rem",
          width: "fit-content",
          border: "1px solid var(--border)",
        }}
      >
        {ZONE_TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setZone(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
              background: zone === id ? "var(--accent)" : "transparent",
              color: zone === id ? "white" : "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "all var(--transition)",
              whiteSpace: "nowrap",
            }}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      {topics.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Filter size={14} color="var(--text-muted)" />
          <button
            onClick={() => setFilterTopic("")}
            style={{
              padding: "4px 12px",
              borderRadius: "100px",
              fontSize: "0.78rem",
              fontWeight: 600,
              border: "1px solid var(--border)",
              cursor: "pointer",
              background: !filterTopic ? "var(--accent)" : "var(--bg-elevated)",
              color: !filterTopic ? "white" : "var(--text-secondary)",
              transition: "all var(--transition)",
            }}
          >
            All Topics
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTopic(t)}
              style={{
                padding: "4px 12px",
                borderRadius: "100px",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "1px solid var(--border)",
                cursor: "pointer",
                background:
                  filterTopic === t ? "var(--accent)" : "var(--bg-elevated)",
                color: filterTopic === t ? "white" : "var(--text-secondary)",
                transition: "all var(--transition)",
                whiteSpace: "nowrap",
              }}
            >
              {t.split(" ")[0]}
            </button>
          ))}
          {filterTopic && (
            <button
              onClick={() => setFilterTopic("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--danger)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                fontSize: "0.78rem",
                padding: "4px",
              }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────── */}
      {Object.keys(grouped).length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ marginBottom: "0.5rem" }}>No attempts yet</h3>
          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            Complete a quiz to see your history here
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/quiz")}>
            <Brain size={16} /> Start a Quiz
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([date, dayResults]) => (
          <div key={date} style={{ marginBottom: "1.5rem" }}>
            {/* Date header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {date}
              </div>
              <div
                style={{ flex: 1, height: "1px", background: "var(--border)" }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  background: "var(--bg-elevated)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  border: "1px solid var(--border)",
                }}
              >
                {dayResults.length} quiz{dayResults.length > 1 ? "zes" : ""}
              </span>
            </div>

            {/* Result cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {dayResults.map((result) => (
                <ResultCard
                  key={result._id}
                  result={result}
                  navigate={navigate}
                  getAccuracyColor={getAccuracyColor}
                  getAccuracyBg={getAccuracyBg}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* ── Pagination ────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: "0.5rem 1rem" }}
          >
            ← Previous
          </button>
          <span
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: "0.5rem 1rem" }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Result Card ────────────────────────────────────────────────
function ResultCard({ result, navigate, getAccuracyColor, getAccuracyBg }) {
  const color = getAccuracyColor(result.accuracy);
  const bg = getAccuracyBg(result.accuracy);
  const time = new Date(result.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        transition: "all var(--transition)",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/result/${result._id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-active)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Accuracy circle */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: bg,
          border: `2px solid ${color}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: "0.9rem",
            color,
            lineHeight: 1,
          }}
        >
          {result.accuracy}%
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.92rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: "4px",
          }}
        >
          {result.quizTitle || `${result.topic} Quiz`}
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <Trophy size={11} />
            {result.score}/{result.totalQuestions} correct
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <Clock size={11} />
            {formatTime(result.totalTimeTaken)}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            ⏰ {time}
          </span>
          {result.autoSubmitted && (
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "var(--warning)",
                background: "var(--warning-dim)",
                padding: "1px 6px",
                borderRadius: "100px",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              Auto-submitted
            </span>
          )}
        </div>
      </div>

      {/* Difficulty + action */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.4rem",
          flexShrink: 0,
        }}
      >
        {result.difficulty && result.difficulty !== "Mixed" && (
          <span
            className={`badge ${
              result.difficulty === "Easy"
                ? "badge-success"
                : result.difficulty === "Medium"
                  ? "badge-warning"
                  : "badge-danger"
            }`}
            style={{ fontSize: "0.68rem" }}
          >
            {result.difficulty}
          </span>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            fontSize: "0.75rem",
            color: "var(--accent)",
            fontWeight: 600,
          }}
        >
          Review <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}

function formatTime(s) {
  if (!s) return "0:00";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
