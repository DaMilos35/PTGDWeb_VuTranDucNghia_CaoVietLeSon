// ============================================================
// INPUT — Shared Component
// ============================================================

import { useState } from "react";
import { DS } from "../../design/tokens";

export default function Input({ label, value, onChange, type = "text", placeholder, required, icon, onKeyDown, autoComplete }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: DS.textSecondary, letterSpacing: "0.01em" }}>
          {label}
          {required && <span style={{ color: DS.error, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: focused ? DS.primary : DS.textMuted, fontSize: 16, transition: "color 0.18s" }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            padding: `11px ${icon ? "14px 11px 40px" : "14px"}`,
            paddingLeft: icon ? 40 : 14,
            borderRadius: DS.radiusMd,
            border: `${focused ? 2 : 1.5}px solid ${focused ? DS.primary : DS.borderInput}`,
            outline: "none",
            fontFamily: "Be Vietnam Pro, sans-serif",
            fontSize: 14,
            color: DS.textPrimary,
            background: DS.bgCard,
            transition: "all 0.18s",
            width: "100%",
            boxSizing: "border-box",
            boxShadow: focused ? `0 0 0 3px ${DS.primaryGlow}` : "none",
          }}
        />
      </div>
    </div>
  );
}
