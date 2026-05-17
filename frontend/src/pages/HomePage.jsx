import { useState, useCallback } from "react";
import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import ProductCard from "../components/common/ProductCard";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import SpinTheWheel from "../components/common/SpinTheWheel";
import { useEffect } from "react";
import "../design/premium.css";

function Countdown({ hours = 2, minutes = 0, seconds = 0 }) {
  const [time, setTime] = useState({ h: hours, m: minutes, s: seconds });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n) => n.toString().padStart(2, "0");

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {[["H", time.h], ["M", time.m], ["S", time.s]].map(([label, val], i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ background: "#000", color: "#fff", padding: "4px 8px", borderRadius: 6, fontSize: 18, fontWeight: 900, minWidth: 32, textAlign: "center" }}>
            {format(val)}
          </div>
          {i < 2 && <span style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Sub-components (extracted so they can use hooks safely) ─────────────────

function TrustCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)", 
        backdropFilter: "blur(12px)",
        borderRadius: DS.radiusLg,
        border: `1.5px solid ${hovered ? DS.primary : "rgba(255,255,255,0.3)"}`,
        padding: "30px 24px", textAlign: "center", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.1)" : "0 10px 20px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "none",
      }}
    >
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: hovered ? DS.primary : DS.bgHover, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 18px", transition: "all 0.3s", color: hovered ? "#fff" : DS.textPrimary, boxShadow: hovered ? DS.shadowPrimary : "none" }}>{icon}</div>
      <h4 style={{ fontWeight: 800, color: DS.textPrimary, marginBottom: 10, fontSize: 16, letterSpacing: "-0.02em" }}>{title}</h4>
      <p style={{ fontSize: 14, color: DS.textMuted, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function FlashSaleCard({ item, onViewProduct, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const remaining = item.stock - item.sold;
  const progress = Math.round((item.sold / item.stock) * 100);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onViewProduct(item.product)}
      style={{
        background: "#fff", borderRadius: DS.radiusLg, padding: 16,
        border: `3px solid ${hovered ? "#dc2626" : "#ef4444"}`,
        boxShadow: hovered ? "0 20px 48px rgba(239,68,68,0.35)" : "0 12px 32px rgba(239,68,68,0.25)",
        transform: hovered ? "translateY(-6px) scale(1.01)" : "none",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        cursor: "pointer", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 2, background: "#ef4444", color: "#fff", fontWeight: 900, padding: "6px 12px", borderRadius: DS.radiusFull, fontSize: 16, boxShadow: "0 4px 12px rgba(239,68,68,0.4)", transform: "rotate(-5deg)" }}>
        -{item.discount}%
      </div>
      <div style={{ position: "relative", paddingTop: "75%", borderRadius: DS.radiusMd, overflow: "hidden", background: DS.bgHover }}>
        <img src={item.product?.images[0]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hovered ? "scale(1.08)" : "scale(1)" }} />
      </div>
      <div style={{ marginTop: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: DS.textPrimary, marginBottom: 8, lineHeight: 1.3, height: 40, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {item.product?.title}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#ef4444" }}>{formatPrice(item.salePrice)}</span>
          <span style={{ fontSize: 13, color: DS.textMuted, textDecoration: "line-through", fontWeight: 600 }}>{formatPrice(item.originalPrice)}</span>
        </div>
        <div style={{ background: "#f1f5f9", height: 10, borderRadius: DS.radiusFull, overflow: "hidden", position: "relative", marginBottom: 4 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #f97316, #ef4444)", borderRadius: DS.radiusFull, transition: "width 0.6s ease" }} />
        </div>
        <p style={{ fontSize: 11, color: DS.textMuted, marginBottom: 14 }}>Đã bán {progress}% · Còn {remaining} sản phẩm</p>
        <button
          onClick={(e) => { e.stopPropagation(); remaining > 0 && onAddToCart(item); }}
          disabled={remaining === 0}
          style={{
            width: "100%", padding: "12px", borderRadius: DS.radiusMd,
            background: remaining === 0 ? DS.borderInput : (hovered ? "#0f172a" : "#1e293b"),
            color: "#fff", fontWeight: 900, fontSize: 14, border: "none",
            cursor: remaining === 0 ? "not-allowed" : "pointer",
            textTransform: "uppercase", letterSpacing: "0.03em",
            transition: "background 0.2s", fontFamily: "Be Vietnam Pro, sans-serif",
          }}
        >
          {remaining === 0 ? "HẾT HÀNG" : "CHỐT ĐƠN NGAY ⚡"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user, setView, setSelectedProduct, watchedIds, handleWatch, handleAddToCart, showToast } = useApp();
  const [cardPositions, setCardPositions] = useState([
    { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }
  ]);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const [heroProducts, setHeroProducts] = useState([]);

  const handleMouseDown = (e, index) => {
    // Account for current parallax offset when starting drag
    const container = document.getElementById('hero-graphic');
    if (!container) return;
    const mx = parseFloat(container.style.getPropertyValue('--mx') || 0);
    const my = parseFloat(container.style.getPropertyValue('--my') || 0);
    const d = heroProducts[index]?.d || -1;
    const parallaxX = mx * d * 40;
    const parallaxY = my * d * 40;

    setDraggingIdx(index);
    setDragOrigin({ 
      x: e.clientX - (cardPositions[index].x + parallaxX), 
      y: e.clientY - (cardPositions[index].y + parallaxY) 
    });
    setHasMoved(false);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const all = await fakeApi.getProducts();
        // Priority: Watched products, then random/featured
        let selection = [];
        if (watchedIds && watchedIds.length > 0) {
          selection = all.filter(p => watchedIds.includes(p.id));
        }
        
        if (selection.length < 3) {
          const others = all.filter(p => !selection.find(s => s.id === p.id));
          selection = [...selection, ...others.slice(0, 3 - selection.length)];
        }
        
        setHeroProducts(selection.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchHeroData();
  }, [watchedIds]);

  const handleMouseMoveGlobal = useCallback((e) => {
    if (draggingIdx === null) return;
    
    const container = document.getElementById('hero-graphic');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    // Allow some overflow but keep it mostly within sight
    const padding = 100;
    const newX = Math.max(-rect.width/2 - padding, Math.min(rect.width/2 + padding, e.clientX - dragOrigin.x));
    const newY = Math.max(-rect.height/2 - padding, Math.min(rect.height/2 + padding, e.clientY - dragOrigin.y));
    
    // Threshold to distinguish click from drag (more than 3 pixels)
    if (!hasMoved && (Math.abs(newX - cardPositions[draggingIdx].x) > 3 || Math.abs(newY - cardPositions[draggingIdx].y) > 3)) {
      setHasMoved(true);
    }

    setCardPositions(prev => {
      const next = [...prev];
      next[draggingIdx] = { x: newX, y: newY };
      return next;
    });
  }, [draggingIdx, dragOrigin, cardPositions, hasMoved]);

  const handleMouseUpGlobal = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  useEffect(() => {
    if (draggingIdx !== null) {
      document.body.style.userSelect = "none";
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    } else {
      document.body.style.userSelect = "auto";
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    }
    return () => {
      document.body.style.userSelect = "auto";
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [draggingIdx, handleMouseMoveGlobal, handleMouseUpGlobal]);

  const [activeCategory, setActiveCategory] = useState(null);
  const [feedTab, setFeedTab] = useState("discover"); // "discover" | "following"
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setPage(1);
  }, [activeCategory, feedTab]);

  const getProducts = useCallback(() => fakeApi.getProducts(), []);
  const getCategories = useCallback(() => fakeApi.getCategories(), []);
  const getFlashSales = useCallback(() => fakeApi.getFlashSales(), []);

  const { data: products, loading } = useApi(getProducts, []);
  const { data: categories } = useApi(getCategories, []);
  const { data: flashSales } = useApi(getFlashSales, []);
  const { data: topSellers } = useApi(() => fakeApi.getLeaderboard(), []);
  const { data: recommendations } = useApi(() => fakeApi.getRecommendedProducts(4), []);
  const { data: lives } = useApi(() => fakeApi.getLives(), []);

  const activeLive = lives?.[0]; // Main live
  const videoLives = lives?.slice(1) || []; // Secondary lives

  const filtered = (products || []).filter(p => !activeCategory || p.category === activeCategory);
  const followingProducts = user ? (products || []).filter(p => (user.following || []).includes(p.sellerId)) : [];
  
  const sourceProducts = feedTab === "following" ? followingProducts : filtered;
  const totalPages = Math.ceil(sourceProducts.length / itemsPerPage);
  const displayProducts = sourceProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setView("product");
  };

  const handleFlashAddToCart = ({ product, salePrice, originalPrice }) => {
    handleAddToCart({ ...product, price: salePrice });
    showToast(`⚡ Đã thêm! Tiết kiệm ${formatPrice(originalPrice - salePrice)}`, "success");
  };

  const TRUST_ITEMS = [
    { icon: "🛡️", title: "Bảo vệ người mua", desc: "Hoàn tiền 100% nếu hàng không đúng mô tả" },
    { icon: "⚡", title: "Nhanh & An toàn", desc: "Người bán đã xác minh, thanh toán bảo mật" },
    { icon: "💬", title: "Thương lượng trực tiếp", desc: "Nhắn tin và thỏa thuận giá với người bán" },
    { icon: "♻️", title: "Sống xanh", desc: "Giảm lãng phí, cho đồ cũ một cuộc đời mới" },
  ];

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{ 
        background: "#0F172A", 
        padding: "80px 28px", 
        position: "relative", 
        overflow: "hidden",
        minHeight: "500px",
        display: "flex",
        alignItems: "center",
        userSelect: draggingIdx !== null ? "none" : "auto"
      }}>
        {/* Animated Background Mesh */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 20% 30%, #4F46E5 0%, transparent 40%), radial-gradient(circle at 80% 70%, #7C3AED 0%, transparent 40%), radial-gradient(circle at 50% 50%, #1E1B4B 0%, transparent 100%)",
          opacity: 0.8,
          zIndex: 0
        }} />
        
        {/* Floating Background Particles (Animated via CSS) */}
        <style>{`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          .floating { animation: float 6s ease-in-out infinite; }
          .floating-delayed { animation: float 8s ease-in-out infinite; animation-delay: 1s; }
        `}</style>

        <div style={{ position: "absolute", top: "10%", left: "5%", width: 120, height: 120, background: "rgba(255,255,255,0.03)", borderRadius: "30%", filter: "blur(2px)" }} className="floating" />
        <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 180, height: 180, background: "rgba(255,255,255,0.02)", borderRadius: "40%", filter: "blur(4px)" }} className="floating-delayed" />
        {/* Background blobs */}
        <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.1)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: -50, left: -50, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", filter: "blur(40px)" }} />
        
        <div style={{ position: "relative", maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
          {/* Left Content */}
          <div style={{ flex: "1 1 500px", color: "#fff" }}>
            <div style={{ marginBottom: 20 }}>
              <Badge color="#FDE047" bg="rgba(253,224,71,0.15)" size="md">✨ Nền tảng trao đổi đồ cũ số 1 Việt Nam</Badge>
            </div>
            <h1 style={{ fontSize: "clamp(40px, 5vw, 60px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.04em" }}>
              Mua Thông Minh,<br />Bán <span style={{ color: "#FDE047" }}>Nhanh Gọn.</span>
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 40, lineHeight: 1.7, maxWidth: 540 }}>
              Hand-Me-On giúp bạn thanh lý đồ cũ trong 30 giây và tìm kiếm những món đồ chất lượng với giá hời nhất từ cộng đồng uy tín.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Button onClick={() => setView("search")} size="xl" style={{ background: "#fff", color: "#4F46E5", padding: "16px 36px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)" }}>Khám phá ngay ➔</Button>
              <Button onClick={() => setView("create-listing")} size="xl" variant="outline" style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff", padding: "16px 36px" }}>Đăng bán miễn phí</Button>
            </div>
            
            <div style={{ display: "flex", gap: 40, marginTop: 56, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[["1.2M+", "Giao dịch"], ["500K+", "Người dùng"], ["4.9★", "Đánh giá"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{v}</div>
                  <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image/Graphic */}
          <div 
            id="hero-graphic"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              e.currentTarget.style.setProperty('--mx', x);
              e.currentTarget.style.setProperty('--my', y);
            }}
            style={{ 
              flex: "1 1 450px", position: "relative", display: "flex", justifyContent: "center",
              "--mx": 0, "--my": 0
            }}
          >
            {/* Interactive Floating Cards with REAL DATA */}
            {heroProducts.map((p, idx) => {
              const configs = [
                { s: { top: -80, left: -140 }, a: "float 7s", d: -1 },
                { s: { bottom: 20, left: -160 }, a: "float 7s", d: -0.8 },
                { s: { bottom: -30, right: -120 }, a: "float 7s", d: -1 },
              ];
              const item = { 
                id: p.id, 
                n: p.title, 
                p: new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price), 
                i: p.images[0], 
                s: configs[idx].s, 
                a: configs[idx].a, 
                d: configs[idx].d 
              };
              const hasThisCardMoved = cardPositions[idx].x !== 0 || cardPositions[idx].y !== 0;
              
              return (
              <div 
                key={item.id}
                onMouseDown={(e) => handleMouseDown(e, idx)}
                onClick={async (e) => { 
                  if (!hasMoved) {
                    try {
                      const fullProduct = await fakeApi.getProductById(item.id);
                      if (fullProduct) {
                        setSelectedProduct(fullProduct);
                        setView('product'); 
                      }
                    } catch (err) {
                      showToast("Sản phẩm không còn tồn tại", "error");
                    }
                  } 
                }}
                style={{ 
                  position: "absolute", ...item.s, background: "rgba(255,255,255,0.95)", padding: "12px 16px", borderRadius: 24, 
                  boxShadow: draggingIdx === idx ? "0 30px 60px rgba(0,0,0,0.4)" : "0 20px 50px rgba(0,0,0,0.3)", 
                  display: "flex", alignItems: "center", gap: 14,
                  zIndex: draggingIdx === idx ? 100 : 20, 
                  animation: (draggingIdx === idx || hasThisCardMoved) ? "none" : `${item.a} infinite alternate ease-in-out`, 
                  cursor: draggingIdx === idx ? "grabbing" : "grab", 
                  userSelect: "none",
                  backdropFilter: "blur(10px)",
                  border: draggingIdx === idx ? `2px solid ${DS.primary}` : "1px solid rgba(255,255,255,0.3)",
                  transition: draggingIdx === idx ? "none" : "background 0.3s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: draggingIdx === idx 
                    ? `translate3d(${cardPositions[idx].x}px, ${cardPositions[idx].y}px, 0) scale(1.05)`
                    : `translate3d(calc(var(--mx) * ${item.d * 40}px + ${cardPositions[idx].x}px), calc(var(--my) * ${item.d * 40}px + ${cardPositions[idx].y}px), 0)`
                }}
              >
                <div style={{ position: "relative", pointerEvents: "none" }}>
                  <img src={item.i} style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: -4, right: -4, width: 12, height: 12, background: "#10b981", borderRadius: "50%", border: "2px solid #fff" }} />
                </div>
                <div style={{ whiteSpace: "nowrap", pointerEvents: "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#0F172A", letterSpacing: "-0.02em" }}>{item.n}</div>
                  <div style={{ fontSize: 11, color: DS.success, fontWeight: 800 }}>{item.p}</div>
                </div>
              </div>
              );
            })}

            <div 
              onClick={async () => {
                if (activeLive?.productIds?.[0]) {
                  const p = await fakeApi.getProductById(activeLive.productIds[0]);
                  handleViewProduct(p);
                }
              }}
              style={{ 
                position: "relative", width: "100%", maxWidth: 600, aspectRatio: "16/9", 
                borderRadius: 32, overflow: "hidden", boxShadow: "0 40px 80px -15px rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.2)", background: "#000",
                transform: "perspective(1000px) rotateY(-8deg) rotateX(4deg)",
                cursor: "pointer"
              }}
            >
              <video 
                src={activeLive?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"} 
                autoPlay loop muted playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 60%)" }} />
              
              <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "8px 16px", borderRadius: DS.radiusFull, border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", boxShadow: "0 0 10px #10b981" }} />
                LIVE: {activeLive?.viewers?.toLocaleString() || "1.429"} Đang xem
              </div>

              <div style={{ position: "absolute", bottom: 30, left: 30, right: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 56, height: 56, background: "rgba(255,255,255,0.95)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: DS.shadowLg }}>🧥</div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{activeLive?.title || "Áo khoác Vintage"}</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>Chạm để xem sản phẩm</p>
                  </div>
                </div>
                <button style={{ padding: "10px 20px", borderRadius: DS.radiusMd, background: DS.primary, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: DS.shadowPrimary }}>Xem ngay</button>
              </div>
            </div>
            
            {/* Floating Badges */}
            <div style={{ position: "absolute", top: -20, left: 20, background: "#fff", padding: "12px 20px", borderRadius: 20, boxShadow: DS.shadowLg, display: "flex", alignItems: "center", gap: 10, animation: "float 4s ease-in-out infinite" }}>
              <span style={{ fontSize: 24 }}>⭐</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>4.9/5</p>
                <p style={{ fontSize: 10, color: DS.textMuted, margin: 0 }}>Uy tín tuyệt đối</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category bar ── */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${DS.border}`, padding: "14px 28px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{ padding: "7px 18px", borderRadius: DS.radiusFull, border: `1.5px solid ${!activeCategory ? DS.primary : DS.border}`, background: !activeCategory ? DS.primary : "#fff", color: !activeCategory ? "#fff" : DS.textSecondary, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Be Vietnam Pro, sans-serif", transition: "all 0.18s" }}
          >
            Tất cả
          </button>
          {(categories || []).map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id === activeCategory ? null : c.id)}
              style={{ padding: "7px 18px", borderRadius: DS.radiusFull, border: `1.5px solid ${activeCategory === c.id ? DS.primary : DS.border}`, background: activeCategory === c.id ? DS.primary : "#fff", color: activeCategory === c.id ? "#fff" : DS.textSecondary, fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "Be Vietnam Pro, sans-serif", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 5 }}
            >
              {c.icon} {c.name} <span style={{ fontSize: 10, opacity: 0.65 }}>({c.count?.toLocaleString("vi-VN")})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Social Row (Stories) ── */}
      {user && (
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "32px 28px 0" }}>
          <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
            <div style={{ flexShrink: 0, textAlign: "center", cursor: "pointer" }}>
              <div style={{ 
                width: 72, height: 72, borderRadius: "50%", background: "#F1F5F9", 
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                border: "2px dashed #CBD5E1", marginBottom: 8
              }}>
                ➕
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: DS.textSecondary }}>Đăng tin</span>
            </div>
            
            {/* Mocking Following/Top Stories */}
            {topSellers?.map(s => (
              <div key={s.id} style={{ flexShrink: 0, textAlign: "center", cursor: "pointer" }} onClick={() => setView("store", s)}>
                <div style={{ 
                  width: 72, height: 72, borderRadius: "50%", padding: 3,
                  background: DS.gradientPrimary, marginBottom: 8, transition: "transform 0.2s"
                }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  <img src={s.avatar} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "3px solid #fff" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: DS.textPrimary, display: "block", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name.split(' ').pop()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Flash Sale ── */}
      {flashSales?.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #3d0b0b 50%, #1a0a1a 100%)", padding: "48px 28px", borderBottom: "4px solid #ef4444", borderTop: "4px solid #ef4444", boxShadow: "0 0 40px rgba(239,68,68,0.3) inset" }}>
          <div style={{ maxWidth: 1360, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#ef4444", color: "#fff", padding: "6px 16px", borderRadius: DS.radiusFull, fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", boxShadow: "0 4px 16px rgba(239,68,68,0.5)", animation: "pulse 1.5s infinite" }}>
                    <span style={{ fontSize: 18 }}>⚡</span> FLASH SALE
                  </div>
                  <Countdown hours={1} minutes={45} seconds={20} />
                </div>
                <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.1, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                  SIÊU SALE <span style={{ color: "#fca5a5" }}>CHỚP NHOÁNG</span>
                </h2>
              </div>
              <Button onClick={() => setView("flashsale")} size="lg" style={{ background: "linear-gradient(135deg, #f97316, #ef4444)", border: "none", color: "#fff", fontWeight: 900, boxShadow: "0 8px 24px rgba(239,68,68,0.4)" }}>
                XEM TẤT CẢ DEALS SỐC ➔
              </Button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
              {flashSales.slice(0, 4).map(item => (
                <FlashSaleCard key={item.id} item={item} onViewProduct={handleViewProduct} onAddToCart={handleFlashAddToCart} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Products ── */}
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "44px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", gap: 32, marginBottom: 12 }}>
              <button onClick={() => setFeedTab("discover")} style={{ padding: "0 0 8px 0", background: "none", border: "none", borderBottom: `3px solid ${feedTab === "discover" ? DS.primary : "transparent"}`, color: feedTab === "discover" ? DS.primary : DS.textSecondary, fontWeight: feedTab === "discover" ? 800 : 600, fontSize: 22, cursor: "pointer", transition: "all 0.2s", fontFamily: "Be Vietnam Pro, sans-serif" }}>Khám phá</button>
              {user && <button onClick={() => setFeedTab("following")} style={{ padding: "0 0 8px 0", background: "none", border: "none", borderBottom: `3px solid ${feedTab === "following" ? DS.primary : "transparent"}`, color: feedTab === "following" ? DS.primary : DS.textSecondary, fontWeight: feedTab === "following" ? 800 : 600, fontSize: 22, cursor: "pointer", transition: "all 0.2s", fontFamily: "Be Vietnam Pro, sans-serif" }}>Đang theo dõi</button>}
            </div>
            {feedTab === "discover" ? (
              <p style={{ color: DS.textMuted, fontSize: 14 }}>{filtered.length} sản phẩm có sẵn</p>
            ) : (
              <p style={{ color: DS.textMuted, fontSize: 14 }}>Sản phẩm mới từ những người bạn theo dõi</p>
            )}
          </div>
          <button onClick={() => setView("search")} style={{ color: DS.primary, fontWeight: 700, fontSize: 14, border: `1.5px solid ${DS.primary}`, background: "none", cursor: "pointer", padding: "8px 18px", borderRadius: DS.radiusFull, fontFamily: "Be Vietnam Pro, sans-serif" }}>
            Xem tất cả →
          </button>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: DS.radiusLg }} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div style={{ padding: "80px 20px", textAlign: "center", background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}` }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: DS.textPrimary, marginBottom: 8 }}>Chưa có sản phẩm nào</h3>
            <p style={{ color: DS.textMuted }}>{feedTab === "following" ? "Những người bạn theo dõi chưa đăng sản phẩm nào mới." : "Không có sản phẩm nào trong danh mục này."}</p>
            {feedTab === "following" && <Button onClick={() => setFeedTab("discover")} style={{ marginTop: 20 }}>Khám phá thêm</Button>}
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
              {displayProducts.map(p => (
                <ProductCard key={p.id} product={p} watched={watchedIds?.includes(p.id)} onWatch={handleWatch} onClick={handleViewProduct} />
              ))}
            </div>

            {/* Modern Floating Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: 12, 
                  background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(12px)", 
                  padding: "8px 16px", borderRadius: DS.radiusFull, 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02) inset",
                  border: "1px solid rgba(255,255,255,0.6)"
                }}>
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    style={{ 
                      width: 44, height: 44, borderRadius: "50%", border: "none", 
                      background: page === 1 ? "transparent" : "#fff", 
                      color: page === 1 ? DS.textMuted : DS.textPrimary,
                      cursor: page === 1 ? "not-allowed" : "pointer", 
                      fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s", boxShadow: page === 1 ? "none" : DS.shadowSm
                    }}
                  >
                    «
                  </button>
                  
                  <div style={{ display: "flex", gap: 8, padding: "0 8px" }}>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      // Simple logic to show near pages
                      let pNum = i + 1;
                      if (totalPages > 5 && page > 3) {
                        pNum = page - 2 + i;
                        if (pNum > totalPages) return null; // Hide if exceeds
                      }

                      return (
                        <button 
                          key={pNum} 
                          onClick={() => setPage(pNum)}
                          style={{ 
                            width: 44, height: 44, borderRadius: "50%", border: "none",
                            background: page === pNum ? DS.gradientPrimary : "transparent",
                            color: page === pNum ? "#fff" : DS.textSecondary,
                            fontWeight: page === pNum ? 800 : 600, fontSize: 16,
                            cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            boxShadow: page === pNum ? "0 8px 16px rgba(108,99,255,0.3)" : "none",
                            transform: page === pNum ? "scale(1.1)" : "scale(1)"
                          }}
                          onMouseEnter={e => { if (page !== pNum) e.currentTarget.style.background = "rgba(0,0,0,0.05)"; }}
                          onMouseLeave={e => { if (page !== pNum) e.currentTarget.style.background = "transparent"; }}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    disabled={page === totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    style={{ 
                      width: 44, height: 44, borderRadius: "50%", border: "none", 
                      background: page === totalPages ? "transparent" : "#fff", 
                      color: page === totalPages ? DS.textMuted : DS.textPrimary,
                      cursor: page === totalPages ? "not-allowed" : "pointer", 
                      fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s", boxShadow: page === totalPages ? "none" : DS.shadowSm
                    }}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Why Hand-Me-On ── */}
        <div style={{ marginTop: 68 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: DS.textPrimary, textAlign: "center", marginBottom: 32, letterSpacing: "-0.03em" }}>Tại sao chọn Hand-Me-On?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 }}>
            {TRUST_ITEMS.map(item => <TrustCard key={item.title} {...item} />)}
          </div>
        </div>

        {/* ── Top Sellers ── */}
        <div style={{ marginTop: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: DS.textPrimary, letterSpacing: "-0.03em" }}>🏆 Bậc thầy thanh lý</h2>
              <p style={{ color: DS.textMuted, fontSize: 14 }}>Những người bán uy tín nhất tuần này</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
            {topSellers?.map((s, i) => (
              <div 
                key={s.id} 
                onClick={() => setView("store", s)}
                style={{ 
                  flexShrink: 0, width: 180, background: "#fff", borderRadius: DS.radiusLg, 
                  padding: 24, border: `1px solid ${DS.border}`, textAlign: "center", 
                  cursor: "pointer", transition: "all 0.2s" 
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = DS.shadowMd; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 16px" }}>
                  <img src={s.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: -5, right: -5, background: i === 0 ? "#FFD700" : (i === 1 ? "#C0C0C0" : "#CD7F32"), width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", border: "2px solid #fff" }}>{i + 1}</div>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</h4>
                <p style={{ fontSize: 12, color: DS.success, fontWeight: 800 }}>{s.sales} lượt bán</p>
                <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 8 }}>⭐ {s.rating} Đánh giá</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Smart Recommendations ── */}
        {recommendations?.length > 0 && (
          <div style={{ marginTop: 68, borderTop: `1px solid ${DS.border}`, paddingTop: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 26, fontWeight: 800, color: DS.textPrimary, letterSpacing: "-0.03em", marginBottom: 4 }}>Gợi ý thông minh cho bạn</h2>
                <p style={{ color: DS.textMuted, fontSize: 14 }}>Dựa trên sở thích của bạn</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
              {recommendations.map(p => (
                <ProductCard key={`rec_${p.id}`} product={p} watched={watchedIds?.includes(p.id)} onWatch={handleWatch} onClick={handleViewProduct} />
              ))}
            </div>
          </div>
        )}

        {/* ── Video Highlights (New WOW Section) ── */}
        <div style={{ marginTop: 80, background: "#0F172A", borderRadius: DS.radiusXl, padding: "60px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 10% 20%, rgba(79,70,229,0.1) 0%, transparent 50%)", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
              <div>
                <Badge color="#FDE047" bg="rgba(253,224,71,0.1)" size="sm">🎥 TRẢI NGHIỆM TRỰC QUAN</Badge>
                <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginTop: 12, letterSpacing: "-0.03em" }}>Khám phá qua Video</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, marginTop: 8 }}>Xem cận cảnh tình trạng sản phẩm trước khi quyết định mua.</p>
              </div>
              <Button variant="outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>Xem tất cả video</Button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 24 }}>
              {(videoLives.length > 0 ? videoLives : [
                { title: "Review MacBook Pro M3 Max", viewers: 3272, icon: "💻", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
                { title: "Review Bàn phím & Chuột cơ", viewers: 850, icon: "⌨️", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
                { title: "Test Loa Marshall Woburn", viewers: 512, icon: "🔊", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
                { title: "Cận cảnh Giày Jordan 1", viewers: 128, icon: "👟", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" }
              ]).map((vid, idx) => (
                <div 
                  key={idx} 
                  onClick={async () => {
                    if (vid.productIds?.[0]) {
                      const p = await fakeApi.getProductById(vid.productIds[0]);
                      handleViewProduct(p);
                    }
                  }}
                  style={{ 
                    position: "relative", borderRadius: 24, overflow: "hidden", aspectRatio: "9/16", 
                    cursor: "pointer", transition: "all 0.3s", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" 
                  }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,0.6)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.4)"; }}>
                  <video 
                    src={vid.videoUrl} 
                    autoPlay loop muted playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent 50%)" }} />
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{vid.icon || "📺"}</span>
                      <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{vid.title}</p>
                    </div>
                    <p style={{ color: "#FDE047", fontWeight: 900, fontSize: 14, margin: 0 }}>{vid.viewers?.toLocaleString() || "0"} Đang xem</p>
                  </div>
                  <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "4px 10px", borderRadius: 10, color: "#fff", fontSize: 10, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 6, height: 6, background: "#ef4444", borderRadius: "50%", animation: "pulse 1s infinite" }} /> LIVE
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA Banner ── */}
        <div style={{ marginTop: 68, background: DS.gradientPrimary, borderRadius: DS.radiusXl, padding: "50px 44px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10, letterSpacing: "-0.03em" }}>Có đồ muốn bán?</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", maxWidth: 380 }}>Đăng tin trong 3 phút. Thao tác đơn giản, tiếp cận hàng nghìn người mua ngay lập tức.</p>
          </div>
          <Button onClick={() => setView("listing")} size="lg" style={{ background: "#fff", color: DS.primary, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", flexShrink: 0 }}>🚀 Bắt đầu kinh doanh</Button>
        </div>
      </div>
      {/* Floating Surprise Button */}
      <div 
        onClick={() => setShowWheel(true)}
        className="float-animation"
        style={{ position: "fixed", bottom: 100, right: 24, zIndex: 9990, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
      >
        <div style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 10px 25px rgba(255,165,0,0.4)", border: "3px solid #fff" }}>🎁</div>
        <Badge color="#FFA500" bg="#fff" size="xs">Quà tặng!</Badge>
      </div>

      {showWheel && <SpinTheWheel onClose={() => setShowWheel(false)} />}
    </div>
  );
}
