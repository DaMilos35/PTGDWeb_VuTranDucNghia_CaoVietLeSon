import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import BackBtn from "../components/common/BackBtn";

const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n);
const fmtPrice = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n).replace("₫", "đ");

function StarRating({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

function ProductCard({ product, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const isSold = product.status === "sold";
  return (
    <div
      onClick={() => onClick(product)}
      style={{
        borderRadius: 8, overflow: "hidden", background: "#fff",
        border: `1px solid #f0f0f0`, cursor: "pointer",
        transition: "box-shadow 0.2s",
        opacity: isSold ? 0.7 : 1,
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ position: "relative", paddingTop: "100%", background: "#f5f5f5" }}>
        <img
          src={imgErr ? "https://via.placeholder.com/200" : product.images?.[0]}
          alt={product.title}
          onError={() => setImgErr(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {isSold && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 4 }}>ĐÃ BÁN</span>
          </div>
        )}
        {product.isSponsored && (
          <div style={{ position: "absolute", top: 6, left: 6, background: DS.primary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3 }}>NỔI BẬT</div>
        )}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <p style={{ fontSize: 13, color: "#333", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 6, minHeight: 36 }}>{product.title}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: DS.primary }}>{fmtPrice(product.price)}</span>
          <span style={{ fontSize: 11, color: "#999" }}>Đã bán {product.reviewCount || 0}</span>
        </div>
        {product.avgRating > 0 && (
          <div style={{ marginTop: 4 }}>
            <StarRating rating={product.avgRating} size={11} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setView, handleUpdateProfile, viewData, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("selling");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Determine whose profile to show
  const profileUserId = viewData?.userId || user?.id;
  const isOwnProfile = profileUserId === user?.id;

  const { data: profileUser, loading: userLoading } = useApi(
    () => fakeApi.getUserById(profileUserId),
    [profileUserId]
  );

  const { data: allProducts, loading: productsLoading } = useApi(
    () => fakeApi.getProductsBySeller(profileUserId),
    [profileUserId]
  );

  const { data: reviews, loading: reviewsLoading } = useApi(
    () => fakeApi.getReviews(profileUserId),
    [profileUserId]
  );

  const displayUser = profileUser || user;

  useEffect(() => {
    if (displayUser) {
      setEditForm({ name: displayUser.name, bio: displayUser.bio || "", location: displayUser.location || "", phone: displayUser.phone || "" });
      setIsFollowing((user?.following || []).includes(displayUser.id));
    }
  }, [displayUser?.id]);

  const selling = (allProducts || []).filter(p => p.status !== "sold");
  const sold = (allProducts || []).filter(p => p.status === "sold");
  const avgRating = reviews?.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : displayUser?.rating || 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await handleUpdateProfile({ ...user, ...editForm });
      showToast("Cập nhật hồ sơ thành công!", "success");
      setEditMode(false);
    } catch { showToast("Lỗi cập nhật hồ sơ", "error"); }
    setSaving(false);
  };

  const handleFollow = async () => {
    if (!user) return setView("auth");
    try {
      const result = await fakeApi.toggleFollow(user.id, displayUser.id);
      setIsFollowing(result);
      showToast(result ? `Đã theo dõi ${displayUser.name}` : "Đã bỏ theo dõi", "success");
    } catch { showToast("Lỗi khi thực hiện", "error"); }
  };

  const TABS = [
    { id: "selling", label: `Đang bán (${selling.length})` },
    { id: "sold", label: `Đã bán (${sold.length})` },
    { id: "reviews", label: `Đánh giá (${reviews?.length || 0})` },
    ...(isOwnProfile ? [{ id: "edit", label: "Chỉnh sửa" }] : []),
  ];

  if (userLoading) return <div style={{ padding: 80, textAlign: "center" }}><Spinner /></div>;
  if (!displayUser) return null;

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <BackBtn />

      {/* ── Shopee-style Header ─────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", marginBottom: 16 }}>
        {/* Cover */}
        <div style={{
          height: 160, background: "linear-gradient(135deg, #ee4d2d 0%, #ff7337 50%, #ffaa00 100%)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: "absolute", borderRadius: "50%",
                width: 80 + i * 40, height: 80 + i * 40,
                background: "rgba(255,255,255,0.3)",
                top: -20 + i * 10, left: i * 15 + "%",
              }} />
            ))}
          </div>
        </div>

        {/* Profile Info Row */}
        <div style={{ padding: "0 24px 20px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-end", marginTop: -40, marginBottom: 16, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={displayUser.avatar || `https://i.pravatar.cc/100?u=${displayUser.id}`}
                alt={displayUser.name}
                style={{ width: 90, height: 90, borderRadius: "50%", border: "4px solid #fff", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
              />
              {displayUser.verified && (
                <div style={{ position: "absolute", bottom: 4, right: 4, width: 24, height: 24, background: "#10b981", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</div>
              )}
            </div>

            {/* Name & Actions */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#333", letterSpacing: "-0.02em", margin: 0 }}>{displayUser.name}</h1>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {displayUser.verified && <Badge color="#fff" bg="#10b981" size="xs">✓ Shop Uy Tín</Badge>}
                  {displayUser.sales > 50 && <Badge color="#fff" bg="#6C63FF" size="xs">🏆 Top Trader</Badge>}
                  {displayUser.joined?.startsWith("2023") && <Badge color="#fff" bg="#8B5CF6" size="xs">🛡️ Thành viên lâu năm</Badge>}
                  <Badge color="#fff" bg="#059669" size="xs">🌿 Sống Xanh</Badge>
                </div>
                {displayUser.role === "admin" && <Badge color={DS.error}>Admin</Badge>}
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", color: "#888", fontSize: 13, flexWrap: "wrap" }}>
                {displayUser.location && <span>📍 {displayUser.location}</span>}
                <span>·</span>
                <span>Tham gia {displayUser.joined?.slice(0, 4)}</span>
                {displayUser.online && <span style={{ color: "#10b981" }}>· 🟢 Online</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {isOwnProfile ? (
                <>
                  <Button size="sm" onClick={() => setView("create-listing")} style={{ background: DS.primary, color: "#fff", border: "none" }}>
                    + Đăng bán
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setView("orders")}>📦 Đơn hàng</Button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    style={{
                      padding: "8px 20px", borderRadius: 4, cursor: "pointer", fontWeight: 700, fontSize: 14,
                      background: isFollowing ? "#fff" : DS.primary,
                      color: isFollowing ? DS.primary : "#fff",
                      border: `1.5px solid ${DS.primary}`,
                      transition: "all 0.2s"
                    }}
                  >{isFollowing ? "Đang theo dõi" : "+ Theo dõi"}</button>
                  <Button size="sm" onClick={() => setView("messaging")}>💬 Chat</Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Row — Shopee style */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid #f5f5f5", paddingTop: 16 }}>
            {[
              { label: "Đánh giá", value: avgRating, icon: "⭐" },
              { label: "Tỉ lệ phản hồi", value: "98%", icon: "💬" },
              { label: "Thời gian phản hồi", value: "Vài phút", icon: "⚡" },
              { label: "Đã bán", value: fmt(sold.length + (displayUser.sales || 0)), icon: "📦" },
              { label: "Đang bán", value: fmt(selling.length), icon: "🏷️" },
              { label: "Theo dõi", value: fmt(displayUser.followers?.length || 0), icon: "👥" },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center", padding: "8px 4px",
                borderRight: i < 5 ? "1px solid #f0f0f0" : "none"
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#333" }}>
                  {s.icon} {s.value}
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px 40px", display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* Left: Sidebar info */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: 4, padding: 16, border: "1px solid #f0f0f0", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 14 }}>Thông tin shop</h3>
            {[
              ["📍", "Địa chỉ", displayUser.location || "Chưa cập nhật"],
              ["📧", "Email", displayUser.email || "—"],
              ["⭐", "Đánh giá", `${avgRating}/5`],
              ["📦", "Tổng bán", `${fmt(displayUser.sales || 0)} sản phẩm`],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: "#999" }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>{val}</div>
                </div>
              </div>
            ))}
            {displayUser.bio && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f5f5f5" }}>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{displayUser.bio}</p>
              </div>
            )}
          </div>

          {/* Wallet card (own profile only) */}
          {isOwnProfile && (
            <div style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              borderRadius: 8, padding: 16, color: "#fff"
            }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Số dư ví</p>
              <p style={{ fontSize: 20, fontWeight: 900 }}>{fmtPrice(displayUser.balance || 0)}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>🪙</span>
                <span style={{ color: "#FDE047", fontWeight: 700 }}>{fmt(displayUser.coins || 0)} Xu</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => showToast("Tính năng đang phát triển", "info")} style={{ flex: 1, padding: "6px 0", borderRadius: 4, background: "#fff", color: "#0f172a", border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Nạp tiền</button>
                <button onClick={() => showToast("Tính năng đang phát triển", "info")} style={{ flex: 1, padding: "6px 0", borderRadius: 4, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Rút tiền</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tabs + Products */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tab Bar */}
          <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #f0f0f0", marginBottom: 12 }}>
            <div style={{ display: "flex", overflowX: "auto" }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? DS.primary : "#666",
                    borderBottom: `2px solid ${activeTab === tab.id ? DS.primary : "transparent"}`,
                    fontSize: 14, whiteSpace: "nowrap",
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    transition: "all 0.2s"
                  }}
                >{tab.label}</button>
              ))}
            </div>
          </div>

          {/* Tab: Selling / Sold */}
          {(activeTab === "selling" || activeTab === "sold") && (
            <div>
              {productsLoading ? <div style={{ padding: 40, textAlign: "center" }}><Spinner /></div> : (
                (() => {
                  const items = activeTab === "selling" ? selling : sold;
                  return items.length === 0 ? (
                    <div style={{ background: "#fff", borderRadius: 4, padding: "60px 20px", textAlign: "center", border: "1px solid #f0f0f0" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
                      <p style={{ color: "#999", fontSize: 15 }}>
                        {activeTab === "selling" ? "Chưa có sản phẩm nào đang bán" : "Chưa có sản phẩm nào đã bán"}
                      </p>
                      {isOwnProfile && activeTab === "selling" && (
                        <Button onClick={() => setView("create-listing")} style={{ marginTop: 16 }}>+ Đăng bán ngay</Button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                      {items.map(p => (
                        <ProductCard key={p.id} product={p} onClick={(prod) => setView("product", prod)} />
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {/* Tab: Reviews */}
          {activeTab === "reviews" && (
            <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #f0f0f0", padding: 20 }}>
              {reviewsLoading ? <Spinner /> : (
                <>
                  {/* Summary */}
                  {reviews?.length > 0 && (
                    <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "16px 0", marginBottom: 20, borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 48, fontWeight: 900, color: DS.primary, lineHeight: 1 }}>{avgRating}</div>
                        <StarRating rating={Number(avgRating)} size={18} />
                        <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{reviews.length} đánh giá</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {[5,4,3,2,1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 12, color: "#666", width: 30 }}>{star} ★</span>
                              <div style={{ flex: 1, height: 6, background: "#f5f5f5", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 3, transition: "width 0.5s" }} />
                              </div>
                              <span style={{ fontSize: 11, color: "#999", width: 20 }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* List */}
                  {reviews?.length === 0 ? (
                    <div style={{ padding: "40px 0", textAlign: "center", color: "#999" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                      <p>Chưa có đánh giá nào</p>
                    </div>
                  ) : reviews.map(r => (
                    <div key={r.id} style={{ padding: "16px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <img src={r.user?.avatar || `https://i.pravatar.cc/40?u=${r.reviewerId}`} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>{r.user?.name || "Người dùng ẩn danh"}</span>
                            <span style={{ fontSize: 11, color: "#999" }}>{r.date}</span>
                          </div>
                          <StarRating rating={r.rating} size={13} />
                          <p style={{ fontSize: 14, color: "#555", marginTop: 6, lineHeight: 1.6 }}>{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Tab: Edit Profile */}
          {activeTab === "edit" && isOwnProfile && (
            <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #f0f0f0", padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#333" }}>Chỉnh sửa hồ sơ</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[
                  ["Họ và tên", "name", "text"],
                  ["Điện thoại", "phone", "tel"],
                  ["Địa chỉ", "location", "text"],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <input
                      type={type}
                      value={editForm[key] || ""}
                      onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 4, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6, fontWeight: 600 }}>Giới thiệu bản thân</label>
                <textarea
                  value={editForm.bio || ""}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả về shop của bạn..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e0e0e0", borderRadius: 4, fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Button onClick={handleSave} disabled={saving} style={{ minWidth: 120 }}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("selling")}>Hủy</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
