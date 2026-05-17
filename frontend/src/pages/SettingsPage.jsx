import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Badge from "../components/common/Badge";

const SETTINGS_GROUPS = [
  {
    title: "Tài khoản của tôi",
    icon: "👤",
    items: [
      { id: "profile", label: "Hồ sơ" },
      { id: "bank", label: "Ngân hàng" },
      { id: "address", label: "Địa chỉ" },
      { id: "password", label: "Đổi mật khẩu" },
      { id: "privacy", label: "Thiết lập riêng tư" },
    ]
  },
  {
    title: "Đơn hàng",
    icon: "📦",
    items: [
      { id: "orders", label: "Đơn Mua" },
      { id: "sales", label: "Đơn Bán" }
    ]
  },
  {
    title: "Tiện ích",
    icon: "⭐",
    items: [
      { id: "notif", label: "Thông báo" },
      { id: "voucher", label: "Kho Voucher" }
    ]
  }
];

export default function SettingsPage() {
  const { user, setView, handleUpdateProfile, viewData, showToast } = useApp();
  const [activeMenu, setActiveMenu] = useState(viewData?.subTab || "profile");
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "098xxxxxxx",
    gender: user?.gender || "Nam",
    dob: user?.dob || "1995-01-01",
    bio: user?.bio || ""
  });

  const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });

  useEffect(() => {
    if (viewData?.subTab) setActiveMenu(viewData.subTab);
  }, [viewData?.subTab]);

  const handleSaveProfile = async () => {
    try {
      showToast("Đang cập nhật hồ sơ...", "info");
      await handleUpdateProfile({
        ...user,
        ...profileForm
      });
      showToast("Cập nhật hồ sơ thành công!", "success");
    } catch (e) {
      showToast("Có lỗi xảy ra", "error");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showToast("Đang tải ảnh lên...", "info");
        const { url } = await fakeApi.uploadFile(file);
        await handleUpdateProfile({
          ...user,
          avatar: url
        });
        showToast("Đã cập nhật ảnh đại diện!");
      } catch (err) {
        showToast("Không thể tải ảnh lên", "error");
      }
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "profile":
        return (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ paddingBottom: 20, borderBottom: `1px solid ${DS.border}`, marginBottom: 30 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Hồ Sơ Của Tôi</h2>
              <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
            </div>
            
            <div style={{ display: "flex", gap: 40 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <label style={{ width: 120, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Tên đăng nhập</label>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.id || "user_12345"}</span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <label style={{ width: 120, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Tên</label>
                  <div style={{ flex: 1 }}><Input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} /></div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <label style={{ width: 120, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Email</label>
                  <div style={{ fontSize: 14 }}>
                    {profileForm.email} <button style={{ border: "none", background: "none", color: DS.primary, textDecoration: "underline", cursor: "pointer", marginLeft: 8 }}>Thay đổi</button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <label style={{ width: 120, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Số điện thoại</label>
                  <div style={{ fontSize: 14 }}>
                    {profileForm.phone} <button style={{ border: "none", background: "none", color: DS.primary, textDecoration: "underline", cursor: "pointer", marginLeft: 8 }}>Thay đổi</button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <label style={{ width: 120, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Giới tính</label>
                  <div style={{ display: "flex", gap: 20 }}>
                    {["Nam", "Nữ", "Khác"].map(g => (
                      <label key={g} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
                        <input type="radio" name="gender" checked={profileForm.gender === g} onChange={() => setProfileForm({...profileForm, gender: g})} /> {g}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <label style={{ width: 120, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Ngày sinh</label>
                  <div style={{ flex: 1 }}><Input type="date" value={profileForm.dob} onChange={e => setProfileForm({...profileForm, dob: e.target.value})} /></div>
                </div>

                <div style={{ marginLeft: 140, marginTop: 10 }}>
                  <Button onClick={handleSaveProfile} size="lg" style={{ padding: "10px 30px" }}>Lưu</Button>
                </div>
              </div>

              <div style={{ width: 280, display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: 40, borderLeft: `1px solid ${DS.border}` }}>
                <img 
                  src={user?.avatar || "https://i.pravatar.cc/150"} 
                  alt="Avatar" 
                  style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: `2px solid ${DS.primaryLight}` }} 
                />
                <label style={{ display: "inline-block", cursor: "pointer" }}>
                  <div style={{ 
                    padding: "7px 16px", 
                    fontSize: 13, 
                    borderRadius: DS.radiusSm, 
                    border: `1.5px solid ${DS.primary}`, 
                    color: DS.primary, 
                    fontWeight: 600,
                    textAlign: "center"
                  }}>
                    Chọn ảnh
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    onChange={handleAvatarUpload} 
                  />
                </label>
                <div style={{ marginTop: 16, fontSize: 13, color: DS.textMuted, textAlign: "center", lineHeight: 1.6 }}>
                  Dung lượng file tối đa 1 MB<br/>Định dạng: .JPEG, .PNG
                </div>
              </div>
            </div>
          </div>
        );
      case "password":
        return (
          <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 500 }}>
            <div style={{ paddingBottom: 20, borderBottom: `1px solid ${DS.border}`, marginBottom: 30 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Đổi Mật Khẩu</h2>
              <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <label style={{ width: 150, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Mật khẩu hiện tại</label>
                <div style={{ flex: 1 }}><Input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <label style={{ width: 150, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Mật khẩu mới</label>
                <div style={{ flex: 1 }}><Input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <label style={{ width: 150, textAlign: "right", fontSize: 14, color: "rgba(0,0,0,0.65)" }}>Xác nhận mật khẩu</label>
                <div style={{ flex: 1 }}><Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} /></div>
              </div>
              <div style={{ marginLeft: 170 }}>
                <Button onClick={() => showToast("Đã cập nhật mật khẩu", "success")} size="lg" style={{ padding: "10px 30px" }}>Xác nhận</Button>
              </div>
            </div>
          </div>
        );
      case "bank":
        return (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ paddingBottom: 20, borderBottom: `1px solid ${DS.border}`, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Ngân Hàng & Thẻ</h2>
                <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Quản lý thẻ tín dụng và tài khoản ngân hàng của bạn</p>
              </div>
              <Button onClick={() => showToast("Đã gửi yêu cầu thêm thẻ", "success")} size="sm" style={{ background: DS.primary }}>+ Thêm thẻ mới</Button>
            </div>
            <div style={{ display: "flex", gap: 30 }}>
              {/* 3D Visa Card */}
              <div style={{ 
                width: 320, height: 200, borderRadius: 20, padding: 24, 
                background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
                color: "#fff", position: "relative", overflow: "hidden",
                boxShadow: "0 20px 25px -5px rgba(67, 56, 202, 0.4)",
                display: "flex", flexDirection: "column", justifyContent: "space-between"
              }}>
                <div style={{ position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 24, fontStyle: "italic", fontWeight: 900 }}>VISA</div>
                  <div style={{ width: 40, height: 30, background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)", borderRadius: 4 }} />
                </div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontSize: 22, letterSpacing: 4, fontFamily: "monospace", marginBottom: 8 }}>**** **** **** 8888</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.8 }}>
                    <span>{user?.name?.toUpperCase() || "NGUYEN VAN A"}</span>
                    <span>12/28</span>
                  </div>
                </div>
              </div>

              {/* Bank list */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: 20, borderRadius: 16, border: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 50, height: 50, background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏦</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Ngân hàng Vietcombank</h4>
                      <p style={{ margin: 0, fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Chi nhánh TP.HCM • **** 1234</p>
                    </div>
                  </div>
                  <Badge color={DS.success} bg={DS.successLight}>Mặc định</Badge>
                </div>
                
                <div style={{ padding: 20, borderRadius: 16, border: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 50, height: 50, background: "#F3F4F6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💳</div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>MoMo E-Wallet</h4>
                      <p style={{ margin: 0, fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Liên kết bằng số điện thoại</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => showToast("Đã đặt làm mặc định", "success")}>Thiết lập</Button>
                </div>
              </div>
            </div>
          </div>
        );
      case "address":
        return (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ paddingBottom: 20, borderBottom: `1px solid ${DS.border}`, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Địa Chỉ Nhận Hàng</h2>
                <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Quản lý địa chỉ giao nhận của bạn</p>
              </div>
              <Button onClick={() => showToast("Đang phát triển", "info")} size="sm" style={{ background: DS.primary }}>+ Thêm địa chỉ mới</Button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ padding: 24, borderRadius: 16, border: `2px solid ${DS.primary}33`, position: "relative", background: "#f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{user?.name}</h4>
                    <span style={{ color: DS.textMuted }}>|</span>
                    <span style={{ color: DS.textMuted, fontSize: 14 }}>{user?.phone || "0987 654 321"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button style={{ border: "none", background: "none", color: DS.primary, cursor: "pointer", fontWeight: 600 }}>Cập nhật</button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: DS.textSecondary, lineHeight: 1.6 }}>123 Đường Số 1, Phường Tân Phú, Quận 7</p>
                <p style={{ margin: "4px 0 12px", fontSize: 14, color: DS.textSecondary }}>TP. Hồ Chí Minh</p>
                <Badge color={DS.primary} bg={DS.primaryLight}>Mặc định</Badge>
              </div>

              <div style={{ padding: 24, borderRadius: 16, border: `1px solid ${DS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Văn Phòng</h4>
                    <span style={{ color: DS.textMuted }}>|</span>
                    <span style={{ color: DS.textMuted, fontSize: 14 }}>{user?.phone || "0987 654 321"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button style={{ border: "none", background: "none", color: DS.primary, cursor: "pointer", fontWeight: 600 }}>Cập nhật</button>
                    <button style={{ border: "none", background: "none", color: DS.error, cursor: "pointer", fontWeight: 600 }}>Xóa</button>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: DS.textSecondary, lineHeight: 1.6 }}>Tòa nhà Bitexco, Số 2 Hải Triều, Quận 1</p>
                <p style={{ margin: "4px 0 12px", fontSize: 14, color: DS.textSecondary }}>TP. Hồ Chí Minh</p>
                <Button variant="outline" size="sm" onClick={() => showToast("Đã đặt làm mặc định", "success")}>Thiết lập mặc định</Button>
              </div>
            </div>
          </div>
        );
      case "notif":
        return (
          <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 600 }}>
            <div style={{ paddingBottom: 20, borderBottom: `1px solid ${DS.border}`, marginBottom: 30 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Cài Đặt Thông Báo</h2>
              <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Tùy chỉnh cách chúng tôi liên lạc với bạn</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {[
                { title: "Khuyến mãi & Cập nhật", desc: "Nhận thông báo về voucher, sự kiện mới.", active: true },
                { title: "Thông báo Đơn hàng", desc: "Trạng thái giao hàng, xác nhận thanh toán.", active: true },
                { title: "Thông báo Tin nhắn", desc: "Khi có người mua hoặc người bán nhắn tin.", active: true },
                { title: "Email Marketing", desc: "Bản tin tổng hợp hàng tuần qua Email.", active: false }
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${DS.border}` }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{item.title}</h4>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.textMuted }}>{item.desc}</p>
                  </div>
                  {/* Toggle UI */}
                  <div style={{ width: 44, height: 24, borderRadius: 12, background: item.active ? DS.primary : "#E5E7EB", position: "relative", cursor: "pointer", transition: "0.2s" }} onClick={() => showToast("Đã cập nhật tùy chọn", "success")}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: item.active ? 22 : 2, transition: "0.2s" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "privacy":
        return (
          <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 600 }}>
            <div style={{ paddingBottom: 20, borderBottom: `1px solid ${DS.border}`, marginBottom: 30 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Thiết Lập Riêng Tư</h2>
              <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Kiểm soát thông tin hiển thị công khai</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${DS.border}` }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Trạng thái hoạt động</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.textMuted }}>Hiển thị trạng thái "Đang hoạt động" khi bạn online.</p>
                </div>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: DS.primary, position: "relative", cursor: "pointer" }} onClick={() => showToast("Đã cập nhật", "success")}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 22 }} />
                </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${DS.border}` }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Người dùng đã chặn</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.textMuted }}>Quản lý danh sách các tài khoản bạn đã chặn.</p>
                </div>
                <Button variant="outline" size="sm">Xem danh sách</Button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${DS.border}` }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: DS.error }}>Yêu cầu xóa tài khoản</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: DS.textMuted }}>Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn khỏi hệ thống.</p>
                </div>
                <Button size="sm" style={{ background: DS.error, color: "#fff", border: "none" }}>Xóa tài khoản</Button>
              </div>
            </div>
          </div>
        );
      case "voucher":
        return (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ paddingBottom: 20, borderBottom: `1px solid ${DS.border}`, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Kho Voucher & Khuyến Mãi</h2>
                <p style={{ fontSize: 13, color: DS.textMuted, marginTop: 4 }}>Quản lý voucher bạn đã lưu và tạo chương trình Sale</p>
              </div>
              <Button onClick={() => showToast("Đã mở form tạo khuyến mãi", "success")} size="sm" style={{ background: DS.primary }}>+ Tạo đợt Sale / Combo</Button>
            </div>
            
            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
              <button style={{ flex: 1, padding: "12px 0", background: DS.primaryLight, color: DS.primary, border: `1px solid ${DS.primary}`, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Đang diễn ra (2)</button>
              <button style={{ flex: 1, padding: "12px 0", background: "#fff", color: DS.textSecondary, border: `1px solid ${DS.border}`, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Sắp tới (0)</button>
              <button style={{ flex: 1, padding: "12px 0", background: "#fff", color: DS.textSecondary, border: `1px solid ${DS.border}`, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Đã kết thúc (15)</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Voucher 1 */}
              <div style={{ display: "flex", border: `1px solid ${DS.border}`, borderRadius: 12, overflow: "hidden", boxShadow: DS.shadowSm }}>
                <div style={{ width: 100, background: DS.primary, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 10, borderRight: "2px dashed #fff" }}>
                  <span style={{ fontSize: 24 }}>🎟️</span>
                  <span style={{ fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 4 }}>GIẢM 50K</span>
                </div>
                <div style={{ padding: 16, flex: 1, background: "#fff", position: "relative" }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Giảm giá mùa Hè</h4>
                  <p style={{ margin: "4px 0 8px", fontSize: 12, color: DS.textMuted }}>Đơn tối thiểu 200k</p>
                  <p style={{ margin: 0, fontSize: 11, color: DS.error }}>HSD: 30/06/2026</p>
                  <button onClick={() => setView('home')} style={{ position: "absolute", bottom: 16, right: 16, background: DS.primary, color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Dùng ngay</button>
                </div>
              </div>

              {/* Voucher 2 */}
              <div style={{ display: "flex", border: `1px solid ${DS.border}`, borderRadius: 12, overflow: "hidden", boxShadow: DS.shadowSm }}>
                <div style={{ width: 100, background: "#10B981", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 10, borderRight: "2px dashed #fff" }}>
                  <span style={{ fontSize: 24 }}>🚚</span>
                  <span style={{ fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 4 }}>FREESHIP</span>
                </div>
                <div style={{ padding: 16, flex: 1, background: "#fff", position: "relative" }}>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Miễn phí vận chuyển</h4>
                  <p style={{ margin: "4px 0 8px", fontSize: 12, color: DS.textMuted }}>Mọi đơn hàng từ 0đ</p>
                  <p style={{ margin: 0, fontSize: 11, color: DS.error }}>HSD: 30/06/2026</p>
                  <button onClick={() => setView('home')} style={{ position: "absolute", bottom: 16, right: 16, background: DS.primary, color: "#fff", border: "none", borderRadius: 4, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Dùng ngay</button>
                </div>
              </div>
            </div>
          </div>
        );
      case "orders":
      case "sales":
        return (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>📦</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>Chưa có đơn hàng nào</h3>
            <p style={{ color: DS.textMuted, marginTop: 8 }}>Bạn chưa có lịch sử mua/bán nào gần đây.</p>
            <Button style={{ marginTop: 20 }} onClick={() => setView('home')}>Mua sắm ngay</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: "#F5F5F5", minHeight: "100vh", padding: "30px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 30 }}>
        
        {/* Sidebar */}
        <aside style={{ width: 200, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
            <img src={user?.avatar} style={{ width: 50, height: 50, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.05)", objectFit: "cover" }} />
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: DS.textPrimary }}>{user?.name}</p>
              <button style={{ border: "none", background: "none", color: DS.textMuted, fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: 0, marginTop: 4 }}>
                ✏️ Sửa hồ sơ
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {SETTINGS_GROUPS.map((group, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 15, color: DS.textPrimary, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: DS.primary }}>{group.icon}</span>
                  {group.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 34 }}>
                  {group.items.map(item => {
                    const active = activeMenu === item.id;
                    return (
                      <div 
                        key={item.id}
                        onClick={() => setActiveMenu(item.id)}
                        style={{ 
                          padding: "6px 0",
                          fontSize: 14, color: active ? DS.primary : "rgba(0,0,0,0.65)",
                          fontWeight: active ? 700 : 500, cursor: "pointer",
                          transition: "color 0.2s"
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ 
          flex: 1, background: "#fff", borderRadius: 3, 
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.13)", padding: 30, minHeight: 600 
        }}>
          {renderContent()}
        </main>

      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
