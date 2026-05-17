import { useState, useEffect } from "react";
import { DS, conditionColor, conditionBg } from "../design/tokens";
import { formatPrice } from "../utils/formatters";
import { useApp } from "../context/AppContext";
import fakeApi from "../database/fakeApi";
import useApi from "../hooks/useApi";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import Spinner from "../components/common/Spinner";
import Input from "../components/common/Input";

function StarRating({ value, onChange, readonly = false }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span
          key={s}
          onClick={() => !readonly && onChange && onChange(s)}
          onMouseEnter={() => !readonly && setHov(s)}
          onMouseLeave={() => !readonly && setHov(0)}
          style={{ fontSize: 22, cursor: readonly ? "default" : "pointer", color: s <= (hov || value) ? "#f59e0b" : "#e2e8f0", transition: "color 0.15s" }}
        >★</span>
      ))}
    </div>
  );
}

function ReviewsTab({ productId, sellerId, user, showToast, initialReviews = [] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(!initialReviews.length);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialReviews.length) {
      fakeApi.getReviews(sellerId).then(r => { setReviews(r.filter(x => x.productId === productId)); setLoading(false); });
    }
  }, [productId, sellerId, initialReviews]);

  const handleSubmit = async () => {
    if (!user) { showToast("Vui lòng đăng nhập để đánh giá", "error"); return; }
    if (!form.comment.trim()) { showToast("Vui lòng nhập nội dung đánh giá", "error"); return; }
    setSubmitting(true);
    const r = await fakeApi.addReview({ reviewerId: user.id, sellerId, productId, rating: form.rating, comment: form.comment });
    setReviews(prev => [r, ...prev]);
    setForm({ rating: 5, comment: "" });
    showToast("Đã gửi đánh giá! ⭐");
    setSubmitting(false);
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div>
      {/* Summary */}
      {reviews.length > 0 && (
        <div style={{ display: "flex", gap: 24, alignItems: "center", background: DS.bgHover, borderRadius: DS.radiusLg, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: DS.textPrimary, lineHeight: 1 }}>{avg}</div>
            <StarRating value={Math.round(avg)} readonly />
            <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>{reviews.length} đánh giá</p>
          </div>
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map(s => {
              const cnt = reviews.filter(r => r.rating === s).length;
              const pct = reviews.length ? (cnt / reviews.length) * 100 : 0;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: DS.textMuted, width: 16, textAlign: "right" }}>{s}</span>
                  <span style={{ fontSize: 12 }}>★</span>
                  <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: DS.radiusFull, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: DS.radiusFull }} />
                  </div>
                  <span style={{ fontSize: 12, color: DS.textMuted, width: 20 }}>{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Review */}
      {user && (
        <div style={{ background: DS.bgCard, border: `1px solid ${DS.border}`, borderRadius: DS.radiusLg, padding: "20px 24px", marginBottom: 24 }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: DS.textPrimary, marginBottom: 14 }}>Viết đánh giá của bạn</h4>
          <div style={{ marginBottom: 12 }}>
            <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>
          <textarea
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            placeholder="Chia sẻ trải nghiệm mua hàng của bạn..."
            rows={3}
            style={{ width: "100%", padding: "12px 14px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontSize: 14, fontFamily: "Be Vietnam Pro, sans-serif", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: DS.bgHover, borderRadius: DS.radiusMd, cursor: "pointer", fontSize: 13, fontWeight: 600, color: DS.textSecondary, border: `1px dashed ${DS.border}` }}>
              📸 Thêm ảnh
              <input type="file" multiple style={{ display: "none" }} onChange={() => showToast("Đã chọn ảnh mô phỏng!")} />
            </label>
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? <Spinner /> : reviews.length === 0 ? (
        <p style={{ color: DS.textMuted, textAlign: "center", padding: "32px 0" }}>Chưa có đánh giá nào.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: DS.bgCard, border: `1px solid ${DS.border}`, borderRadius: DS.radiusLg, padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <img src={r.user?.avatar || "https://i.pravatar.cc/150?u=anon"} alt="" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: DS.textPrimary }}>{r.user?.name || "Người dùng ẩn danh"}</span>
                    <span style={{ fontSize: 11, color: DS.textMuted }}>{r.date}</span>
                  </div>
                  <StarRating value={r.rating} readonly />
                </div>
              </div>
              <p style={{ fontSize: 14, color: DS.textSecondary, lineHeight: 1.7, marginLeft: 52, marginBottom: r.images?.length ? 12 : 0 }}>{r.comment}</p>
              {r.images?.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginLeft: 52 }}>
                  {r.images.map((img, idx) => (
                    <img key={idx} src={img} alt="" style={{ width: 80, height: 80, borderRadius: DS.radiusSm, objectFit: "cover", cursor: "zoom-in" }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QnATab({ productId, user, isOwner, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fakeApi.getQnA(productId).then(d => { setItems(d); setLoading(false); });
  }, [productId]);

  const handleAsk = async () => {
    if (!user) { showToast("Vui lòng đăng nhập", "error"); return; }
    if (!question.trim()) return;
    const q = await fakeApi.askQuestion(productId, user.id, question);
    setItems(prev => [...prev, q]);
    setQuestion("");
    showToast("Đã gửi câu hỏi! Người bán sẽ trả lời sớm.");
  };

  const handleAnswer = async (qId) => {
    const ans = answers[qId];
    if (!ans?.trim()) return;
    const updated = await fakeApi.answerQuestion(qId, ans);
    setItems(prev => prev.map(x => x.id === qId ? updated : x));
    setAnswers(a => ({ ...a, [qId]: "" }));
    showToast("Đã trả lời câu hỏi!");
  };

  return (
    <div>
      {user && !isOwner && (
        <div style={{ background: DS.bgCard, border: `1px solid ${DS.border}`, borderRadius: DS.radiusLg, padding: "20px 24px", marginBottom: 24 }}>
          <h4 style={{ fontWeight: 700, fontSize: 15, color: DS.textPrimary, marginBottom: 12 }}>❓ Đặt câu hỏi cho người bán</h4>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Bạn muốn hỏi gì về sản phẩm này?"
            rows={2}
            style={{ width: "100%", padding: "12px 14px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontSize: 14, fontFamily: "Be Vietnam Pro, sans-serif", resize: "none", outline: "none", boxSizing: "border-box" }}
          />
          <Button size="sm" style={{ marginTop: 10 }} onClick={handleAsk}>Gửi câu hỏi</Button>
        </div>
      )}

      {loading ? <Spinner /> : items.length === 0 ? (
        <p style={{ color: DS.textMuted, textAlign: "center", padding: "32px 0" }}>Chưa có câu hỏi nào.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map(q => (
            <div key={q.id} style={{ background: DS.bgCard, border: `1px solid ${DS.border}`, borderRadius: DS.radiusLg, padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <img src={q.user?.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0 }} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: DS.textPrimary }}>{q.user?.name}</span>
                  <span style={{ fontSize: 12, color: DS.textMuted, marginLeft: 8 }}>{q.askedAt}</span>
                  <p style={{ fontSize: 14, color: DS.textSecondary, marginTop: 4 }}>{q.question}</p>
                </div>
              </div>
              {q.answer ? (
                <div style={{ marginLeft: 42, background: DS.primaryLight, borderRadius: DS.radiusMd, padding: "10px 14px", borderLeft: `3px solid ${DS.primary}` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: DS.primary, marginBottom: 4 }}>💬 Người bán trả lời:</p>
                  <p style={{ fontSize: 13, color: DS.textSecondary }}>{q.answer}</p>
                </div>
              ) : isOwner ? (
                <div style={{ marginLeft: 42, display: "flex", gap: 8 }}>
                  <input
                    value={answers[q.id] || ""}
                    onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                    placeholder="Nhập câu trả lời..."
                    style={{ flex: 1, padding: "8px 12px", borderRadius: DS.radiusMd, border: `1.5px solid ${DS.borderInput}`, fontSize: 13, fontFamily: "Be Vietnam Pro, sans-serif", outline: "none" }}
                  />
                  <Button size="sm" onClick={() => handleAnswer(q.id)}>Trả lời</Button>
                </div>
              ) : (
                <div style={{ marginLeft: 42 }}>
                  <Badge color={DS.warning} size="xs">⏳ Chưa có câu trả lời</Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import BackBtn from "../components/common/BackBtn";

export default function ProductDetailPage() {
  const { user, selectedProduct: product, setView, handleAddToCart, watchedIds, handleWatch, showToast, setMiniChatId, setMiniChatOpen, setCartDrawerOpen } = useApp();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [tab, setTab] = useState("desc");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const { data: categories } = useApi(() => fakeApi.getCategories(), []);

  useEffect(() => {
    if (product) {
      fakeApi.incrementProductViews(product.id).catch(() => { });
      fakeApi.getUserById(product.sellerId).then(s => {
        setSeller(s);
        if (user && s.followers?.includes(user.id)) setIsFollowing(true);
        setLoading(false);
      });
    }
  }, [product, user]);

  if (!product) return (
    <div style={{ padding: 80, textAlign: "center", color: DS.textMuted, fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <h2>Không tìm thấy sản phẩm</h2>
      <Button onClick={() => setView("home")} style={{ marginTop: 20 }}>Về trang chủ</Button>
    </div>
  );

  const watched = watchedIds?.includes(product.id);
  const isOwner = user?.id === product.sellerId;

  const handleFollowToggle = async () => {
    if (!user) return setView("auth");
    if (isOwner) return;
    try {
      await fakeApi.toggleFollow(user.id, seller.id);
      setIsFollowing(!isFollowing);
      showToast(isFollowing ? "Đã bỏ theo dõi" : "Đã theo dõi người bán");
    } catch (e) {
      showToast("Có lỗi xảy ra", "error");
    }
  };

  const handleChat = async () => {
    if (!user) return setView("auth");
    if (isOwner) return showToast("Đây là sản phẩm của bạn", "info");

    const { chatId } = await fakeApi.initiateChat(user.id, seller.id, product.id);
    setMiniChatId(chatId);
    setMiniChatOpen(true);
  };

  const handleSendOffer = async () => {
    if (!user) return setView("auth");
    if (!offerPrice || Number(offerPrice) <= 0) return;
    try {
      await fakeApi.sendOffer(product.id, user.id, seller.id, Number(offerPrice));
      showToast("Đã gửi lời đề nghị giá!", "success");
      setShowOfferModal(false);
      handleChat(); // Open chat to see the offer
    } catch (e) {
      showToast("Có lỗi xảy ra", "error");
    }
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 28px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <BackBtn />

      {/* Breadcrumb */}
      <div style={{ display: "flex", gap: 8, fontSize: 13, color: DS.textMuted, marginBottom: 24 }}>
        <span style={{ cursor: "pointer" }} onClick={() => setView("home")}>Trang chủ</span>
        <span>›</span>
        <span style={{ cursor: "pointer" }} onClick={() => setView("search")}>{categories?.find(c => c.id === product.category)?.name || product.category}</span>
        <span>›</span>
        <span style={{ color: DS.textPrimary }}>{product.title}</span>
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Images & Video */}
        <div style={{ flex: "1 1 500px", minWidth: 320 }}>
          <div 
            onClick={() => activeImg !== -1 && setShowLightbox(true)}
            style={{ position: "relative", borderRadius: DS.radiusLg, overflow: "hidden", background: DS.bgHover, marginBottom: 16, paddingTop: "80%", group: "image-gallery", border: `1px solid ${DS.border}`, cursor: activeImg === -1 ? "default" : "zoom-in" }}
          >
            {activeImg === -1 ? (
              <video 
                src={product.videoUrl || product.video} 
                controls autoPlay muted
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              <img src={product.images[activeImg]} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
            )}
            
            {activeImg !== -1 && (
              <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.5)", color: "#fff", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, backdropFilter: "blur(4px)" }}>🔍</div>
            )}
            
            {/* Navigation Arrows */}
            {(product.images.length > 1 || (product.videoUrl || product.video)) && (
              <>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (activeImg === -1) setActiveImg(product.images.length - 1);
                    else if (activeImg === 0 && (product.videoUrl || product.video)) setActiveImg(-1);
                    else if (activeImg === 0) setActiveImg(product.images.length - 1);
                    else setActiveImg(prev => prev - 1);
                  }}
                  style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: DS.shadowSm, transition: "all 0.2s", zIndex: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.8)"}
                >
                  ❮
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (activeImg === -1) setActiveImg(0);
                    else if (activeImg === product.images.length - 1 && (product.videoUrl || product.video)) setActiveImg(-1);
                    else if (activeImg === product.images.length - 1) setActiveImg(0);
                    else setActiveImg(prev => prev + 1);
                  }}
                  style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.8)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: DS.shadowSm, transition: "all 0.2s", zIndex: 10 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fff"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.8)"}
                >
                  ❯
                </button>
                
                {/* Counter Badge */}
                <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 10px", borderRadius: DS.radiusFull, fontSize: 11, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                  {activeImg === -1 ? "Video" : `${activeImg + 1} / ${product.images.length}`}
                </div>
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {(product.videoUrl || product.video) && (
              <div 
                onClick={() => setActiveImg(-1)} 
                style={{ 
                  width: 80, height: 80, borderRadius: DS.radiusMd, overflow: "hidden", cursor: "pointer", 
                  border: `2px solid ${activeImg === -1 ? DS.primary : "transparent"}`, 
                  position: "relative", background: "#000" 
                }}
              >
                <video src={product.videoUrl || product.video} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 }}>▶</div>
              </div>
            )}
            {product.images.map((img, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width: 80, height: 80, borderRadius: DS.radiusMd, overflow: "hidden", cursor: "pointer", border: `2px solid ${activeImg === i ? DS.primary : "transparent"}`, opacity: activeImg === i ? 1 : 0.6 }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: "1 1 400px", minWidth: 320 }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: DS.textPrimary, lineHeight: 1.3, marginBottom: 12 }}>{product.title}</h1>
              <button onClick={() => handleWatch(product.id)} style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: watched ? DS.primaryLight : DS.bgHover, border: "none", cursor: "pointer", fontSize: 20, color: watched ? DS.primary : DS.textMuted, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                {watched ? "❤️" : "🤍"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              {product.isSponsored && <Badge color="#fff" bg={DS.primary} size="xs">💎 Tài trợ</Badge>}
              <Badge color={conditionColor(product.condition)} bg={conditionBg(product.condition)}>{product.condition}</Badge>
              <span style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>⭐ {product.rating} ({product.reviewCount} đánh giá)</span>
              <span style={{ fontSize: 13, color: DS.textMuted }}>👁 {product.views} lượt xem</span>
              <span style={{ fontSize: 13, color: DS.textMuted }}>📍 {product.location}</span>
              <span style={{ fontSize: 13, color: DS.textMuted, opacity: 0.6 }}>Mã SP: {product.sku}</span>
            </div>

            <div style={{ background: DS.bgHover, padding: 20, borderRadius: DS.radiusLg, position: "relative" }}>
              <p style={{ fontSize: 14, color: DS.textMuted, marginBottom: 4 }}>Giá bán</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: DS.primary, lineHeight: 1 }}>{formatPrice(product.price)}</span>
                {product.format === "auction" && <span style={{ fontSize: 14, color: DS.warning, fontWeight: 700, paddingBottom: 4 }}>Đang đấu giá</span>}
              </div>
              {product.combo && (
                <div style={{ marginTop: 16, padding: "10px 14px", background: "#fff", borderRadius: DS.radiusMd, border: `1px dashed ${DS.success}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🎁</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: DS.success }}>Ưu đãi Combo: Giảm {product.combo.discount}%</p>
                    <p style={{ fontSize: 11, color: DS.textSecondary }}>{product.combo.desc}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
            {isOwner ? (
              <div>
                <div style={{ display: "flex", gap: 12 }}>
                  <Button 
                    size="lg" 
                    fullWidth 
                    onClick={() => setView("create-listing", product)} 
                    style={{ background: DS.gradientHero, border: "none" }}
                  >
                    ✏️ Chỉnh sửa tin đăng
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    fullWidth 
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc chắn muốn xóa tin đăng này?")) {
                        await fakeApi.removeProduct(product.id);
                        showToast("Đã xóa tin đăng");
                        setView("home");
                      }
                    }}
                    style={{ borderColor: DS.error, color: DS.error }}
                  >
                    🗑️ Xóa tin
                  </Button>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                  <Button 
                    size="md" 
                    variant="outline" 
                    fullWidth 
                    onClick={() => setView("create-listing", { ...product, mode: 'boost' })}
                    style={{ borderColor: DS.warning, color: DS.warning, fontWeight: 700 }}
                  >
                    ⚡ Đẩy tin (Boost)
                  </Button>
                  <Button 
                    size="md" 
                    variant="outline" 
                    fullWidth 
                    onClick={() => setView("create-listing", { ...product, mode: 'combo' })}
                    style={{ borderColor: DS.success, color: DS.success, fontWeight: 700 }}
                  >
                    🎁 Thêm Combo
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <Button 
                  size="lg" 
                  fullWidth 
                  onClick={() => { handleAddToCart(product); setCartDrawerOpen(true); }}
                >
                  🛒 Thêm vào giỏ
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  fullWidth 
                  onClick={() => { handleAddToCart(product); setView("checkout"); }}
                >
                  Mua ngay
                </Button>
              </div>
            )}
            {!isOwner && (
              <Button 
                variant="secondary" 
                fullWidth 
                size="md" 
                style={{ background: "#F1F5F9", color: DS.textPrimary }}
                onClick={() => setShowOfferModal(true)}
              >
                🤝 Trả giá (Thương lượng)
              </Button>
            )}
          </div>

          {/* Seller Card */}
          <div style={{ background: DS.bgCard, border: `1px solid ${DS.border}`, borderRadius: DS.radiusLg, padding: 20 }}>
            {loading ? <Spinner /> : seller ? (
              <div>
                <div
                  onClick={() => setView("store", seller)}
                  style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 16, cursor: "pointer", padding: "8px", borderRadius: DS.radiusMd, transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = DS.bgHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <img src={seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}`} alt={seller.name} style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: DS.textPrimary }}>{seller.name} {seller.verified && <span style={{ color: DS.primary }}>✓</span>}</p>
                    <p style={{ fontSize: 13, color: DS.textMuted }}>★ {seller.rating} ({seller.sales} đã bán) • {seller.followers?.length || 0} người theo dõi</p>
                  </div>
                </div>
                {!isOwner && (
                  <div style={{ display: "flex", gap: 10 }}>
                    <Button size="sm" variant={isFollowing ? "outline" : "primary"} fullWidth onClick={async () => {
                      await handleFollowToggle();
                      // Refetch seller to update count
                      const fresh = await fakeApi.getUserById(seller.id);
                      setSeller(fresh);
                    }}>
                      {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                    </Button>
                    <Button size="sm" variant="outline" fullWidth onClick={handleChat}>
                      💬 Nhắn tin
                    </Button>
                  </div>
                )}
                {isOwner && (
                  <div style={{ textAlign: "center", padding: "10px", background: DS.bgHover, borderRadius: DS.radiusMd }}>
                    <p style={{ fontSize: 13, color: DS.textSecondary, fontWeight: 600 }}>Đây là cửa hàng của bạn ✨</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

        </div>
      </div>

      {/* Details Tabs */}
      <div style={{ marginTop: 48, borderTop: `1px solid ${DS.border}`, paddingTop: 32 }}>
        <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${DS.border}`, marginBottom: 28, overflowX: "auto" }}>
          {[{ k: "desc", label: "📋 Mô tả" }, { k: "specs", label: "🔧 Thông số" }, { k: "eco", label: "🌍 Tác động" }, { k: "reviews", label: "⭐ Đánh giá" }, { k: "qna", label: "❓ Hỏi & Đáp" }].map(({ k, label }) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: "10px 20px", border: "none", background: "none", borderBottom: `3px solid ${tab === k ? DS.primary : "transparent"}`, color: tab === k ? DS.primary : DS.textSecondary, fontSize: 14, cursor: "pointer", fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: tab === k ? 700 : 500, transition: "all 0.2s", whiteSpace: "nowrap" }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 800 }}>
          {tab === "desc" && (
            <div style={{ fontSize: 15, color: DS.textSecondary, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
              {product.description}
              
              {product.verifiedProof && (
                <div style={{ marginTop: 32, padding: 24, background: DS.bgHover, borderRadius: DS.radiusLg, border: `1px solid ${DS.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>🛡️</span>
                    <h4 style={{ fontSize: 17, fontWeight: 800, color: DS.textPrimary }}>Minh chứng sản phẩm chính chủ</h4>
                  </div>
                  <p style={{ fontSize: 14, color: DS.textSecondary, marginBottom: 20 }}>Người bán đã cung cấp hình ảnh thực tế kèm giấy tờ hoặc minh chứng sở hữu để đảm bảo tính xác thực của sản phẩm.</p>
                  <div style={{ position: "relative", width: "fit-content", background: "#fff", padding: 8, borderRadius: DS.radiusMd, boxShadow: DS.shadowSm }}>
                    <img src={product.verifiedProof} alt="Proof" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 4, display: "block" }} />
                    <div style={{ position: "absolute", bottom: 12, right: 12, background: DS.success, color: "#fff", padding: "4px 10px", borderRadius: DS.radiusFull, fontSize: 11, fontWeight: 700, boxShadow: DS.shadowSm, display: "flex", alignItems: "center", gap: 4 }}>
                      <span>✓</span> ĐÃ XÁC MINH
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "specs" && (
            <>
              <div style={{ background: DS.bgMain, borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
                {[
                  { label: "Thương hiệu", val: product.specs?.brand || "Không rõ" },
                  { label: "Tình trạng", val: product.condition },
                  { label: "Năm mua", val: product.specs?.yearBought || "Không rõ" },
                  { label: "Bảo hành", val: product.specs?.warranty || "Hết bảo hành" },
                  { label: "Vận chuyển", val: product.shipping === 0 ? "Miễn phí" : formatPrice(product.shipping) }
                ].map((row, i) => (
                  <div key={row.label} style={{ display: "flex", padding: "14px 20px", borderBottom: i === 4 ? "none" : `1px solid ${DS.border}`, background: i % 2 === 0 ? DS.bgCard : "transparent" }}>
                    <span style={{ width: 140, color: DS.textMuted, fontSize: 14 }}>{row.label}</span>
                    <strong style={{ color: DS.textPrimary, fontSize: 14 }}>{row.val}</strong>
                  </div>
                ))}
              </div>

              {/* Price Trend Chart */}
              <div style={{ marginTop: 24, padding: 24, background: DS.bgCard, borderRadius: DS.radiusLg, border: `1px solid ${DS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: DS.textPrimary }}>📉 Biến động giá thị trường</h4>
                  <Badge color={DS.success} size="xs">Ổn định</Badge>
                </div>
                <div style={{ height: 120, position: "relative", display: "flex", alignItems: "flex-end", gap: 2 }}>
                  {[0.8, 0.75, 0.9, 0.85, 0.95, 1.0, 0.98].map((v, i) => (
                    <div key={i} style={{ flex: 1, position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div style={{ height: `${v * 100}%`, background: i === 6 ? DS.primary : `${DS.primary}33`, borderRadius: "4px 4px 0 0", position: "relative" }}>
                        {i === 6 && <div style={{ position: "absolute", top: -25, left: "50%", transform: "translateX(-50%)", background: DS.textPrimary, color: "#fff", fontSize: 10, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>Hiện tại</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, borderTop: `1px solid ${DS.border}`, paddingTop: 8 }}>
                  <span style={{ fontSize: 11, color: DS.textMuted }}>6 tháng trước</span>
                  <span style={{ fontSize: 11, color: DS.textMuted }}>Hiện tại</span>
                </div>
                <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 16, lineHeight: 1.5 }}>
                  ℹ️ Giá sản phẩm này đang ở mức **tốt nhất** trong 3 tháng qua. Bạn nên cân nhắc chốt đơn ngay!
                </p>
              </div>
            </>
          )}

          {tab === "eco" && (
            <div style={{ animation: "fadeInUp 0.4s ease" }}>
              <div style={{ background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", borderRadius: 24, padding: 32, border: "1px solid #A7F3D0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: 40 }}>🌍</div>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: "#065F46", margin: 0 }}>Tác động tích cực đến Trái Đất</h3>
                    <p style={{ fontSize: 14, color: "#047857", marginTop: 4 }}>Bằng việc mua sản phẩm cũ này, bạn đã tiết kiệm được:</p>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                  {[
                    { 
                      label: "Khí thải CO2", 
                      val: product.category === 'c1' ? '75.2 kg' : product.category === 'c2' ? '12.5 kg' : '25.0 kg', 
                      icon: "☁️", color: "#10B981" 
                    },
                    { 
                      label: "Nước sạch", 
                      val: product.category === 'c1' ? '12,000 L' : product.category === 'c2' ? '2,700 L' : '4,500 L', 
                      icon: "💧", color: "#3B82F6" 
                    },
                    { 
                      label: "Rác thải", 
                      val: product.category === 'c1' ? '0.8 kg' : product.category === 'c2' ? '1.5 kg' : '1.0 kg', 
                      icon: "♻️", color: "#F59E0B" 
                    }
                  ].map(stat => (
                    <div key={stat.label} style={{ background: "#fff", padding: 20, borderRadius: 20, textAlign: "center", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: stat.color }}>{stat.val}</div>
                      <div style={{ fontSize: 12, color: DS.textMuted, fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 32, background: "rgba(255,255,255,0.5)", borderRadius: 16, padding: 20, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                  <p style={{ fontSize: 14, color: "#065F46", lineHeight: 1.6, margin: 0 }}>
                    💡 **Bạn có biết?** {product.category === 'c1' 
                      ? "Việc sản xuất một chiếc điện thoại mới tiêu tốn lượng nước tương đương việc tắm rửa trong 3 tháng liên tục."
                      : "Ngành công nghiệp thời trang là ngành tiêu thụ nước sạch lớn thứ 2 trên thế giới."}
                  </p>
                </div>
              </div>
            </div>
          )}
          {tab === "reviews" && (
            <ReviewsTab productId={product.id} sellerId={product.sellerId} user={user} showToast={showToast} initialReviews={product.reviews} />
          )}

          {tab === "qna" && (
            <QnATab productId={product.id} user={user} isOwner={isOwner} showToast={showToast} />
          )}
        </div>
      </div>
      {/* Offer Modal */}
      {showOfferModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, padding: 20 }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 400, borderRadius: DS.radiusLg, padding: 32, boxShadow: DS.shadowLg }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>🤝 Đưa ra lời đề nghị</h3>
            <p style={{ fontSize: 13, color: DS.textMuted, marginBottom: 24 }}>Sản phẩm đang bán với giá {formatPrice(product.price)}. Bạn muốn mua với giá bao nhiêu?</p>
            
            <div style={{ marginBottom: 24 }}>
              <Input 
                label="Giá đề nghị (đ)" 
                type="number" 
                value={offerPrice} 
                onChange={v => setOfferPrice(v)} 
                placeholder="Nhập giá bạn mong muốn..."
                autoFocus
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {[0.9, 0.85, 0.8].map(ratio => (
                  <button 
                    key={ratio}
                    onClick={() => setOfferPrice(Math.round(product.price * ratio))}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: `1px solid ${DS.border}`, background: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    -{Math.round((1-ratio)*100)}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Button variant="outline" fullWidth onClick={() => setShowOfferModal(false)}>Hủy</Button>
              <Button fullWidth onClick={handleSendOffer} disabled={!offerPrice}>Gửi đề nghị</Button>
            </div>
          </div>
        </div>
      )}
      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          onClick={() => setShowLightbox(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out", animation: "fadeIn 0.3s ease" }}
        >
          <img 
            src={product.images[activeImg]} 
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 12, boxShadow: "0 40px 100px rgba(0,0,0,0.5)", transition: "transform 0.3s ease" }} 
            onClick={e => e.stopPropagation()}
          />
          <button style={{ position: "absolute", top: 30, right: 30, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 50, height: 50, borderRadius: "50%", fontSize: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          
          <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 12 }}>
            {product.images.map((img, i) => (
              <div 
                key={i} 
                onClick={(e) => { e.stopPropagation(); setActiveImg(i); }} 
                style={{ width: 60, height: 60, borderRadius: 8, overflow: "hidden", border: `2px solid ${activeImg === i ? "#fff" : "transparent"}`, opacity: activeImg === i ? 1 : 0.5, transition: "all 0.2s", cursor: "pointer" }}
              >
                <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
