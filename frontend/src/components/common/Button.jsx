// ============================================================
// BUTTON — Shared Component
// ============================================================

import { useState } from "react";
import { DS } from "../../design/tokens";

const VARIANTS = {
  primary: {
    background: DS.gradientPrimary,
    color: "#fff",
    border: "none",
    shadow: DS.shadowPrimary,
  },
  success: {
    background: DS.gradientSuccess,
    color: "#fff",
    border: "none",
    shadow: "0 8px 24px rgba(34,197,94,0.3)",
  },
  outline: {
    background: "transparent",
    color: DS.primary,
    border: `1.5px solid ${DS.primary}`,
    shadow: "none",
  },
  ghost: {
    background: "transparent",
    color: DS.textSecondary,
    border: "none",
    shadow: "none",
  },
  danger: {
    background: DS.error,
    color: "#fff",
    border: "none",
    shadow: "0 4px 12px rgba(239,68,68,0.3)",
  },
  secondary: {
    background: DS.bgHover,
    color: DS.textSecondary,
    border: `1px solid ${DS.border}`,
    shadow: "none",
  },
};

const SIZES = {
  xs: { padding: "5px 12px", fontSize: 12, borderRadius: DS.radiusSm },
  sm: { padding: "7px 16px", fontSize: 13, borderRadius: DS.radiusSm },
  md: { padding: "11px 22px", fontSize: 14, borderRadius: DS.radiusMd },
  lg: { padding: "14px 30px", fontSize: 16, borderRadius: DS.radiusMd },
  xl: { padding: "18px 38px", fontSize: 17, borderRadius: DS.radiusLg },
};

export default function Button({ children, onClick, variant = "primary", size = "md", fullWidth, disabled, icon, style: sx }) {
  const [hovered, setHovered] = useState(false);
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...v, ...s,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "Be Vietnam Pro, sans-serif",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        width: fullWidth ? "100%" : undefined,
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered && !disabled ? "translateY(-1px)" : "none",
        boxShadow: hovered && !disabled ? v.shadow : "none",
        letterSpacing: "0.01em",
        ...sx,
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
