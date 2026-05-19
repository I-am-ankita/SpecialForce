/**
 * pages/AdminPage.jsx
 *
 * Admin-only panel with tabs for:
 * 1. Question Management (add/edit/delete/bulk upload)
 * 2. Most Wrong Questions (analytics)
 * 3. User Management
 */

import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  Plus, Trash2, Edit3, Upload, Users, BarChart2,
  AlertTriangle, CheckCircle2, X, Search
} from "lucide-react";

const TOPICS    = ["Quantitative Aptitude","Logical Reasoning","Verbal Ability","Data Interpretation"];
const DIFFS     = ["Easy","Medium","Hard"];
const SUBTOPICS = {
  "Quantitative Aptitude": ["Percentages","Profit & Loss","Simple Interest","Compound Interest","Time & Work","Speed, Time & Distance","Ratio & Proportion","Averages","Mixtures","Number System","Permutation & Combination","Probability"],
  "Logical Reasoning":     ["Syllogisms","Blood Relations","Coding-Decoding","Directions","Ranking & Arrangement","Series","Puzzles","Clocks & Calendars"],
  "Verbal Ability":        ["Synonyms","Antonyms","Reading Comprehension","Fill in the Blanks","Error Correction","Para Jumbles","Idioms & Phrases"],
  "Data Interpretation":   ["Bar Graph","Line Graph","Pie Chart","Tables","Mixed DI"],
};

const TABS = [
  { id: "questions", icon: <BarChart2 size={16} />, label: "Questions" },
  { id: "bulk",      icon: <Upload  size={16} />,   label: "Bulk Upload" },
  { id: "wrong",     icon: <AlertTriangle size={16} />, label: "Most Wrong" },
  { id: "users",     icon: <Users   size={16} />,   label: "Users" },
];

const EMPTY_FORM = {
  questionText: "", options: ["","","",""], correctOption: 0,
  explanation: "", topic: "Quantitative Aptitude",
  subtopic: "", difficulty: "Medium", suggestedTime: 60,
};

export default function AdminPage() {
  const [tab, setTab]           = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [users, setUsers]         = useState([]);
  const [wrongQ, setWrongQ]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [search, setSearch]       = useState("");
  const [filterTopic, setFilterTopic]   = useState("");
  const [filterDiff,  setFilterDiff]    = useState("");
  const [bulkJson, setBulkJson]         = useState("");
  const [bulkLoading, setBulkLoading]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);

  useEffect(() => {
    if (tab === "questions") fetchQuestions();
    else if (tab === "users")  fetchUsers();
    else if (tab === "wrong")  fetchWrong();
  }, [tab, page, filterTopic, filterDiff]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filterTopic) params.set("topic",      filterTopic);
      if (filterDiff)  params.set("difficulty", filterDiff);
      const res = await api.get(`/questions?${params}`);
      setQuestions(res.data.questions);
      setTotalPages(res.data.pages);
    } catch { toast.error("Failed to load questions"); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/all");
      setUsers(res.data.users);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const fetchWrong = async () => {
    setLoading(true);
    try {
      const res = await api.get("/questions/most-wrong");
      setWrongQ(res.data.questions);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.options.some(o => !o.trim())) {
      toast.error("All 4 options are required");
      return;
    }
    try {
      if (editId) {
        await api.put(`/questions/${editId}`, form);
        toast.success("Question updated!");
      } else {
        await api.post("/questions", form);
        toast.success("Question created!");
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    }
  };

  const handleEdit = (q) => {
    setForm({
      questionText: q.questionText, options: q.options,
      correctOption: q.correctOption, explanation: q.explanation,
      topic: q.topic, subtopic: q.subtopic, difficulty: q.difficulty,
      suggestedTime: q.suggestedTime,
    });
    setEditId(q._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success("Question deleted");
      fetchQuestions();
    } catch { toast.error("Failed to delete"); }
  };

  const handleBulkUpload = async () => {
    try {
      const questions = JSON.parse(bulkJson);
      if (!Array.isArray(questions)) throw new Error("Must be an array");
      setBulkLoading(true);
      const res = await api.post("/questions/bulk-upload", { questions });
      toast.success(res.data.message);
      setBulkJson("");
    } catch (err) {
      if (err instanceof SyntaxError) toast.error("Invalid JSON format");
      else toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const SAMPLE_JSON = JSON.stringify([
    {
      questionText: "What is 25% of 200?",
      options: ["40","50","60","70"],
      correctOption: 1,
      explanation: "25% of 200 = (25/100) × 200 = 50",
      topic: "Quantitative Aptitude",
      subtopic: "Percentages",
      difficulty: "Easy",
      suggestedTime: 30,
    }
  ], null, 2);

  return (
    <div className="page-container animate-fade">
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1>Admin Panel</h1>
        <p style={{ color: "var(--text-secondary)" }}>Manage questions, track analytics, and oversee users</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", padding: "0.25rem", width: "fit-content" }}>
        {TABS.map(({ id, icon, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            padding: "0.5rem 1rem", borderRadius: "var(--radius-md)",
            border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
            background: tab === id ? "var(--accent)" : "transparent",
            color: tab === id ? "white" : "var(--text-secondary)",
            transition: "all var(--transition)",
          }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── Questions Tab ─────────────────────────────────────── */}
      {tab === "questions" && (
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <select className="input" value={filterTopic} onChange={e => { setFilterTopic(e.target.value); setPage(1); }}
              style={{ width: "auto" }}>
              <option value="">All Topics</option>
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="input" value={filterDiff} onChange={e => { setFilterDiff(e.target.value); setPage(1); }}
              style={{ width: "auto" }}>
              <option value="">All Difficulties</option>
              {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }} style={{ marginLeft: "auto" }}>
              <Plus size={16} /> Add Question
            </button>
          </div>

          {/* Questions Table */}
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                    {["Question","Topic","Subtopic","Difficulty","Attempted","Accuracy","Actions"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => {
                    const acc = q.stats.timesAttempted > 0 ? Math.round((q.stats.timesCorrect / q.stats.timesAttempted) * 100) : "—";
                    return (
                      <tr key={q._id} style={{ borderBottom: "1px solid var(--border)", transition: "background var(--transition)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "0.75rem 1rem", maxWidth: "260px" }}>
                          <span style={{ fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                            {q.questionText}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{q.topic.split(" ")[0]}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>{q.subtopic}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span className={`badge ${q.difficulty === "Easy" ? "badge-success" : q.difficulty === "Medium" ? "badge-warning" : "badge-danger"}`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>{q.stats.timesAttempted}</td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: typeof acc === "number" ? (acc >= 60 ? "var(--success)" : "var(--danger)") : "var(--text-muted)" }}>
                          {typeof acc === "number" ? `${acc}%` : acc}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <button onClick={() => handleEdit(q)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: "4px" }}><Edit3 size={15} /></button>
                            <button onClick={() => handleDelete(q._id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "4px" }}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", padding: "1rem", borderTop: "1px solid var(--border)" }}>
                  <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ padding: "0.4rem 0.8rem" }}>←</button>
                  <span style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Page {page} of {totalPages}
                  </span>
                  <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} style={{ padding: "0.4rem 0.8rem" }}>→</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Bulk Upload Tab ───────────────────────────────────── */}
      {tab === "bulk" && (
        <div style={{ maxWidth: "720px" }}>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>JSON Bulk Upload</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Upload multiple questions at once as a JSON array. Max 500 per upload.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <label className="label">JSON Array</label>
              <textarea
                className="input"
                rows={18}
                placeholder={SAMPLE_JSON}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-primary" onClick={handleBulkUpload} disabled={bulkLoading || !bulkJson.trim()}>
                <Upload size={15} /> {bulkLoading ? "Uploading..." : "Upload Questions"}
              </button>
              <button className="btn btn-ghost" onClick={() => setBulkJson(SAMPLE_JSON)}>
                Load Sample
              </button>
            </div>
          </div>

          <div className="card" style={{ background: "var(--bg-elevated)" }}>
            <h4 style={{ marginBottom: "0.75rem" }}>Required Fields</h4>
            {[
              ["questionText", "string", "The question text"],
              ["options",      "array[4]","Exactly 4 option strings"],
              ["correctOption","number", "0-3 (index of correct option)"],
              ["topic",        "string", "One of: Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation"],
              ["subtopic",     "string", "e.g. Percentages, Syllogisms"],
              ["difficulty",   "string", "Easy | Medium | Hard"],
              ["explanation",  "string", "Optional explanation"],
              ["suggestedTime","number", "Seconds for this question (optional, default 60)"],
            ].map(([field, type, desc]) => (
              <div key={field} style={{ display: "flex", gap: "1rem", padding: "0.4rem 0", borderBottom: "1px solid var(--border)", fontSize: "0.82rem" }}>
                <code style={{ color: "var(--accent)", width: "130px", flexShrink: 0 }}>{field}</code>
                <span style={{ color: "var(--warning)", width: "80px", flexShrink: 0 }}>{type}</span>
                <span style={{ color: "var(--text-muted)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Most Wrong Tab ────────────────────────────────────── */}
      {tab === "wrong" && (
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Questions with Lowest Accuracy</h3>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {wrongQ.map((q, i) => (
                <div key={q._id} className="card" style={{ padding: "1rem", borderLeft: `3px solid var(--danger)` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                        <span className="badge badge-muted">{q.subtopic}</span>
                        <span className={`badge badge-${q.difficulty === "Easy" ? "success" : q.difficulty === "Medium" ? "warning" : "danger"}`}>{q.difficulty}</span>
                      </div>
                      <p style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{q.questionText}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 500, color: "var(--danger)" }}>
                        {q.accuracyRate}%
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {q.stats.timesAttempted} attempts
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {wrongQ.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                  <CheckCircle2 size={40} style={{ opacity: 0.3, marginBottom: "0.75rem" }} />
                  <p>Not enough data yet. Questions need at least 5 attempts.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Users Tab ─────────────────────────────────────────── */}
      {tab === "users" && (
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Team Members ({users.length})</h3>
          {loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                    {["Name","Email","Quizzes","Accuracy","Streak","Joined"].map(h => (
                      <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)" }}>
                            {u.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "var(--text-secondary)" }}>{u.email}</td>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.88rem" }}>{u.stats.totalQuizzes}</td>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.88rem", color: u.stats.averageAccuracy >= 70 ? "var(--success)" : u.stats.averageAccuracy >= 50 ? "var(--warning)" : "var(--danger)" }}>
                        {u.stats.averageAccuracy}%
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem" }}>🔥 {u.streak.current}d</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Question Form Modal ───────────────────────────────── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="card animate-fade" style={{ width: "100%", maxWidth: "680px", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3>{editId ? "Edit Question" : "Add Question"}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Question Text</label>
                <textarea className="input" rows={3} value={form.questionText}
                  onChange={e => setForm({...form, questionText: e.target.value})}
                  placeholder="Enter the question..." required />
              </div>

              {/* Options */}
              <div>
                <label className="label">Options (select the correct one)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {form.options.map((opt, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <button type="button" onClick={() => setForm({...form, correctOption: i})} style={{
                        width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                        background: form.correctOption === i ? "var(--success)" : "var(--bg-elevated)",
                        border: `2px solid ${form.correctOption === i ? "var(--success)" : "var(--border)"}`,
                        color: form.correctOption === i ? "white" : "var(--text-muted)",
                        fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                      }}>
                        {["A","B","C","D"][i]}
                      </button>
                      <input className="input" placeholder={`Option ${["A","B","C","D"][i]}`} value={opt}
                        onChange={e => { const o=[...form.options]; o[i]=e.target.value; setForm({...form,options:o}); }}
                        required style={{ flex: 1 }} />
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                  Click the letter button to mark the correct answer
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="label">Topic</label>
                  <select className="input" value={form.topic}
                    onChange={e => setForm({...form, topic: e.target.value, subtopic: ""})}>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subtopic</label>
                  <select className="input" value={form.subtopic}
                    onChange={e => setForm({...form, subtopic: e.target.value})}>
                    <option value="">Select subtopic</option>
                    {(SUBTOPICS[form.topic] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Difficulty</label>
                  <select className="input" value={form.difficulty}
                    onChange={e => setForm({...form, difficulty: e.target.value})}>
                    {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Suggested Time (seconds)</label>
                  <input className="input" type="number" min={10} max={300}
                    value={form.suggestedTime}
                    onChange={e => setForm({...form, suggestedTime: Number(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="label">Explanation (optional)</label>
                <textarea className="input" rows={3} value={form.explanation}
                  onChange={e => setForm({...form, explanation: e.target.value})}
                  placeholder="Explain the solution approach..." />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={15} /> {editId ? "Update" : "Create"} Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
