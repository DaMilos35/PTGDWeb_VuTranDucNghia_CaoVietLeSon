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
        borderRadius: 16, overflow: "hidden", background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        border: `1px solid rgba(255,255,255,0.4)`, cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isSold ? 0.7 : 1,
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
      }}
    >
      <div style={{ position: "relative", paddingTop: "100%", background: "#f5f5f5" }}>
        <img
          src={imgErr ? "https://via.placeholder.com/200" : product.images?.[0]}
          alt={product.title}
          onError={() => setImgErr(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {isSold && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, background: "rgba(0,0,0,0.6)", padding: "6px 12px", borderRadius: 8, letterSpacing: "0.05em" }}>ĐÃ BÁN</span>
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: 14, color: "#1e293b", fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 8, minHeight: 40 }}>{product.title}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)" }}>{fmtPrice(product.price)}</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>Đã bán {product.sold || 0}</span>
        </div>
        {product.rating > 0 && (
          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <StarRating rating={product.rating} size={11} />
            <span style={{ fontSize: 11, color: "#64748b" }}>({product.reviewCount || 0})</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setView, handleUpdateProfile, handleUpdateUser, viewData, showToast } = useApp();
  const [activeTab, setActiveTab] = useState("selling");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Wallet modal state
  const [walletModal, setWalletModal] = useState(null); // 'deposit' or 'withdraw'
  const [walletAmount, setWalletAmount] = useState("");
  const [processingWallet, setProcessingWallet] = useState(false);

  const profileUserId = viewData?.userId || user?.id;
  const isOwnProfile = profileUserId === user?.id;

  const { data: profileUser, loading: userLoading, refresh: refreshUser } = useApi(
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
  const avgRating = reviews?.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : displayUser?.rating || 4.8;

  const handleSave = async () => {
    setSaving(true);
    try {
      await handleUpdateProfile({ ...user, ...editForm });
      showToast("Cập nhật hồ sơ thành công!", "success");
      setEditMode(false);
      refreshUser();
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

  const handleWalletSubmit = async () => {
    const amt = Number(walletAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast("Số tiền không hợp lệ", "error");
      return;
    }
    setProcessingWallet(true);
    try {
      let newBalance = displayUser.balance || 0;
      if (walletModal === 'deposit') {
        newBalance += amt;
      } else {
        if (newBalance < amt) {
          showToast("Số dư không đủ để rút tiền", "error");
          setProcessingWallet(false);
          return;
        }
        newBalance -= amt;
      }

      const updatedUser = { ...displayUser, balance: newBalance };
      await fakeApi.updateUser(displayUser.id, { balance: newBalance });
      
      if (isOwnProfile) {
        handleUpdateUser(updatedUser);
      }
      
      showToast(`${walletModal === 'deposit' ? 'Nạp tiền' : 'Rút tiền'} thành công!`, "success");
      setWalletModal(null);
      setWalletAmount("");
      refreshUser();
    } catch (e) {
      showToast("Có lỗi xảy ra, vui lòng thử lại", "error");
    }
    setProcessingWallet(false);
  };

  const TABS = [
    { id: "selling", label: `Đang bán (${selling.length})` },
    { id: "sold", label: `Đã bán (${sold.length})` },
    { id: "reviews", label: `Đánh giá (${reviews?.length || 0})` },
    ...(isOwnProfile ? [{ id: "edit", label: "Chỉnh sửa" }] : []),
  ];

  if (userLoading) return <div style={{ padding: 80, display: "flex", justifyContent: "center" }}><Spinner /></div>;
  if (!displayUser) return null;

  return (
    <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", minHeight: "100vh", fontFamily: "Be Vietnam Pro, sans-serif", paddingBottom: 60 }}>
      <BackBtn />

      {/* ── Glass Cover Header ─────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto 24px", padding: "0 16px" }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
        }}>
          {/* Cover background */}
          <div style={{
            height: 200,
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
            position: "relative"
          }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle, #fff 10%, transparent 10%)", backgroundSize: "20px 20px" }} />
          </div>

          {/* Profile details */}
          <div style={{ padding: "0 32px 32px", position: "relative" }}>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", marginTop: -60, marginBottom: 24, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <img
                  src={displayUser.avatar || `https://i.pravatar.cc/100?u=${displayUser.id}`}
                  alt={displayUser.name}
                  style={{ width: 120, height: 120, borderRadius: 28, border: "4px solid #fff", objectFit: "cover", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
                />
                {displayUser.verified && (
                  <div style={{ position: "absolute", bottom: -4, right: -4, width: 28, height: 28, background: "#10b981", borderRadius: "50%", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 700 }}>✓</div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 250 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>{displayUser.name}</h1>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {displayUser.verified && <Badge bg="rgba(16, 185, 129, 0.1)" color="#10b981" size="xs">✓ Shop Uy Tín</Badge>}
                    {displayUser.sales > 50 && <Badge bg="rgba(99, 102, 241, 0.1)" color="#6366f1" size="xs">🏆 Top Trader</Badge>}
                    {displayUser.role === "admin" && <Badge bg="rgba(239, 68, 68, 0.1)" color="#ef4444" size="xs">Admin</Badge>}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center", color: "#64748b", fontSize: 14, flexWrap: "wrap" }}>
                  <span>📍 {displayUser.location || "Việt Nam"}</span>
                  <span>•</span>
                  <span>Gia nhập {displayUser.joined?.slice(0, 4) || "2023"}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {isOwnProfile ? (
                  <>
                    <Button onClick={() => setView("create-listing")} style={{ borderRadius: 12, fontWeight: 700 }}>
                      + Đăng bán
                    </Button>
                    <Button variant="outline" onClick={() => setView("orders")} style={{ borderRadius: 12, fontWeight: 700 }}>
                      📦 Đơn hàng
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      style={{
                        padding: "10px 24px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 14,
                        background: isFollowing ? "transparent" : "var(--primary)",
                        color: isFollowing ? "var(--primary)" : "#fff",
                        border: `2px solid var(--primary)`,
                        transition: "all 0.2s"
                      }}
                    >
                      {isFollowing ? "Đang theo dõi" : "+ Theo dõi"}
                    </button>
                    <Button onClick={() => setView("messaging")} style={{ borderRadius: 12 }}>💬 Chat ngay</Button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 24 }}>
              {[
                { label: "Đánh giá sao", value: `${avgRating} ★`, icon: "⭐" },
                { label: "Tỉ lệ phản hồi", value: "99%", icon: "⚡" },
                { label: "Đã bán", value: fmt(sold.length + (displayUser.sales || 0)), icon: "📦" },
                { label: "Đang đăng bán", value: fmt(selling.length), icon: "🏷️" },
                { label: "Người theo dõi", value: fmt(displayUser.followers?.length || 0), icon: "👥" }
              ].map((s, i) => (
                <div key={i} style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {s.icon} {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content columns ─────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Left Sidebar: Info & Wallet */}
        <div style={{ width: "100%", maxWidth: 300, display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Shop Profile details card */}
          <div style={{
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            borderRadius: 20,
            padding: 20,
            boxShadow: "0 10px 30px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 850, color: "#0f172a", marginBottom: 16 }}>Giới thiệu</h3>
            {displayUser.bio ? (
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: "0 0 16px" }}>{displayUser.bio}</p>
            ) : (
              <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic", margin: "0 0 16px" }}>Chưa có lời giới thiệu nào.</p>
            )}
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
                <span>📧</span>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 500 }}>Email liên hệ</div>
                  <div style={{ color: "#1e293b", fontWeight: 600 }}>{displayUser.email}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 13 }}>
                <span>📱</span>
                <div>
                  <div style={{ color: "#64748b", fontWeight: 500 }}>Số điện thoại</div>
                  <div style={{ color: "#1e293b", fontWeight: 600 }}>{displayUser.phone || "Chưa cập nhật"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet and Coin Dashboard (Glassmorphic) */}
          <div style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: 20,
            padding: 24,
            color: "#fff",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ví Tài Khoản</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4, fontFamily: "monospace" }}>{fmtPrice(displayUser.balance || 0)}</div>
              </div>
              <span style={{ fontSize: 24 }}>💳</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)", padding: "10px 14px", borderRadius: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 18 }}>🪙</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fde047" }}>{fmt(displayUser.coins || 0)} Xu</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>Sử dụng để đẩy tin nổi bật</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setWalletModal('deposit')}
                style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "#fff", color: "#0f172a", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                Nạp tiền
              </button>
              <button
                onClick={() => setWalletModal('withdraw')}
                style={{ flex: 1, padding: "10px 0", borderRadius: 12, background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >
                Rút tiền
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Tabs and Listings */}
        <div style={{ flex: 1, minWidth: 320 }}>
          {/* Custom navigation tabs */}
          <div style={{
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            borderRadius: 16,
            marginBottom: 20,
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", overflowX: "auto" }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: "16px 20px", border: "none", background: "none", cursor: "pointer",
                    fontWeight: activeTab === tab.id ? 800 : 500,
                    color: activeTab === tab.id ? "var(--primary)" : "#475569",
                    borderBottom: `3px solid ${activeTab === tab.id ? "var(--primary)" : "transparent"}`,
                    fontSize: 14, whiteSpace: "nowrap",
                    fontFamily: "inherit",
                    transition: "all 0.2s"
                  }}
                >{tab.label}</button>
              ))}
            </div>
          </div>

          {/* Render Active Tab Content */}
          {(activeTab === "selling" || activeTab === "sold") && (
            <div>
              {productsLoading ? (
                <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Spinner /></div>
              ) : (
                (() => {
                  const items = activeTab === "selling" ? selling : sold;
                  return items.length === 0 ? (
                    <div style={{
                      background: "rgba(255, 255, 255, 0.4)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      borderRadius: 20, padding: "60px 20px", textAlign: "center"
                    }}>
                      <div style={{ fontSize: 54, marginBottom: 16 }}>🏪</div>
                      <p style={{ color: "#64748b", fontSize: 16, fontWeight: 600 }}>
                        {activeTab === "selling" ? "Chưa có sản phẩm nào đang bán" : "Chưa có sản phẩm nào đã bán"}
                      </p>
                      {isOwnProfile && activeTab === "selling" && (
                        <Button onClick={() => setView("create-listing")} style={{ marginTop: 16, borderRadius: 12 }}>+ Đăng bán ngay</Button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                      {items.map(p => (
                        <ProductCard key={p.id} product={p} onClick={(prod) => setView("product", prod)} />
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={{
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              borderRadius: 20,
              padding: 24
            }}>
              {reviewsLoading ? <Spinner /> : (
                <>
                  {reviews?.length > 0 && (
                    <div style={{ display: "flex", gap: 32, alignItems: "center", paddingBottom: 24, marginBottom: 24, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 54, fontWeight: 900, color: "var(--primary)", lineHeight: 1 }}>{avgRating}</div>
                        <div style={{ margin: "8px 0" }}><StarRating rating={Number(avgRating)} size={16} /></div>
                        <div style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{reviews.length} đánh giá</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {[5,4,3,2,1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length;
                          const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={star} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                              <span style={{ fontSize: 13, color: "#475569", fontWeight: 600, width: 35 }}>{star} ★</span>
                              <div style={{ flex: 1, height: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 4, transition: "width 0.5s" }} />
                              </div>
                              <span style={{ fontSize: 12, color: "#64748b", width: 25, textAlign: "right" }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {reviews?.length === 0 ? (
                    <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
                      <p style={{ fontWeight: 600 }}>Chưa có đánh giá nào</p>
                    </div>
                  ) : reviews.map(r => (
                    <div key={r.id} style={{ padding: "20px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <img src={r.user?.avatar || `https://i.pravatar.cc/40?u=${r.reviewerId}`} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{r.user?.name || "Người mua ẩn danh"}</span>
                            <span style={{ fontSize: 12, color: "#64748b" }}>{r.date}</span>
                          </div>
                          <StarRating rating={r.rating} size={13} />
                          <p style={{ fontSize: 14, color: "#334155", marginTop: 8, lineHeight: 1.6 }}>{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === "edit" && isOwnProfile && (
            <div style={{
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              borderRadius: 20,
              padding: 28
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: "#0f172a" }}>Chỉnh sửa hồ sơ</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                {[
                  ["Họ và tên", "name", "text"],
                  ["Điện thoại", "phone", "tel"],
                  ["Địa chỉ", "location", "text"],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 8, fontWeight: 700 }}>{label}</label>
                    <input
                      type={type}
                      value={editForm[key] || ""}
                      onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "12px 14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, fontSize: 14, outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.7)" }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 8, fontWeight: 700 }}>Giới thiệu bản thân</label>
                <textarea
                  value={editForm.bio || ""}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  rows={4}
                  placeholder="Mô tả về shop của bạn..."
                  style={{ width: "100%", padding: "12px 14px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", background: "rgba(255,255,255,0.7)" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <Button onClick={handleSave} disabled={saving} style={{ minWidth: 120, borderRadius: 12 }}>
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("selling")} style={{ borderRadius: 12 }}>Hủy</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Wallet Deposit/Withdraw Modal ────────────────── */}
      {walletModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999,
          animation: "fadeIn 0.2s"
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            padding: 32,
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(0,0,0,0.05)"
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>
              {walletModal === 'deposit' ? 'Nạp tiền vào ví' : 'Rút tiền về tài khoản'}
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>
              {walletModal === 'deposit' ? 'Nhập số tiền bạn muốn nạp vào ví phụ.' : 'Rút tiền mặt về tài khoản ngân hàng của bạn.'}
            </p>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#475569", fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>Số tiền (VNĐ)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="Ví dụ: 100000"
                  value={walletAmount}
                  onChange={e => setWalletAmount(e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: 12, fontSize: 16, fontWeight: 700, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button
                onClick={handleWalletSubmit}
                disabled={processingWallet}
                style={{ flex: 1, borderRadius: 12, padding: "12px 0", fontWeight: 800 }}
              >
                {processingWallet ? "Đang xử lý..." : "Xác nhận"}
              </Button>
              <button
                onClick={() => { setWalletModal(null); setWalletAmount(""); }}
                style={{ flex: 1, borderRadius: 12, background: "rgba(0,0,0,0.05)", border: "none", color: "#475569", fontWeight: 750, cursor: "pointer" }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
