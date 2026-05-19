import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";

export default function QuizPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const topic = searchParams.get("topic") || "";
  const subtopic = searchParams.get("subtopic") || "";
  const difficulty = searchParams.get("difficulty") || "";
  const count = Number(searchParams.get("count") || 10);
  const totalSecs = Number(searchParams.get("time") || 600);
  const isRetry = location.pathname.includes("retry");

  // ── State ──────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(totalSecs);
  const [qTimeLeft, setQTimeLeft] = useState(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Refs (always current value, safe inside intervals/callbacks) ──
  const questionsRef = useRef([]);
  const answersRef = useRef({});
  const timeLeftRef = useRef(totalSecs);
  const hasSubmitted = useRef(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);
  const qTimerRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // ── Load Questions ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        let qs = [];
        if (isRetry) {
          const stored = sessionStorage.getItem("retryQuestions");
          if (!stored) {
            navigate("/quiz");
            return;
          }
          qs = JSON.parse(stored);
          sessionStorage.removeItem("retryQuestions");
        } else {
          const params = new URLSearchParams();
          if (topic) params.set("topic", topic);
          if (subtopic) params.set("subtopic", subtopic);
          if (difficulty) params.set("difficulty", difficulty);
          params.set("count", count);
          const res = await api.get(`/quizzes/questions?${params}`);
          qs = res.data.questions;
        }

        if (!qs || qs.length === 0) {
          toast.error("No questions found. Try different filters.");
          navigate("/quiz");
          return;
        }

        questionsRef.current = qs;
        setQuestions(qs);
        setQTimeLeft(qs[0]?.suggestedTime || 60);
        startTimeRef.current = Date.now();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load questions");
        navigate("/quiz");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      clearInterval(timerRef.current);
      clearInterval(qTimerRef.current);
    };
  }, []); // eslint-disable-line

  // ── Core submit function — reads from REFS not state ──────
  // This avoids the stale closure problem entirely
  const doSubmit = async (isAuto = false) => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    clearInterval(timerRef.current);
    clearInterval(qTimerRef.current);
    setSubmitting(true);

    const qs = questionsRef.current;
    const ans = answersRef.current;
    const elapsed = totalSecs - timeLeftRef.current;

    if (!qs || qs.length === 0) {
      toast.error("No questions to submit.");
      hasSubmitted.current = false;
      setSubmitting(false);
      return;
    }

    const answersArray = qs.map((q) => ({
      questionId: q._id,
      selectedOption: ans[q._id]?.selected ?? -1,
      timeTaken: ans[q._id]?.timeTaken ?? 0,
    }));

    try {
      const res = await api.post("/quizzes/submit", {
        topic: topic || "Mixed",
        subtopic: subtopic || "",
        difficulty: difficulty || "Mixed",
        answers: answersArray,
        totalTimeTaken: elapsed,
        autoSubmitted: isAuto,
      });

      if (isAuto) toast("⏰ Time's up! Quiz submitted.", { icon: "⚡" });
      else toast.success("Quiz submitted!");

      res.data.newBadges?.forEach((b, i) => {
        setTimeout(
          () => toast.success(`🏆 Badge unlocked: ${b.name}!`),
          (i + 1) * 1200,
        );
      });

      navigate(`/result/${res.data.result._id}`);
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      toast.error(
        err.response?.data?.message || "Submission failed. Try again.",
      );
      hasSubmitted.current = false;
      setSubmitting(false);
    }
  };

  // ── Global Quiz Timer ──────────────────────────────────────
  useEffect(() => {
    if (loading || questions.length === 0 || submitting) return;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timerRef.current);
          doSubmit(true); // uses refs — no stale closure
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, questions.length, submitting]); // eslint-disable-line

  // ── Per-Question Timer ─────────────────────────────────────
  useEffect(() => {
    if (loading || questions.length === 0) return;
    clearInterval(qTimerRef.current);

    const secs = questions[current]?.suggestedTime || 60;
    setQTimeLeft(secs);
    startTimeRef.current = Date.now();

    qTimerRef.current = setInterval(() => {
      setQTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(qTimerRef.current);
          // Auto-advance on per-question timeout
          setCurrent((c) => {
            const next = c + 1;
            return next < questionsRef.current.length ? next : c;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(qTimerRef.current);
  }, [current, loading, questions.length]); // eslint-disable-line

  // ── Handlers ───────────────────────────────────────────────
  const handleSelect = (questionId, optionIndex) => {
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    setAnswers((prev) => {
      const updated = {
        ...prev,
        [questionId]: { selected: optionIndex, timeTaken },
      };
      answersRef.current = updated; // keep ref in sync immediately
      return updated;
    });
  };

  const goTo = (index) => {
    if (index < 0 || index >= questions.length) return;
    setCurrent(index);
  };

  // ── Render ─────────────────────────────────────────────────
  if (loading)
    return (
      <div
        className="loading-center"
        style={{ flexDirection: "column", gap: "1rem" }}
      >
        <div className="spinner" />
        <p style={{ color: "var(--text-muted)" }}>Loading questions...</p>
      </div>
    );

  if (questions.length === 0) return null;

  const q = questions[current];
  const answered = answers[q._id];
  const progress = Math.round(((current + 1) / questions.length) * 100);
  const isTimeLow = timeLeft <= 60;
  const isQTimeLow = qTimeLeft <= 10;
  const answeredCount = Object.values(answers).filter(
    (a) => a.selected !== -1,
  ).length;
  const isLast = current === questions.length - 1;

  return (
    <div
      style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1rem 1.25rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {isRetry
              ? "Retry Session"
              : `${topic || "Mixed"}${subtopic ? ` • ${subtopic}` : ""}`}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              marginTop: "2px",
            }}
          >
            Question {current + 1} of {questions.length}
          </div>
        </div>

        {/* Global countdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-md)",
            background: isTimeLow ? "var(--danger-dim)" : "var(--bg-elevated)",
            border: `1px solid ${isTimeLow ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            fontSize: "1.1rem",
            color: isTimeLow ? "var(--danger)" : "var(--text-primary)",
            transition: "all 0.3s ease",
          }}
        >
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── Progress Bar ─────────────────────────────────────── */}
      <div className="progress-bar" style={{ marginBottom: "1.5rem" }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Question Card ────────────────────────────────────── */}
      <div
        className="card animate-fade"
        key={q._id}
        style={{ marginBottom: "1.25rem" }}
      >
        {/* Card header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <span
              className={`badge ${
                q.difficulty === "Easy"
                  ? "badge-success"
                  : q.difficulty === "Medium"
                    ? "badge-warning"
                    : "badge-danger"
              }`}
            >
              {q.difficulty || "Medium"}
            </span>
            {q.subtopic && (
              <span className="badge badge-muted">{q.subtopic}</span>
            )}
          </div>
          {/* Per-question timer */}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: isQTimeLow ? "var(--danger)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "color 0.3s",
            }}
          >
            <Clock size={13} /> {qTimeLeft}s
          </div>
        </div>

        {/* Question text */}
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.75,
            marginBottom: "1.5rem",
            fontWeight: 500,
          }}
        >
          {q.questionText}
        </p>

        {/* Options */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          {q.options.map((opt, i) => {
            const isSelected = answered?.selected === i;
            return (
              <button
                key={i}
                onClick={() => handleSelect(q._id, i)}
                style={{
                  padding: "0.85rem 1.1rem",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all var(--transition)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  borderRadius: "var(--radius-md)",
                  background: isSelected
                    ? "var(--accent-dim)"
                    : "var(--bg-elevated)",
                  border: `2px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                  color: isSelected
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background: isSelected
                      ? "var(--accent)"
                      : "var(--bg-hover)",
                    color: isSelected ? "white" : "var(--text-muted)",
                  }}
                >
                  {["A", "B", "C", "D"][i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Navigation + Submit ───────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
          gap: "1rem",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Question number pills */}
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap",
            justifyContent: "center",
            flex: 1,
          }}
        >
          {questions.map((_, i) => {
            const hasAns =
              answers[questions[i]._id]?.selected != null &&
              answers[questions[i]._id]?.selected !== -1;
            const isActive = i === current;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition)",
                  background: isActive
                    ? "var(--accent)"
                    : hasAns
                      ? "var(--success-dim)"
                      : "var(--bg-elevated)",
                  border: `1px solid ${isActive ? "var(--accent)" : hasAns ? "var(--success)" : "var(--border)"}`,
                  color: isActive
                    ? "white"
                    : hasAns
                      ? "var(--success)"
                      : "var(--text-muted)",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Next OR Submit */}
        {!isLast ? (
          <button className="btn btn-primary" onClick={() => goTo(current + 1)}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => doSubmit(false)}
            disabled={submitting}
            style={{
              background: "var(--success)",
              minWidth: "140px",
              justifyContent: "center",
            }}
          >
            <Send size={15} />
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>

      {/* ── Bottom submit button (always visible) ─────────────── */}
      {!isLast && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={() => doSubmit(false)}
            disabled={submitting}
            style={{
              fontSize: "0.82rem",
              color: "var(--success)",
              borderColor: "var(--success)",
            }}
          >
            <Send size={14} />
            {submitting
              ? "Submitting..."
              : `Submit now (${answeredCount}/${questions.length} answered)`}
          </button>
        </div>
      )}

      {/* ── Status Bar ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          fontSize: "0.82rem",
          color: "var(--text-muted)",
        }}
      >
        <span style={{ color: "var(--success)" }}>
          ✅ {answeredCount} answered
        </span>
        <span>⬜ {questions.length - answeredCount} remaining</span>
        {submitting && (
          <span style={{ color: "var(--accent)" }} className="animate-pulse">
            ⏳ Submitting...
          </span>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
