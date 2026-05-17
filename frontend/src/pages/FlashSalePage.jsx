import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const tick = () => setTimeLeft(Math.max(0, endTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  const pad = n => String(n).padStart(2, "0");

  if (timeLeft === 0) return <span style={{ color: DS.error, fontWeight: 700, fontSize: 13 }}>Đã kết thúc</span>;

  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[[h, "GIỜ"], [m, "PHÚT"], [s, "GIÂY"]].map(([val, unit], i) => (
        <span key={unit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <span style={{
            background: "#1e1e2e", color: "#fff", fontWeight: 900, fontSize: 18,
            padding: "4px 8px", borderRadius: 6, fontFamily: "monospace", minWidth: 36, textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}>{pad(val)}</span>
          <span style={{ fontSize: 8, color: DS.textMuted, letterSpacing: "0.08em" }}>{unit}</span>
          {i < 2 && <span style={{ position: "absolute", marginLeft: 40, fontSize: 16, fontWeight: 900, color: DS.error }}>:</span>}
        </span>
      ))}
    </div>
  );
}

function FlashSaleCard({ item, onBuy, onDetail }) {
  const [hovered, setHovered] = useState(false);
  const progress = Math.min(100, Math.round((item.sold / item.stock) * 100));
  const remaining = item.stock - item.sold;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff", borderRadius: DS.radiusLg,
        border: `2px solid ${hovered ? DS.primary : DS.border}`,
        boxShadow: hovered ? DS.shadowMd : DS.shadowSm,
        overflow: "hidden", transition: "all 0.25s",
        transform: hovered ? "translateY(-4px)" : "none",
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Discount Badge */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 2,
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "#fff", fontWeight: 900, fontSize: 16, padding: "4px 10px",
        borderRadius: DS.radiusFull, boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
        letterSpacing: "-0.02em"
      }}>
        -{item.discount}%
      </div>
      {/* Label */}
      <div style={{
        position: "absolute", top: 12, right: 12, zIndex: 2,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
        color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: DS.radiusFull
      }}>
        {item.label}
      </div>

      {/* Image */}
      <div style={{ position: "relative", paddingTop: "65%", overflow: "hidden", background: DS.bgHover }}>
        <img
          src={item.product?.images[0]}
          alt=""
          onClick={() => onDetail(item)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            transition: "transform 0.4s",
            transform: hovered ? "scale(1.06)" : "scale(1)"
          }}
        />
      </div>

      <div style={{ padding: "18px 20px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, marginBottom: 10, lineHeight: 1.4, minHeight: 38, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {item.product?.title}
        </p>

        {/* Prices */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: DS.error, letterSpacing: "-0.03em" }}>
            {formatPrice(item.salePrice)}
          </span>
          <span style={{ fontSize: 12, color: DS.textMuted, textDecoration: "line-through" }}>
            {formatPrice(item.originalPrice)}
          </span>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: 12 }}>
          <CountdownTimer endTime={item.endTime} />
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: DS.textMuted }}>
              Đã bán {item.sold}/{item.stock}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: progress >= 70 ? DS.error : DS.warning }}>
              Còn {remaining} sản phẩm
            </span>
          </div>
          <div style={{ height: 6, background: "#f1f5f9", borderRadius: DS.radiusFull, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: DS.radiusFull,
              background: progress >= 80 ? "linear-gradient(90deg, #ef4444, #f97316)" : "linear-gradient(90deg, #f97316, #eab308)",
              width: `${progress}%`, transition: "width 0.6s"
            }} />
          </div>
        </div>

        <button
          onClick={() => onBuy(item)}
          style={{
            width: "100%", padding: "10px", borderRadius: DS.radiusMd, border: "none",
            background: remaining === 0 ? DS.borderInput : "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "#fff", fontWeight: 800, fontSize: 14, cursor: remaining === 0 ? "not-allowed" : "pointer",
            fontFamily: "Be Vietnam Pro, sans-serif",
            boxShadow: remaining === 0 ? "none" : "0 4px 12px rgba(239,68,68,0.35)",
            transition: "all 0.2s",
          }}
          disabled={remaining === 0}
        >
          {remaining === 0 ? "Hết hàng" : "🛒 Mua ngay với giá ưu đãi"}
        </button>
      </div>
    </div>
  );
}

export default function FlashSalePage() {
  const { setView, setSelectedProduct, handleAddToCart, showToast } = useApp();
  const { data: flashSales, loading } = useApi(() => fakeApi.getFlashSales());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const handleBuy = (item) => {
    const fakeProduct = { ...item.product, price: item.salePrice };
    handleAddToCart(fakeProduct);
    showToast(`⚡ Đã thêm Flash Sale vào giỏ! Tiết kiệm ${formatPrice(item.originalPrice - item.salePrice)}`, "success");
  };

  const handleDetail = (item) => {
    setSelectedProduct(item.product);
    setView("product");
  };

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif", background: "#0f0f1a", minHeight: "100vh" }}>

      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a0a 0%, #2d0b0b 40%, #1a0a1a 100%)",
        padding: "64px 28px 52px",
        position: "relative", overflow: "hidden",
        borderBottom: "2px solid rgba(239,68,68,0.3)"
      }}>
        {/* Animated background orbs */}
        {[
          { top: -60, left: -40, size: 300, color: "rgba(239,68,68,0.15)" },
          { bottom: -80, right: -60, size: 400, color: "rgba(249,115,22,0.1)" },
          { top: "40%", left: "50%", size: 200, color: "rgba(234,179,8,0.08)" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute", top: o.top, bottom: o.bottom, left: o.left, right: o.right,
            width: o.size, height: o.size, borderRadius: "50%", background: o.color,
            filter: "blur(40px)"
          }} />
        ))}

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", padding: "8px 20px", borderRadius: DS.radiusFull,
            fontSize: 13, fontWeight: 700, marginBottom: 24,
            animation: "pulse 2s infinite"
          }}>
            <span style={{ width: 8, height: 8, background: "#ef4444", borderRadius: "50%", display: "inline-block", boxShadow: "0 0 8px #ef4444" }} />
            LIVE NOW — Flash Sale đang diễn ra
          </div>

          <h1 style={{
            fontSize: 60, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
            background: "linear-gradient(135deg, #fff 0%, #fca5a5 50%, #ef4444 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 16
          }}>
            ⚡ FLASH SALE
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 17, marginBottom: 40 }}>
            Ưu đãi sập sàn — Chỉ trong thời gian giới hạn. Số lượng có hạn!
          </p>

          <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              ["🔥", `${flashSales?.length || 0}`, "Ưu đãi đang chạy"],
              ["💰", "Đến 30%", "Giảm giá tối đa"],
              ["⚡", "Giới hạn", "Số lượng cực ít"],
            ].map(([icon, val, label]) => (
              <div key={label} style={{ textAlign: "center", color: "#fff" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>{val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "48px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 4 }}>
              Sản phẩm Flash Sale
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
              {flashSales?.length || 0} sản phẩm giảm giá sốc
            </p>
          </div>
          <button onClick={() => setView("search")} style={{
            color: "#f87171", fontWeight: 700, fontSize: 14,
            border: "1.5px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)",
            cursor: "pointer", padding: "8px 18px", borderRadius: DS.radiusFull,
            fontFamily: "Be Vietnam Pro, sans-serif", transition: "all 0.2s"
          }}>
            Xem tất cả →
          </button>
        </div>

        {loading ? (
          <Spinner text="Đang tải Flash Sale..." />
        ) : flashSales?.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
            <p style={{ fontSize: 18 }}>Flash Sale tiếp theo sắp diễn ra!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {flashSales.map(item => (
              <FlashSaleCard key={item.id} item={item} onBuy={handleBuy} onDetail={handleDetail} />
            ))}
          </div>
        )}

        {/* Tips Banner */}
        <div style={{
          marginTop: 64, background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: DS.radiusXl, padding: "32px 36px",
          display: "flex", gap: 40, flexWrap: "wrap", justifyContent: "center"
        }}>
          {[
            ["⚡", "Mua nhanh kẻo hết", "Số lượng Flash Sale cực kỳ giới hạn"],
            ["🔔", "Bật thông báo", "Nhận ngay khi có Flash Sale mới"],
            ["🛡️", "Bảo vệ người mua", "Hoàn tiền nếu hàng không đúng mô tả"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ textAlign: "center", maxWidth: 200 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
              <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
