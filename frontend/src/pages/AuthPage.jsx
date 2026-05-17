// ============================================================
// PAGE 13: AUTH PAGE — Hand-Me-On
// ============================================================

import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import fakeApi from "../database/fakeApi";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const DEMO_ACCOUNTS = [
  { role: "Admin (Full quyền)", email: "tran@example.com", password: "123", avatar: "https://i.pravatar.cc/150?u=u1" },
  { role: "Người dùng (Demo)", email: "nguyen@example.com", password: "123", avatar: "https://i.pravatar.cc/150?u=u2" },
];

export default function AuthPage() {
  const { handleLogin, setView } = useApp();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = windowWidth >= 900;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.email.includes("@")) return "Email không hợp lệ";
    if (form.password.length < 3) return "Mật khẩu phải có ít nhất 3 ký tự";
    if (mode === "register" && form.name.trim().length < 2) return "Vui lòng nhập họ tên đầy đủ";
    return null;
  };

  const submit = async (customForm = null) => {
    const f = customForm || form;
    if (!customForm) {
      const validErr = validate();
      if (validErr) { setError(validErr); return; }
    }
    setLoading(true);
    setError("");
    try {
      const result = mode === "login"
        ? await fakeApi.login(f.email, f.password)
        : await fakeApi.register(f);
      handleLogin(result.user, result.token);
      setView("home");
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) submit();
  };

  const fillDemo = (email, password) => {
    const demoForm = { ...form, email, password };
    setForm(demoForm);
    submit(demoForm);
  };

  const loginWithSocial = async (provider) => {
    setLoading(true);
    try {
      const email = `demo@${provider.toLowerCase()}.com`;
      try {
        const res = await fakeApi.login(email, "social");
        handleLogin(res.user, res.token);
      } catch (e) {
        const res = await fakeApi.register({ name: `${provider} User`, email, password: "social", avatar: `https://ui-avatars.com/api/?name=${provider}&background=random` });
        handleLogin(res.user, res.token);
      }
      setView("home");
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Be Vietnam Pro, sans-serif", background: DS.bgCard }}>
      
      {/* ── Left Side: Branding / Imagery ── */}
      <div style={{
        flex: 1,
        position: "relative",
        display: isDesktop ? "block" : "none",
        backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        {/* Gradient Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(145deg, rgba(239,68,68,0.85) 0%, rgba(153,27,27,0.95) 100%)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "60px 80px"
        }}>
          {/* Top Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              🤝
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em" }}>Hand-Me-On</span>
          </div>

          {/* Center Text */}
          <div style={{ color: "#fff", maxWidth: 480 }}>
            <h1 style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.04em" }}>
              Món đồ cũ.<br/>Cuộc sống mới.
            </h1>
            <p style={{ fontSize: 18, opacity: 0.9, lineHeight: 1.6, fontWeight: 400 }}>
              Tham gia cộng đồng trao đổi, mua bán đồ cũ lớn nhất Việt Nam. Cùng nhau xây dựng lối sống xanh, tiết kiệm và thông minh hơn.
            </p>
            <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>1M+</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>Thành viên</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>50K+</div>
                <div style={{ fontSize: 14, opacity: 0.8 }}>Sản phẩm mới</div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            © 2024 Hand-Me-On Vietnam.
          </div>
        </div>
      </div>

      {/* ── Right Side: Form ── */}
      <div style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        position: "relative",
        background: DS.bgMain,
      }}>
        {/* Mobile Logo & Guest Link Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", width: "100%" }}>
          <div style={{ display: isDesktop ? "none" : "block" }}>
             {/* Shown only on mobile */}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setView("home")} style={{ background: "transparent", border: "none", color: DS.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = DS.primary} onMouseLeave={e => e.currentTarget.style.color = DS.textMuted}>
              Tiếp tục như khách →
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: 440 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: DS.textPrimary, letterSpacing: "-0.03em", marginBottom: 8 }}>
                {mode === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
              </h2>
              <p style={{ color: DS.textMuted, fontSize: 15 }}>
                {mode === "login" ? "Vui lòng đăng nhập để tiếp tục khám phá." : "Điền thông tin bên dưới để đăng ký."}
              </p>
            </div>

            {/* Mode Toggle */}
            <div style={{ display: "flex", background: DS.bgHover, borderRadius: DS.radiusMd, padding: 5, marginBottom: 32 }}>
              {[["login", "Đăng Nhập"], ["register", "Đăng Ký"]].map(([m, l]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  style={{
                    flex: 1, padding: "12px 0",
                    borderRadius: DS.radiusMd,
                    border: "none",
                    background: mode === m ? DS.bgCard : "transparent",
                    color: mode === m ? DS.primary : DS.textSecondary,
                    fontWeight: mode === m ? 700 : 500,
                    cursor: "pointer", fontSize: 14,
                    fontFamily: "Be Vietnam Pro, sans-serif",
                    transition: "all 0.2s",
                    boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  }}
                >{l}</button>
              ))}
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {mode === "register" && (
                <Input label="Họ và tên" value={form.name} onChange={(v) => set("name", v)} placeholder="Nguyễn Văn A" icon="👤" required onKeyDown={handleKeyDown} />
              )}
              <Input label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="ban@email.com" icon="✉️" required onKeyDown={handleKeyDown} />
              <Input label="Mật khẩu" type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="••••••••" icon="🔒" required onKeyDown={handleKeyDown} />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginTop: 20, padding: "14px 16px",
                borderRadius: DS.radiusMd,
                background: DS.errorLight, color: DS.error,
                fontSize: 13, fontWeight: 600,
                border: `1px solid ${DS.error}30`,
                display: "flex", gap: 10, alignItems: "center",
                animation: "fadeIn 0.3s"
              }}>
                <span style={{ fontSize: 18 }}>⚠️</span> {error}
              </div>
            )}

            {/* Submit */}
            <Button onClick={submit} fullWidth size="xl" style={{ marginTop: 24, fontSize: 16, boxShadow: DS.shadowPrimary }} disabled={loading}>
              {loading ? "⏳ Đang xử lý..." : mode === "login" ? "Đăng nhập ngay" : "Tạo tài khoản"}
            </Button>

            {/* Forgot */}
            {mode === "login" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 13, color: DS.textMuted }}>
                <span style={{ cursor: "pointer", fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=DS.primary} onMouseLeave={e=>e.currentTarget.style.color=DS.textMuted}>Quét mã QR</span>
                <span style={{ cursor: "pointer", fontWeight: 600, transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=DS.primary} onMouseLeave={e=>e.currentTarget.style.color=DS.textMuted}>Quên mật khẩu?</span>
              </div>
            )}

            {/* Social Login */}
            <div style={{ marginTop: 36, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: DS.textMuted, marginBottom: 20, position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: DS.border }} />
                <span style={{ fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hoặc kết nối với</span>
                <div style={{ flex: 1, height: 1, background: DS.border }} />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <button onClick={() => loginWithSocial("Google")} style={{ flex: 1, padding: "12px", background: "#fff", border: `1px solid ${DS.border}`, borderRadius: DS.radiusLg, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: DS.textPrimary, transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }} onMouseEnter={e=>e.currentTarget.style.borderColor=DS.primary} onMouseLeave={e=>e.currentTarget.style.borderColor=DS.border}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: 20 }} /> Google
                </button>
                <button onClick={() => loginWithSocial("Facebook")} style={{ flex: 1, padding: "12px", background: "#fff", border: `1px solid ${DS.border}`, borderRadius: DS.radiusLg, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: DS.textPrimary, transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }} onMouseEnter={e=>e.currentTarget.style.borderColor=DS.primary} onMouseLeave={e=>e.currentTarget.style.borderColor=DS.border}>
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" style={{ width: 20 }} /> Facebook
                </button>
              </div>
            </div>

            {/* Demo accounts */}
            {mode === "login" && (
              <div style={{ marginTop: 32, background: DS.bgHover, padding: 20, borderRadius: DS.radiusLg, border: `1px dashed ${DS.border}` }}>
                <p style={{ fontSize: 12, color: DS.textMuted, textAlign: "center", marginBottom: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Đăng nhập nhanh (Chế độ Demo)
                </p>
                <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => fillDemo(acc.email, acc.password)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: DS.radiusMd,
                        border: `1.5px solid transparent`,
                        background: "#fff", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 14,
                        transition: "all 0.2s",
                        fontFamily: "Be Vietnam Pro, sans-serif",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = DS.primary; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; }}
                    >
                      <img src={acc.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: DS.textPrimary, marginBottom: 2 }}>{acc.role}</p>
                        <p style={{ fontSize: 12, color: DS.textMuted }}>{acc.email}</p>
                      </div>
                      <div style={{ marginLeft: "auto", color: DS.primary, opacity: 0.8 }}>→</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Terms */}
            {mode === "register" && (
              <p style={{ marginTop: 24, fontSize: 13, color: DS.textMuted, textAlign: "center", lineHeight: 1.6 }}>
                Bằng việc tạo tài khoản, bạn đồng ý với{" "}
                <span style={{ color: DS.primary, cursor: "pointer", fontWeight: 600 }}>Quy điều khoản dịch vụ</span> và{" "}
                <span style={{ color: DS.primary, cursor: "pointer", fontWeight: 600 }}>Chính sách bảo mật</span>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
