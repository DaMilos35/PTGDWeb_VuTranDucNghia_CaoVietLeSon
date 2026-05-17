// ============================================================
// PAGE 8: WATCHLIST PAGE — Hand-Me-On
// ============================================================

import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import fakeApi from "../database/fakeApi";
import ProductCard from "../components/common/ProductCard";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function WatchlistPage() {
  const { setView, setSelectedProduct, watchedIds, handleWatch, user } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const ids = await fakeApi.getWatchlist(user.id);
        const allProducts = await fakeApi.getProducts();
        const fullItems = allProducts.filter(p => ids.includes(p.id));
        setItems(fullItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [watchedIds, user?.id]);

  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", padding: "36px 28px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: DS.textPrimary, letterSpacing: "-0.03em", marginBottom: 6 }}>
            Mục yêu thích
          </h1>
          <p style={{ color: DS.textMuted, fontSize: 15 }}>
            Bạn đang có {items.length} sản phẩm trong danh sách yêu thích
          </p>
        </div>
        {items.length > 0 && (
          <Button onClick={() => setView("search")} variant="outline" size="sm">Khám phá thêm →</Button>
        )}
      </div>

      {loading ? <Spinner text="Đang tải danh sách..." /> : items.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "100px 40px",
          background: "#fff", borderRadius: DS.radiusXl,
          border: `1px solid ${DS.border}`, boxShadow: DS.shadowSm,
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: DS.primaryLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 48, margin: "0 auto 24px",
          }}>❤️</div>
          <h3 style={{ fontWeight: 800, fontSize: 22, color: DS.textPrimary, marginBottom: 10 }}>
            Danh sách yêu thích trống
          </h3>
          <p style={{ color: DS.textMuted, marginBottom: 28, fontSize: 15, maxWidth: 360, margin: "0 auto 28px" }}>
            Hãy nhấn vào biểu tượng ❤️ trên các sản phẩm bạn thích để lưu lại tại đây.
          </p>
          <Button onClick={() => setView("search")} size="lg">🔍 Khám phá ngay</Button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 22 }}>
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              watched={true}
              onWatch={handleWatch}
              onClick={(prod) => { setSelectedProduct(prod); setView("product"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
