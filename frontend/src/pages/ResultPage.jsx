/**
 * pages/ResultPage.jsx
 *
 * Shows a detailed breakdown of a completed quiz:
 * - Score summary with accuracy
 * - Per-question correct/wrong indicator
 * - Expandable explanations
 * - Retry wrong questions button
 * - Bookmark individual questions
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  RotateCcw, Home, Trophy, Clock, Target, BookmarkPlus, BookmarkCheck
} from "lucide-react";

export default function ResultPage() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState({});
  const [bookmarked, setBookmarked] = useState({});

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/quizzes/result/${id}`);
      setResult(res.data.result);
    } catch {
      toast.error("Failed to load result");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (i) => {
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const handleBookmark = async (questionId) => {
    try {
      const res = await api.post(`/users/bookmark/${questionId}`);
      setBookmarked((prev) => ({ ...prev, [questionId]: res.data.bookmarked }));
      toast.success(res.data.message);
    } catch {
      toast.error("Failed to bookmark");
    }
  };

  const handleRetry = async () => {
    try {
      const res = await api.get(`/results/${id}/retry`);
      if (res.data.questions.length === 0) {
        toast.success("🎉 You got everything right! Nothing to retry.");
        return;
      }
      // Store retry questions in sessionStorage then navigate to quiz
      sessionStorage.setItem("retryQuestions", JSON.stringify(res.data.questions));
      navigate("/quiz/retry");
    } catch {
      toast.error("Failed to load retry questions");
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!result)  return null;

  const { score, totalQuestions, accuracy, totalTimeTaken, answers, topic, subtopic, autoSubmitted } = result;

  const getGrade = (acc) => {
    if (acc >= 90) return { label: "Excellent! 🌟", color: "var(--success)" };
    if (acc >= 75) return { label: "Great Work! 👍", color: "var(--info)" };
    if (acc >= 60) return { label: "Good Effort", color: "var(--warning)" };
    return { label: "Keep Practicing", color: "var(--danger)" };
  };

  const grade = getGrade(accuracy);

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "2rem 1.5rem" }} className="animate-fade">

      {/* ── Score Header ─────────────────────────────────────── */}
      <div className="card" style={{
        textAlign: "center",
        marginBottom: "1.5rem",
        background: `linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)`,
        border: `1px solid ${grade.color}40`,
      }}>
        {autoSubmitted && (
          <div style={{
            background: "var(--warning-dim)",
            color: "var(--warning)",
            borderRadius: "var(--radius-md)",
            padding: "0.4rem 0.8rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            display: "inline-block",
            marginBottom: "1rem",
          }}>
            ⏰ Auto-submitted (time ran out)
          </div>
        )}

        <div style={{ fontSize: "3.5rem", fontFamily: "var(--font-mono)", fontWeight: 500, color: grade.color, lineHeight: 1 }}>
          {accuracy}%
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: grade.color,
          margin: "0.5rem 0 1rem",
        }}>
          {grade.label}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {[
            { icon: <Trophy size={16} />, label: "Score",    val: `${score}/${totalQuestions}` },
            { icon: <Target size={16} />, label: "Accuracy", val: `${accuracy}%` },
            { icon: <Clock size={16} />,  label: "Time",     val: formatTime(totalTimeTaken) },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                marginBottom: "4px",
                justifyContent: "center",
              }}>
                {icon} {label}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("/quiz")}>
            <Trophy size={15} /> New Quiz
          </button>
          <button className="btn btn-ghost" onClick={handleRetry}>
            <RotateCcw size={15} /> Retry Wrong
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
            <Home size={15} /> Dashboard
          </button>
        </div>
      </div>

      {/* ── Answer Review ─────────────────────────────────────── */}
      <h2 style={{ marginBottom: "1rem" }}>Answer Review</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {answers.map((ans, i) => {
          const q         = ans.question;
          if (!q) return null;
          const isCorrect = ans.isCorrect;
          const isOpen    = expanded[i];
          const isBM      = bookmarked[q._id];

          return (
            <div
              key={i}
              className="card"
              style={{
                borderLeft: `3px solid ${isCorrect ? "var(--success)" : "var(--danger)"}`,
                padding: "1rem 1.25rem",
              }}
            >
              {/* Question header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", flex: 1 }}>
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    {isCorrect
                      ? <CheckCircle2 size={20} color="var(--success)" />
                      : <XCircle size={20} color="var(--danger)" />
                    }
                  </div>
                  <div>
                    <span style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      Q{i + 1} · {q.subtopic}
                    </span>
                    <p style={{ fontSize: "0.95rem", lineHeight: 1.6, marginTop: "2px" }}>{q.questionText}</p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button
                    onClick={() => handleBookmark(q._id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: isBM ? "var(--warning)" : "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    title="Bookmark this question"
                  >
                    {isBM ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                  </button>
                  <button
                    onClick={() => toggleExpand(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded: show options + explanation */}
              {isOpen && (
                <div style={{ marginTop: "1rem", paddingLeft: "2rem" }}>
                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = ans.selectedOption === oi;
                      const isCorrectOpt = q.correctOption === oi;
                      let bg = "var(--bg-elevated)", borderColor = "var(--border)", color = "var(--text-secondary)";
                      if (isCorrectOpt) { bg = "var(--success-dim)"; borderColor = "var(--success)"; color = "var(--success)"; }
                      else if (isSelected && !isCorrectOpt) { bg = "var(--danger-dim)"; borderColor = "var(--danger)"; color = "var(--danger)"; }

                      return (
                        <div key={oi} style={{
                          padding: "0.6rem 0.85rem",
                          borderRadius: "var(--radius-md)",
                          border: `1px solid ${borderColor}`,
                          background: bg,
                          color,
                          fontSize: "0.88rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                        }}>
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                            {["A","B","C","D"][oi]}
                          </span>
                          {opt}
                          {isCorrectOpt && <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700 }}>✓ Correct</span>}
                          {isSelected && !isCorrectOpt && <span style={{ marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700 }}>✗ Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div style={{
                      background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.85rem",
                      fontSize: "0.88rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.65,
                      borderLeft: "3px solid var(--accent)",
                    }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        💡 Explanation
                      </span>
                      <p style={{ marginTop: "0.4rem" }}>{q.explanation}</p>
                    </div>
                  )}

                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                    Time taken: {ans.timeTaken}s
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
