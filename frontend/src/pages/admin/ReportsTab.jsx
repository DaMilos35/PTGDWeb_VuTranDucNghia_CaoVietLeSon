import { useState } from "react";
import { DS } from "../../design/tokens";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

export default function ReportsTab({ reports, users, products, onRemoveContent, onDismiss, setView }) {
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  const pendingCount = (reports || []).filter(r => r.status === "pending").length;

  const filtered = (reports || []).filter(r => {
    const matchStatus = filter === "all" || r.status === filter;
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchStatus && matchType;
  }).sort((a, b) => {
    if (sortBy === "oldest") return String(a.id || "").localeCompare(String(b.id || ""));
    return String(b.id || "").localeCompare(String(a.id || ""));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header & Toolbar */}
      <div className="glass-panel" style={{ padding: "16px 24px", borderRadius: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Quản lý báo cáo vi phạm</h3>
          {pendingCount > 0 && <p style={{ fontSize: 13, color: DS.error, marginTop: 4 }}>⚠️ {pendingCount} báo cáo chưa được xử lý</p>}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${DS.borderInput}`, fontSize: 13, background: "#fff", cursor: "pointer", outline: "none" }}>
            <option value="all">Tất cả đối tượng</option>
            <option value="product">Sản phẩm</option>
            <option value="user">Người dùng</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${DS.borderInput}`, fontSize: 13, background: "#fff", cursor: "pointer", outline: "none" }}>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất (Tồn đọng)</option>
          </select>
          <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.04)", padding: 4, borderRadius: 12 }}>
            {["all", "pending", "resolved"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filter === f ? "#fff" : "transparent", color: filter === f ? DS.primary : DS.textSecondary, cursor: "pointer", fontSize: 13, fontWeight: filter === f ? 700 : 600, transition: "all 0.2s", boxShadow: filter === f ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
                {f === "all" ? "Tất cả" : f === "pending" ? "Chờ xử lý" : "Đã giải quyết"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.length === 0 && (
          <div className="glass-panel" style={{ padding: 40, borderRadius: 20, textAlign: "center", color: DS.textMuted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 700 }}>Không có báo cáo nào!</div>
          </div>
        )}
        {filtered.map(r => (
          <div key={r.id} className="glass-panel" style={{ borderRadius: 18, overflow: "hidden", borderLeft: `4px solid ${r.status === "resolved" ? DS.success : DS.error}` }}>
            <div style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: r.type === "product" ? DS.warningLight : DS.errorLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {r.type === "product" ? "📦" : "👤"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                  <Badge color={r.status === "resolved" ? DS.success : DS.error} bg={r.status === "resolved" ? DS.successLight : DS.errorLight}>
                    {r.status === "resolved" ? "✓ Đã xử lý" : "⏳ Chờ xử lý"}
                  </Badge>
                  <Badge color={DS.textSecondary} bg={DS.bgHover}>{r.type === "product" ? "Sản phẩm" : "Người dùng"}</Badge>
                  <span 
                    onClick={() => {
                      const refObj = r.type === "product" 
                        ? products?.find(p => String(p.id) === String(r.ref))
                        : users?.find(u => String(u.id) === String(r.ref));
                      if (refObj) setView?.(r.type === "product" ? "product" : "store", refObj);
                    }}
                    style={{ fontSize: 11, color: DS.textMuted, cursor: "pointer", textDecoration: "underline transparent" }}
                    onMouseEnter={e => e.currentTarget.style.color = DS.primary}
                    onMouseLeave={e => e.currentTarget.style.color = DS.textMuted}
                  >
                    {r.type === "product" 
                      ? (products?.find(p => String(p.id) === String(r.ref))?.title || "Sản phẩm") 
                      : (users?.find(u => String(u.id) === String(r.ref))?.name || "Người dùng")}
                    · {r.createdAt}
                  </span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: DS.textPrimary, marginBottom: 4 }}>{r.reason}</p>
                <p 
                  onClick={() => {
                    const reporter = users?.find(u => String(u.id) === String(r.reporterId || r.reporter));
                    if (reporter) setView?.("store", reporter);
                  }}
                  style={{ fontSize: 12, color: DS.textMuted, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.color = DS.primary}
                  onMouseLeave={e => e.currentTarget.style.color = DS.textMuted}
                >
                  Người báo cáo: {users?.find(u => String(u.id) === String(r.reporterId || r.reporter))?.name || r.reporter}
                </p>
              </div>
              {r.status === "pending" && (
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button onClick={() => onDismiss && onDismiss(r.id)} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${DS.border}`, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: DS.textSecondary, transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.bgHover}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    Bỏ qua
                  </button>
                  <button onClick={() => onRemoveContent && onRemoveContent(r.ref)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: DS.error, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    🗑️ Gỡ nội dung
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
