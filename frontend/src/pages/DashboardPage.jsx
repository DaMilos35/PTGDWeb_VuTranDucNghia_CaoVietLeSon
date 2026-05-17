// ============================================================
// PAGE 5: DASHBOARD — Hand-Me-On
// ============================================================

import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

function StatCard({ icon, label, value, color, trend }) {
  return (
    <div style={{
      background: "#fff", borderRadius: DS.radiusLg,
      border: `1px solid ${DS.border}`, padding: "22px 24px",
      boxShadow: DS.shadowSm, transition: "box-shadow 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{
          width: 46, height: 46, borderRadius: DS.radiusMd,
          background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{icon}</div>
        {trend && <span style={{ fontSize: 12, color: DS.success, fontWeight: 700, background: DS.successLight, padding: "3px 8px", borderRadius: DS.radiusFull }}>{trend}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 4, letterSpacing: "-0.03em" }}>{value}</div>
      <div style={{ fontSize: 13, color: DS.textMuted }}>{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, setView, setSelectedProduct } = useApp();
  const userId = user?.id || "u2";
  const { data: stats, loading: statsLoading } = useApi(() => fakeApi.getSellerDashboardStats(userId), [userId]);
  const { data: products } = useApi(() => fakeApi.getProducts(), []);

  if (statsLoading) return <Spinner text="Loading dashboard..." />;

  const myProducts = products?.filter((p) => p.sellerId === userId) || [];
  const maxRevenue = stats ? Math.max(...stats.revenueChart) : 1;

  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", padding: "36px 28px", fontFamily: "Be Vietnam Pro, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: DS.textPrimary, letterSpacing: "-0.03em", marginBottom: 6 }}>
            Kênh Người Bán
          </h1>
          <p style={{ color: DS.textMuted, fontSize: 15 }}>Chào mừng trở lại, {user?.name || "Người bán"}! Chúc bạn một ngày chốt nghìn đơn.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button onClick={() => setView("orders")} size="md" variant="outline">📦 Quản lý đơn</Button>
          <Button onClick={() => setView("listing")} size="md">+ Đăng sản phẩm mới</Button>
        </div>
      </div>

      {/* To Do List */}
      <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 24, boxShadow: DS.shadowSm, marginBottom: 28 }}>
        <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary, marginBottom: 20 }}>📌 Việc cần làm</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Chờ xác nhận", val: stats?.todo?.pendingConfirm || 0, color: DS.warning },
            { label: "Chờ lấy hàng", val: stats?.todo?.pendingPickup || 0, color: DS.primary },
            { label: "Đã xử lý", val: stats?.todo?.processed || 0, color: DS.success },
            { label: "Đơn hủy/hoàn", val: stats?.todo?.cancelled || 0, color: DS.error }
          ].map((item, i) => (
            <div key={i} onClick={() => setView("orders")} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", background: DS.bgHover, borderRadius: DS.radiusMd, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
              <span style={{ fontSize: 28, fontWeight: 900, color: item.color }}>{item.val}</span>
              <span style={{ fontSize: 13, color: DS.textSecondary, fontWeight: 600, marginTop: 4 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phân tích bán hàng */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
        <StatCard icon="💰" label="Doanh thu (tháng này)" value={formatPrice(stats?.revenue || 0)} color={DS.success} trend={stats?.trends?.revenue} />
        <StatCard icon="📦" label="Đơn hàng" value={stats?.totalSales || 0} color={DS.primary} trend={stats?.trends?.sales} />
        <StatCard icon="👁️" label="Lượt truy cập" value={"1,245"} color={DS.warning} trend={"+15%"} />
        <StatCard icon="⭐" label="Đánh giá Shop" value={`${stats?.avgRating || 0} / 5.0`} color="#9B59B6" trend={stats?.trends?.rating} />
      </div>

      {/* Hai cột: Biểu đồ & Công cụ Marketing */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 28, marginBottom: 32 }}>
        
        {/* Revenue Chart */}
        <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary }}>📈 Phân tích bán hàng</h3>
            <Badge size="sm">6 Tháng qua</Badge>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 160 }}>
            {stats?.revenueChart.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: DS.textMuted, fontWeight: 700 }}>
                  {(v / 1000000).toFixed(1)}M
                </span>
                <div style={{
                  width: "100%",
                  borderRadius: "6px 6px 0 0",
                  background: i === stats.revenueChart.length - 1
                    ? DS.gradientPrimary
                    : `${DS.primary}40`,
                  height: `${(v / maxRevenue) * 100}%`,
                  minHeight: 4,
                  transition: "height 0.6s cubic-bezier(0.4,0,0.2,1)",
                }} />
                <span style={{ fontSize: 12, color: DS.textMuted, fontWeight: 500 }}>{stats.months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Tools */}
        <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary, marginBottom: 20 }}>🎯 Công cụ Marketing</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "🎟️", title: "Mã giảm giá của Shop", desc: "Tạo voucher để thu hút khách hàng", mode: 'voucher' },
              { icon: "⚡", title: "Chương trình Flash Sale", desc: "Đẩy nhanh doanh số bằng sale chớp nhoáng", mode: 'flash' },
              { icon: "🎁", title: "Combo Khuyến mãi", desc: "Mua nhiều giảm sâu", mode: 'combo' },
              { icon: "📢", title: "Quảng cáo Khám phá", desc: "Tiếp cận thêm nhiều người mua", mode: 'boost' },
            ].map((tool, i) => (
              <div 
                key={i} 
                onClick={() => setView("create-listing", { mode: tool.mode })}
                style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px", border: `1px solid ${DS.border}`, borderRadius: DS.radiusMd, cursor: "pointer", transition: "all 0.2s" }} 
                onMouseEnter={e => e.currentTarget.style.borderColor = DS.primary} 
                onMouseLeave={e => e.currentTarget.style.borderColor = DS.border}
              >
                <div style={{ fontSize: 24, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: DS.bgHover, borderRadius: DS.radiusMd }}>{tool.icon}</div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, marginBottom: 2 }}>{tool.title}</h4>
                  <p style={{ fontSize: 12, color: DS.textMuted }}>{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* eBay/Amazon Style Growth Opportunities */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 32 }}>
        
        {/* Growth Opportunities */}
        <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            🚀 Cơ hội tăng trưởng <Badge color={DS.primary} bg={DS.primaryLight}>AI Gợi ý</Badge>
          </h3>
          <p style={{ fontSize: 13, color: DS.textMuted, marginBottom: 20 }}>Dựa trên dữ liệu thị trường, chúng tôi đề xuất bạn:</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { t: "Nhu cầu cao: Laptop cũ dưới 15tr", d: "Số lượng tìm kiếm tăng 40% trong tuần qua.", icon: "💻", action: "Đăng bán ngay" },
              { t: "Hàng của bạn đang thiếu Video", d: "Sản phẩm có video thường bán nhanh hơn gấp 2 lần.", icon: "🎥", action: "Thêm video" },
              { t: "Tối ưu hóa giá bán", d: "Sản phẩm 'iPhone 13' của bạn đang cao hơn 5% so với mặt bằng.", icon: "📉", action: "Xem chi tiết" }
            ].map((opp, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: 16, background: DS.bgHover, borderRadius: DS.radiusMd }}>
                <div style={{ fontSize: 24 }}>{opp.icon}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary }}>{opp.t}</h4>
                  <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>{opp.d}</p>
                </div>
                <Button size="sm" variant="outline" style={{ height: "fit-content" }}>{opp.action}</Button>
              </div>
            ))}
          </div>
        </div>

        {/* eBay Pro Tips */}
        <div style={{ background: "linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)", borderRadius: DS.radiusLg, padding: 28, border: `1px solid ${DS.border}` }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary, marginBottom: 20 }}>🏆 Bí kíp bán hàng Pro</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { t: "Phản hồi tin nhắn nhanh", d: "Tỷ lệ chốt đơn tăng 60% nếu bạn trả lời khách trong vòng 5 phút.", color: DS.primary },
              { t: "Sử dụng Boost đúng thời điểm", d: "Khung giờ 19h - 21h là lúc lượng truy cập cao nhất để đẩy tin.", color: DS.warning },
              { t: "Chụp ảnh trên nền trắng", d: "Ảnh sạch sẽ chuyên nghiệp giúp khách hàng tin tưởng hơn.", color: DS.success }
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: tip.color, marginTop: 6, flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary }}>{tip.t}</h4>
                  <p style={{ fontSize: 13, color: DS.textSecondary, marginTop: 4, lineHeight: 1.5 }}>{tip.d}</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: 16, background: "#fff", borderRadius: DS.radiusMd, border: `1px dashed ${DS.primary}` }}>
              <p style={{ fontSize: 12, color: DS.textPrimary, fontWeight: 700, textAlign: "center" }}>
                💡 Bạn muốn trở thành "Người bán Kim Cương"? <br />
                <span style={{ color: DS.primary, cursor: "pointer" }}>Tham gia Hand-Me-On Academy ➔</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Listings */}
      <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary }}>Sản phẩm đang bán</h3>
          <Button onClick={() => setView("listing")} size="sm" variant="outline">+ Đăng thêm</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {myProducts.length === 0 ? (
            <p style={{ color: DS.textMuted, textAlign: "center", padding: "32px 0" }}>Chưa có sản phẩm nào.</p>
          ) : myProducts.map((p, i) => (
            <div key={p.id} onClick={() => { setSelectedProduct(p); setView("product"); }} style={{
              display: "flex", alignItems: "center", gap: 18, cursor: "pointer",
              padding: "16px 0", borderBottom: i < myProducts.length - 1 ? `1px solid ${DS.border}` : "none",
            }}>
              <img src={p.images[0]} alt="" style={{ width: 60, height: 60, borderRadius: DS.radiusMd, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: DS.textPrimary, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                <p style={{ fontSize: 13, color: DS.textMuted, display: "flex", gap: 12 }}>
                  <span>👁 {p.views} lượt xem</span>
                  <span>❤️ {p.watchers || 0} người quan tâm</span>
                  <span>📍 {p.location}</span>
                </p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 17, color: DS.textPrimary, letterSpacing: "-0.02em" }}>
                  {formatPrice(p.price)}
                </p>
                <div style={{ marginTop: 6 }}>
                  <Badge color={p.format === "auction" ? DS.warning : DS.success} size="xs">
                    {p.format === "auction" ? "⏱ Đấu giá" : "🛒 Bán ngay"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
