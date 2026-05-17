// ============================================================
// PAGE 4: CREATE LISTING — Hand-Me-On
// ============================================================

import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import useApi from "../hooks/useApi";
import fakeApi from "../database/fakeApi";
import { CATEGORIES, CONDITIONS, LOCATIONS } from "../database/constants";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import BackBtn from "../components/common/BackBtn";

function Badge({ children, color, bg, size = "md", style = {} }) {
  const isXs = size === "xs";
  const isSm = size === "sm";
  return (
    <span style={{
      display: "inline-block",
      padding: isXs ? "2px 6px" : isSm ? "4px 10px" : "6px 14px",
      borderRadius: DS.radiusFull,
      fontSize: isXs ? 10 : isSm ? 11 : 12,
      fontWeight: 800,
      background: bg || DS.primaryLight,
      color: color || DS.primary,
      letterSpacing: "0.02em",
      ...style
    }}>
      {children}
    </span>
  );
}

function StepIndicator({ step, titles }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
      {titles.map((t, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < titles.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: done ? DS.success : active ? DS.primary : DS.bgHover,
                border: `2px solid ${done ? DS.success : active ? DS.primary : DS.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: done || active ? "#fff" : DS.textMuted,
                fontSize: done ? 15 : 14, fontWeight: 700,
                transition: "all 0.25s",
                boxShadow: active ? DS.shadowPrimary : "none",
              }}>
                {done ? "✓" : num}
              </div>
              <span style={{
                fontSize: 11, fontWeight: active || done ? 700 : 500,
                color: active ? DS.primary : done ? DS.success : DS.textMuted,
                whiteSpace: "nowrap",
              }}>{t}</span>
            </div>
            {i < titles.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: done ? DS.success : DS.border,
                margin: "0 10px", marginBottom: 20,
                transition: "background 0.25s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

const PRICE_SUGGESTIONS = {
  c1: { label: "Đồ điện tử", range: [1000000, 50000000], tip: "Các dòng máy cũ nên để giá 50-70% giá gốc." },
  c2: { label: "Thời trang", range: [50000, 2000000], tip: "Quần áo cũ thường bán tốt nhất ở mức 100k-300k." },
  c3: { label: "Nhà cửa", range: [200000, 10000000], tip: "Nội thất gỗ có giá trị giữ giá cao hơn đồ nhựa/kim loại." },
  c4: { label: "Thể thao", range: [100000, 5000000], tip: "Dụng cụ gym/yoga cũ đang được săn đón." },
};

export default function CreateListingPage() {
  const { user, setView, viewData, showToast } = useApp();
  const isEditing = viewData && viewData.id && viewData.sellerId === user?.id;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "", category: "c1", condition: "Như mới",
    description: "", price: "", format: "buy-now",
    shipping: "0", location: user?.location || LOCATIONS[0], images: [],
    videoUrl: "", tags: [],
    isSponsored: false, comboDiscount: "", comboDesc: "",
    stock: 1,
  });

  useEffect(() => {
    if (isEditing) {
      setForm({
        ...viewData,
        price: viewData.price.toString(),
        shipping: viewData.shipping.toString(),
        comboDiscount: viewData.combo?.discount?.toString() || "",
        comboDesc: viewData.combo?.desc || "",
        stock: viewData.stock || 1,
      });
      if (viewData.mode === 'boost' || viewData.mode === 'combo') setStep(4);
    }
  }, [isEditing, viewData]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [done, setDone] = useState(false);
  const { data: categories } = useApi(() => fakeApi.getCategories());

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const calculateQuality = () => {
    let score = 0;
    const tips = [];
    if (form.images.length >= 3) score += 30; else tips.push("Thêm ít nhất 3 ảnh (Gợi ý: +30đ)");
    if (form.videoUrl) score += 20; else tips.push("Thêm video quay cận cảnh (Gợi ý: +20đ)");
    if (form.description.length > 50) score += 20; else tips.push("Mô tả chi tiết hơn (>50 ký tự) (Gợi ý: +20đ)");
    if (form.tags.length >= 3) score += 10; else tips.push("Thêm từ khóa tìm kiếm (Gợi ý: +10đ)");
    if (form.isSponsored) score += 20; else tips.push("Sử dụng Boost để lên đầu trang (Gợi ý: +20đ)");
    return { score: Math.min(score, 100), tips };
  };

  const { score: qualityScore, tips: qualityTips } = calculateQuality();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const urls = files.map(f => URL.createObjectURL(f));
    setModerating(true);
    setTimeout(() => {
      setModerating(false);
      set("images", [...form.images, ...urls]);
    }, 1500);
  };

  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) set("verifiedProof", URL.createObjectURL(file));
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      set("videoUrl", url);
      showToast("Đã tải video thành công!");
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title || form.title.length < 5) e.title = "Tiêu đề quá ngắn (tối thiểu 5 ký tự)";
    if (!form.description || form.description.length < 20) e.description = "Mô tả cần chi tiết hơn (tối thiểu 20 ký tự)";
    if (!form.price || Number(form.price) <= 0) e.price = "Vui lòng nhập giá bán hợp lệ";
    if (form.images.length === 0) e.images = "Vui lòng tải lên ít nhất 1 ảnh";
    setErrors(e);
    return e;
  };

  const handleSubmit = async () => {
    if (!user) { setView("auth"); return; }
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      if (errs.images) setStep(1);
      else if (errs.title || errs.description) setStep(2);
      else if (errs.price) setStep(3);
      return;
    }
    setSubmitting(true);
    try {
      if (isEditing) {
        await fakeApi.updateProduct(viewData.id, {
          ...form,
          price: Number(form.price),
          shipping: Number(form.shipping),
          stock: Number(form.stock || 1),
        });
        showToast("Đã cập nhật tin đăng thành công! ✨");
        setView("product", { ...viewData, ...form, price: Number(form.price), shipping: Number(form.shipping), stock: Number(form.stock || 1) });
      } else {
        await fakeApi.createListing({
          ...form,
          price: Number(form.price),
          shipping: Number(form.shipping),
          combo: form.comboDiscount ? { discount: Number(form.comboDiscount), desc: form.comboDesc } : null,
          isSponsored: form.isSponsored,
          sellerId: user.id,
          stock: Number(form.stock || 1),
        });
        setDone(true);
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("Có lỗi xảy ra: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div style={{ maxWidth: 560, margin: "80px auto", textAlign: "center", padding: "0 28px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div style={{
        background: "#fff", borderRadius: DS.radiusXl, padding: "60px 40px",
        border: `1px solid ${DS.border}`, boxShadow: DS.shadowLg,
      }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: DS.textPrimary, marginBottom: 12, letterSpacing: "-0.03em" }}>
          Đăng bán thành công!
        </h2>
        <p style={{ color: DS.textMuted, marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Sản phẩm của bạn đã được niêm yết trên Hand-Me-On. Người mua có thể tìm thấy món đồ của bạn ngay bây giờ.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Button onClick={() => setView("dashboard")} size="lg">📊 Xem Dashboard</Button>
          <Button variant="outline" size="lg" onClick={() => { 
            setStep(1); 
            setForm({ title: "", category: "c1", condition: "Như mới", description: "", price: "", format: "buy-now", shipping: "0", location: LOCATIONS[0], images: [], tags: [], videoUrl: "", stock: 1 }); 
            setDone(false); 
          }}>
            ➕ Đăng thêm món khác
          </Button>
        </div>
      </div>
    </div>
  );

  const stepTitles = ["Hình ảnh", "Thông tin", "Giá bán", "Cá nhân hóa"];

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <BackBtn />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "flex-start" }}>
        
        {/* Main Form Section */}
        <div style={{ background: "#fff", borderRadius: DS.radiusXl, padding: "48px 40px", border: `1px solid ${DS.border}`, boxShadow: DS.shadowLg }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontWeight: 900, fontSize: 32, color: DS.textPrimary, marginBottom: 12, letterSpacing: "-0.03em" }}>
              {isEditing ? "✏️ Chỉnh sửa tin đăng" : "🚀 Đăng tin mới"}
            </h1>
            <p style={{ color: DS.textMuted, fontSize: 16 }}>
              {isEditing ? "Cập nhật thông tin để tiếp cận khách hàng tốt hơn." : "Chỉ mất 2 phút để món đồ của bạn tiếp cận hàng ngàn người mua."}
            </p>
          </div>

          <StepIndicator step={step} titles={stepTitles} />

          {/* Step 1: Photos & Video */}
          {step === 1 && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, fontSize: 22, color: DS.textPrimary, margin: 0 }}>📸 Hình ảnh & Video</h2>
                {moderating && <Badge color={DS.primary} bg={DS.primaryLight}>⚡ AI đang kiểm tra...</Badge>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: `2px dashed ${DS.borderInput}`, borderRadius: DS.radiusLg,
                  padding: "40px 20px", textAlign: "center", cursor: "pointer",
                  background: DS.bgHover, transition: "all 0.2s"
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                  <p style={{ fontWeight: 700, color: DS.textPrimary, fontSize: 14 }}>Tải ảnh sản phẩm</p>
                  <p style={{ fontSize: 11, color: DS.textMuted, marginTop: 4 }}>Tối đa 12 ảnh</p>
                  <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                </label>

                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: `2px dashed ${DS.borderInput}`, borderRadius: DS.radiusLg,
                  padding: "40px 20px", textAlign: "center", cursor: "pointer",
                  background: DS.bgHover, transition: "all 0.2s"
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🎥</div>
                  <p style={{ fontWeight: 700, color: DS.textPrimary, fontSize: 14 }}>Tải Video Review</p>
                  <p style={{ fontSize: 11, color: DS.textMuted, marginTop: 4 }}>Giúp bán nhanh hơn 80%</p>
                  <input type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoUpload} />
                </label>
              </div>

              {form.images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: DS.radiusMd, overflow: "hidden", border: `2px solid ${DS.border}`, position: "relative" }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => set("images", form.images.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 10 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {form.videoUrl && (
                <div style={{ background: DS.bgHover, padding: 16, borderRadius: DS.radiusLg, marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
                   <video src={form.videoUrl} style={{ width: 120, height: 68, objectFit: "cover", borderRadius: 8, background: "#000" }} />
                   <div style={{ flex: 1 }}>
                     <p style={{ fontSize: 14, fontWeight: 700 }}>Video đã sẵn sàng! ✨</p>
                     <p style={{ fontSize: 12, color: DS.textMuted }}>Người mua có thể xem video ngay tại trang chi tiết.</p>
                   </div>
                   <Button variant="outline" size="sm" onClick={() => set("videoUrl", "")}>Gỡ video</Button>
                </div>
              )}

              <Button onClick={() => setStep(2)} fullWidth size="lg" disabled={form.images.length === 0}>Tiếp theo: Thông tin chi tiết →</Button>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: DS.textPrimary }}>📝 Thông tin chi tiết</h2>
              <Input label="Tiêu đề tin đăng" value={form.title} onChange={(v) => set("title", v)} placeholder="Ví dụ: iPhone 15 Pro Max 256GB Gold - Fullbox" required />
              
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: DS.textSecondary }}>Danh mục sản phẩm</label>
                <select 
                  value={form.category} 
                  onChange={(e) => set("category", e.target.value)} 
                  style={{ padding: "12px 14px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontFamily: "inherit", fontSize: 14, outline: "none", background: "#fff" }}
                >
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: DS.textSecondary }}>Mô tả sản phẩm</label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => set("description", e.target.value)} 
                  placeholder="Mô tả tình trạng, thời gian sử dụng, phụ kiện kèm theo..." 
                  rows={6} 
                  style={{ padding: "14px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontFamily: "inherit", fontSize: 14, lineHeight: 1.6, outline: "none", resize: "none" }} 
                />
              </div>
              
              {/* Tình trạng sản phẩm */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: DS.textSecondary }}>Độ cũ mới (Tình trạng)</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[["Như mới", "🌟"], ["Rất tốt", "✨"], ["Tốt", "👍"], ["Khá", "📦"]].map(([cond, icon]) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => set("condition", cond)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: DS.radiusMd,
                        border: `2px solid ${form.condition === cond ? DS.primary : DS.border}`,
                        background: form.condition === cond ? DS.primaryLight : "#fff",
                        color: form.condition === cond ? DS.primary : DS.textSecondary,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        transition: "all 0.18s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Số lượng hàng */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: DS.textSecondary }}>Số lượng đăng bán</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => set("stock", Math.max(1, (Number(form.stock) || 1) - 1))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: DS.radiusMd,
                      border: `1.5px solid ${DS.border}`,
                      background: DS.bgCard,
                      fontSize: 20,
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: DS.textPrimary
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={form.stock || 1}
                    onChange={(e) => set("stock", Math.max(1, Number(e.target.value) || 1))}
                    style={{
                      width: 80,
                      height: 44,
                      textAlign: "center",
                      borderRadius: DS.radiusMd,
                      border: `1.5px solid ${DS.borderInput}`,
                      fontSize: 16,
                      fontWeight: "bold",
                      outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => set("stock", (Number(form.stock) || 1) + 1)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: DS.radiusMd,
                      border: `1.5px solid ${DS.border}`,
                      background: DS.bgCard,
                      fontSize: 20,
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: DS.textPrimary
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Button variant="secondary" onClick={() => setStep(1)} size="lg">← Quay lại</Button>
                <Button onClick={() => setStep(3)} fullWidth size="lg">Tiếp theo: Giá bán →</Button>
              </div>
            </div>
          )}

          {/* Step 3: Pricing */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: DS.textPrimary }}>💰 Giá & Vận chuyển</h2>
              <Input label="Giá muốn bán (VNĐ)" type="number" value={form.price} onChange={v => set("price", v)} placeholder="0" required />
              
              {form.category && PRICE_SUGGESTIONS[form.category] && (
                <div style={{ padding: 18, background: "#FEF3C7", borderRadius: DS.radiusLg, border: `1px solid #FDE68A` }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>💡</span>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#92400E", margin: 0 }}>Gợi ý giá từ eBay/Amazon</p>
                  </div>
                  <p style={{ fontSize: 13, color: "#B45309", marginBottom: 10, lineHeight: 1.5 }}>
                    {PRICE_SUGGESTIONS[form.category].tip}
                  </p>
                  <p style={{ fontSize: 12, color: "#92400E", fontWeight: 600 }}>
                    Mức giá lý tưởng: {formatPrice(PRICE_SUGGESTIONS[form.category].range[0])} - {formatPrice(PRICE_SUGGESTIONS[form.category].range[1])}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 12 }}>
                <Button variant="secondary" onClick={() => setStep(2)} size="lg">← Quay lại</Button>
                <Button onClick={() => setStep(4)} variant="success" fullWidth size="lg">Tiếp theo: Cá nhân hóa →</Button>
              </div>
            </div>
          )}

          {/* Step 4: Marketing & Personalization */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontWeight: 700, fontSize: 22, color: DS.textPrimary }}>🌟 Cá nhân hóa & Tiếp thị</h2>
              
              <div style={{ 
                padding: 24, background: form.isSponsored ? DS.primaryLight : "#F8FAFC", 
                borderRadius: DS.radiusLg, border: `2px solid ${form.isSponsored ? DS.primary : DS.border}`, 
                transition: "all 0.2s", cursor: "pointer"
              }} onClick={() => set("isSponsored", !form.isSponsored)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: form.isSponsored ? DS.primary : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🚀</div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: form.isSponsored ? DS.primary : DS.textPrimary }}>Đẩy tin (Boost Listing)</h3>
                      <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>Ưu tiên hiển thị trên đầu trang</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={form.isSponsored} readOnly style={{ width: 22, height: 22, accentColor: DS.primary }} />
                </div>
                <p style={{ fontSize: 13, color: DS.textSecondary, lineHeight: 1.6, margin: 0 }}>
                  Sản phẩm của bạn sẽ có nhãn <Badge size="xs" style={{ verticalAlign: "middle" }}>TÀI TRỢ</Badge> và được hiển thị tới nhiều người mua hơn.
                  <strong style={{ display: "block", marginTop: 8, color: DS.primary }}>Phí: 5 Xu / ngày</strong>
                </p>
              </div>

              <div style={{ padding: 24, background: form.comboDiscount ? "#F0FDF4" : "#F8FAFC", borderRadius: DS.radiusLg, border: `2px solid ${form.comboDiscount ? DS.success : DS.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: form.comboDiscount ? DS.success : "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎁</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: form.comboDiscount ? DS.success : DS.textPrimary }}>Ưu đãi Combo / Mua kèm</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                   <Input label="Giảm giá khi mua kèm (%)" type="number" value={form.comboDiscount} onChange={v => set("comboDiscount", v)} placeholder="Ví dụ: 10" />
                   <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                     <label style={{ fontSize: 13, fontWeight: 600, color: DS.textSecondary }}>Mô tả quà tặng / Ưu đãi</label>
                     <textarea 
                      value={form.comboDesc} 
                      onChange={e => set("comboDesc", e.target.value)} 
                      placeholder="Ví dụ: Tặng ốp lưng và dán cường lực..." 
                      rows={2} 
                      style={{ padding: "12px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontFamily: "inherit", fontSize: 14, outline: "none", resize: "none" }} 
                     />
                   </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Button variant="secondary" onClick={() => setStep(3)} size="lg">← Quay lại</Button>
                <Button onClick={handleSubmit} variant="success" fullWidth size="lg" disabled={submitting}>
                  {submitting ? "Đang xử lý..." : isEditing ? "Cập nhật tin đăng ✨" : "🚀 Hoàn tất & Đăng ngay"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* eBay/Amazon Style Sidebar Improvements */}
        <aside style={{ position: "sticky", top: 120 }}>
          
          {/* Quality Score Card */}
          <div style={{ background: "#fff", borderRadius: DS.radiusXl, padding: 28, border: `1px solid ${DS.border}`, boxShadow: DS.shadowSm, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: DS.textPrimary, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              📊 Chất lượng tin đăng
            </h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{ position: "relative", width: 64, height: 64 }}>
                <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={qualityScore > 70 ? DS.success : qualityScore > 40 ? DS.warning : DS.error} strokeWidth="3" strokeDasharray={`${qualityScore}, 100`} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: DS.textPrimary }}>
                  {qualityScore}
                </div>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: qualityScore > 70 ? DS.success : qualityScore > 40 ? DS.warning : DS.error }}>
                  {qualityScore > 70 ? "Cực tốt!" : qualityScore > 40 ? "Tạm được" : "Cần sửa gấp"}
                </p>
                <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 2 }}>Điểm càng cao, bán càng nhanh</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {qualityTips.length > 0 ? qualityTips.slice(0, 3).map((tip, i) => (
                <div key={i} style={{ fontSize: 12, color: DS.textSecondary, display: "flex", gap: 8 }}>
                  <span style={{ color: DS.error }}>•</span> {tip}
                </div>
              )) : (
                <div style={{ fontSize: 12, color: DS.success, fontWeight: 600 }}>✓ Tin đăng đã đạt chuẩn eBay!</div>
              )}
            </div>
          </div>

          {/* Seller Tips Card */}
          <div style={{ background: DS.gradientHero, borderRadius: DS.radiusXl, padding: 28, color: "#fff", boxShadow: DS.shadowPrimary }}>
            <h4 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: "#FDE047" }}>🚀 Pro Tips cho Seller</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { t: "Chụp đủ 5 góc", d: "Tăng 40% khả năng chốt đơn." },
                { t: "Mô tả trung thực", d: "Giảm 90% khiếu nại trả hàng." },
                { t: "Phản hồi chat < 5p", d: "Khách hàng rất thích điều này!" }
              ].map((tip, i) => (
                <div key={i}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{tip.t}</div>
                  <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{tip.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Impact */}
          <div style={{ background: "#F0FDF4", borderRadius: DS.radiusXl, padding: 24, border: "1px solid #BBF7D0", marginTop: 24 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>🌍</span>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: "#166534", margin: 0 }}>Hành động vì môi trường</h4>
            </div>
            <p style={{ fontSize: 12, color: "#15803D", lineHeight: 1.6, margin: 0 }}>
              Bán lại món đồ này giúp tiết kiệm <strong>12.5kg CO2</strong> và <strong>2,700L nước sạch</strong>. Cảm ơn bạn!
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}
