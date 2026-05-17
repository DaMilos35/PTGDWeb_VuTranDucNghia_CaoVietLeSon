import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import useDebounce from "../hooks/useDebounce";
import fakeApi from "../database/fakeApi";
import ProductCard from "../components/common/ProductCard";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function SearchPage() {
  const { setView, setSelectedProduct, watchedIds, handleWatch, globalSearch, setGlobalSearch, searchState, setSearchState } = useApp();
  const [query, setQuery] = useState(searchState.query || globalSearch || "");
  const [filters, setFilters] = useState(searchState.filters);
  const [sortBy, setSortBy] = useState(searchState.sortBy);
  const [viewMode, setViewMode] = useState("grid");
  const [filterOpen, setFilterOpen] = useState({ category: true, condition: true, format: true, price: true, brand: true, rating: true });

  // Debounce the query and filters to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 400);
  const debouncedFilters = useDebounce(filters, 400);

  // Sync with context
  useEffect(() => {
    setSearchState({ query, filters, sortBy });
  }, [query, filters, sortBy]);

  const { data: products, loading } = useApi(() => fakeApi.getProducts({ ...debouncedFilters, search: debouncedQuery }), [JSON.stringify(debouncedFilters), debouncedQuery]);
  const { data: categories } = useApi(() => fakeApi.getCategories());

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const toggleF = (k, v) => setFilters(f => {
    if (v === "") return { ...f, [k]: [] };
    const arr = f[k];
    if (arr.includes(v)) return { ...f, [k]: arr.filter(x => x !== v) };
    return { ...f, [k]: [...arr, v] };
  });

  const clear = () => { setFilters({ condition: [], format: [], minPrice: "", maxPrice: "", category: [], location: "", brand: [], rating: "" }); setQuery(""); setGlobalSearch(""); };

  useEffect(() => {
    if (globalSearch !== query) {
      setQuery(globalSearch || "");
      setFilters({ condition: [], format: [], minPrice: "", maxPrice: "", category: [], location: "" });
    }
  }, [globalSearch]);

  const { globalCategory, setGlobalCategory } = useApp();
  useEffect(() => {
    if (globalCategory) {
      setFilters(f => ({ ...f, category: [globalCategory] }));
      setGlobalCategory(null); // Reset it so you can click the same category again from Header
    }
  }, [globalCategory]);

  const applySearch = () => {
    setFilters({ condition: [], format: [], minPrice: "", maxPrice: "", category: [], location: "", brand: [], rating: "" });
    setGlobalSearch(query);
  };

  const activeCount = (filters.category?.length > 0 ? 1 : 0) + (filters.condition?.length > 0 ? 1 : 0) + (filters.format?.length > 0 ? 1 : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.location ? 1 : 0) + (query ? 1 : 0);

  const sorted = [...(products || [])].sort((a, b) => {
    if (sortBy === "relevance") {
      const q = query.toLowerCase();
      const aScore = (a.title.toLowerCase().includes(q) ? 10 : 0) + (a.brand?.toLowerCase().includes(q) ? 5 : 0);
      const bScore = (b.title.toLowerCase().includes(q) ? 10 : 0) + (b.brand?.toLowerCase().includes(q) ? 5 : 0);
      return bScore - aScore;
    }
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "popular") return b.views - a.views;
    if (sortBy === "watchers") return (b.watchers || 0) - (a.watchers || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const toggle = (section) => setFilterOpen(o => ({ ...o, [section]: !o[section] }));

  return (
    <div style={{ maxWidth: 1360, margin: "0 auto", padding: "32px 24px", fontFamily: "Be Vietnam Pro, sans-serif", display: "flex", gap: 28 }}>

      {/* Sidebar */}
      <aside style={{ width: 252, flexShrink: 0, background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: 22, maxHeight: "calc(100vh - 100px)", overflowY: "auto", position: "sticky", top: 80, boxShadow: DS.shadowSm, scrollbarWidth: "thin" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 16, color: DS.textPrimary }}>
            Bộ lọc {activeCount > 0 && <span style={{ marginLeft: 6, background: DS.primary, color: "#fff", borderRadius: DS.radiusFull, fontSize: 11, padding: "1px 7px", fontWeight: 700 }}>{activeCount}</span>}
          </h3>
          {activeCount > 0 && <button onClick={clear} style={{ fontSize: 12, color: DS.error, border: "none", background: "none", cursor: "pointer", fontWeight: 600, fontFamily: "Be Vietnam Pro, sans-serif" }}>Xóa tất cả</button>}
        </div>

        {/* Category */}
        <div style={{ borderBottom: `1px solid ${DS.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <button onClick={() => toggle("category")} style={{ display: "flex", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", marginBottom: filterOpen.category ? 12 : 0, fontFamily: "Be Vietnam Pro, sans-serif" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Danh mục</span>
            <span style={{ color: DS.textMuted }}>{filterOpen.category ? "▾" : "›"}</span>
          </button>
          {filterOpen.category && (
            <>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: DS.radiusMd, cursor: "pointer", background: filters.category.length === 0 ? DS.primaryLight : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                <input type="checkbox" checked={filters.category.length === 0} onChange={() => toggleF("category", "")} style={{ accentColor: DS.primary }} />
                <span style={{ fontSize: 13, color: filters.category.length === 0 ? DS.primary : DS.textSecondary, fontWeight: filters.category.length === 0 ? 700 : 400 }}>Tất cả danh mục</span>
              </label>
              {(categories || []).map(c => (
                <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: DS.radiusMd, cursor: "pointer", background: filters.category.includes(c.id) ? DS.primaryLight : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                  <input type="checkbox" checked={filters.category.includes(c.id)} onChange={() => toggleF("category", c.id)} style={{ accentColor: DS.primary }} />
                  <span style={{ fontSize: 13, color: filters.category.includes(c.id) ? DS.primary : DS.textSecondary, fontWeight: filters.category.includes(c.id) ? 700 : 400 }}>{c.icon} {c.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: DS.textMuted }}>{c.count}</span>
                </label>
              ))}
            </>
          )}
        </div>

        {/* Condition */}
        <div style={{ borderBottom: `1px solid ${DS.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <button onClick={() => toggle("condition")} style={{ display: "flex", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", marginBottom: filterOpen.condition ? 12 : 0, fontFamily: "Be Vietnam Pro, sans-serif" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Tình trạng</span>
            <span style={{ color: DS.textMuted }}>{filterOpen.condition ? "▾" : "›"}</span>
          </button>
          {filterOpen.condition && (
            <>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: DS.radiusMd, cursor: "pointer", background: filters.condition.length === 0 ? DS.primaryLight : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                <input type="checkbox" checked={filters.condition.length === 0} onChange={() => toggleF("condition", "")} style={{ accentColor: DS.primary }} />
                <span style={{ fontSize: 13, color: filters.condition.length === 0 ? DS.primary : DS.textSecondary, fontWeight: filters.condition.length === 0 ? 700 : 400 }}>Tất cả tình trạng</span>
              </label>
              {[["Như mới","🌟"],["Rất tốt","✨"],["Tốt","👍"],["Khá","📦"]].map(([c,e]) => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: DS.radiusMd, cursor: "pointer", background: filters.condition.includes(c) ? DS.primaryLight : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                  <input type="checkbox" checked={filters.condition.includes(c)} onChange={() => toggleF("condition", c)} style={{ accentColor: DS.primary }} />
                  <span style={{ fontSize: 13, color: filters.condition.includes(c) ? DS.primary : DS.textSecondary, fontWeight: filters.condition.includes(c) ? 700 : 400 }}>{e} {c}</span>
                </label>
              ))}
            </>
          )}
        </div>

        {/* Format */}
        <div style={{ borderBottom: `1px solid ${DS.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <button onClick={() => toggle("format")} style={{ display: "flex", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", marginBottom: filterOpen.format ? 12 : 0, fontFamily: "Be Vietnam Pro, sans-serif" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Loại bán</span>
            <span style={{ color: DS.textMuted }}>{filterOpen.format ? "▾" : "›"}</span>
          </button>
          {filterOpen.format && (
            <>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: DS.radiusMd, cursor: "pointer", background: filters.format.length === 0 ? DS.primaryLight : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                <input type="checkbox" checked={filters.format.length === 0} onChange={() => toggleF("format", "")} style={{ accentColor: DS.primary }} />
                <span style={{ fontSize: 13, color: filters.format.length === 0 ? DS.primary : DS.textSecondary, fontWeight: filters.format.length === 0 ? 700 : 400 }}>Tất cả loại</span>
              </label>
              {[["buy-now","🛒 Mua ngay"],["auction","⏱ Đấu giá"]].map(([v,l]) => (
                <label key={v} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: DS.radiusMd, cursor: "pointer", background: filters.format.includes(v) ? DS.primaryLight : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                  <input type="checkbox" checked={filters.format.includes(v)} onChange={() => toggleF("format", v)} style={{ accentColor: DS.primary }} />
                  <span style={{ fontSize: 13, color: filters.format.includes(v) ? DS.primary : DS.textSecondary, fontWeight: filters.format.includes(v) ? 700 : 400 }}>{l}</span>
                </label>
              ))}
            </>
          )}
        </div>

        {/* Price */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Khoảng giá (đ)</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input type="number" placeholder="Từ" value={filters.minPrice} onChange={e => setF("minPrice", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontSize: 13, outline: "none", fontFamily: "Be Vietnam Pro, sans-serif" }} />
            <input type="number" placeholder="Đến" value={filters.maxPrice} onChange={e => setF("maxPrice", e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontSize: 13, outline: "none", fontFamily: "Be Vietnam Pro, sans-serif" }} />
          </div>
          <div style={{ position: "relative", height: 24 }}>
            <style>{`
              .dual-slider {
                -webkit-appearance: none;
                appearance: none;
                background: transparent;
                outline: none;
              }
              .dual-slider::-webkit-slider-thumb {
                pointer-events: auto;
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: ${DS.primary};
                cursor: pointer;
                position: relative;
                z-index: 10;
              }
            `}</style>
            <div style={{ position: "absolute", top: 10, left: 0, right: 0, height: 4, background: DS.borderInput, borderRadius: 2 }}></div>
            <div style={{ position: "absolute", top: 10, left: `${(Number(filters.minPrice||0)/30000000)*100}%`, right: `${100 - (Number(filters.maxPrice||30000000)/30000000)*100}%`, height: 4, background: DS.primary, borderRadius: 2 }}></div>
            
            <input 
              type="range" min="0" max="30000000" step="100000" 
              value={filters.minPrice || 0} 
              onChange={e => setF("minPrice", Math.min(Number(e.target.value), Number(filters.maxPrice || 30000000)))} 
              style={{ position: "absolute", width: "100%", pointerEvents: "none", zIndex: (filters.minPrice||0) > 15000000 ? 5 : 3, margin: 0, top: 4 }} 
              className="dual-slider"
            />
            <input 
              type="range" min="0" max="30000000" step="100000" 
              value={filters.maxPrice || 30000000} 
              onChange={e => setF("maxPrice", Math.max(Number(e.target.value), Number(filters.minPrice || 0)))} 
              style={{ position: "absolute", width: "100%", pointerEvents: "none", zIndex: 4, margin: 0, top: 4 }} 
              className="dual-slider"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: DS.textMuted, marginTop: 4 }}>
            <span>0đ</span>
            <span>30tr+</span>
          </div>
        </div>

        {/* Brand */}
        <div style={{ borderBottom: `1px solid ${DS.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <button onClick={() => toggle("brand")} style={{ display: "flex", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", marginBottom: filterOpen.brand ? 12 : 0, fontFamily: "Be Vietnam Pro, sans-serif" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Thương hiệu</span>
            <span style={{ color: DS.textMuted }}>{filterOpen.brand ? "▾" : "›"}</span>
          </button>
          {filterOpen.brand && (
            <>
              {["Apple", "Sony", "Nike", "Adidas", "Samsung", "Uniqlo", "Honda", "Yamaha"].map(b => (
                <label key={b} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: DS.radiusMd, cursor: "pointer", background: filters.brand.includes(b) ? DS.primaryLight : "transparent", marginBottom: 2, transition: "all 0.15s" }}>
                  <input type="checkbox" checked={filters.brand.includes(b)} onChange={() => toggleF("brand", b)} style={{ accentColor: DS.primary }} />
                  <span style={{ fontSize: 13, color: filters.brand.includes(b) ? DS.primary : DS.textSecondary, fontWeight: filters.brand.includes(b) ? 700 : 400 }}>{b}</span>
                </label>
              ))}
            </>
          )}
        </div>

        {/* Rating */}
        <div style={{ borderBottom: `1px solid ${DS.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <button onClick={() => toggle("rating")} style={{ display: "flex", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", marginBottom: filterOpen.rating ? 12 : 0, fontFamily: "Be Vietnam Pro, sans-serif" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>Đánh giá người bán</span>
            <span style={{ color: DS.textMuted }}>{filterOpen.rating ? "▾" : "›"}</span>
          </button>
          {filterOpen.rating && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[5, 4, 3, 2, 1].map(r => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: DS.radiusMd, cursor: "pointer", background: Number(filters.rating) === r ? DS.primaryLight : "transparent", transition: "all 0.15s" }}>
                  <input type="radio" name="rating" checked={Number(filters.rating) === r} onChange={() => setF("rating", r)} style={{ accentColor: DS.primary, width: 16, height: 16 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} style={{ fontSize: 14, color: star <= r ? "#F59E0B" : DS.border }}>{star <= r ? "⭐" : "☆"}</span>
                    ))}
                    <span style={{ fontSize: 12, color: Number(filters.rating) === r ? DS.primary : DS.textSecondary, fontWeight: 600, marginLeft: 4 }}>{r === 5 ? "5.0" : `Từ ${r}.0`}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Tỉnh / Thành phố</p>
          <select value={filters.location} onChange={e => setF("location", e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontFamily: "Be Vietnam Pro, sans-serif", fontSize: 13, background: "#fff", color: DS.textPrimary, outline: "none" }}>
            <option value="">Toàn quốc</option>
            {["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Bình Dương", "Đồng Nai", "Khánh Hòa", "Lâm Đồng", "Quảng Ninh", "Long An", "Tiền Giang", "Bà Rịa - Vũng Tàu", "Thừa Thiên Huế", "Kiên Giang", "Đắk Lắk", "Nghệ An", "Thanh Hóa"].sort().map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Search bar */}
        <div style={{ background: DS.bgCard, borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, padding: "6px 8px", display: "flex", gap: 8, marginBottom: 22, boxShadow: DS.shadowSm }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: DS.bgHover, borderRadius: DS.radiusMd, padding: "9px 14px", gap: 8 }}>
            <span style={{ color: DS.textMuted }}>🔍</span>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && applySearch()} placeholder="Tìm kiếm sản phẩm, thương hiệu, danh mục..." style={{ flex: 1, border: "none", outline: "none", fontFamily: "Be Vietnam Pro, sans-serif", fontSize: 14, color: DS.textPrimary, background: "transparent" }} />
            {query && <button onClick={() => { setQuery(""); setGlobalSearch(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: DS.textMuted }}>✕</button>}
          </div>
          <Button onClick={applySearch} size="md">Tìm kiếm</Button>
        </div>

        {/* Filter Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {filters.category.map(cId => {
            const c = categories?.find(x => x.id === cId);
            return (
              <div key={cId} onClick={() => toggleF("category", cId)} style={{ padding: "6px 12px", borderRadius: DS.radiusFull, background: DS.primaryLight, color: DS.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${DS.primary}22` }}>
                {c?.name} ✕
              </div>
            );
          })}
          {filters.condition.map(c => (
            <div key={c} onClick={() => toggleF("condition", c)} style={{ padding: "6px 12px", borderRadius: DS.radiusFull, background: DS.warning + "22", color: "#b45309", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, border: `1px solid #b4530922` }}>
              Tình trạng: {c} ✕
            </div>
          ))}
          {filters.minPrice && (
            <div onClick={() => setF("minPrice", "")} style={{ padding: "6px 12px", borderRadius: DS.radiusFull, background: DS.bgHover, color: DS.textSecondary, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${DS.border}` }}>
              Giá từ: {Number(filters.minPrice).toLocaleString()}đ ✕
            </div>
          )}
          {filters.location && (
            <div onClick={() => setF("location", "")} style={{ padding: "6px 12px", borderRadius: DS.radiusFull, background: DS.primaryLight, color: DS.primary, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, border: `1px solid ${DS.primary}22` }}>
              📍 {filters.location} ✕
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <p style={{ color: DS.textMuted, fontSize: 14 }}>Tìm thấy <strong style={{ color: DS.textPrimary }}>{sorted.length}</strong> kết quả</p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 12px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.border}`, fontFamily: "Be Vietnam Pro, sans-serif", fontSize: 13, color: DS.textSecondary, background: DS.bgCard, cursor: "pointer", outline: "none" }}>
              <option value="relevance">Mức độ liên quan</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp → Cao</option>
              <option value="price-desc">Giá: Cao → Thấp</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
            <div style={{ display: "flex", gap: 4 }}>
              {[["grid","⊞"],["list","☰"]].map(([m,icon]) => (
                <button key={m} onClick={() => setViewMode(m)} style={{ width: 34, height: 34, borderRadius: DS.radiusMd, border: `1.5px solid ${viewMode === m ? DS.primary : DS.border}`, background: viewMode === m ? DS.primaryLight : DS.bgCard, color: viewMode === m ? DS.primary : DS.textMuted, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? <Spinner text="Đang tìm kiếm..." /> : sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 40px", background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}` }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontWeight: 700, color: DS.textPrimary, marginBottom: 8 }}>Không tìm thấy kết quả</h3>
            <p style={{ color: DS.textMuted, marginBottom: 20 }}>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.</p>
            <Button onClick={clear} variant="outline">Xóa bộ lọc</Button>
          </div>
        ) : viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 18 }}>
            {sorted.map(p => <ProductCard key={p.id} product={p} watched={watchedIds?.includes(p.id)} onWatch={handleWatch} onClick={prod => { setSelectedProduct(prod); setView("product"); }} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map(p => (
              <div key={p.id} onClick={() => { setSelectedProduct(p); setView("product"); }} style={{ background: "#fff", borderRadius: DS.radiusLg, border: `1.5px solid ${DS.border}`, padding: 16, display: "flex", gap: 16, alignItems: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: DS.shadowSm }} onMouseEnter={e => { e.currentTarget.style.borderColor = DS.primary; e.currentTarget.style.boxShadow = DS.shadowMd; }} onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.boxShadow = DS.shadowSm; }}>
                <img src={p.images[0]} alt="" style={{ width: 80, height: 80, borderRadius: DS.radiusMd, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: DS.textPrimary, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                  <p style={{ fontSize: 12, color: DS.textMuted }}>📍 {p.location} · {p.condition}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: DS.textPrimary, letterSpacing: "-0.02em" }}>{formatPrice(p.price)}</p>
                  <p style={{ fontSize: 11, color: DS.textMuted, marginTop: 2 }}>👁 {p.views}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
