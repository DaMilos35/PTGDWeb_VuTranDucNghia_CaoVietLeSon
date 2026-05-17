import { useState } from "react";
import { DS } from "../../design/tokens";
import { formatPrice } from "../../utils/formatters";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

export default function ProductsTab({ products, users, onApprove, onRemove, onRefresh, setView }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (products || []).filter(p => {
    const seller = users?.find(u => u.id === p.sellerId);
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                       p.sellerId.toLowerCase().includes(search.toLowerCase()) ||
                       seller?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "available": return <Badge color={DS.success} bg={DS.successLight}>Đang bán</Badge>;
      case "pending": return <Badge color={DS.warning} bg={DS.warningLight}>Chờ duyệt</Badge>;
      case "sold": return <Badge color={DS.textMuted} bg={DS.bgHover}>Đã bán</Badge>;
      case "reserved": return <Badge color={DS.info} bg={DS.infoLight}>Đang giữ</Badge>;
      default: return <Badge color={DS.textSecondary} bg={DS.bgHover}>{status}</Badge>;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: 20, borderRadius: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, position: "relative", minWidth: 260 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, người bán..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 48px", borderRadius: 12, border: `1.5px solid ${DS.border}`, fontSize: 14, outline: "none", transition: "all 0.2s" }}
            onFocus={e => e.target.style.borderColor = DS.primary}
            onBlur={e => e.target.style.borderColor = DS.border}
          />
        </div>
        <div style={{ display: "flex", gap: 8, background: DS.bgHover, padding: 4, borderRadius: 14 }}>
          {["all", "available", "pending", "sold"].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: statusFilter === f ? "#fff" : "transparent",
                color: statusFilter === f ? DS.primary : DS.textSecondary,
                boxShadow: statusFilter === f ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.2s"
              }}
            >
              {f === "all" ? "Tất cả" : f === "available" ? "Đang bán" : f === "pending" ? "Đang chờ" : "Đã bán"}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={onRefresh} style={{ borderRadius: 12 }}>🔄 Làm mới</Button>
      </div>

      {/* Table Content */}
      <div className="glass-panel" style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${DS.border}` }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${DS.border}` }}>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Sản phẩm</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Giá</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Trạng thái</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Người bán</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 60, textAlign: "center", color: DS.textMuted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                    <div style={{ fontWeight: 600 }}>Không tìm thấy sản phẩm nào!</div>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${DS.border}`, transition: "background 0.2s" }} className="table-row-hover">
                    <td style={{ padding: "16px 24px" }}>
                      <div 
                        onClick={() => setView?.("product", p)}
                        style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                      >
                        <div style={{ position: "relative" }}>
                          <img src={p.images?.[0]} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", background: DS.bgHover }} />
                          {p.condition === "new" && <span style={{ position: "absolute", top: -4, right: -4, background: DS.success, width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff" }} title="Mới" />}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, marginBottom: 2 }}>{p.title}</p>
                          <p style={{ fontSize: 11, color: DS.textMuted }}>{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: DS.primary }}>{formatPrice(p.price)}</span>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      {getStatusBadge(p.status)}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div 
                        onClick={() => {
                          const seller = users?.find(u => u.id === p.sellerId);
                          if (seller) setView?.("store", seller);
                        }}
                        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                      >
                        <span style={{ fontSize: 13, color: DS.textSecondary, fontWeight: 600 }}>
                          {users?.find(u => u.id === p.sellerId)?.name || p.sellerId}
                        </span>
                        <span style={{ fontSize: 10, color: DS.textMuted, background: DS.bgHover, padding: "2px 6px", borderRadius: 4 }}>Seller</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        {p.status === "pending" && (
                          <button onClick={() => onApprove?.(p.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: DS.success, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Duyệt</button>
                        )}
                        <button onClick={() => onRemove?.(p.id)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${DS.error}`, background: "transparent", color: DS.error, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .table-row-hover:hover { background: #F8FAFC !important; }
      `}</style>
    </div>
  );
}
