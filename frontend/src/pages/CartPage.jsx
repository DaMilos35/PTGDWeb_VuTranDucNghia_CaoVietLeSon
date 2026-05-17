// ============================================================
// PAGE 9: CART PAGE — Hand-Me-On
// ============================================================

import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function CartPage() {
  const { setView, cartItems, handleRemoveFromCart, handleUpdateCartQty, handleClearCart, showToast, user, setMiniChatId, setMiniChatOpen } = useApp();

  // Group by seller for combo calculation
  const itemsBySeller = cartItems.reduce((acc, item) => {
    acc[item.sellerId] = acc[item.sellerId] || [];
    acc[item.sellerId].push(item);
    return acc;
  }, {});

  let comboDiscount = 0;
  Object.values(itemsBySeller).forEach(items => {
    const firstItemWithCombo = items.find(i => i.combo);
    const totalQty = items.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (firstItemWithCombo && totalQty >= firstItemWithCombo.combo.minQty) {
      const sellerSubtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
      comboDiscount += sellerSubtotal * (firstItemWithCombo.combo.discount / 100);
    }
  });

  const subtotal = cartItems.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  const shipping = cartItems.reduce((s, i) => s + ((i.shipping || 0) * (i.qty || 1)), 0);
  const total = subtotal + shipping - comboDiscount;

  const handleRemove = async (item) => {
    await handleRemoveFromCart(item.id);
    showToast(`Đã xóa "${item.title}" khỏi giỏ`, "info");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: DS.textPrimary, letterSpacing: "-0.03em", marginBottom: 4 }}>
            🛒 Giỏ hàng
          </h1>
          <p style={{ color: DS.textMuted }}>{cartItems.reduce((sum, i) => sum + (i.qty || 1), 0)} sản phẩm</p>
        </div>
        {cartItems.length > 0 && (
          <button
            onClick={() => { handleClearCart(); showToast("Đã xóa tất cả sản phẩm khỏi giỏ", "info"); }}
            style={{ fontSize: 13, color: DS.error, border: `1.5px solid ${DS.error}`, borderRadius: DS.radiusMd, padding: "8px 16px", background: "none", cursor: "pointer", fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: 600 }}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "100px 40px", background: "#fff", borderRadius: DS.radiusXl, border: `1px solid ${DS.border}`, boxShadow: DS.shadowSm }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
          <h3 style={{ fontWeight: 800, fontSize: 22, color: DS.textPrimary, marginBottom: 10 }}>Giỏ hàng trống</h3>
          <p style={{ color: DS.textMuted, marginBottom: 28 }}>Hãy khám phá sản phẩm và thêm vào giỏ nhé!</p>
          <Button onClick={() => setView("search")} size="lg">Khám phá sản phẩm</Button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 20, display: "flex", gap: 18, alignItems: "center", boxShadow: DS.shadowSm }}
              >
                <img
                  src={item.images?.[0]}
                  alt=""
                  onClick={() => setView("product")}
                  style={{ width: 90, height: 90, borderRadius: DS.radiusMd, objectFit: "cover", flexShrink: 0, cursor: "pointer" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 15, color: DS.textPrimary, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: 13, color: DS.textMuted }}>{item.condition} · 📍 {item.location}</p>
                  <p style={{ fontSize: 12, color: item.shipping === 0 ? DS.success : DS.textMuted, marginTop: 4, fontWeight: item.shipping === 0 ? 700 : 400 }}>
                    {item.shipping === 0 ? "✓ Miễn phí vận chuyển" : `+ ${formatPrice(item.shipping * (item.qty || 1))} vận chuyển`}
                  </p>

                  {/* Quantity Selector inside Cart Page */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                    <button
                      onClick={() => handleUpdateCartQty(item.id, (item.qty || 1) - 1)}
                      disabled={(item.qty || 1) <= 1}
                      style={{
                        width: 24, height: 24, borderRadius: "50%", border: `1px solid ${DS.border}`,
                        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: "bold", cursor: "pointer", opacity: (item.qty || 1) <= 1 ? 0.4 : 1
                      }}
                    >-</button>
                    <span style={{ fontSize: 13, fontWeight: "bold", minWidth: 20, textAlign: "center" }}>{item.qty || 1}</span>
                    <button
                      onClick={() => handleUpdateCartQty(item.id, (item.qty || 1) + 1)}
                      disabled={(item.qty || 1) >= (item.stock || 10)}
                      style={{
                        width: 24, height: 24, borderRadius: "50%", border: `1px solid ${DS.border}`,
                        background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: "bold", cursor: "pointer", opacity: (item.qty || 1) >= (item.stock || 10) ? 0.4 : 1
                      }}
                    >+</button>
                    <span style={{ fontSize: 11, color: DS.textMuted }}>(Tồn kho: {item.stock || 10})</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 20, fontWeight: 900, color: DS.textPrimary, letterSpacing: "-0.03em", marginBottom: 10 }}>
                    {formatPrice(item.price * (item.qty || 1))}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        const sellerId = item.sellerId;
                        if (!user) return setView("auth");
                        fakeApi.initiateChat(user.id, sellerId, item.id).then(({ chatId }) => {
                          setMiniChatId(chatId);
                          setMiniChatOpen(true);
                        });
                      }}
                      style={{ fontSize: 12, color: DS.primary, border: `1.5px solid ${DS.primary}`, borderRadius: DS.radiusSm, padding: "5px 12px", background: "none", cursor: "pointer", fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: 600, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = DS.primaryLight; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                    >
                      💬 Chat
                    </button>
                    <button
                      onClick={() => handleRemove(item)}
                      style={{ fontSize: 12, color: DS.error, border: `1.5px solid ${DS.error}`, borderRadius: DS.radiusSm, padding: "5px 12px", background: "none", cursor: "pointer", fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: 600, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = DS.errorLight; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 26, boxShadow: DS.shadowSm, position: "sticky", top: 90 }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: DS.textPrimary, marginBottom: 22 }}>Tóm tắt đơn hàng</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
              {cartItems.map((i) => (
                <div key={i.id} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 13, color: DS.textSecondary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {i.title} <span style={{ fontWeight: 700, color: DS.primary }}>x{i.qty || 1}</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: DS.textPrimary, flexShrink: 0 }}>{formatPrice(i.price * (i.qty || 1))}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: DS.textSecondary }}>
                <span>Tạm tính</span><span style={{ color: DS.textPrimary }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: DS.textSecondary }}>
                <span>Phí vận chuyển</span><span style={{ color: DS.textPrimary }}>{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</span>
              </div>
              {comboDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: DS.success }}>
                  <span>Giảm giá Combo 🎁</span><span style={{ fontWeight: 700 }}>-{formatPrice(comboDiscount)}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${DS.border}`, paddingTop: 16, marginBottom: 22 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: DS.textPrimary }}>Tổng cộng</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: DS.primary, letterSpacing: "-0.03em" }}>{formatPrice(total)}</span>
            </div>

            {user ? (
              <Button onClick={() => setView("checkout")} variant="success" fullWidth size="lg">
                Tiến hành thanh toán →
              </Button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button onClick={() => setView("checkout")} variant="success" fullWidth size="lg">
                  Tiếp tục như Khách →
                </Button>
                <Button onClick={() => setView("auth")} variant="outline" fullWidth size="md" style={{ color: DS.textSecondary }}>
                  Đăng nhập để thanh toán nhanh hơn
                </Button>
              </div>
            )}

            <div style={{ marginTop: 16, padding: 14, background: `${DS.success}10`, borderRadius: DS.radiusMd, border: `1px solid ${DS.success}30` }}>
              <p style={{ fontSize: 12, color: DS.success, fontWeight: 700, marginBottom: 2 }}>🛡️ Bảo vệ người mua</p>
              <p style={{ fontSize: 11, color: DS.textMuted }}>Tất cả giao dịch được bảo đảm hoàn tiền nếu có vấn đề.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
