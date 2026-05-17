import { useState, useRef } from "react";
import { DS } from "../../design/tokens";
import { useApp } from "../../context/AppContext";
import confetti from "canvas-confetti";
import Button from "../common/Button";

const PRIZES = [
  { label: "500 HMO", val: 500, color: "#6C63FF" },
  { label: "1.000 HMO", val: 1000, color: "#8B5CF6" },
  { label: "5.000 HMO", val: 5000, color: "#EC4899" },
  { label: "Voucher 10%", val: "V10", color: "#F59E0B" },
  { label: "Chúc may mắn", val: 0, color: "#94A3B8" },
  { label: "2.000 HMO", val: 2000, color: "#10B981" },
  { label: "Voucher Ship", val: "VSHIP", color: "#3B82F6" },
  { label: "10.000 HMO", val: 10000, color: "#EF4444" },
];

export default function SpinTheWheel({ onClose }) {
  const { user, handleUpdateUser, showToast } = useApp();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const wheelRef = useRef(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    const extraDeg = Math.floor(Math.random() * 360) + 3600; // 10 rounds + random
    const newRotation = rotation + extraDeg;
    setRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const actualDeg = newRotation % 360;
      const prizeIndex = Math.floor((360 - actualDeg) / (360 / PRIZES.length)) % PRIZES.length;
      const prize = PRIZES[prizeIndex];
      setWinner(prize);

      if (prize.val > 0) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        if (typeof prize.val === 'number') {
           handleUpdateUser({ ...user, coins: (user.coins || 0) + prize.val });
           showToast(`Chúc mừng! Bạn nhận được ${prize.label}`, "success");
        } else {
           showToast(`Chúc mừng! Bạn nhận được ${prize.label}. Kiểm tra kho Voucher nhé!`, "success");
        }
      } else {
        showToast("Hic, chúc bạn may mắn lần sau nha!", "info");
      }
    }, 5000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.5s ease" }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 40, textAlign: "center", position: "relative", maxWidth: 500, width: "90%" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>✕</button>
        
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10, background: DS.gradientPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Vòng Quay May Mắn</h2>
        <p style={{ color: DS.textMuted, fontSize: 14, marginBottom: 30 }}>Quay ngay để nhận HMO Coins và Voucher miễn phí!</p>

        <div style={{ position: "relative", width: 300, height: 300, margin: "0 auto 40px" }}>
          {/* Pointer */}
          <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", zIndex: 10, width: 0, height: 0, borderLeft: "15px solid transparent", borderRight: "15px solid transparent", borderTop: "30px solid #FFD700", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))" }} />
          
          <div ref={wheelRef} style={{ width: "100%", height: "100%", borderRadius: "50%", border: "8px solid #333", position: "relative", overflow: "hidden", transition: "transform 5s cubic-bezier(0.15, 0, 0.15, 1)", transform: `rotate(${rotation}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.3)" }}>
            {PRIZES.map((p, i) => (
              <div key={i} style={{ position: "absolute", width: "50%", height: "50%", background: p.color, transformOrigin: "100% 100%", transform: `rotate(${i * (360 / PRIZES.length)}deg) skewY(${90 - (360 / PRIZES.length)}deg)`, border: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ position: "absolute", left: -40, bottom: 20, transform: `skewY(-${90 - (360 / PRIZES.length)}deg) rotate(${(360 / PRIZES.length) / 2}deg)`, display: "block", width: 120, textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 10 }}>
                  {p.label}
                </span>
              </div>
            ))}
            <div style={{ position: "absolute", inset: "45%", background: "#333", borderRadius: "50%", border: "4px solid #fff", zIndex: 5 }} />
          </div>
        </div>

        <Button fullWidth size="xl" onClick={spin} disabled={spinning}>
          {spinning ? "Đang quay..." : "QUAY NGAY (0đ)"}
        </Button>

        {winner && (
          <div style={{ marginTop: 20, animation: "bounce 1s ease" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: winner.val > 0 ? DS.success : DS.textMuted }}>
              {winner.val > 0 ? `🎉 Bạn trúng: ${winner.label}!` : "😢 Tiếc quá, thử lại mai nhé!"}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
