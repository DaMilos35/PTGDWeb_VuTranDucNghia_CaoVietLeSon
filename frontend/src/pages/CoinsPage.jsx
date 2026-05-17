import { useState, useEffect } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import Button from "../components/common/Button";

export default function CoinsPage() {
  const { user, handleUpdateProfile, showToast } = useApp();
  const [lastCheckIn, setLastCheckIn] = useState(() => localStorage.getItem(`last_checkin_${user?.id}`) || "");
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);

  const canCheckIn = lastCheckIn !== new Date().toDateString();

  const handleCheckIn = async () => {
    if (!canCheckIn) return;
    const reward = 1000;
    const newCoins = (user.coins || 0) + reward;
    await handleUpdateProfile({ ...user, coins: newCoins });
    const today = new Date().toDateString();
    setLastCheckIn(today);
    localStorage.setItem(`last_checkin_${user.id}`, today);
    showToast(`Điểm danh thành công! Nhận ngay ${reward.toLocaleString()} Xu 💰`);
  };

  const handleSpin = async () => {
    if (spinning) return;
    if ((user.coins || 0) < 500) {
      showToast("Bạn cần ít nhất 500 Xu để quay!", "error");
      return;
    }

    setSpinning(true);
    setSpinResult(null);

    // Simulate spin
    setTimeout(async () => {
      const outcomes = [0, 200, 500, 1000, 2000, 5000];
      const result = outcomes[Math.floor(Math.random() * outcomes.length)];
      setSpinResult(result);
      setSpinning(false);

      const newCoins = (user.coins || 0) - 500 + result;
      await handleUpdateProfile({ ...user, coins: newCoins });

      if (result > 500) showToast(`Chúc mừng! Bạn trúng ${result.toLocaleString()} Xu! 🎉`);
      else if (result === 500) showToast("Hòa vốn rồi, thử lại nhé! 🔄");
      else showToast("Kém may mắn một chút, thử lại sau nhé! 😢", "error");
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div style={{ background: DS.gradientPrimary, borderRadius: DS.radiusXl, padding: "40px", color: "#fff", textAlign: "center", marginBottom: 32, boxShadow: DS.shadowLg }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Kho Xu Của Bạn</h1>
        <div style={{ fontSize: 48, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          💰 {(user?.coins || 0).toLocaleString()}
        </div>
        <p style={{ opacity: 0.9, marginTop: 8 }}>Tích lũy xu để đổi voucher và giảm giá khi mua hàng!</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Daily Check-in */}
        <div style={{ background: "#fff", borderRadius: DS.radiusLg, padding: 32, border: `1px solid ${DS.border}`, textAlign: "center", boxShadow: DS.shadowSm }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📅</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Điểm danh hàng ngày</h2>
          <p style={{ color: DS.textMuted, fontSize: 14, marginBottom: 24 }}>Nhận ngay 1.000 Xu mỗi ngày khi đăng nhập vào Hand-Me-On.</p>
          <Button 
            fullWidth 
            size="lg" 
            disabled={!canCheckIn}
            onClick={handleCheckIn}
          >
            {canCheckIn ? "Nhận 1.000 Xu" : "Đã điểm danh"}
          </Button>
        </div>

        {/* Lucky Spin */}
        <div style={{ background: "#fff", borderRadius: DS.radiusLg, padding: 32, border: `1px solid ${DS.border}`, textAlign: "center", boxShadow: DS.shadowSm }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: spinning ? "spin 0.5s linear infinite" : "none" }}>🎡</div>
          <style>{` @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `}</style>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Vòng quay may mắn</h2>
          <p style={{ color: DS.textMuted, fontSize: 14, marginBottom: 24 }}>Dùng 500 Xu để thử vận may. Cơ hội nhận tới 5.000 Xu!</p>
          <Button 
            fullWidth 
            size="lg" 
            variant="outline"
            disabled={spinning}
            onClick={handleSpin}
          >
            {spinning ? "Đang quay..." : "Quay ngay (500 Xu)"}
          </Button>
          {spinResult !== null && (
            <div style={{ marginTop: 16, fontWeight: 700, color: spinResult >= 500 ? DS.success : DS.error }}>
              Kết quả: {spinResult.toLocaleString()} Xu
            </div>
          )}
        </div>
      </div>

      {/* Mini Game Placeholder */}
      <div style={{ marginTop: 32, background: "#fff", borderRadius: DS.radiusLg, padding: 32, border: `1px solid ${DS.border}`, textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Nhiệm vụ khác</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { task: "Chia sẻ sản phẩm lên Facebook", reward: 200, icon: "📢" },
            { task: "Đánh giá sản phẩm đã mua", reward: 500, icon: "⭐" },
            { task: "Mời bạn bè tham gia", reward: 2000, icon: "👥" }
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: DS.bgHover, borderRadius: DS.radiusMd }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span>{t.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{t.task}</span>
              </div>
              <span style={{ fontWeight: 700, color: DS.primary }}>+{t.reward} Xu</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
