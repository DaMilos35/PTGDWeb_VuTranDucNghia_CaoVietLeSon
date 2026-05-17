import { useState } from "react";
import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import Spinner from "../components/common/Spinner";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";

const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#f59e0b", "#94a3b8", "#b45309"];

function SellerCard({ seller, rank, onClick }) {
  const [hovered, setHovered] = useState(false);
  const medal = MEDAL[rank] || `#${rank + 1}`;
  const rankColor = RANK_COLORS[rank] || DS.textMuted;
  const isTop3 = rank < 3;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: isTop3
          ? `linear-gradient(135deg, ${rankColor}15, ${rankColor}05)`
          : "#fff",
        border: `${isTop3 ? 2 : 1}px solid ${hovered ? rankColor : isTop3 ? `${rankColor}40` : DS.border}`,
        borderRadius: DS.radiusLg, padding: "24px",
        boxShadow: hovered ? DS.shadowMd : DS.shadowSm,
        cursor: "pointer", transition: "all 0.25s",
        transform: hovered ? "translateY(-3px)" : "none",
        position: "relative",
      }}
    >
      {isTop3 && (
        <div style={{
          position: "absolute", top: -14, right: 20,
          fontSize: 28, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))"
        }}>
          {medal}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* Rank */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: isTop3 ? rankColor : DS.bgHover,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: isTop3 ? 16 : 13, fontWeight: 900, color: isTop3 ? "#fff" : DS.textMuted,
          flexShrink: 0
        }}>
          {isTop3 ? medal : `#${rank + 1}`}
        </div>

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img src={seller.avatar} alt="" style={{
            width: 56, height: 56, borderRadius: "50%", objectFit: "cover",
            border: `3px solid ${isTop3 ? rankColor : DS.border}`
          }} />
          {seller.verified && (
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: 18, height: 18, borderRadius: "50%", background: DS.success,
              border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10
            }}>✓</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: DS.textPrimary }}>{seller.name}</span>
            {seller.verified && <Badge color={DS.success} bg={DS.successLight} size="xs">✓ Verified</Badge>}
          </div>
          <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 8 }}>
            📍 {seller.location} • Tham gia từ {seller.joined?.slice(0, 4)}
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: DS.textSecondary }}><strong style={{ color: DS.textPrimary }}>{seller.sales}</strong> lượt bán</span>
            <span style={{ fontSize: 12, color: DS.textSecondary }}>⭐ <strong style={{ color: DS.textPrimary }}>{seller.avgRating}</strong></span>
            {seller.totalRevenue > 0 && (
              <span style={{ fontSize: 12, color: DS.success, fontWeight: 700 }}>{formatPrice(seller.totalRevenue)} doanh thu</span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: isTop3 ? rankColor : DS.primary, letterSpacing: "-0.03em" }}>
            {seller.sales}
          </div>
          <div style={{ fontSize: 11, color: DS.textMuted }}>lượt bán</div>
          {seller.listingCount > 0 && (
            <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 4 }}>
              🏷️ {seller.listingCount} sản phẩm
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { setView } = useApp();
  const { data: sellers, loading } = useApi(() => fakeApi.getLeaderboard());
  const [tab, setTab] = useState("sales");

  const sorted = sellers ? [...sellers].sort((a, b) => {
    if (tab === "sales") return b.sales - a.sales;
    if (tab === "revenue") return b.totalRevenue - a.totalRevenue;
    if (tab === "rating") return parseFloat(b.avgRating) - parseFloat(a.avgRating);
    return 0;
  }) : [];

  return (
    <div style={{ fontFamily: "Be Vietnam Pro, sans-serif", minHeight: "100vh", background: DS.bgMain }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
        padding: "64px 28px 56px", position: "relative", overflow: "hidden"
      }}>
        {[
          { top: -80, right: -60, size: 360, color: "rgba(139,92,246,0.2)" },
          { bottom: -100, left: -40, size: 280, color: "rgba(99,102,241,0.15)" },
        ].map((o, i) => (
          <div key={i} style={{
            position: "absolute", top: o.top, bottom: o.bottom, left: o.left, right: o.right,
            width: o.size, height: o.size, borderRadius: "50%", background: o.color, filter: "blur(50px)"
          }} />
        ))}

        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
          <h1 style={{
            fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #fff, #c4b5fd)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 14
          }}>
            Bảng Xếp Hạng
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 17, marginBottom: 16 }}>
            Top người bán xuất sắc nhất trên Hand-Me-On
          </p>
          {sellers && (
            <div style={{ display: "flex", gap: 36, justifyContent: "center", flexWrap: "wrap", marginTop: 24 }}>
              {[
                ["🥇", sellers[0]?.name, "Người dẫn đầu"],
                ["📦", `${sellers.reduce((s, x) => s + x.sales, 0)}`, "Tổng giao dịch"],
                ["⭐", (sellers.reduce((s, x) => s + parseFloat(x.avgRating || 0), 0) / sellers.length).toFixed(1), "Đánh giá trung bình"],
              ].map(([icon, val, label]) => (
                <div key={label} style={{ textAlign: "center", color: "#fff" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{val}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 28px" }}>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 32,
          background: "#fff", border: `1px solid ${DS.border}`, borderRadius: DS.radiusMd,
          overflow: "hidden", width: "fit-content"
        }}>
          {[
            { key: "sales", label: "📦 Lượt bán" },
            { key: "revenue", label: "💰 Doanh thu" },
            { key: "rating", label: "⭐ Đánh giá" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "10px 24px", border: "none", cursor: "pointer",
              fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: 700, fontSize: 14,
              background: tab === key ? DS.primary : "transparent",
              color: tab === key ? "#fff" : DS.textSecondary,
              transition: "all 0.2s"
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {!loading && sorted.length >= 3 && (
          <div style={{
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
            border: `1px solid ${DS.border}`, borderRadius: DS.radiusXl,
            padding: "36px 28px", marginBottom: 32
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: DS.textPrimary, marginBottom: 28, textAlign: "center" }}>
              🏅 Top 3 Người Bán Xuất Sắc
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1fr", gap: 16, alignItems: "end" }}>
              {[sorted[1], sorted[0], sorted[2]].map((seller, podiumIdx) => {
                const realRank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2;
                const heights = [120, 160, 100];
                return (
                  <div key={seller.id} style={{ textAlign: "center" }}>
                    <img src={seller.avatar} alt="" style={{
                      width: 64, height: 64, borderRadius: "50%", objectFit: "cover",
                      border: `4px solid ${RANK_COLORS[realRank]}`,
                      boxShadow: `0 8px 24px ${RANK_COLORS[realRank]}40`,
                      marginBottom: 8
                    }} />
                    <p style={{ fontWeight: 800, fontSize: 13, color: DS.textPrimary, marginBottom: 2 }}>{seller.name}</p>
                    <p style={{ fontSize: 11, color: DS.textMuted, marginBottom: 8 }}>
                      {tab === "sales" ? `${seller.sales} bán` :
                       tab === "revenue" ? formatPrice(seller.totalRevenue) :
                       `⭐ ${seller.avgRating}`}
                    </p>
                    <div style={{
                      height: heights[podiumIdx], background: RANK_COLORS[realRank],
                      borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, color: "#fff", opacity: 0.9,
                      boxShadow: `0 -4px 20px ${RANK_COLORS[realRank]}40`
                    }}>
                      {MEDAL[realRank]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Full List */}
        {loading ? <Spinner text="Đang tải xếp hạng..." /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map((seller, i) => (
              <SellerCard
                key={seller.id}
                seller={seller}
                rank={i}
                onClick={() => {}} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
