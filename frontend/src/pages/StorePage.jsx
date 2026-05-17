import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import ProductCard from "../components/common/ProductCard";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function StorePage() {
  const { user, selectedUser: storeUser, setView, watchedIds, handleWatch, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("selling"); // "selling" | "about"

  useEffect(() => {
    if (storeUser) {
      if (user && storeUser.followers?.includes(user.id)) setIsFollowing(true);
      
      Promise.all([
        fakeApi.getProductsBySeller(storeUser.id),
        fakeApi.getSellerStats(storeUser.id)
      ]).then(([sellerProducts, stats]) => {
        setProducts(sellerProducts);
        setSellerStats(stats);
        setLoading(false);
      });
    }
  }, [storeUser, user]);

  if (!storeUser) {
    return (
      <div style={{ padding: 80, textAlign: "center", color: DS.textMuted }}>
        <h2>Không tìm thấy gian hàng</h2>
        <Button onClick={() => setView("home")} style={{ marginTop: 20 }}>Về trang chủ</Button>
      </div>
    );
  }

  const isOwner = user?.id === storeUser.id;

  const handleFollowToggle = async () => {
    if (!user) return setView("auth");
    if (isOwner) return;
    try {
      await fakeApi.toggleFollow(user.id, storeUser.id);
      setIsFollowing(!isFollowing);
      showToast(isFollowing ? "Đã bỏ theo dõi" : "Đã theo dõi người bán");
    } catch (e) {
      showToast("Có lỗi xảy ra", "error");
    }
  };

  const handleChat = async () => {
    if (!user) return setView("auth");
    if (isOwner) return showToast("Đây là gian hàng của bạn", "info");
    
    try {
      showToast("Đang mở hộp thoại...", "info");
      await fakeApi.initiateChat(user.id, storeUser.id);
      setView("messaging");
    } catch (e) {
      showToast("Không thể mở hộp thoại", "error");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      
      {/* ─── Store Header Profile ─── */}
      <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 32, marginBottom: 24, boxShadow: DS.shadowSm, display: "flex", gap: 32, alignItems: "center" }}>
        <img 
          src={storeUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(storeUser.name)}&background=random`} 
          alt={storeUser.name} 
          style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: `3px solid ${DS.primaryLight}` }}
        />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: DS.textPrimary, marginBottom: 4 }}>
            {storeUser.name} {storeUser.verified && <span style={{ color: DS.primary, fontSize: 22 }} title="Đã xác minh">✓</span>}
          </h1>
          <div style={{ display: "flex", gap: 16, alignItems: "center", color: DS.textMuted, fontSize: 14, marginBottom: 16 }}>
            <span>⭐ {storeUser.rating || 0}/5.0</span>
            <span>👥 {storeUser.followers?.length || 0} Người theo dõi</span>
            <span>📍 {storeUser.location || "Chưa cập nhật"}</span>
            <span>Tham gia: {storeUser.joined}</span>
          </div>
          
          <div style={{ display: "flex", gap: 12 }}>
            {!isOwner ? (
              <>
                <Button onClick={async () => {
                  await handleFollowToggle();
                  // Refetch to update follower count UI
                  const fresh = await fakeApi.getUserById(storeUser.id);
                  setView("store", fresh); // This updates selectedUser in context
                }} variant={isFollowing ? "outline" : "primary"}>
                  {isFollowing ? "✓ Đang theo dõi" : "+ Theo dõi"}
                </Button>
                <Button onClick={handleChat} variant="outline">💬 Chat ngay</Button>
              </>
            ) : (
              <Button onClick={() => setView("profile")} variant="outline">✏️ Chỉnh sửa hồ sơ</Button>
            )}
          </div>
        </div>
        
        {/* Store Stats Mini */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", paddingLeft: 32, borderLeft: `1px solid ${DS.border}` }}>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 4 }}>Sản phẩm</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: DS.primary }}>{products.length}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 4 }}>Đã bán</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>{storeUser.sales || 0}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 4 }}>Tỉ lệ phản hồi</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>{sellerStats?.responseRate || "..."}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 4 }}>Thời gian chuẩn bị</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary }}>{sellerStats?.prepTime || "..."}</p>
          </div>
        </div>
      </div>

      {/* ─── Store Navigation Tabs ─── */}
      <div style={{ display: "flex", gap: 32, borderBottom: `1px solid ${DS.border}`, marginBottom: 24 }}>
        {[
          { id: "selling", label: `Sản phẩm (${products.length})` },
          { id: "about", label: "Thông tin shop" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "12px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 16, fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? DS.primary : DS.textSecondary,
              borderBottom: `3px solid ${activeTab === t.id ? DS.primary : "transparent"}`,
              fontFamily: "Be Vietnam Pro, sans-serif", transition: "all 0.2s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Store Content ─── */}
      {loading ? (
        <Spinner text="Đang tải gian hàng..." />
      ) : activeTab === "selling" ? (
        products.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}` }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🛍️</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary, marginBottom: 8 }}>Chưa có sản phẩm nào</h3>
            <p style={{ color: DS.textMuted }}>Gian hàng này hiện chưa đăng bán sản phẩm nào.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {products.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onClick={(prod) => setView("product", prod)} 
                onWatch={handleWatch} 
                watched={watchedIds?.includes(p.id)} 
              />
            ))}
          </div>
        )
      ) : (
        <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 32, lineHeight: 1.6 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary, marginBottom: 16 }}>Giới thiệu</h3>
          <p style={{ color: DS.textSecondary, whiteSpace: "pre-line" }}>
            {storeUser.bio || "Người bán chưa cập nhật thông tin giới thiệu."}
          </p>
        </div>
      )}
    </div>
  );
}
