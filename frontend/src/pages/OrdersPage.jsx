import { useState } from "react";
import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import BackBtn from "../components/common/BackBtn";
import confetti from "canvas-confetti";

const STEPS = {
  pending:   { label: "Chờ xác nhận", icon: "📝", color: "#f59e0b" },
  paid:      { label: "Đã xác nhận",  icon: "✅", color: "#3b82f6" },
  shipping:  { label: "Đang giao",    icon: "🚚", color: "#8b5cf6" },
  completed: { label: "Hoàn thành",   icon: "🎉", color: "#10b981" },
  cancelled: { label: "Đã hủy",       icon: "❌", color: "#ef4444" },
};

const STATUS_COLOR = { pending:"#f59e0b", paid:"#3b82f6", shipping:"#8b5cf6", completed:"#10b981", cancelled:"#ef4444" };

export default function OrdersPage() {
  const { user, setView, showToast } = useApp();
  const [mainTab, setMainTab] = useState("buy"); // buy | sell | offers
  const [filter, setFilter] = useState("all");
  const [loadingActions, setLoadingActions] = useState({});

  const { data: allOrders, loading: ordersLoading, mutate: refetchOrders } =
    useApi(() => fakeApi.getOrders(user?.id), [user?.id]);

  const { data: sellerOffers, loading: offersLoading, mutate: refetchOffers } =
    useApi(() => user ? fakeApi.getOffersForSeller(user.id) : Promise.resolve([]), [user?.id]);

  if (!user) return (
    <div style={{ padding: 80, textAlign: "center", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
      <h2 style={{ marginBottom: 16, color: DS.textPrimary }}>Vui lòng đăng nhập</h2>
      <Button onClick={() => setView("auth")}>Đăng nhập ngay</Button>
    </div>
  );

  const raw = allOrders || [];
  const buyOrders = raw.filter(o => o.buyerId === user.id);
  const sellOrders = raw.filter(o => o.sellerId === user.id);
  const activeOrders = mainTab === "buy" ? buyOrders : sellOrders;

  const filtered = activeOrders.filter(o => {
    if (filter === "all") return true;
    if (filter === "active") return o.status !== "completed" && o.status !== "cancelled";
    return o.status === filter;
  });

  const setLoading = (id, v) => setLoadingActions(p => ({ ...p, [id]: v }));

  // ── Buyer confirms received → release escrow
  const handleReceived = async (orderId) => {
    setLoading(orderId, true);
    try {
      await fakeApi.releaseEscrow(orderId);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      showToast("🎉 Xác nhận nhận hàng thành công! Bạn nhận được xu thưởng!", "success");
      refetchOrders();
    } catch { showToast("Có lỗi xảy ra", "error"); }
    setLoading(orderId, false);
  };

  // ── Seller confirms order
  const handleConfirm = async (orderId, newStatus) => {
    setLoading(orderId, true);
    try {
      const order = raw.find(o => o.id === orderId);
      await fakeApi.updateOrderStatus(orderId, newStatus);
      if (newStatus === "paid" && order) {
        await fakeApi.sendNotification(order.buyerId, "✅ Người bán đã xác nhận!", "Đơn hàng của bạn đã được xác nhận và đang chuẩn bị hàng.", "order");
      }
      if (newStatus === "shipping" && order) {
        await fakeApi.sendNotification(order.buyerId, "🚚 Hàng đang trên đường!", "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển.", "order");
      }
      showToast(`Cập nhật đơn hàng thành công`, "success");
      refetchOrders();
    } catch { showToast("Có lỗi xảy ra", "error"); }
    setLoading(orderId, false);
  };

  const handleCancel = async (orderId) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;
    setLoading(orderId, true);
    try {
      const order = raw.find(o => o.id === orderId);
      await fakeApi.updateOrderStatus(orderId, "cancelled");
      // Unmark reserved products
      if (order?.items) {
        for (const item of order.items) {
          await fakeApi.markProductAvailable && fakeApi.markProductAvailable(item.id);
        }
      }
      showToast("Đã hủy đơn hàng", "info");
      refetchOrders();
    } catch { showToast("Có lỗi", "error"); }
    setLoading(orderId, false);
  };

  // ── Offer actions
  const handleAcceptOffer = async (offerId) => {
    setLoading(offerId, true);
    try {
      await fakeApi.acceptOffer(offerId);
      showToast("✅ Đã chấp nhận lời đề nghị! Người mua sẽ được thông báo.", "success");
      refetchOffers();
    } catch { showToast("Lỗi", "error"); }
    setLoading(offerId, false);
  };

  const handleRejectOffer = async (offerId) => {
    setLoading(offerId, true);
    try {
      await fakeApi.rejectOffer(offerId);
      showToast("Đã từ chối lời đề nghị", "info");
      refetchOffers();
    } catch { showToast("Lỗi", "error"); }
    setLoading(offerId, false);
  };

  const FILTERS = [["all","Tất cả"], ["active","Đang xử lý"], ["pending","Chờ xác nhận"], ["shipping","Đang giao"], ["completed","Hoàn thành"], ["cancelled","Đã hủy"]];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 20px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <BackBtn />

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: DS.textPrimary, letterSpacing: "-0.03em" }}>Quản lý đơn hàng</h1>
        <p style={{ color: DS.textMuted, marginTop: 4, fontSize: 14 }}>Theo dõi tình trạng mua bán của bạn</p>
      </div>

      {/* Main Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${DS.border}`, marginBottom: 20 }}>
        {[
          ["buy", `🛒 Đơn mua (${buyOrders.length})`],
          ["sell", `📦 Đơn bán (${sellOrders.length})`],
          ["offers", `💬 Lời đề nghị (${(sellerOffers || []).filter(o => o.status === "pending").length})`],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setMainTab(id)} style={{
            padding: "12px 24px", border: "none", background: "none", cursor: "pointer",
            fontWeight: mainTab === id ? 700 : 500, fontSize: 15,
            color: mainTab === id ? DS.primary : DS.textSecondary,
            borderBottom: `2px solid ${mainTab === id ? DS.primary : "transparent"}`,
            marginBottom: -2, fontFamily: "inherit", transition: "all 0.2s"
          }}>{label}</button>
        ))}
      </div>

      {/* Perspective Banner */}
      {mainTab === "buy" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: "linear-gradient(135deg,#eff6ff,#dbeafe)", borderRadius: 12, marginBottom: 20, border: "1px solid #bfdbfe" }}>
          <span style={{ fontSize: 24 }}>🛒</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#1e40af", margin: 0 }}>Góc nhìn: Người MUA</p>
            <p style={{ fontSize: 13, color: "#3b82f6", margin: 0 }}>Theo dõi trạng thái giao hàng, xác nhận nhận hàng để giải phóng tiền Escrow cho người bán.</p>
          </div>
        </div>
      )}
      {mainTab === "sell" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 12, marginBottom: 20, border: "1px solid #bbf7d0" }}>
          <span style={{ fontSize: 24 }}>🏪</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, color: "#166534", margin: 0 }}>Góc nhìn: Người BÁN</p>
            <p style={{ fontSize: 13, color: "#16a34a", margin: 0 }}>Xác nhận đơn → Giao vận chuyển → Chờ người mua xác nhận nhận hàng → Tiền tự động về ví.</p>
          </div>
        </div>
      )}

      {/* Offers Tab */}
      {mainTab === "offers" && (
        <div>
          {offersLoading ? <Spinner /> : (sellerOffers || []).length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", background: "#fff", borderRadius: DS.radiusLg, border: `1px dashed ${DS.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p style={{ color: DS.textSecondary }}>Chưa có lời đề nghị nào</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(sellerOffers || []).map(offer => {
                const statusInfo = { pending: { label: "Chờ phản hồi", color: "#f59e0b" }, accepted: { label: "Đã chấp nhận", color: "#10b981" }, rejected: { label: "Đã từ chối", color: "#ef4444" } };
                const s = statusInfo[offer.status] || statusInfo.pending;
                return (
                  <div key={offer.id} style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 20, display: "flex", gap: 16, alignItems: "center", boxShadow: DS.shadowSm }}>
                    {offer.product?.images?.[0] && (
                      <img src={offer.product.images[0]} alt="" style={{ width: 60, height: 60, borderRadius: DS.radiusMd, objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, marginBottom: 4 }}>{offer.product?.title || "Sản phẩm"}</p>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: DS.textMuted }}>Người mua: <strong>{offer.buyer?.name || "—"}</strong></span>
                        <span style={{ fontSize: 13, color: DS.textMuted }}>Giá gốc: <strong>{formatPrice(offer.product?.price || 0)}</strong></span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: DS.primary }}>Đề nghị: {formatPrice(offer.price)}</span>
                        <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: DS.radiusFull, background: s.color + "20", color: s.color, fontWeight: 700 }}>{s.label}</span>
                      </div>
                    </div>
                    {offer.status === "pending" && (
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <Button size="sm" disabled={loadingActions[offer.id]} onClick={() => handleAcceptOffer(offer.id)} style={{ background: "#10b981", border: "none", color: "#fff" }}>
                          {loadingActions[offer.id] ? "..." : "✓ Chấp nhận"}
                        </Button>
                        <Button size="sm" variant="outline" disabled={loadingActions[offer.id]} onClick={() => handleRejectOffer(offer.id)} style={{ color: "#ef4444", borderColor: "#ef4444" }}>
                          Từ chối
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Buy/Sell Orders */}
      {(mainTab === "buy" || mainTab === "sell") && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {FILTERS.map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                padding: "6px 16px", borderRadius: DS.radiusFull,
                border: `1px solid ${filter === v ? DS.primary : DS.border}`,
                background: filter === v ? DS.primaryLight : "#fff",
                color: filter === v ? DS.primary : DS.textSecondary,
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.18s", whiteSpace: "nowrap"
              }}>{l}</button>
            ))}
          </div>

          {ordersLoading ? <Spinner /> : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", background: "#fff", borderRadius: DS.radiusLg, border: `1px dashed ${DS.border}` }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{mainTab === "buy" ? "🛍️" : "🏪"}</div>
              <p style={{ color: DS.textSecondary, fontWeight: 600, fontSize: 15 }}>Chưa có đơn hàng nào.</p>
              {mainTab === "buy" && <Button onClick={() => setView("home")} style={{ marginTop: 16 }}>Mua sắm ngay</Button>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map(order => {
                const stepKeys = ["pending", "paid", "shipping", "completed"];
                const currIdx = stepKeys.indexOf(order.status);
                const isCancelled = order.status === "cancelled";
                const statusInfo = STEPS[order.status] || STEPS.pending;
                return (
                  <div key={order.id} style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, boxShadow: DS.shadowSm, overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${DS.border}`, background: DS.bgHover }}>
                      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary }}>#{order.id.toUpperCase()}</span>
                        <span style={{ fontSize: 12, color: DS.textMuted }}>{order.createdAt}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: DS.radiusFull, background: statusInfo.color + "20", color: statusInfo.color }}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 900, color: DS.primary }}>{formatPrice(order.amount || 0)}</span>
                      </div>
                    </div>

                    <div style={{ padding: "20px" }}>
                      {/* Items */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                        {(order.items || []).map(item => (
                          <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <img src={item.images?.[0]} alt="" onError={e => e.target.style.display="none"} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", border: `1px solid ${DS.border}` }} />
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 13, fontWeight: 600, color: DS.textPrimary, marginBottom: 2 }}>{item.title}</p>
                              <p style={{ fontSize: 12, color: DS.textMuted }}>x{item.qty || 1} · {formatPrice(item.price)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Progress Bar */}
                      {!isCancelled && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", position: "relative", marginBottom: 8 }}>
                            <div style={{ position: "absolute", top: 14, left: "6%", right: "6%", height: 2, background: DS.border }} />
                            <div style={{ position: "absolute", top: 14, left: "6%", width: currIdx > 0 ? `${(currIdx / 3) * 88}%` : "0%", height: 2, background: DS.success, transition: "width 0.6s" }} />
                            {stepKeys.map((k, i) => {
                              const done = i <= currIdx;
                              return (
                                <div key={k} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                                  <div style={{
                                    width: 30, height: 30, borderRadius: "50%",
                                    background: done ? DS.success : "#fff",
                                    border: `2px solid ${done ? DS.success : DS.border}`,
                                    color: done ? "#fff" : DS.textMuted,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 12, transition: "all 0.3s"
                                  }}>{done ? STEPS[k].icon : i + 1}</div>
                                  <span style={{ fontSize: 11, fontWeight: done ? 700 : 400, color: done ? DS.textPrimary : DS.textMuted, textAlign: "center" }}>{STEPS[k].label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {isCancelled && (
                        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, marginBottom: 16, textAlign: "center" }}>
                          <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 14 }}>❌ Đơn hàng đã bị hủy</p>
                        </div>
                      )}

                      {/* Escrow Badge */}
                      {order.escrowStatus === "held_by_platform" && !isCancelled && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, marginBottom: 16 }}>
                          <span>🛡️</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>Tiền đang được HMO bảo vệ an toàn (Escrow)</span>
                        </div>
                      )}
                      {order.escrowStatus === "released_to_seller" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 16 }}>
                          <span>✅</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: DS.textSecondary }}>Giao dịch hoàn tất · Tiền đã chuyển cho người bán</span>
                        </div>
                      )}

                      {/* Shipping info */}
                      {order.status === "shipping" && order.shippingAddress && (
                        <div style={{ background: DS.bgHover, borderRadius: 8, padding: 12, marginBottom: 16 }}>
                          <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 4 }}>🏠 Địa chỉ nhận hàng</p>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>{order.shippingAddress.name} · {order.shippingAddress.phone}</p>
                          <p style={{ fontSize: 12, color: DS.textSecondary }}>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 14, borderTop: `1px solid ${DS.border}` }}>
                        {/* Buyer actions */}
                        {mainTab === "buy" && (
                          <>
                            {order.status === "shipping" && (
                              <Button
                                size="sm"
                                disabled={loadingActions[order.id]}
                                onClick={() => handleReceived(order.id)}
                                style={{ background: DS.success, border: "none", color: "#fff" }}
                              >
                                {loadingActions[order.id] ? "Đang xử lý..." : "📦 Đã nhận hàng"}
                              </Button>
                            )}
                            {order.status === "pending" && (
                              <Button size="sm" variant="outline" style={{ color: DS.error, borderColor: DS.error }} disabled={loadingActions[order.id]} onClick={() => handleCancel(order.id)}>Hủy đơn</Button>
                            )}
                            {order.status === "completed" && (
                              <Button size="sm" variant="outline" onClick={() => setView("product", { id: (order.items?.[0]?.id) })}>⭐ Đánh giá</Button>
                            )}
                          </>
                        )}

                        {/* Seller actions */}
                        {mainTab === "sell" && (
                          <>
                            {order.status === "pending" && (
                              <Button size="sm" disabled={loadingActions[order.id]} onClick={() => handleConfirm(order.id, "paid")}>
                                {loadingActions[order.id] ? "..." : "✅ Xác nhận đơn"}
                              </Button>
                            )}
                            {order.status === "paid" && (
                              <Button size="sm" disabled={loadingActions[order.id]} onClick={() => handleConfirm(order.id, "shipping")} style={{ background: "#8b5cf6", border: "none", color: "#fff" }}>
                                {loadingActions[order.id] ? "..." : "🚚 Đã giao vận chuyển"}
                              </Button>
                            )}
                            {order.status !== "completed" && order.status !== "cancelled" && (
                              <Button size="sm" variant="outline" style={{ color: DS.error, borderColor: DS.error }} disabled={loadingActions[order.id]} onClick={() => handleCancel(order.id)}>Hủy đơn</Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
