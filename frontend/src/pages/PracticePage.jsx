/**
 * pages/PracticePage.jsx
 *
 * Three timed practice drills:
 * 1. Multiplication Tables
 * 2. Speed Math (mixed operations)
 * 3. Fractions (simplification)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  Dumbbell,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  ChevronRight,
} from "lucide-react";

const MODULES = [
  {
    id: "tables",
    icon: "✕",
    title: "Multiplication Tables",
    desc: "Master tables from 2 to 20 with timed practice",
    color: "var(--accent)",
  },
  {
    id: "speed-math",
    icon: "⚡",
    title: "Speed Math",
    desc: "Mixed arithmetic with configurable difficulty",
    color: "var(--success)",
  },
  {
    id: "fractions",
    icon: "½",
    title: "Fractions",
    desc: "Simplify fractions and compare values quickly",
    color: "var(--warning)",
  },
];

export default function PracticePage() {
  const [module, setModule] = useState(null);
  const [config, setConfig] = useState({ difficulty: "easy", count: 15 });
  const [started, setStarted] = useState(false);

  const handleStart = (mod) => {
    setModule(mod);
    setStarted(false);
  };

  const handleBack = () => {
    setModule(null);
    setStarted(false);
  };

  if (!module) {
    return (
      <div className="page-container animate-fade">
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Dumbbell size={28} color="var(--accent)" /> Practice Modules
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Sharpen your mental math with timed drills
          </p>
        </div>

        <div className="grid-3">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => handleStart(m)}
              style={{
                padding: "2rem",
                background: "var(--bg-surface)",
                border: `1px solid var(--border)`,
                borderRadius: "var(--radius-xl)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = m.color;
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 12px 32px ${m.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "var(--radius-lg)",
                  background: `${m.color}20`,
                  border: `1px solid ${m.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  color: m.color,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                }}
              >
                {m.icon}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                  }}
                >
                  {m.title}
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    marginTop: "0.3rem",
                  }}
                >
                  {m.desc}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  color: m.color,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  marginTop: "auto",
                }}
              >
                Start Practice <ChevronRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="page-container animate-fade">
        <button
          className="btn btn-ghost"
          onClick={handleBack}
          style={{ marginBottom: "1.5rem" }}
        >
          ← Back
        </button>

        <div style={{ maxWidth: "480px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "var(--radius-lg)",
              background: `${module.color}20`,
              border: `1px solid ${module.color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              color: module.color,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            {module.icon}
          </div>

          <h1 style={{ marginBottom: "0.25rem" }}>{module.title}</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            {module.desc}
          </p>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>Configure Drill</h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label className="label">Difficulty</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["easy", "medium", "hard"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setConfig({ ...config, difficulty: d })}
                      style={{
                        flex: 1,
                        padding: "0.5rem",
                        borderRadius: "var(--radius-md)",
                        border: `2px solid ${config.difficulty === d ? module.color : "var(--border)"}`,
                        background:
                          config.difficulty === d
                            ? `${module.color}20`
                            : "var(--bg-elevated)",
                        color:
                          config.difficulty === d
                            ? module.color
                            : "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        transition: "all var(--transition)",
                      }}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  className="label"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Questions</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: module.color,
                    }}
                  >
                    {config.count}
                  </span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={config.count}
                  onChange={(e) =>
                    setConfig({ ...config, count: Number(e.target.value) })
                  }
                  style={{ width: "100%", accentColor: module.color }}
                />
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setStarted(true)}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.9rem",
              background: module.color,
            }}
          >
            <Play size={16} /> Start Drill
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate drill
  const DrillComponent =
    module.id === "tables"
      ? TablesDrill
      : module.id === "speed-math"
        ? SpeedMathDrill
        : FractionsDrill;

  return (
    <DrillComponent config={config} onBack={handleBack} color={module.color} />
  );
}

// ── Shared Drill Engine ────────────────────────────────────────
function DrillEngine({ questions, onBack, color, title }) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong"
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    timerRef.current = setInterval(
      () => setElapsed(Math.round((Date.now() - startTime) / 1000)),
      1000,
    );
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!done) inputRef.current?.focus();
  }, [current]);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    const q = questions[current];
    const isCorrect = parseFloat(input.trim()) === q.answer;

    setFeedback(isCorrect ? "correct" : "wrong");
    setResults((prev) => [...prev, { ...q, userAnswer: input, isCorrect }]);

    setTimeout(() => {
      setFeedback(null);
      setInput("");
      if (current + 1 >= questions.length) {
        clearInterval(timerRef.current);
        setDone(true);
      } else {
        setCurrent((c) => c + 1);
      }
    }, 400);
  }, [input, current, questions]);

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (done) {
    const correct = results.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correct / results.length) * 100);
    return (
      <div
        className="page-container animate-fade"
        style={{ maxWidth: "560px" }}
      >
        <div
          className="card"
          style={{
            textAlign: "center",
            borderColor: `${color}40`,
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
            {accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👍" : "💪"}
          </div>
          <h2 style={{ color }}>{accuracy}% Accuracy</h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              marginTop: "1rem",
            }}
          >
            <div>
              <div className="stat-value" style={{ color: "var(--success)" }}>
                {correct}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Correct
              </div>
            </div>
            <div>
              <div className="stat-value" style={{ color: "var(--danger)" }}>
                {results.length - correct}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Wrong
              </div>
            </div>
            <div>
              <div className="stat-value">{elapsed}s</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Time
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>Review</h3>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {results.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  background: r.isCorrect
                    ? "var(--success-dim)"
                    : "var(--danger-dim)",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {r.question}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    color: r.isCorrect ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {r.isCorrect
                    ? `✓ ${r.answer}`
                    : `✗ ${r.answer} (yours: ${r.userAnswer})`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-primary"
            onClick={onBack}
            style={{ flex: 1, justifyContent: "center", background: color }}
          >
            <RotateCcw size={15} /> Try Again
          </button>
          <button
            className="btn btn-ghost"
            onClick={onBack}
            style={{ flex: 1, justifyContent: "center" }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const progress = Math.round((current / questions.length) * 100);

  return (
    <div
      style={{ maxWidth: "540px", margin: "0 auto", padding: "2rem 1.5rem" }}
      className="animate-fade"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={onBack}
          style={{ padding: "0.4rem 0.8rem", fontSize: "0.82rem" }}
        >
          ← Back
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
          }}
        >
          <Clock size={14} /> {elapsed}s
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {current + 1} / {questions.length}
        </div>
      </div>

      <div className="progress-bar" style={{ marginBottom: "2rem" }}>
        <div
          className="progress-fill"
          style={{ width: `${progress}%`, background: color }}
        />
      </div>

      <div
        className="card"
        style={{
          textAlign: "center",
          borderColor:
            feedback === "correct"
              ? "var(--success)"
              : feedback === "wrong"
                ? "var(--danger)"
                : `${color}40`,
          transition: "border-color 0.2s",
          marginBottom: "1.5rem",
          padding: "2.5rem",
        }}
      >
        {feedback && (
          <div style={{ marginBottom: "1rem" }}>
            {feedback === "correct" ? (
              <CheckCircle2
                size={40}
                color="var(--success)"
                style={{ animation: "fadeIn 0.2s ease" }}
              />
            ) : (
              <XCircle
                size={40}
                color="var(--danger)"
                style={{ animation: "fadeIn 0.2s ease" }}
              />
            )}
          </div>
        )}
        <p
          style={{
            fontSize: "2rem",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          {q.question}
        </p>
        <input
          ref={inputRef}
          type="number"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Your answer..."
          style={{
            textAlign: "center",
            fontSize: "1.3rem",
            fontFamily: "var(--font-mono)",
            maxWidth: "200px",
            margin: "0 auto",
          }}
          autoComplete="off"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        style={{
          width: "100%",
          justifyContent: "center",
          padding: "0.85rem",
          background: color,
        }}
      >
        Submit Answer <ChevronRight size={16} />
      </button>
      <p
        style={{
          textAlign: "center",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          marginTop: "0.75rem",
        }}
      >
        Press Enter to submit quickly
      </p>
    </div>
  );
}

// ── Specific Drills ────────────────────────────────────────────
function TablesDrill({ config, onBack, color }) {
  const [questions] = useState(() => {
    // Easy: tables 2-15, Medium: 2-20, Hard: 2-30
    const maxTable =
      config.difficulty === "easy"
        ? 15
        : config.difficulty === "medium"
          ? 20
          : 30;
    // Easy: multiply up to 12, Medium: up to 20, Hard: up to 30
    const maxMult =
      config.difficulty === "easy"
        ? 12
        : config.difficulty === "medium"
          ? 20
          : 30;
    return Array.from({ length: config.count }, (_, i) => {
      const table = Math.floor(Math.random() * (maxTable - 1)) + 2;
      const num = Math.floor(Math.random() * maxMult) + 1;
      return { id: i, question: `${table} × ${num} = ?`, answer: table * num };
    });
  });
  return (
    <DrillEngine
      questions={questions}
      onBack={onBack}
      color={color}
      title="Tables"
    />
  );
}

function SpeedMathDrill({ config, onBack, color }) {
  const [questions] = useState(() => {
    const maxNum =
      config.difficulty === "easy"
        ? 25
        : config.difficulty === "medium"
          ? 75
          : 150;

    // Easy: +/-/×  |  Medium: +/-/×/÷  |  Hard: all + squares
    const ops =
      config.difficulty === "easy"
        ? ["+", "+", "-", "-", "×"] // weighted toward + and -
        : config.difficulty === "medium"
          ? ["+", "-", "×", "÷", "+", "-"]
          : ["+", "-", "×", "÷", "²", "+", "-", "×"]; // Hard includes squares

    return Array.from({ length: config.count }, (_, i) => {
      const op = ops[Math.floor(Math.random() * ops.length)];
      let a, b, answer, question;

      if (op === "²") {
        // Squares: easy 1-20, medium 1-30, hard 1-50
        const maxSq = config.difficulty === "hard" ? 50 : 30;
        a = Math.floor(Math.random() * maxSq) + 1;
        answer = a * a;
        question = `${a}² = ?`;
      } else if (op === "÷") {
        // Generate clean divisions (no remainders)
        b = Math.floor(Math.random() * 12) + 2;
        answer =
          Math.floor(Math.random() * (config.difficulty === "hard" ? 20 : 12)) +
          1;
        a = b * answer;
        question = `${a} ÷ ${b} = ?`;
      } else if (op === "×") {
        const maxMul =
          config.difficulty === "easy"
            ? 12
            : config.difficulty === "medium"
              ? 20
              : 30;
        a = Math.floor(Math.random() * maxMul) + 2;
        b = Math.floor(Math.random() * maxMul) + 2;
        answer = a * b;
        question = `${a} × ${b} = ?`;
      } else if (op === "-") {
        a = Math.floor(Math.random() * maxNum) + 10;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        question = `${a} - ${b} = ?`;
      } else {
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
      }

      return { id: i, question, answer };
    });
  });
  return (
    <DrillEngine
      questions={questions}
      onBack={onBack}
      color={color}
      title="Speed Math"
    />
  );
}

function FractionsDrill({ config, onBack, color }) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const [questions] = useState(() => {
    const maxNum =
      config.difficulty === "easy"
        ? 10
        : config.difficulty === "medium"
          ? 20
          : 50;
    return Array.from({ length: config.count }, (_, i) => {
      const num = Math.floor(Math.random() * maxNum) + 2;
      const den = Math.floor(Math.random() * maxNum) + 2;
      const g = gcd(num, den);
      const simplified = `${num / g}/${den / g}`;
      return {
        id: i,
        question: `Simplify: ${num}/${den} (enter numerator only)`,
        answer: num / g,
        fullAnswer: simplified,
      };
    });
  });
  return (
    <DrillEngine
      questions={questions}
      onBack={onBack}
      color={color}
      title="Fractions"
    />
  );
}
