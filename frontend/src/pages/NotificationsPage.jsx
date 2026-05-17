import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import fakeApi from "../database/fakeApi";
import useApi from "../hooks/useApi";
import Button from "../components/common/Button";
import BackBtn from "../components/common/BackBtn";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import { Bell, ShoppingBag, MessageSquare, CreditCard, User, MoreHorizontal, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const { user, showToast, setNotifCount } = useApp();
  const { data: notifications, loading, refresh } = useApi(() => fakeApi.getNotifications(user?.id), [user?.id]);
  const [filter, setFilter] = useState("all");

  const filteredNotifs = notifications?.filter(n => {
    if (filter === "all") return true;
    return n.type === filter;
  });

  const handleMarkRead = async (id) => {
    await fakeApi.markNotificationsRead(user.id, [id]);
    refresh();
    const fresh = await fakeApi.getNotifications(user.id);
    setNotifCount(fresh.filter(n => !n.read).length);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await fakeApi.markNotificationsRead(user.id, unreadIds);
    showToast("Đã đánh dấu tất cả là đã đọc");
    refresh();
    setNotifCount(0);
  };

  const getIcon = (type) => {
    switch (type) {
      case "order": return <ShoppingBag size={18} color="#3B82F6" />;
      case "message": return <MessageSquare size={18} color="#6C63FF" />;
      case "payment": return <CreditCard size={18} color="#10B981" />;
      case "social": return <User size={18} color="#F59E0B" />;
      default: return <Bell size={18} color={DS.textMuted} />;
    }
  };

  if (!user) return (
    <div style={{ padding: 100, textAlign: "center", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <Bell size={64} color={DS.border} style={{ marginBottom: 20 }} />
      <h2 style={{ fontWeight: 800 }}>Vui lòng đăng nhập để xem thông báo</h2>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Be Vietnam Pro, sans-serif", minHeight: "80vh" }}>
      <BackBtn />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: DS.textPrimary, marginBottom: 8, letterSpacing: "-0.03em" }}>Thông báo</h1>
          <p style={{ color: DS.textMuted, fontSize: 16 }}>Cập nhật những hoạt động mới nhất từ tài khoản của bạn.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Đánh dấu đã đọc tất cả</Button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
        {[
          { id: "all", label: "Tất cả" },
          { id: "order", label: "📦 Đơn hàng" },
          { id: "message", label: "💬 Tin nhắn" },
          { id: "payment", label: "💰 Thanh toán" },
          { id: "social", label: "👤 Xã hội" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "8px 16px", borderRadius: DS.radiusFull, border: `1px solid ${filter === f.id ? DS.primary : DS.border}`,
              background: filter === f.id ? DS.primaryLight : "#fff", color: filter === f.id ? DS.primary : DS.textSecondary,
              fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s"
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${DS.border}`, background: "#fff" }}>
        {loading ? (
          <div style={{ padding: 60 }}><Spinner /></div>
        ) : filteredNotifs?.length === 0 ? (
          <div style={{ padding: 80, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📭</div>
            <p style={{ color: DS.textMuted, fontWeight: 600 }}>Không có thông báo nào trong mục này</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredNotifs.map((n, i) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                style={{
                  padding: "20px 24px", display: "flex", gap: 16, borderBottom: i === filteredNotifs.length - 1 ? "none" : `1px solid ${DS.border}`,
                  background: n.read ? "transparent" : `${DS.primary}05`, cursor: "pointer", transition: "all 0.2s", position: "relative"
                }}
                onMouseEnter={e => e.currentTarget.style.background = n.read ? DS.bgHover : `${DS.primary}10`}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : `${DS.primary}05`}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: DS.shadowSm }}>
                  {getIcon(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <h4 style={{ fontSize: 15, fontWeight: n.read ? 600 : 800, color: DS.textPrimary, margin: 0, lineHeight: 1.4 }}>{n.title}</h4>
                    <span style={{ fontSize: 11, color: DS.textMuted, whiteSpace: "nowrap" }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: 14, color: DS.textSecondary, marginTop: 4, lineHeight: 1.5 }}>{n.text}</p>
                </div>
                {!n.read && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.primary, position: "absolute", right: 24, top: 46 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
