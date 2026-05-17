import { useState, useEffect } from "react";
import { DS } from "../../design/tokens";
import { formatPrice } from "../../utils/formatters";
import { Users, Package, DollarSign, Flag, AlertCircle, AlertTriangle, Info, ArrowRight, TrendingUp, Star } from "lucide-react";
import Badge from "../../components/common/Badge";

function AnimatedNumber({ value, isCurrency }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    let cur = 0; const end = parseInt(value, 10);
    if (!end) return;
    const step = end / 50;
    const t = setInterval(() => { cur += step; if (cur >= end) { clearInterval(t); setDisp(end); } else setDisp(Math.floor(cur)); }, 20);
    return () => clearInterval(t);
  }, [value]);
  return <span>{isCurrency ? formatPrice(disp) : disp.toLocaleString("vi-VN")}</span>;
}

function StatCard({ label, val, icon, color, trend, isCurrency, onClick }) {
  return (
    <div onClick={onClick} className="glass-panel" style={{ padding: 24, borderRadius: 20, cursor: onClick ? "pointer" : "default", transition: "transform 0.2s" }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, background: `${color}18`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{icon}</div>
        <span style={{ fontSize: 12, fontWeight: 800, color: trend?.startsWith("+") ? DS.success : DS.error, background: trend?.startsWith("+") ? DS.successLight : DS.errorLight, padding: "4px 10px", borderRadius: 20, alignSelf: "flex-start" }}>{trend}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color: DS.textPrimary, letterSpacing: "-0.02em" }}>
        <AnimatedNumber value={val} isCurrency={isCurrency} />
      </div>
      <div style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7"];
const REV_DATA = [32, 48, 28, 72, 55, 88, 65];

export default function OverviewTab({ users, products, stats, pendingProducts, recentActivity, setActiveTab }) {
  const alertCount = (pendingProducts?.length || 0) + (stats?.reports?.filter(r => r.status === "pending")?.length || 0);
  const bannedCount = users?.filter(u => u.banned)?.length || 0;

  const insights = [
    pendingProducts?.length > 0 && { type: "warn", text: `${pendingProducts.length} sản phẩm đang chờ kiểm duyệt`, action: "products" },
    stats?.reports?.some(r => r.status === "pending") && { type: "danger", text: `${stats.reports.filter(r=>r.status==="pending").length} báo cáo chưa xử lý`, action: "reports" },
    bannedCount > 0 && { type: "info", text: `${bannedCount} tài khoản đang bị khóa`, action: "users" },
  ].filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Smart Insights Banner */}
      {insights.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>⚡ Cần xử lý ngay</h3>
          {insights.map((ins, i) => (
            <div key={i} onClick={() => setActiveTab(ins.action)} className="glass-panel" style={{ padding: "14px 20px", borderRadius: 14, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", borderLeft: `4px solid ${ins.type === "danger" ? DS.error : ins.type === "warn" ? DS.warning : DS.info}`, transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <span style={{ display: "flex", color: ins.type === "danger" ? DS.error : ins.type === "warn" ? DS.warning : DS.info }}>
                {ins.type === "danger" ? <AlertCircle size={20} /> : ins.type === "warn" ? <AlertTriangle size={20} /> : <Info size={20} />}
              </span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{ins.text}</span>
              <span style={{ fontSize: 12, color: DS.primary, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>Xử lý <ArrowRight size={14} /></span>
            </div>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        <StatCard label="Tổng người dùng" val={users?.length || 0} icon={<Users size={24} color={DS.primary} />} color={DS.primary} trend="+12%" onClick={() => setActiveTab("users")} />
        <StatCard label="Tổng sản phẩm" val={products?.length || 0} icon={<Package size={24} color="#059669" />} color="#059669" trend="+8%" onClick={() => setActiveTab("products")} />
        <StatCard label="Doanh thu ước tính" val={stats?.totalRevenue || 54200000} icon={<DollarSign size={24} color="#7C3AED" />} color="#7C3AED" trend="+15%" isCurrency />
        <StatCard label="Báo cáo vi phạm" val={stats?.reports?.length || 0} icon={<Flag size={24} color={DS.error} />} color={DS.error} trend="-5%" onClick={() => setActiveTab("reports")} />
      </div>

      {/* Chart + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div className="glass-panel" style={{ padding: 28, borderRadius: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800 }}>📈 Doanh thu theo tháng</h3>
            <span style={{ fontSize: 12, color: DS.textMuted, background: DS.bgHover, padding: "4px 12px", borderRadius: 20 }}>2025</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180, position: "relative" }}>
            {/* Y axis lines */}
            {[25, 50, 75, 100].map(pct => (
              <div key={pct} style={{ position: "absolute", left: 0, right: 0, bottom: `${pct}%`, borderTop: `1px dashed ${DS.border}`, zIndex: 0 }} />
            ))}
            {REV_DATA.map((h, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
                <span style={{ fontSize: 10, color: DS.textMuted, fontWeight: 700 }}>{Math.round(h * 0.8)}tr</span>
                <div style={{ width: "100%", height: `${h}%`, background: i === 5 ? DS.gradientPrimary : "rgba(108,99,255,0.2)", borderRadius: "6px 6px 0 0", transition: "height 1s cubic-bezier(0.16,1,0.3,1)" }} />
                <span style={{ fontSize: 11, color: DS.textSecondary, fontWeight: 600 }}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 24, borderRadius: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: DS.success, animation: "pulse 1.5s infinite" }} />
            Live Activity
          </h3>
          {(recentActivity || [
            { icon: "👤", text: "Nguyễn Văn A đăng ký", time: "Vừa xong", color: DS.primaryLight },
            { icon: "💰", text: "Đơn #3842 hoàn tất", time: "5 phút", color: DS.successLight },
            { icon: "📦", text: "Sản phẩm mới chờ duyệt", time: "10 phút", color: DS.warningLight },
            { icon: "🚩", text: "Báo cáo vi phạm #1092", time: "15 phút", color: DS.errorLight },
          ]).map((log, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 3 ? `1px solid ${DS.border}` : "none", alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: log.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{log.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: DS.textPrimary, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.text}</p>
                <p style={{ fontSize: 11, color: DS.textMuted }}>{log.time?.includes(':') ? log.time : `${log.time} trước`}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by category */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>🏷️ Phân tích theo danh mục</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { cat: "Điện tử", icon: "💻", rev: 50000000, pct: 46 },
            { cat: "Thời trang", icon: "👗", rev: 20000000, pct: 18 },
            { cat: "Nội thất", icon: "🪑", rev: 14000000, pct: 13 },
            { cat: "Sách vở", icon: "📚", rev: 8000000, pct: 7 },
          ].map((c, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 14, background: DS.bgHover, border: `1px solid ${DS.border}` }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, marginBottom: 4 }}>{c.cat}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: DS.primary }}>{formatPrice(c.rev)}</div>
              <div style={{ marginTop: 8, height: 4, background: DS.border, borderRadius: 4 }}>
                <div style={{ width: `${c.pct}%`, height: "100%", background: DS.gradientPrimary, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 4 }}>{c.pct}% tổng DT</div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <TrendingUp size={22} color={DS.primary} /> Phân tích xu hướng (AI Insights)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Trending Categories */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: DS.textSecondary, marginBottom: 16 }}>Danh mục thịnh hành</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { name: "Thời trang nam", growth: "+45%", val: 120 },
                { name: "Đồ điện tử", growth: "+28%", val: 85 },
                { name: "Phụ kiện", growth: "+12%", val: 42 },
              ].map((cat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: DS.success }}>{cat.growth}</span>
                    </div>
                    <div style={{ height: 6, background: DS.bgHover, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(cat.val / 150) * 100}%`, background: DS.gradientPrimary, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sellers */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: DS.textSecondary, marginBottom: 16 }}>Người bán tiêu biểu</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {users?.slice(0, 3).map((u, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={u.avatar} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{u.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Star size={10} fill="#F59E0B" color="#F59E0B" />
                        <span style={{ fontSize: 11, color: DS.textMuted }}>4.9 (28 đánh giá)</span>
                      </div>
                    </div>
                  </div>
                  <Badge color={DS.primary} bg={DS.primaryLight}>Top {i+1}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
