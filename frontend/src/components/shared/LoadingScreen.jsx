import { Zap } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        gap: "1rem",
      }}
    >
      <Zap size={36} color="var(--accent)" fill="var(--accent)" />
      <div className="spinner" />
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
        Loading SpecialForce...
      </p>
    </div>
  );
}
