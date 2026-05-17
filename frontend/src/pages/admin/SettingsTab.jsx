import { useState, useEffect } from "react";
import { DS } from "../../design/tokens";
import Button from "../../components/common/Button";
import fakeApi from "../../database/fakeApi";

export default function SettingsTab({ settings, onUpdate }) {
  const [formData, setFormData] = useState({
    siteName: "Hand-Me-On",
    maintenanceMode: false,
    platformFee: 5,
    allowRegistration: true,
    maxListingPerUser: 50,
    contactEmail: "admin@handmeon.vn",
    globalAnnouncement: "",
    autoApproveProducts: false,
  });

  useEffect(() => {
    if (settings) setFormData(prev => ({ ...prev, ...settings }));
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate?.(formData);
  };

  const handleResetDB = async () => {
    if (window.confirm("CẢNH BÁO: Hành động này sẽ xóa toàn bộ dữ liệu hiện tại và đưa hệ thống về trạng thái ban đầu. Bạn có chắc chắn?")) {
      const res = await fakeApi.resetDatabase();
      alert(res.message);
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* General Settings */}
        <section className="glass-panel" style={{ padding: 32, borderRadius: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>🌐 Cấu hình chung</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: DS.textSecondary }}>Tên nền tảng</label>
              <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${DS.border}`, outline: "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: DS.textSecondary }}>Email liên hệ</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${DS.border}`, outline: "none" }} />
            </div>
          </div>
        </section>

        {/* Business Settings */}
        <section className="glass-panel" style={{ padding: 32, borderRadius: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>💰 Kinh doanh & Vận hành</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: DS.textSecondary }}>Phí sàn (%)</label>
              <div style={{ position: "relative" }}>
                <input type="number" name="platformFee" value={formData.platformFee} onChange={handleChange} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${DS.border}`, outline: "none" }} />
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: DS.textMuted }}>%</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: DS.textSecondary }}>Giới hạn tin đăng / User</label>
              <input type="number" name="maxListingPerUser" value={formData.maxListingPerUser} onChange={handleChange} style={{ padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${DS.border}`, outline: "none" }} />
            </div>
          </div>
        </section>

        {/* Advanced Controls */}
        <section className="glass-panel" style={{ padding: 32, borderRadius: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>🚀 Kiểm soát nâng cao</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: DS.textSecondary }}>Thông báo toàn sàn (Banner)</label>
              <textarea name="globalAnnouncement" value={formData.globalAnnouncement} onChange={handleChange} placeholder="VD: Bảo trì hệ thống từ 2h-4h sáng mai..." style={{ padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${DS.border}`, outline: "none", minHeight: 80, resize: "vertical" }} />
            </div>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: DS.bgHover, borderRadius: 14, cursor: "pointer" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700 }}>Tự động duyệt sản phẩm</p>
                <p style={{ fontSize: 12, color: DS.textMuted }}>Bỏ qua bước kiểm duyệt thủ công của Admin</p>
              </div>
              <input type="checkbox" name="autoApproveProducts" checked={formData.autoApproveProducts} onChange={handleChange} style={{ width: 20, height: 20, accentColor: DS.primary }} />
            </label>

            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: DS.bgHover, borderRadius: 14, cursor: "pointer" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700 }}>Chế độ bảo trì</p>
                <p style={{ fontSize: 12, color: DS.textMuted }}>Tạm dừng tất cả giao dịch trên sàn</p>
              </div>
              <input type="checkbox" name="maintenanceMode" checked={formData.maintenanceMode} onChange={handleChange} style={{ width: 20, height: 20, accentColor: DS.primary }} />
            </label>
            
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: DS.bgHover, borderRadius: 14, cursor: "pointer" }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700 }}>Cho phép đăng ký mới</p>
                <p style={{ fontSize: 12, color: DS.textMuted }}>Mở/Khóa cổng đăng ký người dùng mới</p>
              </div>
              <input type="checkbox" name="allowRegistration" checked={formData.allowRegistration} onChange={handleChange} style={{ width: 20, height: 20, accentColor: DS.primary }} />
            </label>
          </div>
        </section>

        {/* Danger Zone */}
        <section style={{ padding: 32, borderRadius: 24, border: `2px dashed ${DS.error}50`, background: `${DS.error}05` }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: DS.error, marginBottom: 12 }}>☢️ Vùng nguy hiểm</h3>
          <p style={{ fontSize: 13, color: DS.textMuted, marginBottom: 20 }}>Các hành động dưới đây không thể hoàn tác. Hãy cẩn trọng.</p>
          <Button type="button" onClick={handleResetDB} style={{ background: DS.error, borderColor: DS.error }}>
            Reset toàn bộ dữ liệu (Database Wipe)
          </Button>
        </section>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button type="button" variant="outline" style={{ borderRadius: 12 }}>Hủy thay đổi</Button>
          <Button type="submit" style={{ borderRadius: 12, padding: "12px 32px" }}>Lưu cấu hình</Button>
        </div>
      </form>
    </div>
  );
}
