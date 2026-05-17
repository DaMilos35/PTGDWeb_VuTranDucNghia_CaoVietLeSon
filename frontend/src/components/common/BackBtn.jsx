import { DS } from "../../design/tokens";

export default function BackBtn({ onClick }) {
  const handleBack = () => {
    if (onClick) onClick();
    else window.history.back();
  };

  return (
    <button 
      onClick={handleBack}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: DS.radiusMd,
        border: `1px solid ${DS.border}`, background: "#fff",
        color: DS.textSecondary, fontSize: 13, fontWeight: 600,
        cursor: "pointer", transition: "all 0.2s",
        marginBottom: 20
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = DS.bgHover;
        e.currentTarget.style.color = DS.primary;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.color = DS.textSecondary;
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Quay lại
    </button>
  );
}
