// ============================================================
// BADGE — Shared Component
// ============================================================

import { DS } from "../../design/tokens";

export default function Badge({ children, color = DS.primary, bg, size = "sm" }) {
  const sizes = {
    xs: { padding: "2px 7px", fontSize: 10 },
    sm: { padding: "3px 10px", fontSize: 11 },
    md: { padding: "5px 14px", fontSize: 13 },
  };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      ...sizes[size],
      borderRadius: DS.radiusFull,
      background: bg || `${color}18`,
      color,
      fontWeight: 700,
      letterSpacing: "0.02em",
      lineHeight: 1,
    }}>
      {children}
    </span>
  );
}
