import { useState } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Flag, 
  Ticket, 
  Lightbulb, 
  Settings,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Tag,
  Megaphone
} from "lucide-react";

// Import modular tabs
import OverviewTab from "./admin/OverviewTab";
import ProductsTab from "./admin/ProductsTab";
import UsersTab from "./admin/UsersTab";
import ReportsTab from "./admin/ReportsTab";
import SettingsTab from "./admin/SettingsTab";
import PromotionsTab from "./admin/PromotionsTab";
import VouchersTab from "./admin/VouchersTab";
import DisputesTab from "./admin/DisputesTab";

export default function AdminPage() {
  const { setView, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [refresh, setRefresh] = useState(0);

  // API Data
  const { data: stats, loading: statsLoading } = useApi(() => fakeApi.getAdminStats(), [refresh]);
  const { data: products, loading: prodLoading } = useApi(() => fakeApi.getProductsAdmin(), [refresh]);
  const { data: users, loading: usersLoading } = useApi(() => fakeApi.getAllUsers(), [refresh]);
  const { data: pendingProducts } = useApi(() => fakeApi.getPendingProducts(), [refresh]);
  const { data: settings } = useApi(() => fakeApi.getSystemSettings(), [refresh]);
  const { data: suggestions } = useApi(() => fakeApi.getAdminMessages(), [refresh]);
  const { data: recentActivity } = useApi(() => fakeApi.getRecentActivity(), [refresh]);

  if (statsLoading || prodLoading || usersLoading) return <Spinner text="Đang tải dữ liệu Admin..." />;

  const pendingCount = pendingProducts?.length || 0;
  const reportsCount = stats?.reports?.filter(r => r.status === "pending")?.length || 0;

  const sidebarItems = [
    { id: "overview", label: "Tổng quan", icon: <LayoutDashboard size={20} /> },
    { id: "products", label: "Sản phẩm", icon: <Package size={20} />, badge: pendingCount },
    { id: "users", label: "Người dùng", icon: <Users size={20} /> },
    { id: "reports", label: "Báo cáo", icon: <Flag size={20} />, badge: reportsCount },
    { id: "promotions", label: "Khuyến mãi", icon: <Megaphone size={20} /> },
    { id: "vouchers", label: "Vouchers", icon: <Ticket size={20} /> },
    { id: "disputes", label: "Tranh chấp", icon: <ShieldCheck size={20} /> },
    { id: "suggestions", label: "Đề xuất", icon: <Lightbulb size={20} />, badge: suggestions?.filter(s => s.status === 'unread').length },
    { id: "settings", label: "Cài đặt", icon: <Settings size={20} /> },
  ];

  // Handlers
  const handleRefresh = () => setRefresh(r => r + 1);

  const handleToggleBan = async (id) => {
    await fakeApi.toggleUserBan(id);
    showToast("Đã cập nhật trạng thái người dùng");
    handleRefresh();
  };

  const handleToggleVerify = async (id) => {
    await fakeApi.toggleUserVerify(id);
    showToast("Đã cập nhật xác minh");
    handleRefresh();
  };

  const handleRemoveProduct = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      await fakeApi.removeProduct(id);
      showToast("Đã xóa sản phẩm");
      handleRefresh();
    }
  };

  const handleApproveProduct = async (id) => {
    // Assuming a generic update status for approval
    await fakeApi.updateProduct(id, { status: "available" }); 
    showToast("Đã duyệt sản phẩm");
    handleRefresh();
  };

  const handleRemoveContent = async (ref) => {
    // Determine if ref is product or user
    if (ref.startsWith("p")) await fakeApi.removeProduct(ref);
    else await fakeApi.toggleUserBan(ref);
    showToast("Đã gỡ nội dung vi phạm");
    handleRefresh();
  };

  const handleDismissReport = async (id) => {
    await fakeApi.dismissReport(id);
    showToast("Đã bỏ qua báo cáo");
    handleRefresh();
  };

  const handleUpdateSettings = async (data) => {
    await fakeApi.updateSystemSettings(data);
    showToast("Đã lưu cài đặt hệ thống");
    handleRefresh();
  };

  const handleMarkAllRead = async () => {
    await fakeApi.markAllSuggestionsRead();
    showToast("Đã đánh dấu tất cả là đã đọc");
    handleRefresh();
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: DS.bgMain, fontFamily: "'Be Vietnam Pro', sans-serif", overflow: "hidden" }}>

      {/* Sidebar */}
      <div className="glass-sidebar" style={{ width: 280, background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "4px 0 24px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <ShieldCheck size={32} color={DS.primary} />
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em", color: "#fff" }}>HMO ADMIN</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: DS.success }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>System Online</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
          {sidebarItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                borderRadius: 14, cursor: "pointer", transition: "all 0.2s",
                background: activeTab === item.id ? "rgba(255,255,255,0.1)" : "transparent",
                color: activeTab === item.id ? "#fff" : "rgba(255,255,255,0.5)",
                fontWeight: activeTab === item.id ? 700 : 500,
                transform: activeTab === item.id ? "translateX(4px)" : "none",
              }}
              onMouseEnter={e => { if (activeTab !== item.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={e => { if (activeTab !== item.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", opacity: activeTab === item.id ? 1 : 0.7 }}>{item.icon}</span>
              <span style={{ fontSize: 14, flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ background: item.id === "reports" ? DS.error : DS.primary, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10, minWidth: 20, textAlign: "center" }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </nav>

        <div style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Button fullWidth variant="outline" style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", borderRadius: 12 }} onClick={() => setView("home")}>
            ↩ Quay về Shop
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 80, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", borderBottom: `1px solid ${DS.border}`, zIndex: 10 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: DS.textPrimary, letterSpacing: "-0.02em" }}>
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>Trang quản trị hệ thống Hand-Me-On</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary }}>Admin HMO</p>
              <p style={{ fontSize: 11, color: DS.success, fontWeight: 700 }}>Root Access</p>
            </div>
            <img src="https://i.pravatar.cc/150?u=admin" style={{ width: 44, height: 44, borderRadius: 14, border: `2px solid ${DS.border}` }} />
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: 40, background: "#F8FAFC" }}>
          {activeTab === "overview" && (
            <OverviewTab 
              users={users} 
              products={products} 
              stats={stats} 
              pendingProducts={pendingProducts} 
              recentActivity={recentActivity}
              setActiveTab={setActiveTab} 
              setView={setView}
            />
          )}

          {activeTab === "products" && (
            <ProductsTab 
              products={products} 
              users={users}
              onApprove={handleApproveProduct} 
              onRemove={handleRemoveProduct} 
              onRefresh={handleRefresh} 
              setView={setView}
            />
          )}

          {activeTab === "users" && (
            <UsersTab 
              users={users} 
              onToggleBan={handleToggleBan} 
              onToggleVerify={handleToggleVerify} 
              onRefresh={handleRefresh} 
              setView={setView}
            />
          )}

          {activeTab === "reports" && (
            <ReportsTab 
              reports={stats?.reports} 
              users={users}
              products={products}
              onRemoveContent={handleRemoveContent} 
              onDismiss={handleDismissReport} 
              setView={setView}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab 
              settings={settings} 
              onUpdate={handleUpdateSettings} 
            />
          )}

          {activeTab === "promotions" && (
            <PromotionsTab 
              products={products}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === "vouchers" && (
            <VouchersTab />
          )}

          {activeTab === "disputes" && (
            <DisputesTab />
          )}

          {activeTab === "suggestions" && (
            <div style={{ animation: "fadeIn 0.4s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>Đề xuất từ người dùng</h3>
                  <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>Tin nhắn phản hồi và góp ý từ cộng đồng</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Badge color={DS.primary}>{suggestions?.length || 0} tin nhắn</Badge>
                  {suggestions?.some(s => s.status === 'unread') && (
                    <Button variant="outline" size="sm" onClick={handleMarkAllRead}>Đánh dấu đã đọc</Button>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                {suggestions?.map(s => {
                  const suggestedUser = users?.find(u => u.id === s.userId);
                  return (
                    <div key={s.id} style={{ background: "#fff", padding: 24, borderRadius: 20, border: `1px solid ${DS.border}`, position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={suggestedUser?.avatar || "https://ui-avatars.com/api/?name=User"} style={{ width: 28, height: 28, borderRadius: "50%" }} />
                          <span style={{ fontWeight: 800, fontSize: 14 }}>{suggestedUser?.name || `Người dùng #${s.userId}`}</span>
                        </div>
                        <span style={{ fontSize: 12, color: DS.textMuted }}>{new Date(s.createdAt).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: 15, lineHeight: 1.6, color: DS.textPrimary }}>{s.content}</p>
                      {s.status === 'unread' && <div style={{ position: "absolute", top: 24, left: -4, width: 8, height: 8, background: DS.primary, borderRadius: "50%" }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
      
      <style>{`
        .glass-panel {
          background: #ffffff;
          border: 1px solid ${DS.border};
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; borderRadius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}
