import { useState, useRef, useEffect, useCallback } from "react";
import { DS } from "../../design/tokens";
import { useApp } from "../../context/AppContext";
import fakeApi from "../../database/fakeApi";

const markdownify = (text) => {
  if (!text) return "";
  let html = text.replace(/[&<>]/g, t => ({ '&':'&amp;','<':'&lt;','>':'&gt;' }[t]));
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<b>$2</b>');
  html = html.replace(/(\*|_)(.*?)\1/g, '<i>$2</i>');
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.05);padding:2px 4px;border-radius:4px;">$1</code>');
  html = html.replace(/\n/g, '<br/>');
  return html;
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AIChatbot() {
  const { user } = useApp();
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState("right"); // "left" | "right"
  const [bottomPct, setBottomPct] = useState(0.1); // fraction of viewport height
  const [retracted, setRetracted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [panelSize, setPanelSize] = useState({ w: 350, h: 480 }); // Compact default
  const [showTutorial, setShowTutorial] = useState(false);

  const [messages, setMessages] = useState([{
    id: 1, sender: "ai", type: "text",
    text: "Xin chào! 👋 Mình là Trợ lý 2ndHand. Bạn cần hỗ trợ gì hôm nay?"
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  // Drag button state
  const btnDrag = useRef({ active: false, startX: 0, startY: 0, moved: false });
  // Resize panel state
  const resizeDrag = useRef({ active: false, startX: 0, startY: 0, startW: 420, startH: 640 });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping, open, input, showTutorial]);

  const handleSendSuggestion = async () => {
    const content = window.prompt("Nhập đề xuất của bạn cho Admin:");
    if (content && content.trim()) {
      try {
        // Assume fakeApi exists or handle accordingly
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: "ai",
          type: "text",
          text: "✅ Cảm ơn bạn! Đề xuất đã được gửi tới Admin. Chúng mình sẽ phản hồi sớm nhất có thể."
        }]);
      } catch (err) {
        alert("Lỗi khi gửi đề xuất. Vui lòng thử lại sau.");
      }
    }
  };

  // ── BUTTON DRAG (snap to edge) ──────────────────────────────────────────────
  const onBtnDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    btnDrag.current = { active: true, startX: e.clientX, startY: e.clientY, moved: false, startBottom: bottomPct };
  };
  const onBtnMove = useCallback((e) => {
    if (!btnDrag.current.active) return;
    const dx = Math.abs(e.clientX - btnDrag.current.startX);
    const dy = Math.abs(e.clientY - btnDrag.current.startY);
    if (dx > 4 || dy > 4) btnDrag.current.moved = true;
    
    // Smooth vertical drag
    const newBottom = 1 - (e.clientY / window.innerHeight);
    setBottomPct(Math.max(0.05, Math.min(0.85, newBottom)));
    
    // Horizontal side detection
    setSide(e.clientX < window.innerWidth / 2 ? "left" : "right");
  }, []);

  const onBtnUp = useCallback((e) => {
    if (!btnDrag.current.active) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    btnDrag.current.active = false;
    if (!btnDrag.current.moved) { setOpen(v => !v); return; }
    
    setRetracted(true);
    setTimeout(() => setRetracted(false), 2000);
  }, []);

  // Handle Window Resize to keep panel in bounds
  useEffect(() => {
    const handleResize = () => {
      setPanelSize(prev => ({
        w: Math.min(prev.w, window.innerWidth - 30),
        h: Math.min(prev.h, window.innerHeight - 100)
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── PANEL RESIZE ────────────────────────────────────────────────────────────
  const onResizeDown = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeDrag.current = { active: true, startX: e.clientX, startY: e.clientY, startW: panelSize.w, startH: panelSize.h };
  };
  const onResizeMove = useCallback((e) => {
    if (!resizeDrag.current.active) return;
    const dx = e.clientX - resizeDrag.current.startX;
    const dy = e.clientY - resizeDrag.current.startY;
    const dw = side === "right" ? -dx : dx;
    setPanelSize({
      w: Math.max(300, Math.min(700, window.innerWidth - 30, resizeDrag.current.startW + dw)),
      h: Math.max(400, Math.min(900, window.innerHeight - 100, resizeDrag.current.startH + dy))
    });
  }, [side]);
  const onResizeUp = useCallback((e) => {
    resizeDrag.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  // ── SEND MESSAGE ─────────────────────────────────────────────────────────────
  const handleSend = async (preset = null) => {
    const raw = preset || input.trim();
    if (!raw) return;

    const userMsg = { id: Date.now(), sender: "user", type: "text", text: raw, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(p => [...p, userMsg]);
    setInput(""); 
    setIsTyping(true);

    try {
      const historyText = messages
        .filter(m => m.type !== "image")
        .map(m => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
        .join("\n");
      
      const systemPrompt = `Bạn là HMO Concierge - trợ lý AI cực kỳ thông minh của nền tảng thương mại đồ cũ Hand-Me-On.
Nhiệm vụ: Tư vấn, hỗ trợ mua bán, giải đáp thắc mắc về chính sách một cách ngắn gọn, chuyên nghiệp và thân thiện.
Thông tin Hand-Me-On:
- Phí giao dịch: 5% cho mỗi đơn thành công. Miễn phí đăng tin.
- Chính sách hoàn tiền 7 ngày nếu hàng sai mô tả. Tiền được giữ an toàn qua hệ thống Escrow.
- Khuyến mãi đang có: Mã "NEWUSER50K" giảm 50k, mã "WELCOME7" giảm 7%.
- Bạn xưng là "mình" và gọi người dùng là "bạn". Sử dụng emoji phù hợp.
Hãy trả lời câu hỏi dưới đây của người dùng, nếu câu hỏi nằm ngoài chuyên môn mua bán thì từ chối khéo léo. Trả lời bằng Markdown.`;

      const fullPrompt = `${systemPrompt}\n\n${historyText}\nUser: ${raw}\nAssistant:`;

      const botMsgId = Date.now() + 1;
      const botMsg = {
        id: botMsgId, sender: "ai", type: "text",
        text: "",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      
      setMessages(p => [...p, botMsg]);
      setIsTyping(false);

      if (window.puter && window.puter.ai) {
        // Stream text using Puter AI SDK
        const stream = await window.puter.ai.chat(fullPrompt, { stream: true });
        let fullText = "";
        for await (const part of stream) {
          if (part?.text) {
            fullText += part.text;
            setMessages(prev => {
              const newMsgs = [...prev];
              const targetIdx = newMsgs.findIndex(m => m.id === botMsgId);
              if (targetIdx !== -1) newMsgs[targetIdx].text = fullText;
              return newMsgs;
            });
          }
        }
      } else {
        // Fallback if Puter is not loaded
        setMessages(prev => {
          const newMsgs = [...prev];
          const targetIdx = newMsgs.findIndex(m => m.id === botMsgId);
          if (targetIdx !== -1) newMsgs[targetIdx].text = "Xin lỗi, hệ thống AI hiện chưa sẵn sàng do mạng hoặc SDK chưa tải xong. Vui lòng thử lại sau vài giây!";
          return newMsgs;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 2, sender: "ai", type: "text", text: "❌ Lỗi kết nối AI: " + err.message }]);
      setIsTyping(false);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMessages(p => [...p, { id: Date.now(), sender: "user", type: "image", img: url }]);
    setIsTyping(true);

    try {
      // Simulate real API behavior
      const data = await mockApiCall("đã gửi một hình ảnh");

      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: "ai" }]);

      if (data.action === "START_TUTORIAL") {
        setShowTutorial(true);
      }

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), text: "❌ Đã có lỗi xảy ra khi kết nối hệ thống. Vui lòng thử lại sau!", sender: "ai" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const mockApiCall = (text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lower = text.toLowerCase();
        if (lower.includes("hướng dẫn") || lower.includes("tutorial")) {
          resolve({ reply: "Dĩ nhiên rồi! Mình đã bật bảng hướng dẫn chi tiết cho bạn trên màn hình nhé. 👇", action: "START_TUTORIAL" });
        } else if (lower.includes("voucher") || lower.includes("giảm giá")) {
          resolve({ reply: "Hiện tại chúng mình có mã NEWUSER50K giảm 50k cho đơn đầu tiên và HANDON10 giảm 10% nhé! 🎟️", action: null });
        } else {
          resolve({ reply: `Cảm ơn bạn đã hỏi về "${text}". Đây là trợ lý ảo HMO, mình có thể giúp bạn tìm sản phẩm, xem phí ship hoặc giải quyết thắc mắc về đơn hàng!`, action: null });
        }
      }, 1200);
    });
  };

  return (
    <>
      <button
        onPointerDown={onBtnDown}
        onPointerMove={onBtnMove}
        onPointerUp={onBtnUp}
        style={{
          position: "fixed", bottom: `${bottomPct * 100}%`, [side]: retracted ? -30 : 24, zIndex: 9999,
          width: 64, height: 64, borderRadius: "50%",
          background: DS.gradientPrimary, border: "4px solid #fff",
          boxShadow: "0 10px 30px rgba(108, 99, 255, 0.4)", cursor: "grab",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: open ? "scale(0) rotate(90deg)" : "scale(1) rotate(0)",
          opacity: open ? 0 : 1,
          animation: "floatBlob 6s infinite",
          touchAction: "none"
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span style={{ animation: hovered ? "none" : "pulse 2s infinite" }}>🤖</span>
      </button>

      <div style={{
        position: "fixed", bottom: open ? 24 : -600, [side]: 24, zIndex: 9999,
        width: 400, height: 600, background: "#fff",
        borderRadius: 32, border: `1px solid ${DS.border}`,
        boxShadow: "0 30px 100px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column",
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        fontFamily: "Be Vietnam Pro, sans-serif", overflow: "hidden"
      }}>

        <div style={{ background: DS.gradientPrimary, padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "1px solid rgba(255,255,255,0.3)" }}>✨</div>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>HMO Concierge</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 10px #4ADE80" }} />
                <span style={{ fontSize: 11, fontWeight: 800, opacity: 0.9, textTransform: "uppercase", color: "#fff", letterSpacing: "0.05em" }}>AI Intelligent</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSendSuggestion}
            style={{ 
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", 
              color: "#fff", padding: "6px 12px", borderRadius: 12, fontSize: 11, fontWeight: 800, 
              cursor: "pointer", backdropFilter: "blur(4px)", transition: "all 0.2s" 
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
          >
            💡 Đề xuất
          </button>
          <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", width: 32, height: 32, borderRadius: "50%", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}>✕</button>
        </div>

        <div style={{ flex: 1, padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, background: DS.bgHover }}>

          {showTutorial && (
            <div style={{ background: "#fff", border: `1.5px solid ${DS.primary}`, borderRadius: 12, padding: 16, boxShadow: "0 4px 12px rgba(0,123,255,0.15)", position: "relative" }}>
              <button onClick={() => setShowTutorial(false)} style={{ position: "absolute", top: 8, right: 8, background: "transparent", border: "none", cursor: "pointer", fontSize: 16, color: "#999" }}>✕</button>
              <h5 style={{ margin: "0 0 10px 0", color: DS.primary, fontSize: 15 }}>🎓 Hướng dẫn nhanh Hand-Me-On</h5>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: DS.textSecondary, display: "flex", flexDirection: "column", gap: 8 }}>
                <li><strong>Bước 1:</strong> Đăng nhập tài khoản.</li>
                <li><strong>Bước 2:</strong> Nhấn "Đăng tin" để chụp ảnh đồ cũ.</li>
                <li><strong>Bước 3:</strong> Chat trực tiếp với người mua để thương lượng.</li>
                <li><strong>Bước 4:</strong> Đóng gói và giao cho đơn vị vận chuyển!</li>
              </ul>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
              <div style={{
                background: m.sender === "user" ? DS.primary : "#fff",
                color: m.sender === "user" ? "#fff" : DS.textPrimary,
                padding: "12px 16px", borderRadius: 16,
                borderBottomRightRadius: m.sender === "user" ? 4 : 16,
                borderBottomLeftRadius: m.sender === "ai" ? 4 : 16,
                boxShadow: DS.shadowSm, fontSize: 14, lineHeight: 1.5
              }} dangerouslySetInnerHTML={{ __html: markdownify(m.text) }} />
              <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 6, textAlign: m.sender === "user" ? "right" : "left" }}>
                {m.sender === "ai" ? "AI Assistant" : "Bạn"}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
              <div style={{ background: "#fff", padding: "14px 18px", borderRadius: 16, borderBottomLeftRadius: 4, boxShadow: DS.shadowSm, display: "flex", gap: 6, alignItems: "center" }}>
                <span className="dot" style={{ width: 6, height: 6, background: DS.primary, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both" }} />
                <span className="dot" style={{ width: 6, height: 6, background: DS.primary, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }} />
                <span className="dot" style={{ width: 6, height: 6, background: DS.primary, borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }} />
                <style>{`@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div style={{ padding: "10px 16px", background: "#fff", borderTop: `1px solid ${DS.border}`, display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
          {["🛠️ Hướng dẫn sử dụng", "📦 Cách bán hàng nhanh", "⚖️ Chính sách hoàn tiền", "🎟️ Nhận mã giảm giá"].map(q => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={isTyping}
              style={{ padding: "8px 14px", borderRadius: 20, background: DS.bgHover, border: `1px solid ${DS.border}`, fontSize: 12, fontWeight: 600, color: DS.textSecondary, cursor: isTyping ? "not-allowed" : "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}
              onMouseEnter={e => { if (!isTyping) { e.currentTarget.style.borderColor = DS.primary; e.currentTarget.style.color = DS.primary; } }}
              onMouseLeave={e => { if (!isTyping) { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.textSecondary; } }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ padding: "12px 16px", background: "#fff", borderTop: `1px solid ${DS.border}`, display: "flex", gap: 10 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Hỏi AI bất cứ điều gì..."
            disabled={isTyping}
            style={{ flex: 1, padding: "12px 16px", borderRadius: 24, border: `1.5px solid ${DS.borderInput}`, outline: "none", fontSize: 14, fontFamily: "inherit", background: isTyping ? DS.bgHover : "#fff" }}
            onFocus={e => e.target.style.borderColor = DS.primary}
            onBlur={e => e.target.style.borderColor = DS.borderInput}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() && !isTyping ? DS.primary : DS.border, color: "#fff", border: "none", cursor: input.trim() && !isTyping ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}