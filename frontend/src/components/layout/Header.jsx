import { useState, useEffect, useRef } from "react";
import { DS } from "../../design/tokens";
import { useApp } from "../../context/AppContext";
import fakeApi from "../../database/fakeApi";

// ─── Icon Button ─────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, active, badge, children, style: sx }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative", width: 38, height: 38, borderRadius: DS.radiusMd,
        border: "none", background: active || hov ? DS.primaryLight : "transparent",
        cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, transition: "background 0.15s",
        color: active ? DS.primary : DS.textSecondary, ...sx,
      }}
    >
      {children}
      {badge > 0 && (
        <span style={{
          position: "absolute", top: 3, right: 3, background: DS.error, color: "#fff",
          borderRadius: DS.radiusFull, fontSize: 9, fontWeight: 800,
          minWidth: 16, height: 16, padding: "0 3px",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #fff", lineHeight: 1,
        }}>{badge > 99 ? "99+" : badge}</span>
      )}
    </button>
  );
}

// ─── Nav Button ──────────────────────────────────────────────────────────────
function NavBtn({ label, active, highlight, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        whiteSpace: "nowrap", padding: "6px 12px", borderRadius: DS.radiusMd,
        border: active ? `1px solid ${DS.primary}` : highlight ? "1px solid rgba(239,68,68,0.25)" : "none",
        background: active ? DS.primary : highlight ? "rgba(239,68,68,0.08)" : "transparent",
        color: active ? "#fff" : highlight ? "#ef4444" : DS.textSecondary,
        fontWeight: active || highlight ? 700 : 500,
        fontSize: 13, cursor: "pointer", fontFamily: "Be Vietnam Pro, sans-serif",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────
function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      {trigger(open, () => setOpen(v => !v))}
      {open && (
        <div style={{
          position: "absolute", [align === "right" ? "right" : "left"]: 0,
          top: "calc(100% + 8px)",
          background: DS.bgCard, borderRadius: DS.radiusLg,
          border: `1px solid ${DS.border}`, boxShadow: DS.shadowLg,
          zIndex: 400, overflow: "hidden",
          animation: "slideDown 0.18s cubic-bezier(0.16,1,0.3,1)",
          minWidth: 200,
        }}>
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────────────
export default function Header() {
  const {
    view, setView, cartItems, user, handleLogout,
    notifCount, setNotifCount, setGlobalSearch, globalSearch, setGlobalCategory,
    chats, setMiniChatId, setMiniChatOpen, cartDrawerOpen, setCartDrawerOpen
  } = useApp();
  
  const [searchVal, setSearchVal] = useState("");
  const [previews, setPreviews] = useState([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (globalSearch !== searchVal) setSearchVal(globalSearch || "");
  }, [globalSearch]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search Previews logic
  useEffect(() => {
    if (searchVal.trim().length > 1) {
      const timer = setTimeout(async () => {
        try {
          const results = await fakeApi.getSearchPreviews(searchVal);
          setPreviews(results.slice(0, 5));
          setShowPreviews(true);
        } catch (err) { setPreviews([]); }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setPreviews([]);
      setShowPreviews(false);
    }
  }, [searchVal]);

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const placeholders = ["Tìm iPhone 13...", "Tìm áo khoác Zara...", "Tìm máy giặt cũ...", "Tìm bàn làm việc..."];
  const [phIdx, setPhIdx] = useState(0);
  useEffect(() => {
    const int = setInterval(() => setPhIdx(x => (x + 1) % placeholders.length), 3000);
    return () => clearInterval(int);
  }, []);

  const doSearch = () => {
    setGlobalSearch(searchVal.trim());
    setView("search");
  };

  const openNotifs = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && user && notifs.length === 0) {
      const data = await fakeApi.getNotifications(user.id);
      setNotifs(data);
      await fakeApi.markNotificationsRead(user.id);
      setNotifCount(0);
    }
  };

  const primaryNav = [
    { label: "Trang chủ", view: "home" },
    { label: "Khám phá", view: "search" },
    { label: "⚡ Flash Sale", view: "flashsale", highlight: true },
  ];

  const cartCount = cartItems.reduce((acc, i) => acc + (i.qty || 1), 0);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 1000,
      background: scrolled ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.92)",
      backdropFilter: "blur(20px) saturate(180%)",
      borderBottom: `1px solid ${scrolled ? DS.border : "transparent"}`,
      fontFamily: "Be Vietnam Pro, sans-serif",
      boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
      transition: "all 0.3s ease",
    }}>
      <style>{`
        @keyframes logoGlow {
          0% { filter: drop-shadow(0 0 2px rgba(239,68,68,0.2)); }
          50% { filter: drop-shadow(0 0 8px rgba(239,68,68,0.5)); }
          100% { filter: drop-shadow(0 0 2px rgba(239,68,68,0.2)); }
        }
        @keyframes shine {
          from { left: -100%; }
          to { left: 100%; }
        }
        .shine-btn {
          position: relative;
          overflow: hidden;
        }
        .shine-btn::after {
          content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-25deg); transition: none;
        }
        .shine-btn:hover::after {
          animation: shine 0.75s ease-in-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, 
        height: scrolled ? 60 : 70, transition: "all 0.3s ease"
      }}>

        {/* ── Logo ── */}
        <div
          onClick={() => setView("home")}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, animation: "logoGlow 3s infinite" }}
        >
          <div style={{
            width: scrolled ? 32 : 38, height: scrolled ? 32 : 38, borderRadius: 10, background: DS.gradientPrimary,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: scrolled ? 15 : 18, boxShadow: "0 6px 15px rgba(239,68,68,0.2)", flexShrink: 0,
            transition: "all 0.3s ease"
          }}>🛍️</div>
          <span style={{ fontWeight: 900, fontSize: scrolled ? 17 : 19, color: DS.textPrimary, letterSpacing: "-0.04em", whiteSpace: "nowrap", transition: "all 0.3s ease" }}>
            Hand<span style={{ color: DS.primary }}>-Me-</span>On
          </span>
        </div>

        {/* ── Search & Sell ── */}
        {view !== "auth" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, maxWidth: 650 }}>
            <div style={{
              flex: 1, minWidth: 150,
              display: "flex", alignItems: "center",
              background: "#F1F5F9", borderRadius: 14,
              border: `1.5px solid ${DS.border}`, padding: "4px 4px 4px 12px",
              gap: 8, transition: "all 0.2s",
            }}
              onFocus={e => { e.currentTarget.style.borderColor = DS.primary; e.currentTarget.style.background = "#fff"; }}
              onBlur={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = "#F1F5F9"; }}
            >
              <Dropdown align="left" trigger={(open, toggle) => (
                <button onClick={toggle} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: DS.textSecondary, borderRight: `1px solid ${DS.border}`, paddingRight: 8, marginRight: 4 }}>
                  Danh mục {open ? "▴" : "▾"}
                </button>
              )}>
                {(close) => (
                  <div style={{ padding: 8, width: 180 }}>
                    {[
                      {id:"c1",name:"Điện tử"}, {id:"c2",name:"Thời trang"}, {id:"c3",name:"Nhà & Vườn"}, 
                      {id:"c4",name:"Sách"}, {id:"c5",name:"Thể thao & Du lịch"}, {id:"c6",name:"Xe cộ"},
                      {id:"c7",name:"Mẹ & Bé"}, {id:"c8",name:"Phụ kiện"}, {id:"c9",name:"Nội thất"}, {id:"c10",name:"Đồ cổ"}
                    ].map(c => (
                      <button key={c.id} onClick={() => { setGlobalCategory(c.id); setView("search"); close(); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: DS.textSecondary, borderRadius: 8, transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = DS.bgHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSearch()}
                placeholder={placeholders[phIdx]}
                style={{
                  flex: 1, border: "none", background: "transparent", outline: "none",
                  fontSize: 13, color: DS.textPrimary, minWidth: 0,
                }}
              />
              {showPreviews && previews.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 12px)", left: 0, right: 0,
                  background: "#fff", borderRadius: 16, border: `1px solid ${DS.border}`,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)", zIndex: 2000, overflow: "hidden",
                  animation: "slideDown 0.2s ease"
                }}>
                  <div style={{ padding: "10px 16px", background: DS.bgHover, fontSize: 11, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kết quả gợi ý</div>
                  {previews.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { setView("product"); setSelectedProduct(p); setShowPreviews(false); setSearchVal(""); }}
                      style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = DS.bgHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <img src={p.images[0]} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</p>
                        <p style={{ fontSize: 11, color: DS.primary, fontWeight: 800 }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p.price)}</p>
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={() => { doSearch(); setShowPreviews(false); }}
                    style={{ padding: "12px", textAlign: "center", background: DS.primaryLight, color: DS.primary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    Xem tất cả kết quả cho "{searchVal}"
                  </div>
                </div>
              )}
              <button
                onClick={doSearch}
                style={{
                  width: 30, height: 30, borderRadius: 10,
                  background: DS.gradientPrimary, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, flexShrink: 0, color: "#fff",
                }}
              >🔍</button>
            </div>

            <button 
              onClick={() => setView("listing")}
              className="shine-btn"
              style={{ 
                background: DS.success, color: "#fff", border: "none",
                padding: scrolled ? "8px 16px" : "10px 20px", borderRadius: 12, fontWeight: 900, 
                fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", 
                gap: 6, boxShadow: "0 6px 15px -3px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s ease", flexShrink: 0
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
            >
              <span style={{ fontSize: 16 }}>⚡</span> ĐĂNG BÁN
            </button>
          </div>
        )}

        {/* ── Right actions ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          
          <nav style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}>
            {primaryNav.map(n => (
              <NavBtn
                key={n.view}
                label={n.label}
                active={view === n.view}
                highlight={n.highlight}
                onClick={() => setView(n.view)}
              />
            ))}
          </nav>

          {user && view !== "auth" ? (
            <>
              {user.role === "admin" && (
                <button
                  onClick={() => setView("admin")}
                  className="shine-btn"
                  style={{
                    background: "linear-gradient(135deg, #0F172A 0%, #334155 100%)", color: "#fff", border: "none",
                    padding: "8px 14px", borderRadius: 12, fontWeight: 900, fontSize: 10, cursor: "pointer",
                    marginRight: 4, position: "relative", overflow: "hidden", boxShadow: DS.shadowLg
                  }}
                >🛡️ ADMIN</button>
              )}

              <IconBtn onClick={() => setCartDrawerOpen(true)} title="Giỏ hàng" active={cartDrawerOpen} badge={cartCount}>🛒</IconBtn>

              <div ref={notifRef} style={{ position: "relative" }}>
                <IconBtn onClick={openNotifs} title="Thông báo" active={notifOpen} badge={notifCount}>🔔</IconBtn>
                {notifOpen && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", borderRadius: DS.radiusLg, border: `1px solid ${DS.border}`, boxShadow: DS.shadowLg, width: 320, zIndex: 400, overflow: "hidden", animation: "slideDown 0.2s ease" }}>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${DS.border}`, background: DS.bgHover }}>
                      <h4 style={{ fontWeight: 800, fontSize: 13, color: DS.textPrimary }}>Thông báo ({notifCount})</h4>
                    </div>
                    <div style={{ maxHeight: 400, overflowY: "auto" }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding: "30px 20px", textAlign: "center", color: DS.textMuted, fontSize: 12 }}>
                          <p style={{ fontSize: 24, marginBottom: 8 }}>📭</p>
                          Bạn chưa có thông báo nào
                        </div>
                      ) : (
                        notifs.map(n => (
                          <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${DS.border}`, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = DS.bgHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, marginBottom: 4 }}>{n.title}</p>
                            <p style={{ fontSize: 12, color: DS.textSecondary, lineHeight: 1.4 }}>{n.body}</p>
                            <p style={{ fontSize: 10, color: DS.textMuted, marginTop: 6 }}>{n.createdAt}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Messaging Dropdown */}
              <Dropdown align="right" trigger={(open, toggle) => (
                <IconBtn onClick={(e) => { e.stopPropagation(); toggle(); }} title="Tin nhắn" active={open} badge={chats.filter(c => c.unreadCount > 0).length}>💬</IconBtn>
              )}>
                {(close) => (
                  <div style={{ width: 320, animation: "slideDown 0.2s ease" }}>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${DS.border}`, background: DS.bgHover, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ fontWeight: 800, fontSize: 13, color: DS.textPrimary }}>Tin nhắn</h4>
                      <button onClick={() => { setView("messaging"); close(); }} style={{ border: "none", background: "none", color: DS.primary, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Xem tất cả</button>
                    </div>
                    <div style={{ maxHeight: 400, overflowY: "auto" }}>
                      {chats.length === 0 ? (
                        <div style={{ padding: "30px 20px", textAlign: "center", color: DS.textMuted, fontSize: 12 }}>
                          <p style={{ fontSize: 24, marginBottom: 8 }}>💬</p>
                          Chưa có cuộc hội thoại nào
                        </div>
                      ) : (
                        chats.slice(0, 6).map(chat => (
                          <div 
                            key={chat.id} 
                            onClick={() => { setMiniChatId(chat.id); setMiniChatOpen(true); close(); }}
                            style={{ 
                              padding: "12px 16px", borderBottom: `1px solid ${DS.border}`, 
                              display: "flex", gap: 12, cursor: "pointer", 
                              transition: "background 0.2s",
                              background: chat.unreadCount > 0 ? DS.primaryLight : "transparent"
                            }} 
                            onMouseEnter={e => e.currentTarget.style.background = DS.bgHover} 
                            onMouseLeave={e => e.currentTarget.style.background = chat.unreadCount > 0 ? DS.primaryLight : "transparent"}
                          >
                            <img src={chat.user?.avatar} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: DS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.user?.name}</p>
                                <span style={{ fontSize: 10, color: DS.textMuted }}>{chat.lastMessageTime}</span>
                              </div>
                              <p style={{ fontSize: 12, color: chat.unreadCount > 0 ? DS.textPrimary : DS.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: chat.unreadCount > 0 ? 600 : 400 }}>
                                {chat.lastMessage}
                              </p>
                            </div>
                            {chat.unreadCount > 0 && (
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: DS.primary, alignSelf: "center" }} />
                            )}
                          </div>
                        ))
                      )}
                      {chats.length > 6 && (
                        <div onClick={() => { setView("messaging"); close(); }} style={{ padding: "10px", textAlign: "center", cursor: "pointer", color: DS.primary, fontSize: 12, fontWeight: 600, background: DS.bgHover }}>
                          Xem thêm {chats.length - 6} cuộc hội thoại
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Dropdown>

              <Dropdown trigger={(open, toggle) => (
                <div
                  onClick={toggle}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, marginLeft: 4,
                    padding: "3px", borderRadius: DS.radiusFull,
                    border: `2px solid ${open ? DS.primary : DS.border}`,
                    cursor: "pointer", background: open ? DS.primaryLight : "#fff",
                    transition: "all 0.15s",
                  }}
                >
                  <img
                    src={user.avatar}
                    alt=""
                    style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=6C63FF&color=fff`; }}
                  />
                </div>
              )}>
                {(close) => (
                  <>
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${DS.border}`, background: DS.primaryLight }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: DS.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: DS.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
                    </div>
                    <div style={{ padding: 4 }}>
                      {[
                        ["👤 Hồ sơ", "profile"],
                        ["📦 Đơn hàng", "orders"],
                        ["❤️ Yêu thích", "watchlist"],
                        ["⚙️ Cài đặt", "settings"],
                      ].map(([label, v, data]) => (
                        <button
                          key={v + (data?.tab || "")}
                          onClick={() => { setView(v, data); close(); }}
                          style={{
                            display: "flex", alignItems: "center", width: "100%",
                            padding: "8px 12px", borderRadius: DS.radiusSm,
                            border: "none", background: view === v ? DS.primaryLight : "none",
                            cursor: "pointer", fontSize: 12,
                            color: view === v ? DS.primary : DS.textSecondary,
                            fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: view === v ? 600 : 400,
                            textAlign: "left", transition: "background 0.15s",
                          }}
                        >{label}</button>
                      ))}
                    </div>
                    <div style={{ padding: "6px", borderTop: `1px solid ${DS.border}`, background: DS.bgMain }}>
                      <button
                        onClick={() => { handleLogout(); close(); }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", width: "100%",
                          padding: "8px 12px", borderRadius: DS.radiusSm,
                          border: `1.5px solid ${DS.error}`, background: DS.errorLight,
                          cursor: "pointer", fontSize: 12, color: DS.error,
                          fontFamily: "Be Vietnam Pro, sans-serif", fontWeight: 700,
                        }}
                      >🚪 Đăng xuất</button>
                    </div>
                  </>
                )}
              </Dropdown>
            </>
          ) : (
            <button onClick={() => setView("auth")} style={{ marginLeft: 4, padding: "8px 18px", borderRadius: DS.radiusMd, background: DS.gradientPrimary, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
