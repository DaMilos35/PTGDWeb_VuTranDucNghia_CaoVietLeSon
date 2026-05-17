// ============================================================
// SPINNER — Shared Component
// ============================================================

import { DS } from "../../design/tokens";

export default function Spinner({ size = 36, text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 40px", gap: 16 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid ${DS.border}`,
        borderTop: `3px solid ${DS.primary}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      {text && <p style={{ color: DS.textMuted, fontSize: 14 }}>{text}</p>}
    </div>
  );
}
