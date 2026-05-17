import { useState } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import Button from "../components/common/Button";

export default function UserHubPage() {
  const { user, setView, handleLogout } = useApp();

  const buyItems = [
    { id: "orders", icon: "📦", label: "Đơn mua của tôi", color: DS.primary },
    { id: "watchlist", icon: "❤️", label: "Sản phẩm yêu thích", color: DS.primary },
    { id: "cart", icon: "🛒", label: "Giỏ hàng", color: DS.primary },
  ];

  const sellItems = [
    { id: "dashboard", icon: "📊", label: "Kênh Người bán", color: DS.success },
    { id: "listing", icon: "➕", label: "Đăng bán mới", color: DS.success },
    { id: "seller_orders", icon: "🤝", label: "Quản lý Đơn bán", color: DS.success },
  ];

  const middleItems = [
    { id: "messaging", icon: "💬", label: "Tin nhắn", color: "#6366F1" },
    { id: "notifications", icon: "🔔", label: "Thông báo", color: DS.primary },
    { id: "coins", icon: "🪙", label: "Ví HMO", color: "#F59E0B" },
    { id: "profile", icon: "⚙️", label: "Cài đặt tài khoản", color: "#64748B" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      
      {/* Header Profile Summary */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 48, background: "#fff", padding: 24, borderRadius: 24, border: `1px solid ${DS.border}`, boxShadow: DS.shadowSm }}>
        <img 
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}`} 
          style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${DS.primary}22` }} 
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Chào bạn, {user?.name}!</h2>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div style={{ fontSize: 13, color: DS.textSecondary }}>⭐ <strong style={{ color: DS.textPrimary }}>{user?.rating || 5.0}</strong> Đánh giá</div>
            <div style={{ fontSize: 13, color: DS.textSecondary }}>👥 <strong style={{ color: DS.textPrimary }}>{user?.followers?.length || 0}</strong> Người theo dõi</div>
            <div style={{ fontSize: 13, color: DS.textSecondary }}>📦 <strong style={{ color: DS.textPrimary }}>{user?.sales || 0}</strong> Đã bán</div>
          </div>
        </div>
        <Button variant="ghost" onClick={() => { handleLogout(); }}>Đăng xuất 🚪</Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
        
        {/* LEFT: BUYING SECTION */}
        <section style={{ background: "#fff", borderRadius: 32, padding: 32, border: `1px solid ${DS.primary}33`, boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: DS.primary, margin: 0 }}>MUA HÀNG</h3>
            <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Dành cho người tiêu dùng</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {buyItems.map(item => (
              <HubButton key={item.id} {...item} onClick={() => setView(item.id)} />
            ))}
          </div>
        </section>

        {/* MIDDLE: SHARED UTILITIES */}
        <section style={{ background: "#F8FAFC", borderRadius: 32, padding: 32, border: `1px solid ${DS.border}`, boxShadow: DS.shadowSm }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#475569", margin: 0 }}>TIỆN ÍCH CHUNG</h3>
            <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Công cụ hỗ trợ & Ví</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {middleItems.map(item => (
              <HubButton key={item.id} {...item} onClick={() => setView(item.id)} />
            ))}
          </div>
        </section>

        {/* RIGHT: SELLING SECTION */}
        <section style={{ background: "#fff", borderRadius: 32, padding: 32, border: `1px solid ${DS.success}33`, boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.1)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: DS.success, margin: 0 }}>BÁN HÀNG</h3>
            <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Dành cho người kinh doanh</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sellItems.map(item => (
              <HubButton key={item.id} {...item} onClick={() => setView(item.id)} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function HubButton({ icon, label, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button 
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{ 
        display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", 
        borderRadius: 20, border: `1px solid ${hov ? color : DS.border}`, 
        background: hov ? `${color}08` : "#fff", cursor: "pointer", 
        transition: "all 0.2s", textAlign: "left", width: "100%"
      }}
    >
      <span style={{ fontSize: 24, filter: hov ? "none" : "grayscale(0.5)" }}>{icon}</span>
      <span style={{ fontSize: 15, fontWeight: 800, color: hov ? color : DS.textPrimary }}>{label}</span>
      <span style={{ marginLeft: "auto", fontSize: 14, color: DS.textMuted, opacity: hov ? 1 : 0.5 }}>❯</span>
    </button>
  );
}
