import { useState } from "react";
import { DS, conditionColor, conditionBg } from "../../design/tokens";
import { formatPrice, getCategoryName } from "../../utils/formatters";
import { useApp } from "../../context/AppContext";
import Badge from "./Badge";

export default function ProductCard({ product, onClick, onWatch, watched }) {
  const { user } = useApp();
  const isOwner = user?.id === product.sellerId;
  const [hovered, setHovered] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const totalImgs = product.images?.length || 1;

  const nextImg = (e) => {
    e.stopPropagation();
    setActiveImg(prev => (prev + 1) % totalImgs);
  };
  const prevImg = (e) => {
    e.stopPropagation();
    setActiveImg(prev => (prev - 1 + totalImgs) % totalImgs);
  };

  return (
    <div
      onClick={() => onClick(product)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        background: DS.bgCard, 
        borderRadius: 24, 
        border: `1px solid ${hovered ? DS.primary : DS.border}`, 
        overflow: "hidden", 
        cursor: "pointer", 
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
        transform: hovered ? "translateY(-8px) perspective(1000px) rotateX(2deg)" : "none", 
        boxShadow: hovered ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.05)", 
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}
    >
      {/* Image Container with Slider & Video Preview */}
      <div style={{ position: "relative", paddingTop: "95%", overflow: "hidden", background: "#F1F5F9" }}>
        {!imgError ? (
          <>
            <div style={{ 
              position: "absolute", inset: 0, 
              display: "flex", 
              transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)", 
              transform: `translateX(-${activeImg * 100}%)`,
              opacity: hovered && (product.videoUrl || product.video) ? 0 : 1 
            }}>
              {product.images.map((img, idx) => (
                <div key={idx} style={{ width: "100%", height: "100%", flexShrink: 0, position: "relative" }}>
                  {/* Shimmer skeleton background */}
                  <div className="skeleton" style={{ position: "absolute", inset: 0, zIndex: 0 }} />
                  <img 
                    src={img} 
                    alt={product.title} 
                    onError={() => setImgError(true)} 
                    loading="lazy"
                    style={{ position: "relative", zIndex: 1, width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
              ))}
            </div>
            {/* Video Preview on Hover */}
            {hovered && (product.videoUrl || product.video) && (
              <video 
                src={product.videoUrl || product.video} 
                autoPlay loop muted playsInline
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", animation: "fadeIn 0.4s ease" }}
              />
            )}
            
            {/* Quick View Overlay */}
            {hovered && (
              <div style={{ 
                position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.4)", 
                display: "flex", alignItems: "center", justifyContent: "center",
                backdropFilter: "blur(4px)", animation: "fadeIn 0.3s ease"
              }}>
                <button style={{ 
                  background: "#fff", color: "#0F172A", border: "none", 
                  padding: "10px 20px", borderRadius: 12, fontWeight: 800, fontSize: 13,
                  boxShadow: DS.shadowLg, transform: "translateY(0)", transition: "transform 0.2s"
                }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  XEM CHI TIẾT 🔍
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: DS.textMuted }}>📦</div>
        )}
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>

        {/* Navigation Arrows */}
        {hovered && totalImgs > 1 && !product.videoUrl && (
          <>
            <button onClick={prevImg} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: DS.shadowMd, fontSize: 12, zIndex: 5 }}>◀</button>
            <button onClick={nextImg} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: DS.shadowMd, fontSize: 12, zIndex: 5 }}>▶</button>
          </>
        )}
        
        {/* Overlay Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}>
          {product.format === "auction" && (
            <Badge color={DS.warning} bg="#0F172A" size="xs">⏱ Đấu giá</Badge>
          )}
          {isOwner && (
            <Badge color="#fff" bg={DS.primary} size="xs">👤 Của bạn</Badge>
          )}
          <Badge color="#fff" bg={DS.success} size="xs">Sống Xanh 🌿</Badge>
          {product.status === 'sold' && (
            <Badge color="#fff" bg="rgba(0,0,0,0.8)" size="xs">ĐÃ BÁN</Badge>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={e => { e.stopPropagation(); onWatch && onWatch(product.id); }} 
          style={{ 
            position: "absolute", top: 12, right: 12, 
            background: watched ? "#fff" : "rgba(255,255,255,0.8)", border: "none", borderRadius: 14, 
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", 
            cursor: "pointer", fontSize: 20, 
            opacity: hovered || watched ? 1 : 0, 
            transform: hovered || watched ? "scale(1)" : "scale(0.8)",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
            boxShadow: DS.shadowLg, zIndex: 10
          }}
        >
          {watched ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: DS.primary, textTransform: "uppercase", letterSpacing: "0.1em" }}>{getCategoryName(product.category)}</span>
            {product.isSponsored && <Badge color="#fff" bg={DS.primary} size="xs" style={{ padding: "2px 6px", fontSize: 9, borderRadius: 4 }}>PR</Badge>}
            {product.sellerRating >= 4.5 && <Badge color="#fff" bg={DS.success} size="xs" style={{ padding: "2px 6px", fontSize: 9, borderRadius: 4 }}>⭐ Uy tín</Badge>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#FEF3C7", padding: "2px 8px", borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: "#D97706" }}>★</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#92400E" }}>{product.rating}</span>
          </div>
        </div>
        
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", lineHeight: "1.5", marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "3em" }}>
          {product.title}
        </h3>
        
        <div style={{ marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: DS.primary, letterSpacing: "-0.02em" }}>
              {formatPrice(product.format === "auction" && product.currentBid ? product.currentBid : product.price)}
            </span>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid #F1F5F9`, paddingTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: DS.success }} />
              <span style={{ fontSize: 11, color: DS.textMuted, fontWeight: 600 }}>{product.location.split(',')[0]}</span>
            </div>
            <span style={{ fontSize: 11, color: DS.textMuted, fontWeight: 500 }}>{product.sku}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
