import { useState, useEffect, useRef } from "react";
import { DS } from "../design/tokens";
import { useApp } from "../context/AppContext";
import fakeApi from "../database/fakeApi";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

const formatPrice = (p) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

const FB_ICONS = {
  phone: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.44 15.25l1.25 1.25c.41.41.41 1.08 0 1.5l-1.5 1.5c-.41.41-1.08.41-1.5 0-2.83-2.83-5.66-5.66-8.49-8.49-.41-.41-.41-1.08 0-1.5l1.5-1.5c.41-.41 1.08-.41 1.5 0l1.25 1.25c.41.41.41 1.08 0 1.5l-.75.75c1.41 1.41 2.83 2.83 4.24 4.24l.75-.75c.42-.41 1.09-.41 1.5 0z" /></svg>,
  video: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" /></svg>,
  info: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>,
  plus: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>,
  gallery: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>,
  mic: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>,
  emoji: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" /></svg>,
  send: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>,
  like: <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  settings: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>,
  compose: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>,
  close: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>,
  gif: <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 9H13v6h-1.5zM9 9H6c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-2H8.5v1.5h-2v-3H10V10c0-.6-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z" /></svg>
};

export default function MessagingPage() {
  const { user, setView, activeChatId, setActiveChatId, showToast } = useApp();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [callState, setCallState] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (user) {
      fakeApi.getChatsForUser(user.id).then(data => {
        setChats(data);
        if (data.length > 0 && !activeChatId) setActiveChatId(data[0].id);
        setLoading(false);
      });
    }
  }, [user, activeChatId, setActiveChatId]);

  useEffect(() => {
    if (activeChatId) {
      const fetchHistory = async () => {
        try {
          const data = await fakeApi.getChatHistory(activeChatId);

          // Fix 1: Update state without side-effects inside
          setMessages(prev => {
            if (prev.length !== data.length || JSON.stringify(prev) !== JSON.stringify(data)) {
              return data;
            }
            return prev;
          });

          // Fix 1: Handle side-effects (read marks) AFTER and OUTSIDE the state update
          if (Array.isArray(data)) {
            const hasUnread = data.some(m => m.senderId !== user?.id && !m.read);
            if (hasUnread) {
              await fakeApi.markAsRead(activeChatId, user?.id);
              const newData = await fakeApi.getChatHistory(activeChatId);
              setMessages(newData);
            }
          }
        } catch (err) {
          console.error("Failed to fetch chat history:", err);
        }
      };

      fetchHistory();
      const interval = setInterval(fetchHistory, 3000);

      const handleStorageChange = (e) => {
        if (e.key === `sync_chat_${activeChatId}`) {
          fetchHistory();
        }
      };
      window.addEventListener("storage", handleStorageChange);

      return () => {
        clearInterval(interval);
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [activeChatId, user]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  if (!user) return (
    <div style={{ padding: 100, textAlign: "center", fontFamily: "Be Vietnam Pro, sans-serif" }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>💬</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Tham gia cộng đồng!</h2>
      <p style={{ color: DS.textMuted, marginBottom: 32 }}>Đăng nhập để bắt đầu trò chuyện với người bán và người mua.</p>
      <Button onClick={() => setView("auth")} size="xl">Đăng nhập ngay</Button>
    </div>
  );

  const handleSend = async (customPayload = null) => {
    const textToSend = msgInput.trim();
    if (!textToSend && !customPayload) return;
    const activeChat = chats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    const optimisticMsg = {
      id: `opt_${Date.now()}`,
      chatId: activeChatId,
      senderId: user.id,
      text: customPayload?.text !== undefined ? customPayload.text : textToSend,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      reactions: {}, read: false,
      ...customPayload
    };
    setMessages(prev => [...prev, optimisticMsg]);
    if (!customPayload) setMsgInput("");

    try {
      const saved = customPayload
        ? await fakeApi.sendMessage(activeChatId, user.id, "", activeChat.product?.id, customPayload)
        : await fakeApi.sendMessage(activeChatId, user.id, textToSend, activeChat.product?.id);

      if (replyingTo) {
        saved.replyTo = replyingTo;
      }

      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...saved, id: saved.id } : m));

      const displayLastMsg =
        customPayload?.type === 'image' ? "[Hình ảnh]" :
          customPayload?.type === 'audio' ? "[Ghi âm]" :
            customPayload?.type === 'gif' ? "[GIF]" :
              saved.text;
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, lastMessage: displayLastMsg, time: "Vừa xong" } : c));

      localStorage.setItem(`sync_chat_${activeChatId}`, Date.now().toString());
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      if (!customPayload) setMsgInput(textToSend);
      if (showToast) showToast("Gửi tin nhắn thất bại", "error");
    }

    setReplyingTo(null);
  };

  const handleUnsend = (msgId) => {
    if (confirm("Bạn có chắc chắn muốn thu hồi tin nhắn này?")) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (showToast) showToast("Đã thu hồi tin nhắn", "info");
      localStorage.setItem(`sync_chat_${activeChatId}`, Date.now().toString());
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        showToast("Đang gửi ảnh...", "info");
        const { url } = await fakeApi.uploadFile(file);
        handleSend({ type: 'image', url, text: "" });
        e.target.value = null;
      } catch (err) {
        showToast("Không thể gửi ảnh", "error");
      }
    }
  };

  const handleRecordAudio = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      handleSend({ type: 'audio', duration: "0:05", text: "" });
    }, 2000);
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  const filteredChats = chats.filter(c =>
    c.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ margin: "0 auto", height: "calc(100vh - 66px)", padding: 0, fontFamily: "Be Vietnam Pro, sans-serif", display: "flex", width: "100%", position: "relative", background: "#fff" }}>

      {callState && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, borderRadius: DS.radiusXl, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", backdropFilter: "blur(10px)" }}>
          <div style={{ position: "relative", marginBottom: 30 }}>
            <div style={{ position: "absolute", inset: -20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", animation: "pulse 2s infinite" }} />
            <div style={{ position: "absolute", inset: -40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", animation: "pulse 2s infinite", animationDelay: "0.5s" }} />
            <img src={activeChat.user?.avatar} style={{ width: 140, height: 140, borderRadius: "50%", border: "4px solid #fff", objectFit: "cover", position: "relative" }} />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12, letterSpacing: "-0.02em" }}>{activeChat.user?.name}</h2>
          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", marginBottom: 60, fontWeight: 500 }}>
            {callState === 'calling' ? 'Đang đổ chuông...' : 'Đang kết nối video...'}
          </p>
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🎤</div>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>Tắt mic</span>
            </div>
            <div
              onClick={() => {
                setCallState(null);
                if (showToast) showToast("Cuộc gọi đã kết thúc", "info");
              }}
              style={{ width: 72, height: 72, borderRadius: "50%", background: DS.error, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 15px 35px rgba(239, 68, 68, 0.4)", transition: "transform 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#fff"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" /></svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>🔊</div>
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>Loa ngoài</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ width: 360, background: "linear-gradient(180deg, #0F0C29 0%, #1a1740 100%)", borderRadius: DS.radiusXl, display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden", border: "1px solid rgba(108,99,255,0.2)" }}>
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: "-0.03em" }}>💬 Chat</h1>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>{FB_ICONS.settings}</div>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>{FB_ICONS.compose}</div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 10, color: "rgba(255,255,255,0.4)" }}>{FB_ICONS.search}</span>
            <input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", fontSize: 14, outline: "none", fontFamily: "inherit", color: "#fff", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 0" }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "12px", borderRadius: 16, background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.1)", animation: "pulse 1.5s infinite ease-in-out" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                    <div style={{ width: "60%", height: 14, background: "rgba(255,255,255,0.1)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
                    <div style={{ width: "80%", height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 4, animation: "pulse 1.5s infinite ease-in-out" }} />
                  </div>
                </div>
              ))}
              <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
            </div>
          ) : filteredChats.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: DS.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>💬</div>
              <p style={{ fontSize: 15, fontWeight: 600 }}>Không tìm thấy cuộc hội thoại nào.</p>
              <p style={{ fontSize: 13, marginTop: 6, opacity: 0.7 }}>Hãy bắt đầu nhắn tin từ trang chi tiết sản phẩm.</p>
            </div>
          ) : filteredChats.map(c => {
            const isActive = activeChatId === c.id;
            const hasUnread = c.unreadCount > 0;
            return (
              <div
                key={c.id}
                onClick={() => setActiveChatId(c.id)}
                style={{
                  padding: "12px", borderRadius: 16, display: "flex", gap: 12, cursor: "pointer",
                  background: isActive ? "rgba(108,99,255,0.25)" : "transparent",
                  transition: "all 0.2s", marginBottom: 2,
                  border: isActive ? "1px solid rgba(108,99,255,0.4)" : "1px solid transparent"
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={c.user?.avatar} alt="" style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: isActive ? "2px solid #6C63FF" : "2px solid rgba(255,255,255,0.1)" }} />
                  <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: "#22C55E", border: "2px solid #1a1740" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontWeight: hasUnread ? 800 : 600, color: "#fff", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.user?.name}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>{c.time || "Vừa xong"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 12, color: hasUnread ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: hasUnread ? 600 : 400 }}>
                      {c.product && <span style={{ color: "#A78BFA", fontWeight: 700 }}>[SP] </span>}
                      {c.lastMessage}
                    </p>
                    {hasUnread && (
                      <span style={{ background: "#6C63FF", color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 }}>{c.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, background: "#fff", borderRadius: DS.radiusXl, border: `1px solid ${DS.border}`, display: "flex", flexDirection: "column", boxShadow: DS.shadowLg, overflow: "hidden" }}>
        {activeChatId && activeChat ? (
          <>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #0F0C29 0%, #1a1740 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => setShowProfile(!showProfile)}>
                <div style={{ position: "relative" }}>
                  <img src={activeChat?.user?.avatar || `https://i.pravatar.cc/42`} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(108,99,255,0.5)" }} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: DS.success, border: "2px solid #1a1740" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{activeChat?.user?.name || "..."}</h3>
                  <p style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>● Đang hoạt động</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 18, alignItems: "center", color: "rgba(255,255,255,0.7)" }}>
                <span style={{ cursor: "pointer", transition: "0.2s" }} onClick={() => setShowProfile(!showProfile)} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>{FB_ICONS.info}</span>
              </div>
            </div>

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0 20px", textAlign: "center" }}>
                    <img src={activeChat.user?.avatar} alt="" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 12, objectFit: "cover", boxShadow: DS.shadowMd }} />
                    <h2 style={{ fontSize: 20, fontWeight: 900 }}>{activeChat.user?.name}</h2>
                    <p style={{ fontSize: 13, color: DS.textMuted, maxWidth: 280, margin: "8px auto 20px" }}>Bạn bè trên hệ thống · Kết nối từ tháng 10, 2023</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Button size="sm" variant="outline" onClick={() => setView("store", activeChat.user)}>Xem trang cá nhân</Button>
                    </div>
                  </div>

                  {messages.map((m, idx) => {
                    const isMe = m.senderId === user.id;
                    const prevMsg = messages[idx - 1];
                    const nextMsg = messages[idx + 1];
                    const isFirstInGroup = !prevMsg || prevMsg.senderId !== m.senderId;
                    const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;

                    const handleReact = async (emoji) => {
                      const updated = await fakeApi.addReaction(m.id, emoji);
                      if (updated) {
                        setMessages(prev => prev.map(msg => msg.id === m.id ? { ...msg, reactions: updated.reactions } : msg));
                      }
                      setHoveredMsgId(null);
                    };

                    return (
                      <div
                        key={m.id}
                        onMouseEnter={() => setHoveredMsgId(m.id)}
                        onMouseLeave={() => setHoveredMsgId(null)}
                        style={{
                          display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 12,
                          marginBottom: isLastInGroup ? 16 : 4, marginTop: isFirstInGroup ? 14 : 0,
                          animation: "msgPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards", position: "relative"
                        }}
                      >
                        {!isMe && (
                          <div style={{ width: 32, height: 32, flexShrink: 0 }}>
                            {isLastInGroup && (
                              <img src={activeChat.user?.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                            )}
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "70%", position: "relative" }}>
                          {hoveredMsgId === m.id && (
                            <div style={{
                              position: "absolute", bottom: "100%", [isMe ? 'right' : 'left']: 0, background: "#fff", borderRadius: 24, padding: "4px 8px",
                              display: "flex", gap: 6, boxShadow: DS.shadowLg, border: `1px solid ${DS.border}`, zIndex: 100, animation: "msgPop 0.2s ease"
                            }}>
                              <span onClick={() => setReplyingTo(m)} style={{ cursor: "pointer", fontSize: 18, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} title="Trả lời">↩️</span>
                              {isMe && <span onClick={() => handleUnsend(m.id)} style={{ cursor: "pointer", fontSize: 18, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} title="Thu hồi">🗑️</span>}
                              <div style={{ width: 1, background: DS.border, margin: "0 4px" }} />
                              {["❤️", "😆", "😮", "😢", "😠", "👍"].map(emoji => (
                                <span
                                  key={emoji} onClick={() => handleReact(emoji)}
                                  style={{ cursor: "pointer", fontSize: 18, transition: "transform 0.2s" }}
                                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                >{emoji}</span>
                              ))}
                            </div>
                          )}

                          <div style={{
                            background: m.type === 'image' ? 'transparent' : (isMe ? DS.primary : "#F0F2F5"),
                            color: isMe ? "#fff" : "#1e293b",
                            padding: m.type === 'image' ? 0 : "10px 16px",
                            borderRadius: 20,
                            borderTopRightRadius: isMe && !isFirstInGroup ? 4 : 20,
                            borderBottomRightRadius: isMe && !isLastInGroup ? 4 : 20,
                            borderTopLeftRadius: !isMe && !isFirstInGroup ? 4 : 20,
                            borderBottomLeftRadius: !isMe && !isLastInGroup ? 4 : 20,
                            fontSize: 15, lineHeight: 1.5, wordBreak: "break-word",
                            position: "relative"
                          }}>
                            {m.replyTo && (
                              <div style={{ fontSize: 12, color: isMe ? "rgba(255,255,255,0.8)" : DS.textMuted, marginBottom: 6, background: isMe ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)", padding: "6px 10px", borderRadius: 12, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", borderLeft: `3px solid ${isMe ? "#fff" : DS.primary}` }}>
                                ↪ {m.replyTo.text || "[Tệp đính kèm]"}
                              </div>
                            )}

                            {m.type === 'image' || m.type === 'gif' ? (
                              <img src={m.url} style={{ maxWidth: 250, borderRadius: 16, border: `1px solid ${DS.border}` }} alt="attachment" />
                            ) : m.type === 'audio' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 150 }}>
                                <span style={{ cursor: 'pointer' }}>▶️</span>
                                <div style={{ flex: 1, height: 4, background: isMe ? 'rgba(255,255,255,0.4)' : '#ccc', borderRadius: 2 }}></div>
                                <span style={{ fontSize: 12 }}>{m.duration}</span>
                              </div>
                            ) : (
                              m.text === "👍" ? <span style={{ fontSize: 40, background: 'none' }}>👍</span> : m.text
                            )}

                            {m.reactions && Object.keys(m.reactions).length > 0 && (
                              <div style={{
                                position: "absolute", bottom: -12, [isMe ? 'left' : 'right']: -4, background: "#fff", borderRadius: 12, padding: "2px 6px",
                                display: "flex", gap: 2, boxShadow: DS.shadowSm, border: `1px solid ${DS.border}`, fontSize: 10, alignItems: "center"
                              }}>
                                {Object.entries(m.reactions).map(([emoji, count]) => (
                                  <span key={emoji}>{emoji} {count > 1 ? count : ""}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {isLastInGroup && (
                            <div style={{ fontSize: 11, color: DS.textMuted, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {m.time || "10:30"} {isMe && m.read && <span style={{ color: DS.textMuted }}>• Đã xem</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {messages.length > 0 && /(chốt|chuyển khoản|thanh toán|stk)/i.test(messages[messages.length - 1].text) && activeChat?.product && (
                    <div style={{ margin: "16px 20px", padding: "16px", background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: 16, border: "1px solid #86efac", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "msgPop 0.4s ease" }}>
                      <div>
                        <p style={{ fontWeight: 800, color: "#166534", margin: 0, fontSize: 15 }}>Chốt đơn thành công! 🎉</p>
                        <p style={{ color: "#15803d", fontSize: 13, marginTop: 4 }}>Thanh toán qua hệ thống Escrow để được bảo vệ 100%.</p>
                      </div>
                      <Button onClick={() => setView("checkout", activeChat.product)} size="sm" style={{ background: "#16a34a", color: "#fff", border: "none" }}>Chuyển khoản ngay</Button>
                    </div>
                  )}

                  {isTyping && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
                      <img src={activeChat.user?.avatar} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                      <div style={{ background: "#F0F2F5", padding: "12px 16px", borderRadius: 20, display: "flex", gap: 4 }}>
                        <span className="typing-dot"></span>
                        <span className="typing-dot" style={{ animationDelay: "0.2s" }}></span>
                        <span className="typing-dot" style={{ animationDelay: "0.4s" }}></span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div style={{ background: "#fff", borderTop: `1px solid ${DS.border}` }}>
                  {replyingTo && (
                    <div style={{ padding: "10px 20px", background: "#F8FAFC", borderBottom: `1px solid ${DS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, color: DS.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", borderLeft: `3px solid ${DS.primary}`, paddingLeft: 10 }}>
                        <strong style={{ color: DS.textPrimary }}>Đang trả lời: </strong> {replyingTo.text || "[Tệp đính kèm]"}
                      </div>
                      <span onClick={() => setReplyingTo(null)} style={{ cursor: "pointer", fontSize: 18, color: DS.textMuted }}>✕</span>
                    </div>
                  )}

                  <div style={{ padding: "12px 20px 24px", display: "flex", alignItems: "flex-end", gap: 12 }}>
                    <div style={{ display: "flex", gap: 14, paddingBottom: 10, color: DS.primary }}>
                      <span style={{ cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{FB_ICONS.plus}</span>

                      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
                      <span style={{ cursor: "pointer", transition: "0.2s" }} onClick={() => fileInputRef.current.click()} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{FB_ICONS.gallery}</span>

                      <div style={{ position: "relative" }}>
                        <span style={{ cursor: "pointer", transition: "0.2s" }} onClick={() => setShowGifPicker(!showGifPicker)} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{FB_ICONS.gif}</span>
                        {showGifPicker && (
                          <div style={{
                            position: "absolute", bottom: "calc(100% + 20px)", left: -40, background: "#fff",
                            borderRadius: 20, padding: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                            border: `1px solid ${DS.border}`, zIndex: 100, width: 300,
                            animation: "msgPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 800 }}>GIF phổ biến</h4>
                              <span onClick={() => setShowGifPicker(false)} style={{ cursor: "pointer", fontSize: 18 }}>×</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 300, overflowY: "auto", paddingRight: 4 }}>
                              {[
                                "https://media.giphy.com/media/3o7TKMGpxx136Y/giphy.gif",
                                "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
                                "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif",
                                "https://media.giphy.com/media/brHaCdJqCXijm/giphy.gif",
                                "https://media.giphy.com/media/3o6gDWzmAzrpi5DQU8/giphy.gif",
                                "https://media.giphy.com/media/l41lTfuxV3Vf5z7eE/giphy.gif"
                              ].map(url => (
                                <img
                                  key={url} src={url} alt="gif"
                                  onClick={() => { handleSend({ type: 'gif', url }); setShowGifPicker(false); }}
                                  style={{ width: "100%", borderRadius: 12, cursor: "pointer", transition: "transform 0.2s" }}
                                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ flex: 1, background: "#F0F2F5", borderRadius: 24, padding: "12px 18px", display: "flex", alignItems: "flex-end", border: "1.5px solid transparent", transition: "all 0.2s" }} onFocusCapture={e => e.currentTarget.style.borderColor = DS.primary} onBlurCapture={e => e.currentTarget.style.borderColor = "transparent"}>
                      <textarea
                        value={msgInput}
                        onChange={e => setMsgInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Nhắn tin..."
                        style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 16, fontFamily: "inherit", resize: "none", maxHeight: 150, padding: "4px 0", minHeight: 24 }}
                      />
                      <span style={{ marginLeft: 12, cursor: "pointer", color: DS.primary, paddingBottom: 2 }}>{FB_ICONS.emoji}</span>
                    </div>

                    {msgInput.trim() ? (
                      <span style={{ cursor: "pointer", color: DS.primary, paddingBottom: 10, transition: "transform 0.2s", display: "flex", alignItems: "center" }} onClick={() => handleSend()} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{FB_ICONS.send}</span>
                    ) : (
                      <span style={{ cursor: "pointer", color: DS.primary, paddingBottom: 10, transition: "transform 0.2s", display: "flex", alignItems: "center" }} onClick={() => handleSend({ type: 'text', text: "👍" })} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{FB_ICONS.like}</span>
                    )}
                  </div>
                </div>

                {showProfile && (
                  <div style={{ width: 340, borderLeft: `1px solid ${DS.border}`, display: "flex", flexDirection: "column", overflowY: "auto", animation: "slideInRight 0.3s ease" }}>
                    <div style={{ padding: 24, textAlign: "center", position: "relative" }}>
                      <span onClick={() => setShowProfile(false)} style={{ position: "absolute", right: 20, top: 20, cursor: "pointer", color: DS.textMuted }}>{FB_ICONS.close}</span>
                      <img src={activeChat.user?.avatar} alt="" style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 16, objectFit: "cover", margin: "0 auto" }} />
                      <h3 style={{ fontSize: 18, fontWeight: 800 }}>{activeChat.user?.name}</h3>
                      <p style={{ fontSize: 12, color: DS.success, fontWeight: 600 }}>Đang hoạt động</p>

                      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
                        <div style={{ textAlign: "center", cursor: "pointer" }} onClick={() => setView("store", activeChat.user)}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F0F2F5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, margin: "0 auto" }}>👤</div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Trang cá nhân</span>
                        </div>
                        <div style={{ textAlign: "center", cursor: "pointer" }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F0F2F5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, margin: "0 auto" }}>🔔</div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Tắt thông báo</span>
                        </div>
                        <div style={{ textAlign: "center", cursor: "pointer" }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F0F2F5", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, margin: "0 auto" }}>🔍</div>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>Tìm kiếm</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: "0 16px 24px" }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ padding: "12px 8px", fontWeight: 700, fontSize: 14, display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                          Thông tin về sản phẩm <span>⌄</span>
                        </div>
                        {activeChat.product && (
                          <div style={{ padding: 12, background: DS.bgHover, borderRadius: 16, border: `1px solid ${DS.border}` }}>
                            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                              <img src={activeChat.product.images[0]} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover" }} />
                              <div>
                                <p style={{ fontSize: 14, fontWeight: 700, color: DS.textPrimary, lineHeight: 1.3 }}>{activeChat.product.title}</p>
                                <p style={{ fontSize: 16, color: DS.primary, fontWeight: 900, marginTop: 4 }}>{formatPrice(activeChat.product.price)}</p>
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <Button fullWidth size="sm" onClick={() => { setView("product", activeChat.product); }}>🛒 Xem chi tiết</Button>
                              <Button fullWidth size="sm" variant="ghost" style={{ color: DS.error }}>⚠️ Báo cáo / Chặn</Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "12px 8px", fontWeight: 700, fontSize: 14, display: "flex", justifyContent: "space-between", cursor: "pointer" }}>
                        File phương tiện, file và liên kết <span>⌄</span>
                      </div>
                      <div style={{ padding: "12px 8px", fontWeight: 700, fontSize: 14, display: "flex", justifyContent: "space-between", cursor: "pointer", color: DS.error }}>
                        Quyền riêng tư & Hỗ trợ <span>⌄</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
            <div style={{ textAlign: "center", maxWidth: 320 }}>
              <div style={{ fontSize: 80, marginBottom: 20, animation: "bounce 2s infinite" }}>💬</div>
              <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, background: "linear-gradient(135deg,#6C63FF,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Bắt đầu kết nối</h2>
              <p style={{ color: DS.textMuted, fontSize: 15, lineHeight: 1.6 }}>Chọn một cuộc trò chuyện từ danh sách để bắt đầu nhắn tin.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes msgPop {
          from { opacity: 0; transform: scale(0.9) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot {
          width: 7px; height: 7px; background: #94a3b8; border-radius: 50%; display: inline-block;
          animation: typingDot 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}