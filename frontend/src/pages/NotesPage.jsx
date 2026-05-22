/**
 * pages/NotesPage.jsx - Fully redesigned
 * - Mobile responsive (sidebar collapses)
 * - Better typography and contrast
 * - Proper markdown rendering
 * - Clean modern layout
 */

import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import {
  BookOpen,
  Plus,
  X,
  Search,
  ChevronLeft,
  Menu,
  Tag,
  Clock,
  User,
  Filter,
} from "lucide-react";

const TYPE_COLORS = {
  concept: { bg: "#6c63ff20", text: "#6c63ff", border: "#6c63ff40" },
  formula: { bg: "#22c55e20", text: "#22c55e", border: "#22c55e40" },
  shortcut: { bg: "#f59e0b20", text: "#f59e0b", border: "#f59e0b40" },
  example: { bg: "#38bdf820", text: "#38bdf8", border: "#38bdf840" },
};

const TOPIC_ICONS = {
  "Quantitative Aptitude": "🔢",
  "Logical Reasoning": "🧩",
  "Verbal Ability": "📖",
  "Data Interpretation": "📊",
  General: "📚",
};

const TOPICS = [
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
  "Data Interpretation",
  "General",
];

export default function NotesPage() {
  const { isAdmin } = useAuth();
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [form, setForm] = useState({
    title: "",
    content: "",
    topic: "Quantitative Aptitude",
    subtopic: "",
    noteType: "concept",
    isPublic: true,
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [filterTopic, filterType]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterTopic) params.set("topic", filterTopic);
      if (filterType) params.set("noteType", filterType);
      const res = await api.get(`/notes?${params}`);
      setNotes(res.data.notes);
      if (res.data.notes.length > 0 && !selected) {
        setSelected(res.data.notes[0]);
      }
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/notes", form);
      setNotes((prev) => [res.data.note, ...prev]);
      setSelected(res.data.note);
      setShowForm(false);
      toast.success("Note created!");
      setForm({
        title: "",
        content: "",
        topic: "Quantitative Aptitude",
        subtopic: "",
        noteType: "concept",
        isPublic: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create note");
    }
  };

  const handleSelectNote = (note) => {
    setSelected(note);
    if (isMobile) setSidebarOpen(false);
  };

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subtopic?.toLowerCase().includes(search.toLowerCase()) ||
      n.topic?.toLowerCase().includes(search.toLowerCase()),
  );

  // Group notes by topic
  const grouped = filtered.reduce((acc, note) => {
    const t = note.topic || "General";
    if (!acc[t]) acc[t] = [];
    acc[t].push(note);
    return acc;
  }, {});

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        background: "var(--bg-base)",
      }}
    >
      {/* ── Mobile overlay when sidebar open ─────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
          }}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        style={{
          width: isMobile ? "300px" : sidebarOpen ? "300px" : "0",
          minWidth: isMobile ? "300px" : sidebarOpen ? "300px" : "0",
          flexShrink: 0,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.25s ease, min-width 0.25s ease",
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: isMobile ? 50 : 1,
          transform:
            isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            position: "sticky",
            top: 0,
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <BookOpen size={18} color="var(--accent)" />
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                Notes
              </span>
              <span
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  borderRadius: "100px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "1px 7px",
                }}
              >
                {notes.length}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {isAdmin && (
                <button
                  onClick={() => setShowForm(true)}
                  style={{
                    background: "var(--accent)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    padding: "5px 10px",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  <Plus size={14} /> Add
                </button>
              )}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "0.6rem" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              className="input"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: "2rem",
                fontSize: "0.85rem",
                height: "36px",
              }}
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            style={{
              background: showFilter
                ? "var(--accent-dim)"
                : "var(--bg-elevated)",
              border: `1px solid ${showFilter ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "var(--radius-md)",
              padding: "5px 10px",
              color: showFilter ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Filter size={13} /> {showFilter ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Filters */}
          {showFilter && (
            <div
              style={{
                marginTop: "0.6rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <select
                className="input"
                value={filterTopic}
                onChange={(e) => {
                  setFilterTopic(e.target.value);
                }}
                style={{
                  fontSize: "0.8rem",
                  height: "34px",
                  padding: "0 0.75rem",
                }}
              >
                <option value="">All Topics</option>
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {TOPIC_ICONS[t]} {t}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  fontSize: "0.8rem",
                  height: "34px",
                  padding: "0 0.75rem",
                }}
              >
                <option value="">All Types</option>
                {["concept", "formula", "shortcut", "example"].map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              {(filterTopic || filterType) && (
                <button
                  onClick={() => {
                    setFilterTopic("");
                    setFilterType("");
                  }}
                  style={{
                    background: "var(--danger-dim)",
                    border: "1px solid var(--danger)",
                    borderRadius: "var(--radius-md)",
                    padding: "4px 8px",
                    color: "var(--danger)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  Clear Filters ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Note List — grouped by topic */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {Object.keys(grouped).length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                padding: "2rem",
                fontSize: "0.85rem",
              }}
            >
              <BookOpen
                size={32}
                style={{ opacity: 0.3, marginBottom: "0.5rem" }}
              />
              <p>No notes found</p>
            </div>
          )}

          {Object.entries(grouped).map(([topic, topicNotes]) => (
            <div key={topic} style={{ marginBottom: "0.5rem" }}>
              {/* Topic header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>
                  {TOPIC_ICONS[topic] || "📚"}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    color: "var(--text-muted)",
                  }}
                >
                  {topic}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {topicNotes.length}
                </span>
              </div>

              {/* Notes in this topic */}
              {topicNotes.map((note) => {
                const tc = TYPE_COLORS[note.noteType] || TYPE_COLORS.concept;
                const isActive = selected?._id === note._id;
                return (
                  <button
                    key={note._id}
                    onClick={() => handleSelectNote(note)}
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      background: isActive
                        ? "var(--accent-dim)"
                        : "transparent",
                      border: `1px solid ${isActive ? "var(--accent)" : "transparent"}`,
                      textAlign: "left",
                      cursor: "pointer",
                      marginBottom: "2px",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "var(--bg-elevated)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "3px",
                          minHeight: "36px",
                          borderRadius: "2px",
                          background: isActive ? "var(--accent)" : tc.text,
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: isActive
                              ? "var(--text-primary)"
                              : "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: "3px",
                            lineHeight: 1.3,
                          }}
                        >
                          {note.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {note.subtopic && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {note.subtopic}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              padding: "1px 6px",
                              borderRadius: "100px",
                              background: tc.bg,
                              color: tc.text,
                              border: `1px solid ${tc.border}`,
                            }}
                          >
                            {note.noteType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "6px 10px",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            <Menu size={15} />
            {!isMobile && (sidebarOpen ? "Hide" : "Notes")}
          </button>

          {selected && (
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selected.title}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  marginTop: "2px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}
                >
                  {TOPIC_ICONS[selected.topic]} {selected.topic}
                </span>
                {selected.subtopic && (
                  <>
                    <span
                      style={{ color: "var(--border)", fontSize: "0.7rem" }}
                    >
                      ·
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {selected.subtopic}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Note content */}
        {selected ? (
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: isMobile ? "1rem" : "2rem",
            }}
          >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {/* Note header card */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  padding: isMobile ? "1.25rem" : "1.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginBottom: "0.85rem",
                  }}
                >
                  {/* Topic badge */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "100px",
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      border: "1px solid rgba(108,99,255,0.3)",
                    }}
                  >
                    {TOPIC_ICONS[selected.topic]} {selected.topic}
                  </span>

                  {/* Subtopic */}
                  {selected.subtopic && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 10px",
                        borderRadius: "100px",
                        background: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <Tag size={11} /> {selected.subtopic}
                    </span>
                  )}

                  {/* Type badge */}
                  {(() => {
                    const tc =
                      TYPE_COLORS[selected.noteType] || TYPE_COLORS.concept;
                    return (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "4px 10px",
                          borderRadius: "100px",
                          background: tc.bg,
                          color: tc.text,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: `1px solid ${tc.border}`,
                        }}
                      >
                        {selected.noteType.charAt(0).toUpperCase() +
                          selected.noteType.slice(1)}
                      </span>
                    );
                  })()}
                </div>

                <h1
                  style={{
                    fontSize: isMobile ? "1.4rem" : "1.75rem",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: "0.6rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {selected.title}
                </h1>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {selected.createdBy?.name && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <User size={12} /> {selected.createdBy.name}
                    </span>
                  )}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Clock size={12} />{" "}
                    {new Date(selected.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Markdown content */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  padding: isMobile ? "1.25rem" : "2rem",
                  overflow: "hidden",
                }}
              >
                <MarkdownContent content={selected.content} />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              gap: "1rem",
              padding: "2rem",
            }}
          >
            <BookOpen size={56} style={{ opacity: 0.15 }} />
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              Select a note to read
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                textAlign: "center",
                maxWidth: "260px",
              }}
            >
              Choose any note from the sidebar on the left
            </p>
            {isMobile && (
              <button
                className="btn btn-primary"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={15} /> Browse Notes
              </button>
            )}
          </div>
        )}
      </main>

      {/* ── Create Note Modal ─────────────────────────────────── */}
      {showForm && isAdmin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflow: "auto",
              padding: "1.75rem",
              boxShadow: "var(--shadow-lg)",
            }}
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
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                }}
              >
                Create New Note
              </h3>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "6px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleCreate}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <label className="label">Title</label>
                <input
                  className="input"
                  placeholder="e.g. Percentage Formula Sheet"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <label className="label">Topic</label>
                  <select
                    className="input"
                    value={form.topic}
                    onChange={(e) =>
                      setForm({ ...form, topic: e.target.value })
                    }
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Subtopic</label>
                  <input
                    className="input"
                    placeholder="e.g. Percentages"
                    value={form.subtopic}
                    onChange={(e) =>
                      setForm({ ...form, subtopic: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Note Type</label>
                  <select
                    className="input"
                    value={form.noteType}
                    onChange={(e) =>
                      setForm({ ...form, noteType: e.target.value })
                    }
                  >
                    {["concept", "formula", "shortcut", "example"].map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: "2px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isPublic}
                      onChange={(e) =>
                        setForm({ ...form, isPublic: e.target.checked })
                      }
                      style={{
                        accentColor: "var(--accent)",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    Visible to all users
                  </label>
                </div>
              </div>

              <div>
                <label className="label">Content (Markdown supported)</label>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.4rem",
                    lineHeight: 1.5,
                  }}
                >
                  Use # for headings, **bold**, *italic*, | tables |, and ```
                  code blocks ```
                </div>
                <textarea
                  className="input"
                  rows={14}
                  placeholder={`# My Note Title\n\n## Section\n\nWrite your content here...\n\n| Column 1 | Column 2 |\n|---------|----------|\n| Value 1 | Value 2  |`}
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  required
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.83rem",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "flex-end",
                  paddingTop: "0.25rem",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={15} /> Create Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Markdown Renderer Component ────────────────────────────────
function MarkdownContent({ content }) {
  return (
    <div style={{ color: "var(--text-primary)" }}>
      <style>{`
        .md-body { line-height: 1.8; }
        .md-body h1 {
          font-family: var(--font-display);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent);
          padding-bottom: 0.5rem;
          margin: 0 0 1.25rem 0;
        }
        .md-body h2 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--accent);
          margin: 1.75rem 0 0.75rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .md-body h2::before {
          content: '';
          width: 4px;
          height: 1.2rem;
          background: var(--accent);
          border-radius: 2px;
          display: inline-block;
        }
        .md-body h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 1.25rem 0 0.5rem 0;
        }
        .md-body p {
          color: var(--text-secondary);
          margin: 0 0 1rem 0;
          font-size: 0.95rem;
          line-height: 1.8;
        }
        .md-body strong {
          color: var(--text-primary);
          font-weight: 700;
        }
        .md-body em {
          color: var(--warning);
          font-style: italic;
        }
        .md-body ul, .md-body ol {
          color: var(--text-secondary);
          padding-left: 1.5rem;
          margin: 0 0 1rem 0;
        }
        .md-body li {
          margin-bottom: 0.4rem;
          font-size: 0.95rem;
          line-height: 1.7;
        }
        .md-body li strong { color: var(--text-primary); }
        .md-body code {
          font-family: var(--font-mono);
          font-size: 0.88em;
          background: var(--bg-elevated);
          color: var(--accent);
          padding: 0.15em 0.5em;
          border-radius: 5px;
          border: 1px solid var(--border);
        }
        .md-body pre {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.1rem 1.25rem;
          overflow-x: auto;
          margin: 0 0 1.25rem 0;
        }
        .md-body pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.88rem;
          color: var(--text-primary);
          line-height: 1.7;
        }
        .md-body blockquote {
          border-left: 4px solid var(--accent);
          background: var(--accent-dim);
          margin: 0 0 1rem 0;
          padding: 0.75rem 1rem;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          color: var(--text-secondary);
          font-style: italic;
        }
        .md-body blockquote p { margin: 0; color: var(--text-secondary); }
        .md-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 1.25rem 0;
          font-size: 0.9rem;
          overflow-x: auto;
          display: block;
        }
        .md-body thead tr {
          background: var(--accent-dim);
          border-bottom: 2px solid var(--accent);
        }
        .md-body th {
          padding: 0.65rem 1rem;
          text-align: left;
          font-weight: 700;
          font-size: 0.82rem;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .md-body td {
          padding: 0.6rem 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .md-body tbody tr:hover td {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .md-body tbody tr:last-child td { border-bottom: none; }
        .md-body hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1.5rem 0;
        }
        .md-body a { color: var(--accent); text-decoration: underline; }
        .md-body img {
          max-width: 100%;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          margin: 0.75rem 0;
        }
        @media (max-width: 640px) {
          .md-body h1 { font-size: 1.3rem; }
          .md-body h2 { font-size: 1.05rem; }
          .md-body p, .md-body li { font-size: 0.9rem; }
          .md-body th, .md-body td { padding: 0.5rem 0.65rem; font-size: 0.82rem; }
        }
      `}</style>
      <div className="md-body">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
