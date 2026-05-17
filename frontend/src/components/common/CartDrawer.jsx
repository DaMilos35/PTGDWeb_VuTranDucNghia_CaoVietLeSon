import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { DS } from "../../design/tokens";
import { useApp } from "../../context/AppContext";
import { formatPrice } from "../../utils/formatters";
import Button from "../common/Button";
import fakeApi from "../../database/fakeApi";

export default function CartDrawer() {
  const { cartDrawerOpen, setCartDrawerOpen, cartItems, setView, handleRemoveFromCart, handleClearCart, user, setMiniChatId, setMiniChatOpen } = useApp();
  const [closing, setClosing] = useState(false);
  const location = useLocation();

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setCartDrawerOpen(false);
    }, 300); // match transition duration
  };

  useEffect(() => {
    if (cartDrawerOpen) {
      setCartDrawerOpen(false);
      setClosing(false);
    }
  }, [location.pathname]);

  if (!cartDrawerOpen && !closing) return null;

  // Group by seller for combo calculation
  const itemsBySeller = cartItems.reduce((acc, item) => {
    acc[item.sellerId] = acc[item.sellerId] || [];
    acc[item.sellerId].push(item);
    return acc;
  }, {});

  let comboDiscount = 0;
  Object.values(itemsBySeller).forEach(items => {
    const firstItemWithCombo = items.find(i => i.combo);
    if (firstItemWithCombo && items.length >= firstItemWithCombo.combo.minQty) {
      const sellerSubtotal = items.reduce((s, i) => s + i.price, 0);
      comboDiscount += sellerSubtotal * (firstItemWithCombo.combo.discount / 100);
    }
  });

  const subtotal = cartItems.reduce((s, i) => s + i.price, 0);
  const shipping = cartItems.reduce((s, i) => s + (i.shipping || 0), 0);
  const total = subtotal + shipping - comboDiscount;

  return (
    <>
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes drawerSlideOut {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes drawerFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
      
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999,
          backdropFilter: "blur(2px)",
          animation: `${closing ? "drawerFadeOut" : "drawerFadeIn"} 0.3s ease forwards`
        }}
      />
      
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 450,
        background: "#fff", zIndex: 10000, display: "flex", flexDirection: "column",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
        animation: `${closing ? "drawerSlideOut" : "drawerSlideIn"} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
        fontFamily: "Be Vietnam Pro, sans-serif"
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: DS.textPrimary, display: "flex", alignItems: "center", gap: 8 }}>
            🛒 Giỏ hàng <span style={{ background: DS.primary, color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>{cartItems.length}</span>
          </h2>
          <button onClick={handleClose} style={{ background: DS.bgHover, border: "none", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, color: DS.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 60, color: DS.textMuted }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary, marginBottom: 8 }}>Giỏ hàng đang trống</h3>
              <p style={{ fontSize: 14, marginBottom: 24 }}>Hãy thêm sản phẩm vào giỏ nhé.</p>
              <Button onClick={() => { handleClose(); setView("search"); }}>Tiếp tục mua sắm</Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 16, paddingBottom: 16, borderBottom: `1px solid ${DS.border}` }}>
                  <img src={item.images?.[0]} alt="" style={{ width: 80, height: 80, borderRadius: DS.radiusMd, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontWeight: 600, fontSize: 14, color: DS.textPrimary, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: 14, fontWeight: 800, color: DS.primary, marginBottom: 8 }}>{formatPrice(item.price)}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={async () => {
                        const sellerId = item.sellerId;
                        if (!user) { handleClose(); return setView("auth"); }
                        fakeApi.initiateChat(user.id, sellerId, item.id).then(({ chatId }) => {
                          setMiniChatId(chatId);
                          setMiniChatOpen(true);
                          handleClose();
                        });
                      }} style={{ fontSize: 12, color: DS.primary, background: DS.primaryLight, border: "none", borderRadius: DS.radiusSm, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
                        💬 Chat
                      </button>
                      <button onClick={() => handleRemoveFromCart(item.id)} style={{ fontSize: 12, color: DS.error, background: DS.errorLight, border: "none", borderRadius: DS.radiusSm, padding: "4px 10px", cursor: "pointer", fontWeight: 600 }}>
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{ padding: 24, borderTop: `1px solid ${DS.border}`, background: "#fff", boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: DS.textSecondary }}>
              <span>Tạm tính</span>
              <span style={{ color: DS.textPrimary, fontWeight: 600 }}>{formatPrice(subtotal)}</span>
            </div>
            {comboDiscount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: DS.success }}>
                <span>Giảm giá Combo</span>
                <span style={{ fontWeight: 700 }}>-{formatPrice(comboDiscount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 18, color: DS.textPrimary, fontWeight: 800 }}>
              <span>Tổng cộng</span>
              <span style={{ color: DS.primary }}>{formatPrice(total)}</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="outline" fullWidth onClick={() => { handleClose(); setView("cart"); }}>Xem chi tiết</Button>
              <Button fullWidth onClick={() => { handleClose(); setView("checkout"); }}>Thanh toán</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
