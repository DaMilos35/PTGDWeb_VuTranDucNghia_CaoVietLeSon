import { useState, useEffect, useRef } from "react";
import { DS } from "../../design/tokens";
import { useApp } from "../../context/AppContext";
import fakeApi from "../../database/fakeApi";
import Button from "../common/Button";
import Spinner from "../common/Spinner";

// Facebook-style SVG Icons
const FB_ICONS = {
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16.44 15.25l1.25 1.25c.41.41.41 1.08 0 1.5l-1.5 1.5c-.41.41-1.08.41-1.5 0-2.83-2.83-5.66-5.66-8.49-8.49-.41-.41-.41-1.08 0-1.5l1.5-1.5c.41-.41 1.08-.41 1.5 0l1.25 1.25c.41.41.41 1.08 0 1.5l-.75.75c1.41 1.41 2.83 2.83 4.24 4.24l.75-.75c.42-.41 1.09-.41 1.5 0z"/></svg>,
  video: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>,
  plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  emoji: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>,
  send: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  like: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>,
};

export default function MiniChat() {
  const { user, miniChatId, setMiniChatId, setMiniChatOpen, setView, setActiveChatId } = useApp();
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (miniChatId) {
      const parts = miniChatId.split('_');
      const otherId = parts.find(id => id !== 'c' && id !== user?.id && id.startsWith('u'));
      const prodId = parts.find(id => id.startsWith('p'));
      
      setLoading(true);
      Promise.all([
        fakeApi.getUserById(otherId).catch(() => null),
        prodId ? fakeApi.getProductById(prodId).catch(() => null) : Promise.resolve(null),
        fakeApi.getChatHistory(miniChatId).catch(() => [])
      ]).then(([u, p, history]) => {
        setOtherUser(u);
        setProduct(p);
        setMessages(history);
        setLoading(false);
      });
    }
  }, [miniChatId, user?.id]);

  useEffect(() => {
    if (miniChatId) {
      const interval = setInterval(() => {
        fakeApi.getChatHistory(miniChatId).then(data => {
          if (data.length !== messages.length) setMessages(data);
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [miniChatId, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!msgInput.trim() || !miniChatId) return;
    const newMsg = await fakeApi.sendMessage(miniChatId, user.id, msgInput, product?.id);
    setMessages(prev => [...prev, newMsg]);
    setMsgInput("");
  };

  if (!miniChatId) return null;

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 90, width: 340, height: 480,
      background: "#fff", borderRadius: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
      display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 9998,
      border: `1px solid ${DS.border}`, animation: "popIn 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)"
    }}>
      {/* Messenger-like Header */}
      <div style={{ 
        padding: "10px 16px", background: "#fff", borderBottom: `1px solid ${DS.border}`, 
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <img src={otherUser?.avatar || "https://i.pravatar.cc/150?u=anon"} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: DS.success, border: "2px solid #fff" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, lineHeight: 1.2 }}>{otherUser?.name || "..."}</p>
            <p style={{ fontSize: 11, color: DS.textMuted }}>Đang hoạt động</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, color: DS.primary, alignItems: "center" }}>
          <span style={{ cursor: "pointer", display: "flex" }}>{FB_ICONS.phone}</span>
          <span style={{ cursor: "pointer", display: "flex" }} onClick={() => {
            setActiveChatId(miniChatId);
            setView("messaging");
            setMiniChatOpen(false);
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
          </span>
          <button onClick={() => setMiniChatOpen(false)} style={{ background: "none", border: "none", color: DS.primary, cursor: "pointer", fontSize: 18, fontWeight: 800, padding: 0, marginLeft: 4 }}>✕</button>
        </div>
      </div>

      {/* Mini Product Context */}
      {product && (
        <div style={{ padding: "6px 12px", background: DS.bgHover, borderBottom: `1px solid ${DS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <img src={product.images[0]} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: DS.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.title}</p>
            <p style={{ fontSize: 11, fontWeight: 800, color: DS.primary }}>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2, background: "#fff" }}>
        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size="sm" /></div>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
              <img src={otherUser?.avatar} alt="" style={{ width: 50, height: 50, borderRadius: "50%", margin: "0 auto 8px" }} />
              <p style={{ fontSize: 12, fontWeight: 700 }}>{otherUser?.name}</p>
              <p style={{ fontSize: 10, color: DS.textMuted }}>Hand-Me-On ID: {otherUser?.id}</p>
            </div>
            
            {messages.map((m, idx) => {
              const isMe = m.senderId === user?.id;
              const prevMsg = messages[idx - 1];
              const nextMsg = messages[idx + 1];
              const isFirst = !prevMsg || prevMsg.senderId !== m.senderId;
              const isLast = !nextMsg || nextMsg.senderId !== m.senderId;

              return (
                <div key={m.id} style={{ 
                  alignSelf: isMe ? "flex-end" : "flex-start", 
                  maxWidth: "80%",
                  marginTop: isFirst ? 8 : 0,
                  marginBottom: isLast ? 4 : 0,
                  display: "flex",
                  flexDirection: isMe ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: 6
                }}>
                  {!isMe && (
                    <div style={{ width: 24, height: 24, flexShrink: 0 }}>
                      {isLast && <img src={otherUser?.avatar} alt="" style={{ width: 24, height: 24, borderRadius: "50%" }} />}
                    </div>
                  )}
                  <div style={{
                    background: isMe ? "linear-gradient(135deg, #0084FF 0%, #0078FF 100%)" : "#F0F2F5",
                    color: isMe ? "#fff" : "#050505",
                    padding: m.isOffer ? "12px 14px" : "8px 12px", 
                    borderRadius: 16, 
                    fontSize: 14,
                    lineHeight: 1.4,
                    borderTopRightRadius: isMe && !isFirst ? 4 : 16,
                    borderBottomRightRadius: isMe && !isLast ? 4 : 16,
                    borderTopLeftRadius: !isMe && !isFirst ? 4 : 16,
                    borderBottomLeftRadius: !isMe && !isLast ? 4 : 16,
                    boxShadow: isMe ? "0 1px 2px rgba(0, 132, 255, 0.15)" : "none",
                    border: m.isOffer && !isMe ? `1px solid ${DS.border}` : "none",
                  }}>
                    {m.isOffer ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 16 }}>🤝</span>
                          <span style={{ fontWeight: 800, fontSize: 13 }}>Đề nghị giá: {new Intl.NumberFormat('vi-VN').format(m.offerPrice)}đ</span>
                        </div>
                        <div style={{ fontSize: 13, opacity: 0.9 }}>{m.text}</div>
                      </div>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: "12px 12px 16px", background: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: DS.primary, cursor: "pointer" }}>{FB_ICONS.plus}</span>
        <div style={{ flex: 1, background: "#F0F2F5", borderRadius: 18, padding: "6px 12px", display: "flex", alignItems: "center" }}>
          <input
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Aa"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 14, fontFamily: "inherit" }}
          />
          <span style={{ color: DS.primary, cursor: "pointer" }}>{FB_ICONS.emoji}</span>
        </div>
        <div onClick={handleSend} style={{ cursor: "pointer", color: DS.primary, display: "flex", alignItems: "center" }}>
          {msgInput.trim() ? FB_ICONS.send : FB_ICONS.like}
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
