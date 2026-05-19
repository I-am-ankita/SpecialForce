import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Zap } from "lucide-react";

export default function SignupPage() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { signup }            = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success("Account created! Let's get started 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-base)",
      padding: "1rem",
    }}>
      <div className="animate-fade" style={{
        width: "100%",
        maxWidth: "420px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "2.5rem",
        boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Zap size={28} color="var(--accent)" fill="var(--accent)" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem" }}>
            Ap
          </span>
        </div>

        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>Create account</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Join your team's training platform
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { label: "Full Name", name: "name", type: "text", placeholder: "Your name" },
            { label: "Email",     name: "email", type: "email", placeholder: "you@example.com" },
            { label: "Password",  name: "password", type: "password", placeholder: "At least 6 characters" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input
                className="input"
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "0.8rem", marginTop: "0.5rem" }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
