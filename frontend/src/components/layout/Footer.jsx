import { DS } from "../../design/tokens";
import { useApp } from "../../context/AppContext";

export default function Footer() {
  const { setView } = useApp();
  return (
    <footer style={{ background: "#0F172A", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "56px 28px 36px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: DS.gradientPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤝</div>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Hand-Me-On</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 260 }}>Chợ trao đổi đồ cũ C2C uy tín nhất Việt Nam. Mua thông minh, bán dễ dàng, sống bền vững.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              {[["🐦", "Twitter"], ["📘", "Facebook"], ["📸", "Instagram"], ["▶️", "YouTube"]].map(([icon, label]) => (
                <button key={label} title={label} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}>{icon}</button>
              ))}
            </div>
          </div>
          {[
            ["Người mua", [["Cách mua hàng","search"],["Bảo vệ người mua","sustainability"],["Theo dõi đơn hàng","orders"],["Trung tâm hỗ trợ","help"]]],
            ["Người bán", [["Bắt đầu đăng bán","listing"],["Mẹo bán hàng","help"],["Tác động môi trường","sustainability"],["Dashboard","dashboard"]]],
            ["Hỗ trợ", [["Trung tâm trợ giúp","help"],["Liên hệ chúng tôi","help"],["Mẹo an toàn","help"],["Cộng đồng","home"]]],
          ].map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontWeight: 700, fontSize: 12, color: "#fff", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map(([label, v]) => (
                  <span key={label} onClick={() => setView(v)} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "color 0.15s" }} onMouseEnter={e => e.currentTarget.style.color="#fff"} onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.5)"}>{label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>© 2024 Hand-Me-On. Bảo lưu mọi quyền.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Chính sách quyền riêng tư", "Điều khoản dịch vụ", "Chính sách cookie"].map(l => (
              <span key={l} style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
