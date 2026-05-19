/**
 * pages/NotesPage.jsx
 *
 * Topic-wise notes and formula sheets with Markdown rendering.
 * Admins can create new notes.
 */

import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { BookOpen, Plus, X, Search, Filter } from "lucide-react";

const TYPE_COLORS = {
  concept:  "var(--accent)",
  formula:  "var(--success)",
  shortcut: "var(--warning)",
  example:  "var(--info)",
};

export default function NotesPage() {
  const { isAdmin }   = useAuth();
  const [notes, setNotes]         = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterTopic, setFilterTopic] = useState("");
  const [filterType, setFilterType]   = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", topic: "Quantitative Aptitude",
    subtopic: "", noteType: "concept", isPublic: true,
  });

  useEffect(() => {
    fetchNotes();
  }, [filterTopic, filterType]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterTopic) params.set("topic", filterTopic);
      if (filterType)  params.set("noteType", filterType);
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
      setForm({ title: "", content: "", topic: "Quantitative Aptitude", subtopic: "", noteType: "concept", isPublic: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create note");
    }
  };

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subtopic?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }} className="animate-fade">

      {/* ── Sidebar: Note List ────────────────────────────────── */}
      <div style={{
        width: "300px",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={18} color="var(--accent)" /> Notes
            </h3>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ padding: "0.4rem 0.7rem", fontSize: "0.8rem" }}>
                <Plus size={14} />
              </button>
            )}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              className="input"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2rem", fontSize: "0.85rem" }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem" }}>
            <select
              className="input"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              style={{ fontSize: "0.78rem", padding: "0.4rem" }}
            >
              <option value="">All Topics</option>
              {["Quantitative Aptitude","Logical Reasoning","Verbal Ability","Data Interpretation"].map(t => (
                <option key={t} value={t}>{t.split(" ")[0]}</option>
              ))}
            </select>
            <select
              className="input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ fontSize: "0.78rem", padding: "0.4rem" }}
            >
              <option value="">All Types</option>
              {["concept","formula","shortcut","example"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Note List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem", fontSize: "0.85rem" }}>
              No notes found
            </div>
          )}
          {filtered.map((note) => (
            <button
              key={note._id}
              onClick={() => setSelected(note)}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: "var(--radius-md)",
                background: selected?._id === note._id ? "var(--accent-dim)" : "transparent",
                border: `1px solid ${selected?._id === note._id ? "var(--accent)" : "transparent"}`,
                textAlign: "left",
                cursor: "pointer",
                marginBottom: "2px",
                transition: "all var(--transition)",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: TYPE_COLORS[note.noteType] || "var(--accent)",
                  flexShrink: 0,
                  marginTop: "6px",
                }} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note.title}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {note.subtopic || note.topic.split(" ")[0]} · {note.noteType}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main: Note Content ────────────────────────────────── */}
      <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
        {selected ? (
          <div style={{ maxWidth: "720px" }}>
            {/* Note header */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span className="badge badge-accent">{selected.topic.split(" ")[0]}</span>
                {selected.subtopic && <span className="badge badge-muted">{selected.subtopic}</span>}
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "0.2rem 0.7rem", borderRadius: "100px",
                  fontSize: "0.75rem", fontWeight: 600,
                  background: `${TYPE_COLORS[selected.noteType]}20`,
                  color: TYPE_COLORS[selected.noteType],
                }}>
                  {selected.noteType}
                </span>
              </div>
              <h1 style={{ fontSize: "1.6rem" }}>{selected.title}</h1>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                By {selected.createdBy?.name} · {new Date(selected.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>

            {/* Markdown content */}
            <div style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              padding: "2rem",
              border: "1px solid var(--border)",
              lineHeight: 1.8,
            }}>
              <div className="markdown-body">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 style={{fontFamily:"var(--font-display)",borderBottom:"1px solid var(--border)",paddingBottom:"0.5rem",marginBottom:"1rem"}}>{children}</h1>,
                    h2: ({children}) => <h2 style={{fontFamily:"var(--font-display)",marginTop:"1.5rem",marginBottom:"0.75rem",color:"var(--accent)"}}>{children}</h2>,
                    h3: ({children}) => <h3 style={{marginTop:"1rem",marginBottom:"0.5rem"}}>{children}</h3>,
                    p: ({children}) => <p style={{marginBottom:"1rem",color:"var(--text-secondary)"}}>{children}</p>,
                    code: ({inline,children}) => inline
                      ? <code style={{background:"var(--bg-elevated)",padding:"0.2em 0.4em",borderRadius:"4px",fontFamily:"var(--font-mono)",fontSize:"0.9em",color:"var(--accent)"}}>{children}</code>
                      : <pre style={{background:"var(--bg-elevated)",padding:"1rem",borderRadius:"var(--radius-md)",overflow:"auto",fontFamily:"var(--font-mono)",fontSize:"0.88rem",marginBottom:"1rem"}}><code>{children}</code></pre>,
                    table: ({children}) => <table style={{width:"100%",borderCollapse:"collapse",marginBottom:"1rem"}}>{children}</table>,
                    th: ({children}) => <th style={{padding:"0.5rem 0.75rem",background:"var(--bg-elevated)",borderBottom:"1px solid var(--border)",textAlign:"left",fontSize:"0.85rem",fontWeight:600}}>{children}</th>,
                    td: ({children}) => <td style={{padding:"0.5rem 0.75rem",borderBottom:"1px solid var(--border)",fontSize:"0.88rem",color:"var(--text-secondary)"}}>{children}</td>,
                    strong: ({children}) => <strong style={{color:"var(--text-primary)",fontWeight:700}}>{children}</strong>,
                    li: ({children}) => <li style={{marginBottom:"0.4rem",color:"var(--text-secondary)"}}>{children}</li>,
                    blockquote: ({children}) => <blockquote style={{borderLeft:"3px solid var(--accent)",paddingLeft:"1rem",color:"var(--text-secondary)",fontStyle:"italic",margin:"1rem 0"}}>{children}</blockquote>,
                  }}
                >
                  {selected.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "4rem" }}>
            <BookOpen size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <p>Select a note to read</p>
          </div>
        )}
      </div>

      {/* ── Admin Create Note Modal ───────────────────────────── */}
      {showForm && isAdmin && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
        }}>
          <div className="card animate-fade" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3>Create Note</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "Title",    name: "title",    type: "text",     placeholder: "Note title" },
                { label: "Subtopic", name: "subtopic", type: "text",     placeholder: "e.g. Percentages" },
              ].map(({label, name, type, placeholder}) => (
                <div key={name}>
                  <label className="label">{label}</label>
                  <input className="input" type={type} placeholder={placeholder}
                    value={form[name]} onChange={e => setForm({...form,[name]:e.target.value})} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="label">Topic</label>
                  <select className="input" value={form.topic} onChange={e => setForm({...form,topic:e.target.value})}>
                    {["Quantitative Aptitude","Logical Reasoning","Verbal Ability","Data Interpretation","General"].map(t=>(
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Note Type</label>
                  <select className="input" value={form.noteType} onChange={e => setForm({...form,noteType:e.target.value})}>
                    {["concept","formula","shortcut","example"].map(t=>(
                      <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Content (Markdown supported)</label>
                <textarea
                  className="input"
                  rows={12}
                  placeholder="Write your note in Markdown format..."
                  value={form.content}
                  onChange={e => setForm({...form,content:e.target.value})}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
