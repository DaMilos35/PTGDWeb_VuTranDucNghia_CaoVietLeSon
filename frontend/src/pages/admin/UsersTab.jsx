import { useState } from "react";
import { DS } from "../../design/tokens";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

export default function UsersTab({ users, onToggleBan, onToggleVerify, onRefresh, setView }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = (users || []).filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                       u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || 
                        (statusFilter === "banned" ? u.banned : !u.banned);
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search & Filter Bar */}
      <div className="glass-panel" style={{ padding: 20, borderRadius: 20, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, position: "relative", minWidth: 260 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 48px", borderRadius: 12, border: `1.5px solid ${DS.border}`, fontSize: 14, outline: "none" }}
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: "10px 16px", borderRadius: 12, border: `1.5px solid ${DS.border}`, fontSize: 14, background: "#fff", cursor: "pointer", outline: "none" }}>
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="user">Người dùng</option>
        </select>
        <div style={{ display: "flex", gap: 8, background: DS.bgHover, padding: 4, borderRadius: 14 }}>
          {["all", "active", "banned"].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{ padding: "8px 16px", borderRadius: 10, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: statusFilter === f ? "#fff" : "transparent", color: statusFilter === f ? DS.primary : DS.textSecondary, boxShadow: statusFilter === f ? "0 4px 12px rgba(0,0,0,0.05)" : "none", transition: "all 0.2s" }}>
              {f === "all" ? "Tất cả" : f === "active" ? "Hoạt động" : "Bị khóa"}
            </button>
          ))}
        </div>
        <Button variant="outline" onClick={onRefresh} style={{ borderRadius: 12 }}>🔄</Button>
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${DS.border}` }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${DS.border}` }}>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase" }}>Người dùng</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase" }}>Vai trò</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase" }}>Xác minh</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase" }}>Số dư / Coins</th>
                <th style={{ padding: "18px 24px", fontSize: 13, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i === filtered.length - 1 ? "none" : `1px solid ${DS.border}` }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={u.avatar} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <p 
                          onClick={() => setView?.("store", u)}
                          style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, marginBottom: 2, cursor: "pointer" }}
                        >
                          {u.name}
                        </p>
                        <p style={{ fontSize: 11, color: DS.textMuted }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <Badge color={u.role === "admin" ? DS.primary : DS.textSecondary} bg={u.role === "admin" ? DS.primaryLight : DS.bgHover}>
                      {u.role === "admin" ? "🛡️ Admin" : "👤 User"}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div onClick={() => onToggleVerify?.(u.id)} style={{ cursor: "pointer" }}>
                      {u.verified ? <Badge color={DS.success} bg={DS.successLight}>✓ Verified</Badge> : <Badge color={DS.textMuted} bg={DS.bgHover}>Unverified</Badge>}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>💰 {(u.balance || 0).toLocaleString()}đ</div>
                    <div style={{ fontSize: 11, color: DS.textMuted }}>🪙 {(u.coins || 0).toLocaleString()} HMO</div>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button onClick={() => onToggleBan?.(u.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: u.banned ? DS.success : DS.error, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {u.banned ? "Mở khóa" : "Khóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
