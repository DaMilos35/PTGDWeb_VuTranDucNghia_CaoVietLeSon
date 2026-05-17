// ============================================================
// PAGE 10: CHECKOUT PAGE — Hand-Me-On
// ============================================================

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import fakeApi from "../database/fakeApi";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import BackBtn from "../components/common/BackBtn";
import Badge from "../components/common/Badge";
import useApi from "../hooks/useApi";

const PAYMENT_METHODS = [
  { value: "momo", label: "🌸 Ví MoMo", desc: "Thanh toán an toàn qua MoMo" },
  { value: "shopeepay", label: "🛍️ ShopeePay", desc: "Thanh toán qua ShopeePay" },
  { value: "bank", label: "🏦 Chuyển khoản ngân hàng", desc: "Chuyển khoản trực tiếp (24/7)" },
  { value: "cod", label: "💵 Thanh toán khi nhận hàng", desc: "Thanh toán tiền mặt (COD)" },
];

function ConfirmationPage({ setView, orderIds }) {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center", padding: "0 28px", fontFamily: "Outfit, sans-serif" }}>
      <div style={{
        background: "#fff", borderRadius: DS.radiusXl, padding: "60px 40px",
        border: `1px solid ${DS.border}`, boxShadow: DS.shadowLg,
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: DS.successLight, margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52,
        }}>✅</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: DS.textPrimary, marginBottom: 12, letterSpacing: "-0.03em" }}>
          Đặt hàng thành công!
        </h2>
        <p style={{ color: DS.textMuted, fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
          Cảm ơn bạn! Đơn hàng của bạn đã được tiếp nhận và {orderIds.length > 1 ? "các người bán" : "người bán"} sẽ được thông báo ngay.
        </p>
        <div style={{ background: DS.bgHover, borderRadius: DS.radiusLg, padding: "20px 24px", marginBottom: 32, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: DS.textMuted }}>Mã đơn hàng</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary }}>{orderIds.join(", ")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: DS.textMuted }}>Thời gian dự kiến</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary }}>3–5 ngày làm việc</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button onClick={() => setView("orders")} size="lg">📦 Theo dõi đơn</Button>
          <Button onClick={() => setView("home")} variant="outline" size="lg">Tiếp tục mua sắm</Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { setView, cartItems, handleClearCart, user, handleUpdateProfile, showToast } = useApp();
  const savedAddresses = user?.addresses || [];
  const defaultAddress = savedAddresses.find(a => a.isDefault) || savedAddresses[0] || null;
  
  const [form, setForm] = useState(defaultAddress ? 
    { name: defaultAddress.name, phone: defaultAddress.phone, address: defaultAddress.address, city: defaultAddress.city, payment: "momo" } : 
    { name: user?.name || "", phone: "", address: "", city: user?.location || "", payment: "momo" }
  );
  const [orderIds, setOrderIds] = useState([]);
  const [done, setDone] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(!defaultAddress);
  const [saveAddress, setSaveAddress] = useState(true);
  const [appliedVouchers, setAppliedVouchers] = useState({ shipping: null, shop: null, global: null });
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [useCoins, setUseCoins] = useState(false);
  
  const { data: vouchers } = useApi(() => fakeApi.getVouchers(), []);

  const userCoins = user?.coins || 15000;
  const subtotal = cartItems.reduce((s, i) => s + i.price * (i.qty || 1), 0);
  const baseShipping = cartItems.reduce((s, i) => s + (i.shipping || 30000), 0);
  
  const shippingDiscount = appliedVouchers.shipping ? Math.min(baseShipping, appliedVouchers.shipping.maxDiscount || baseShipping) : 0;
  const shipping = baseShipping - shippingDiscount;
  
  let shopDiscount = 0;
  if (appliedVouchers.shop) {
    if (appliedVouchers.shop.type === "percent") {
      shopDiscount = Math.min(subtotal * (appliedVouchers.shop.discount / 100), appliedVouchers.shop.maxDiscount || Infinity);
    } else {
      shopDiscount = appliedVouchers.shop.discount;
    }
  }

  let globalDiscount = 0;
  if (appliedVouchers.global) {
    const v = appliedVouchers.global;
    if (v.type === "percentage") {
      globalDiscount = subtotal * (v.discount / 100);
    } else {
      globalDiscount = v.discount;
    }
  }

  const voucherDiscount = globalDiscount;
  const protectionFee = Math.round(subtotal * 0.01);
  const totalBeforeCoins = Math.max(0, subtotal + shipping + protectionFee - voucherDiscount);
  const coinDiscount = useCoins ? Math.min(totalBeforeCoins, userCoins) : 0;
  const total = totalBeforeCoins - coinDiscount;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit = form.name && form.phone && form.address && form.city && cartItems.length > 0;

  const toggleVoucher = (v) => {
    if (subtotal < v.minOrder) {
      showToast(`Đơn hàng tối thiểu ${formatPrice(v.minOrder)}`, "warning");
      return;
    }
    setAppliedVouchers(prev => ({
      ...prev,
      global: prev.global?.id === v.id ? null : v
    }));
  };

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
    
    if (form.payment !== "cod") {
      setPaying(true);
      return;
    }

    completeOrder();
  };

  const completeOrder = async () => {
    // Group items by seller
    const itemsBySeller = cartItems.reduce((acc, item) => {
      acc[item.sellerId] = acc[item.sellerId] || [];
      acc[item.sellerId].push(item);
      return acc;
    }, {});

    const totalDiscount = voucherDiscount + coinDiscount;
    const newOrderIds = [];

    try {
      for (const [sellerId, items] of Object.entries(itemsBySeller)) {
        const sellerSubtotal = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
        const sellerShipping = items.reduce((s, i) => s + (i.shipping || 30000), 0);
        
        // Split discount pro-rata based on subtotal
        const sellerDiscount = subtotal > 0 ? Math.round(totalDiscount * (sellerSubtotal / subtotal)) : 0;
        const sellerProtectionFee = Math.round(sellerSubtotal * 0.01);
        const sellerTotal = sellerSubtotal + sellerShipping + sellerProtectionFee - sellerDiscount;

        const orderData = {
          buyerId: user?.id || "guest",
          items,
          amount: sellerTotal,
          subtotal: sellerSubtotal,
          shipping: sellerShipping,
          protectionFee: sellerProtectionFee,
          discount: sellerDiscount,
          paymentMethod: form.payment,
          shippingAddress: {
            name: form.name, phone: form.phone, address: form.address, city: form.city
          },
          sellerId
        };

        const saved = await fakeApi.createOrder(orderData);
        newOrderIds.push(saved.id);
      }

      if (useCoins && user) {
        await handleUpdateProfile({ ...user, coins: user.coins - coinDiscount });
      }

      if (saveAddress && showAddressForm && user) {
        const isDuplicate = savedAddresses.some(a => a.address === form.address && a.phone === form.phone);
        if (!isDuplicate) {
          const newAddress = { id: Date.now().toString(), name: form.name, phone: form.phone, address: form.address, city: form.city, isDefault: savedAddresses.length === 0 };
          await handleUpdateProfile({ ...user, addresses: [...savedAddresses, newAddress] });
        }
      }

      setOrderIds(newOrderIds);
      setDone(true);
      setPaying(false);
      handleClearCart();
      showToast(`🎉 Đã đặt ${newOrderIds.length} đơn hàng thành công!`, "success");
    } catch (err) {
      showToast("Có lỗi xảy ra khi đặt hàng: " + err.message, "error");
    }
  };

  if (done) return <ConfirmationPage setView={setView} orderIds={orderIds} />;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 28px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <BackBtn />
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: DS.textPrimary, marginBottom: 8, letterSpacing: "-0.03em" }}>Thanh toán</h1>
        <p style={{ color: DS.textMuted, fontSize: 15 }}>Bạn sắp sở hữu món đồ yêu thích rồi! Kiểm tra lại thông tin nhé.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }}>
        
        {/* Left Column: Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Address Section */}
          <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary }}>📍 Địa chỉ nhận hàng</h3>
              {savedAddresses.length > 0 && (
                <button onClick={() => setShowAddressForm(!showAddressForm)} style={{ fontSize: 14, color: DS.primary, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
                  {showAddressForm ? "Sổ địa chỉ" : "Thêm địa chỉ mới"}
                </button>
              )}
            </div>

            {!showAddressForm && savedAddresses.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {savedAddresses.map(addr => (
                  <label key={addr.id} style={{ display: "flex", gap: 14, padding: "16px", borderRadius: DS.radiusMd, border: `2px solid ${form.address === addr.address ? DS.primary : DS.border}`, background: form.address === addr.address ? DS.primaryLight : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                    <input 
                      type="radio" name="addressSelect" 
                      checked={form.address === addr.address}
                      onChange={() => setForm(f => ({ ...f, name: addr.name, phone: addr.phone, address: addr.address, city: addr.city }))}
                      style={{ accentColor: DS.primary, width: 20, height: 20 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ fontWeight: 800, color: DS.textPrimary }}>{addr.name}</span>
                        <span style={{ width: 1, height: 14, background: DS.border }} />
                        <span style={{ color: DS.textMuted }}>{addr.phone}</span>
                        {addr.isDefault && <span style={{ marginLeft: 8 }}><Badge color="#10b981">Mặc định</Badge></span>}
                      </div>
                      <p style={{ fontSize: 13, color: DS.textSecondary, lineHeight: 1.5 }}>{addr.address}, {addr.city}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Input label="Họ và tên" value={form.name} onChange={(v) => set("name", v)} placeholder="Nguyễn Văn A" required />
                  <Input label="Số điện thoại" value={form.phone} onChange={(v) => set("phone", v)} type="tel" placeholder="0901 234 567" required />
                </div>
                <Input label="Địa chỉ cụ thể" value={form.address} onChange={(v) => set("address", v)} placeholder="Số nhà, tên đường, phường/xã..." required />
                <Input label="Tỉnh / Thành phố" value={form.city} onChange={(v) => set("city", v)} placeholder="Ví dụ: Hà Nội" required />
                {user && (
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginTop: 4 }}>
                    <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} style={{ accentColor: DS.primary, width: 18, height: 18 }} />
                    <span style={{ fontSize: 14, color: DS.textSecondary, fontWeight: 500 }}>Lưu làm địa chỉ mặc định</span>
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary, marginBottom: 22 }}>💳 Phương thức thanh toán</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {PAYMENT_METHODS.map(({ value, label, desc }) => (
                <label key={value} style={{
                  display: "flex", flexDirection: "column", gap: 8, padding: "20px",
                  borderRadius: DS.radiusLg,
                  border: `2px solid ${form.payment === value ? DS.primary : DS.border}`,
                  background: form.payment === value ? DS.primaryLight : "#fff",
                  cursor: "pointer", transition: "all 0.2s",
                  position: "relative", overflow: "hidden",
                }}>
                  {form.payment === value && (
                    <div style={{ position: "absolute", top: 12, right: 12, color: DS.primary, fontSize: 20 }}>✅</div>
                  )}
                  <input
                    type="radio" name="pay" value={value}
                    checked={form.payment === value}
                    onChange={() => set("payment", value)}
                    style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                  />
                  <div style={{ fontWeight: 800, fontSize: 16, color: form.payment === value ? DS.primary : DS.textPrimary }}>{label}</div>
                  <div style={{ fontSize: 13, color: DS.textMuted, lineHeight: 1.4 }}>{desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Voucher Section */}
          <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary }}>🎟️ Hand-Me-On Voucher</h3>
              <button onClick={() => setShowVoucherModal(true)} style={{ color: DS.primary, background: "none", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "Be Vietnam Pro, sans-serif" }}>
                Chọn hoặc nhập mã {">"}
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.values(appliedVouchers).some(v => v !== null) ? (
                Object.values(appliedVouchers).filter(v => v !== null).map(v => (
                  <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#F0FDF4", borderRadius: DS.radiusMd, border: `1px dashed ${DS.success}` }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 22 }}>🎟️</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 800, color: DS.success }}>{v.code}</p>
                        <p style={{ fontSize: 12, color: DS.textSecondary }}>{v.desc}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleVoucher(v)} style={{ border: "none", background: "none", color: DS.error, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Gỡ</button>
                  </div>
                ))
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: DS.textMuted }}>
                  <span style={{ fontSize: 20 }}>🎫</span>
                  <p style={{ fontSize: 14 }}>Tiết kiệm hơn với Voucher của chúng tôi</p>
                </div>
              )}
            </div>
          </div>

          {/* Coins Section */}
          {user && userCoins > 0 && (
            <div style={{ background: "#FEF08A", borderRadius: DS.radiusLg, border: `1px solid #FDE047`, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 26 }}>💰</span>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: 16, color: "#854D0E", marginBottom: 2 }}>Hand-Me-On Xu</h3>
                  <p style={{ fontSize: 13, color: "#A16207" }}>Bạn có {userCoins.toLocaleString('vi-VN')} Xu</p>
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <span style={{ fontSize: 14, color: "#854D0E", fontWeight: 700 }}>Dùng {Math.min(totalBeforeCoins, userCoins).toLocaleString('vi-VN')} Xu</span>
                <input
                  type="checkbox"
                  checked={useCoins}
                  onChange={(e) => setUseCoins(e.target.checked)}
                  style={{ width: 22, height: 22, accentColor: "#854D0E" }}
                />
              </label>
            </div>
          )}
        </div>

        {/* Right Column: Summary */}
        <div style={{ position: "sticky", top: 100 }}>
          <div style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 28, boxShadow: DS.shadowSm }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary, marginBottom: 20 }}>Tóm tắt đơn hàng</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
              {cartItems.map(item => (
                <div key={item.id} style={{ display: "flex", gap: 12 }}>
                  <img src={item.images?.[0]} alt="" style={{ width: 50, height: 50, borderRadius: DS.radiusMd, objectFit: "cover" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</p>
                    <p style={{ fontSize: 11, color: DS.textMuted }}>Số lượng: {item.qty || 1}</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: DS.textPrimary, marginTop: 4 }}>{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: 20, display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: DS.textSecondary }}>Tổng tiền hàng</span>
                <span style={{ color: DS.textPrimary, fontWeight: 700 }}>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: DS.textSecondary }}>Phí vận chuyển</span>
                <span style={{ color: DS.textPrimary, fontWeight: 700 }}>{formatPrice(baseShipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: DS.textSecondary }}>Bảo vệ người mua</span>
                <span style={{ color: DS.textPrimary, fontWeight: 700 }}>{formatPrice(protectionFee)}</span>
              </div>
              {shippingDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: DS.success }}>
                  <span>Giảm giá phí vận chuyển</span>
                  <span style={{ fontWeight: 700 }}>-{formatPrice(shippingDiscount)}</span>
                </div>
              )}
              {voucherDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: DS.success }}>
                  <span>Voucher giảm giá</span>
                  <span style={{ fontWeight: 700 }}>-{formatPrice(voucherDiscount)}</span>
                </div>
              )}
              {coinDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#A16207" }}>
                  <span>Dùng Xu</span>
                  <span style={{ fontWeight: 700 }}>-{formatPrice(coinDiscount)}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: `2px dashed ${DS.border}`, paddingTop: 20, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>Tổng cộng</span>
              <span style={{ fontSize: 28, fontWeight: 900, color: DS.primary, letterSpacing: "-0.03em" }}>{formatPrice(total)}</span>
            </div>

            <Button onClick={handlePlaceOrder} disabled={!canSubmit || paying} size="xl" fullWidth>
              {paying ? "Đang xử lý thanh toán..." : "Đặt hàng ngay"}
            </Button>
            
            <div style={{ marginTop: 24, padding: 20, background: "#F0FDF4", borderRadius: DS.radiusLg, border: "1.5px solid #BBF7D0", boxShadow: "0 4px 12px rgba(22, 101, 52, 0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#166534" }}>Thanh toán trung gian (Escrow)</h4>
              </div>
              <p style={{ fontSize: 12, color: "#166534", fontWeight: 500, lineHeight: 1.6 }}>
                Hand-Me-On sẽ giữ tiền của bạn an toàn. Người bán chỉ nhận được tiền khi bạn xác nhận đã nhận hàng thành công và không có khiếu nại.
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Badge color="#166534" bg="#fff" size="xs">🔒 An toàn tuyệt đối</Badge>
                <Badge color="#166534" bg="#fff" size="xs">⚡ Hoàn tiền 100%</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000, padding: 20 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 520, borderRadius: DS.radiusLg, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "85vh", boxShadow: DS.shadowLg }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 900 }}>Chọn Hand-Me-On Voucher</h3>
              <button onClick={() => setShowVoucherModal(false)} style={{ background: "none", border: "none", fontSize: 28, cursor: "pointer", color: DS.textMuted }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {vouchers?.map(v => {
                  const active = appliedVouchers.global?.id === v.id;
                  const disabled = subtotal < v.minOrder;
                  return (
                    <div key={v.id} onClick={() => !disabled && toggleVoucher(v)} style={{
                      display: "flex", border: `2px solid ${active ? DS.primary : DS.border}`,
                      borderRadius: DS.radiusLg, opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer",
                      transition: "all 0.2s", position: "relative"
                    }}>
                      <div style={{ width: 110, background: DS.primary, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, borderRight: "2px dashed #fff" }}>
                        <span style={{ fontSize: 28 }}>🎟️</span>
                        <span style={{ fontSize: 11, fontWeight: 900, marginTop: 6, textAlign: "center" }}>VOUCHER</span>
                      </div>
                      <div style={{ flex: 1, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 15, fontWeight: 900, color: DS.textPrimary, marginBottom: 4 }}>{v.code}</p>
                          <p style={{ fontSize: 12, color: DS.textSecondary, lineHeight: 1.4 }}>
                            {v.type === 'percentage' ? `Giảm ${v.discount}%` : `Giảm ${formatPrice(v.discount)}`} cho đơn từ {formatPrice(v.minOrder)}
                          </p>
                          {disabled && <p style={{ fontSize: 11, color: DS.error, fontWeight: 800, marginTop: 6 }}>⚠️ Mua thêm {formatPrice(v.minOrder - subtotal)}</p>}
                        </div>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${active ? DS.primary : DS.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: active ? DS.primary : "transparent" }}>
                          {active && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: "20px 24px", borderTop: `1px solid ${DS.border}`, display: "flex", justifyContent: "flex-end", gap: 12, background: DS.bgHover }}>
              <Button onClick={() => setShowVoucherModal(false)} variant="outline">Trở lại</Button>
              <Button onClick={() => setShowVoucherModal(false)}>Hoàn thành</Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Payment Overlay */}
      {paying && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, padding: 20 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 440, borderRadius: DS.radiusXl, overflow: "hidden", boxShadow: DS.shadowLg, textAlign: "center", padding: 40 }}>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Quét mã để thanh toán</h3>
            <p style={{ color: DS.textMuted, fontSize: 14, marginBottom: 24 }}>Vui lòng sử dụng ứng dụng {PAYMENT_METHODS.find(p => p.value === form.payment)?.label} để quét mã QR bên dưới.</p>
            
            <div style={{ background: DS.bgHover, padding: 20, borderRadius: DS.radiusLg, marginBottom: 24, display: "inline-block", border: `2px solid ${DS.primary}33` }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`HandMeOnOrder_${Date.now()}`)}`} 
                alt="QR Code" 
                style={{ width: 200, height: 200 }}
              />
            </div>

            <div style={{ textAlign: "left", background: DS.bgMain, padding: 20, borderRadius: DS.radiusMd, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: DS.textMuted }}>Số tiền</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: DS.primary }}>{formatPrice(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: DS.textMuted }}>Người nhận</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>HAND-ME-ON CORP</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: DS.textMuted }}>Nội dung</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>HMO PAYMENT {Math.floor(Math.random()*1000)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button onClick={() => setPaying(false)} variant="outline" fullWidth>Hủy</Button>
              <Button onClick={completeOrder} variant="success" fullWidth>Đã thanh toán</Button>
            </div>
            
            <p style={{ fontSize: 11, color: DS.textMuted, marginTop: 20 }}>
              Hệ thống sẽ tự động xác nhận sau khi nhận được tiền. <br/>
              Vui lòng không đóng cửa sổ này.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
