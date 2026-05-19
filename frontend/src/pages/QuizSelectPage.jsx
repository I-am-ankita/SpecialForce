/**
 * pages/QuizSelectPage.jsx
 *
 * Lets users configure and start a quiz:
 * - Select topic, subtopic, difficulty
 * - Set question count and time limit
 * - View topic availability
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Brain, Clock, BarChart2, Hash, Play, RefreshCw } from "lucide-react";

const TOPIC_COLORS = {
  "Quantitative Aptitude": "#6c63ff",
  "Logical Reasoning": "#22c55e",
  "Verbal Ability": "#f59e0b",
  "Data Interpretation": "#38bdf8",
};

const TOPIC_ICONS = {
  "Quantitative Aptitude": "🔢",
  "Logical Reasoning": "🧩",
  "Verbal Ability": "📖",
  "Data Interpretation": "📊",
};

export default function QuizSelectPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState({
    topic: "",
    subtopic: "",
    difficulty: "",
    count: 10,
    time: 600, // seconds
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await api.get("/questions/topics");
      setTopics(res.data.topics);
    } catch {
      toast.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  const selectedTopicData = topics.find((t) => t._id === config.topic);

  const handleStart = () => {
    if (!config.topic) {
      toast.error("Please select a topic");
      return;
    }
    const params = new URLSearchParams({
      topic: config.topic,
      subtopic: config.subtopic,
      difficulty: config.difficulty,
      count: config.count,
      time: config.time,
    });
    navigate(`/quiz/start?${params}`);
  };

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page-container animate-fade">
      <div style={{ marginBottom: "2rem" }}>
        <h1>Start a Quiz</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Choose your topic and configure the quiz
        </p>
      </div>

      {/* ── Topic Cards ───────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <p className="section-title">Select Topic</p>
        <div className="grid-4">
          {topics.map((t) => {
            const color = TOPIC_COLORS[t._id] || "var(--accent)";
            const icon = TOPIC_ICONS[t._id] || "📚";
            const selected = config.topic === t._id;
            return (
              <button
                key={t._id}
                onClick={() =>
                  setConfig({ ...config, topic: t._id, subtopic: "" })
                }
                style={{
                  background: selected ? `${color}20` : "var(--bg-surface)",
                  border: `2px solid ${selected ? color : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all var(--transition)",
                  transform: selected ? "translateY(-2px)" : "none",
                  boxShadow: selected ? `0 8px 24px ${color}30` : "none",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                  {icon}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: selected ? color : "var(--text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {t._id}
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  {t.totalQuestions} questions
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Configuration Panel ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div className="card">
          <h3 style={{ marginBottom: "1.25rem" }}>Quiz Configuration</h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
          >
            {/* Subtopic */}
            <div>
              <label className="label">Subtopic (optional)</label>
              <select
                className="input"
                value={config.subtopic}
                onChange={(e) =>
                  setConfig({ ...config, subtopic: e.target.value })
                }
                disabled={!selectedTopicData}
              >
                <option value="">All Subtopics (Mixed)</option>
                {selectedTopicData?.subtopics.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.count} questions)
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="label">Difficulty</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["", "Easy", "Medium", "Hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setConfig({ ...config, difficulty: d })}
                    style={{
                      flex: 1,
                      padding: "0.55rem",
                      borderRadius: "var(--radius-md)",
                      border: `2px solid ${config.difficulty === d ? getDiffColor(d) : "var(--border)"}`,
                      background:
                        config.difficulty === d
                          ? `${getDiffColor(d)}20`
                          : "var(--bg-elevated)",
                      color:
                        config.difficulty === d
                          ? getDiffColor(d)
                          : "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      transition: "all var(--transition)",
                    }}
                  >
                    {d || "Mixed"}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label
                className="label"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Number of Questions</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                  }}
                >
                  {config.count}
                </span>
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={config.count}
                onChange={(e) =>
                  setConfig({ ...config, count: Number(e.target.value) })
                }
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                }}
              >
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>25</span>
                <span>30</span>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label
                className="label"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>Time Limit</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                  }}
                >
                  {config.time / 60} min
                </span>
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[300, 600, 900, 1200, 1800].map((t) => (
                  <button
                    key={t}
                    onClick={() => setConfig({ ...config, time: t })}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${config.time === t ? "var(--accent)" : "var(--border)"}`,
                      background:
                        config.time === t
                          ? "var(--accent-dim)"
                          : "var(--bg-elevated)",
                      color:
                        config.time === t
                          ? "var(--accent)"
                          : "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      transition: "all var(--transition)",
                    }}
                  >
                    {t / 60}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary + Start ───────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Quiz Summary</h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {[
                {
                  icon: <Brain size={15} />,
                  label: "Topic",
                  val: config.topic || "Not selected",
                },
                {
                  icon: <BarChart2 size={15} />,
                  label: "Difficulty",
                  val: config.difficulty || "Mixed",
                },
                {
                  icon: <Hash size={15} />,
                  label: "Questions",
                  val: config.count,
                },
                {
                  icon: <Clock size={15} />,
                  label: "Time",
                  val: `${config.time / 60} minutes`,
                },
              ].map(({ icon, label, val }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {icon} {label}
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleStart}
            disabled={!config.topic}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.9rem",
              fontSize: "1rem",
            }}
          >
            <Play size={18} /> Start Quiz
          </button>

          <button
            className="btn btn-ghost"
            onClick={() =>
              setConfig({
                topic: "",
                subtopic: "",
                difficulty: "",
                count: 10,
                time: 600,
              })
            }
            style={{ width: "100%", justifyContent: "center" }}
          >
            <RefreshCw size={15} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function getDiffColor(d) {
  if (d === "Easy") return "var(--success)";
  if (d === "Medium") return "var(--warning)";
  if (d === "Hard") return "var(--danger)";
  return "var(--accent)";
}
