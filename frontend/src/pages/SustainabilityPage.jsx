import React from 'react';
import { DS } from '../design/tokens';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';

export default function SustainabilityPage() {
  const { setView } = useApp();

  const stats = [
    { label: "CO2 Tiết kiệm", value: "250,000 kg", icon: "🌱", desc: "Tương đương với việc trồng 12,000 cây xanh." },
    { label: "Nước Tiết kiệm", value: "15,000,000 L", icon: "💧", desc: "Đủ cho 200,000 lần tắm vòi sen." },
    { label: "Rác thải tránh được", value: "45,000 kg", icon: "📦", desc: "Số lượng vải và nhựa không bị đưa ra bãi rác." },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 80 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, color: DS.textPrimary, marginBottom: 20 }}>Tác động của bạn 🌍</h1>
        <p style={{ fontSize: 18, color: DS.textSecondary, maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
          Mỗi món đồ bạn mua hoặc bán trên Hand-Me-On đều góp phần bảo vệ hành tinh. 
          Cùng nhau, chúng ta đang xây dựng một tương lai bền vững hơn.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, marginBottom: 80 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "#fff", padding: 40, borderRadius: DS.radiusLg, boxShadow: DS.shadowLg, textAlign: "center", border: `1px solid ${DS.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>{s.icon}</div>
            <h3 style={{ fontSize: 32, fontWeight: 900, color: DS.primary, marginBottom: 8 }}>{s.value}</h3>
            <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{s.label}</p>
            <p style={{ color: DS.textMuted, fontSize: 14 }}>{s.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: DS.primary, borderRadius: DS.radiusLg, padding: "60px 40px", color: "#fff", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 24 }}>Tại sao chọn đồ cũ?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 24 }}>1️⃣</span>
              <p><strong>Giảm tiêu thụ tài nguyên:</strong> Sản xuất đồ mới tốn rất nhiều năng lượng và nguyên liệu.</p>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 24 }}>2️⃣</span>
              <p><strong>Kéo dài vòng đời sản phẩm:</strong> Giúp đồ vật có "cuộc đời thứ hai" thay vì bị vứt bỏ.</p>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 24 }}>3️⃣</span>
              <p><strong>Xây dựng cộng đồng:</strong> Kết nối những người có cùng ý thức bảo vệ môi trường.</p>
            </div>
          </div>
        </div>
        <div style={{ flex: "0 0 300px", textAlign: "center" }}>
          <div style={{ width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <span style={{ fontSize: 100 }}>♻️</span>
          </div>
          <Button variant="white" size="lg" onClick={() => setView("search")}>Bắt đầu mua sắm</Button>
        </div>
      </div>

      <div style={{ marginTop: 80, textAlign: "center" }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 40 }}>Hành trình của chúng ta</h3>
        <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
          <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop" style={{ borderRadius: DS.radiusMd, width: 300 }} alt="Nature" />
          <img src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop" style={{ borderRadius: DS.radiusMd, width: 300 }} alt="Recycle" />
          <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop" style={{ borderRadius: DS.radiusMd, width: 300 }} alt="Green" />
        </div>
      </div>
    </div>
  );
}
