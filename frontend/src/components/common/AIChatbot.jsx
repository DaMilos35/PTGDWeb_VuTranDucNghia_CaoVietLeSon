import { useState, useRef, useEffect, useCallback } from "react";
import { DS } from "../../design/tokens";
import { useApp } from "../../context/AppContext";
import fakeApi from "../../database/fakeApi";

const KNOWLEDGE_BASE = [
  // Mua hàng
  { keys: ["mua", "cách mua", "hướng dẫn mua"], reply: "Để mua hàng, bạn chỉ cần chọn sản phẩm, nhấn 'Thêm vào giỏ' hoặc 'Mua ngay', sau đó điền thông tin giao hàng ở trang Thanh toán nhé!" },
  { keys: ["đơn hàng của tôi", "xem đơn", "theo dõi đơn"], reply: "Bạn có thể theo dõi đơn hàng tại mục 'Đơn hàng' trong menu tài khoản cá nhân. Tất cả trạng thái vận chuyển sẽ được cập nhật tại đó." },
  { keys: ["hủy đơn", "hủy mua"], reply: "Bạn có thể hủy đơn hàng nếu người bán chưa xác nhận gửi hàng. Hãy vào mục 'Đơn hàng' -> 'Chi tiết' -> 'Hủy đơn'." },
  { keys: ["trả hàng", "hoàn tiền", "chính sách hoàn"], reply: "HMO có chính sách bảo vệ người mua trong 3 ngày kể từ khi nhận hàng. Nếu hàng lỗi, sai mô tả, bạn hãy chọn 'Yêu cầu Trả hàng/Hoàn tiền' ngay trong chi tiết đơn." },
  // Bán hàng
  { keys: ["bán", "đăng bán", "cách bán"], reply: "Để đăng bán, bạn nhấn nút 'ĐĂNG BÁN' màu xanh trên thanh điều hướng, sau đó tải ảnh lên, điền tên, giá và mô tả nhé!" },
  { keys: ["phí", "hoa hồng", "chiết khấu"], reply: "HMO thu phí nền tảng là 5% trên mỗi đơn hàng thành công để duy trì dịch vụ bảo vệ thanh toán an toàn cho cả hai bên." },
  { keys: ["sửa thông tin", "sửa sản phẩm", "sửa giá"], reply: "Bạn có thể chỉnh sửa giá và mô tả trong mục 'Hồ sơ' -> 'Sản phẩm của tôi', chọn sản phẩm cần sửa và nhấn nút 'Chỉnh sửa'." },
  { keys: ["đẩy tin", "bán nhanh", "quảng cáo"], reply: "Tính năng Đẩy tin hiện đang được phát triển, giúp sản phẩm của bạn xuất hiện trên đầu trang tìm kiếm. Bạn đón chờ nhé!" },
  // Thanh toán & Vận chuyển
  { keys: ["thanh toán", "cách trả tiền", "phương thức"], reply: "HMO hỗ trợ thanh toán qua Ví HMO (Coins), Chuyển khoản ngân hàng, Thẻ tín dụng và COD (Thanh toán khi nhận hàng)." },
  { keys: ["ví hmo", "nạp tiền", "rút tiền"], reply: "Ví HMO (Coins) giúp bạn mua hàng nhanh chóng và nhận hoàn tiền. Bạn có thể nạp/rút tiền tại mục 'Hồ sơ' -> 'Quản lý số dư'." },
  { keys: ["phí ship", "tiền ship", "phí vận chuyển"], reply: "Phí ship phụ thuộc vào khoảng cách và kích thước món hàng. Phí này sẽ được tính tự động tại bước Thanh toán." },
  { keys: ["ship cod", "cod"], reply: "Chúng mình có hỗ trợ ship COD. Bạn có thể kiểm tra hàng trước khi thanh toán cho shipper nhé!" },
  { keys: ["thời gian giao", "bao lâu nhận"], reply: "Thời gian giao hàng thường từ 1-3 ngày đối với nội thành, và 3-5 ngày đối với ngoại tỉnh." },
  // Thương lượng & Chat
  { keys: ["mặc cả", "thương lượng", "trả giá", "deal"], reply: "Bạn hoàn toàn có thể thương lượng giá bằng cách nhấn vào nút 'Chat & Trả giá' trong trang chi tiết sản phẩm." },
  { keys: ["chat", "nhắn tin"], reply: "Tính năng Chat giúp bạn trao đổi trực tiếp với người bán. Hãy hỏi thêm hình ảnh thực tế nếu cần nhé!" },
  // Flash Sale & Khuyến mãi
  { keys: ["flash sale", "khuyến mãi", "sale", "giảm giá"], reply: "HMO có các đợt Flash Sale vào 12h trưa và 8h tối mỗi ngày. Bạn hãy canh giờ để săn deal sốc nhé!" },
  { keys: ["voucher", "mã giảm giá", "coupon"], reply: "Hiện tại hệ thống có mã NEWUSER50K giảm 50k cho đơn đầu tiên và FREESHIP để miễn phí vận chuyển!" },
  // Bảo vệ an toàn
  { keys: ["an toàn", "bảo vệ", "scam", "lừa đảo"], reply: "Bạn yên tâm nhé! HMO giữ tiền của bạn (Escrow) và chỉ thanh toán cho người bán khi bạn xác nhận đã nhận hàng đúng như mô tả." },
  { keys: ["kiểm duyệt", "chờ duyệt"], reply: "Mọi sản phẩm trên HMO đều được Admin kiểm duyệt để đảm bảo chất lượng. Quá trình duyệt mất tối đa 30 phút." },
  { keys: ["báo cáo", "report", "vi phạm"], reply: "Nếu phát hiện hàng giả hoặc lừa đảo, bạn hãy nhấn nút 'Báo cáo vi phạm' trên trang sản phẩm để Admin xử lý nhé." },
  // Tài khoản
  { keys: ["quên mật khẩu", "mật khẩu"], reply: "Bạn có thể khôi phục mật khẩu ở màn hình Đăng nhập bằng cách nhấn vào 'Quên mật khẩu' và làm theo hướng dẫn qua email." },
  { keys: ["xác thực", "tích xanh", "verify"], reply: "Xác thực danh tính (Tích xanh) giúp tăng độ uy tín khi bán hàng. Hãy vào mục 'Cài đặt' -> 'Xác thực tài khoản'." },
  { keys: ["đổi tên", "đổi avatar"], reply: "Bạn có thể thay đổi Avatar và Tên hiển thị trong phần 'Hồ sơ' -> 'Chỉnh sửa thông tin'." },
  // Khác
  { keys: ["hướng dẫn", "tutorial"], action: "START_TUTORIAL" },
  { keys: ["chào", "hello", "hi", "xin chào"], reply: "Chào bạn! Mình là Trợ lý AI của HMO. Mình có thể giúp gì cho bạn hôm nay?" },
];

// ─── Mega Knowledge Base ───────────────────────────────────────────────────────
const KB = [
  { p: /(mua|cách mua|đặt hàng|đặt mua|muốn mua|tìm mua)/i, r: "Mua hàng dễ:\n1️⃣ Tìm sản phẩm → bấm 'Mua ngay'\n2️⃣ Chọn địa chỉ nhận hàng\n3️⃣ Thanh toán qua Escrow bảo mật\n✅ Tiền chỉ về người bán khi bạn xác nhận!\n\nBạn đang tìm đồ gì ạ?" },
  { p: /(bán|cách bán|đăng bán|đăng tin|muốn bán)/i, r: "Đăng bán siêu nhanh:\n1️⃣ Bấm nút ➕ Đăng bán\n2️⃣ Chụp 3-5 ảnh rõ nét\n3️⃣ Viết mô tả + định giá\n4️⃣ Đăng và chờ người mua!\n💡 Ảnh đẹp + mô tả chi tiết bán nhanh gấp 3 lần!" },
  { p: /(đơn hàng|kiểm tra đơn|giao hàng|vận chuyển|ship|theo dõi)/i, r: "Trạng thái đơn hàng:\n📝 Chờ xác nhận → ✅ Đã xác nhận → 🚚 Đang giao → 🎉 Hoàn thành\n\nVào menu → Đơn hàng. Người mua/bán thấy giao diện khác nhau nhé!" },
  { p: /(lừa đảo|scam|an toàn|bảo vệ|hoàn tiền|tranh chấp|khiếu nại|tố cáo)/i, r: "Nền tảng bảo vệ bạn 100%:\n🛡️ Escrow: tiền giữ trung gian\n🔄 Hoàn tiền nếu hàng sai mô tả (7 ngày)\n⚠️ Báo cáo vi phạm trên profile\n📞 CSKH xử lý trong 24h" },
  { p: /(phí|hoa hồng|chi phí|phần trăm|fee|mất tiền)/i, r: "Biểu phí công khai:\n✅ Đăng tin: Miễn phí\n💳 Phí giao dịch: 5% / đơn thành công\n🚚 Ship: 20k-50k tùy đơn vị\n💡 Không phí ẩn, không tự trừ!" },
  { p: /(voucher|mã giảm|khuyến mãi|sale|discount|ưu đãi|coupon)/i, r: "Kho voucher tại Cài đặt → Kho Voucher 🎟️\nHiện có:\n🎁 Giảm 50k cho đơn từ 200k\n🚚 Freeship mọi đơn\n💡 Mã tự áp dụng khi checkout!" },
  { p: /(đổi trả|return|refund|hoàn hàng|trả lại)/i, r: "Chính sách đổi trả:\n✅ 7 ngày nếu hàng lỗi/sai mô tả\n❌ Không áp dụng sau khi đã xác nhận OK\n📸 Quay video unbox làm bằng chứng nhé!" },
  { p: /(thanh toán|payment|chuyển khoản|momo|vnpay|zalopay|thẻ)/i, r: "Hỗ trợ thanh toán:\n💳 Visa/Master/ATM\n📱 MoMo, ZaloPay, VNPay\n🏦 Chuyển khoản ngân hàng\nTất cả qua Escrow bảo mật 🔒" },
  { p: /(tài khoản|đăng ký|đăng nhập|quên mật khẩu|mật khẩu|hồ sơ|profile)/i, r: "Quản lý tài khoản:\n👤 Cài đặt → Hồ sơ: ảnh, tên, SĐT\n🔑 Cài đặt → Đổi mật khẩu\n🔔 Cài đặt → Thông báo\nBạn cần hỗ trợ bước nào?" },
  { p: /(xu|coin|điểm|thưởng|loyalty|tích điểm)/i, r: "Hệ thống Xu:\n🪙 Kiếm: Mua hàng, Đánh giá, Giới thiệu bạn bè\n💎 Dùng: Giảm giá đơn tiếp, Đổi voucher\nXem tại menu → Xu!" },
  { p: /(đánh giá|review|sao|rating|nhận xét)/i, r: "Đánh giá sau khi nhận hàng để nhận xu thưởng! ⭐\nĐánh giá công bằng giúp cộng đồng an toàn hơn 😊" },
  { p: /(giá|định giá|bao nhiêu|rẻ|đắt|giá tốt|thị trường)/i, r: "Tips định giá:\n📊 Tham khảo sản phẩm tương tự\n💰 Đồ cũ rẻ hơn mới 30-70%\n🏷️ Tình trạng tốt → giá cao hơn\nBạn muốn định giá món gì?" },
  { p: /(quần áo|thời trang|áo|quần|váy|fashion|vintage|outfit)/i, r: "Thời trang 2ndHand đang trending! 👗\nHàng vintage, hàng hiệu second-hand giá siêu tốt.\nFilter 'Thời trang' để xem hàng trăm món đẹp nhé!" },
  { p: /(điện thoại|iphone|samsung|điện tử|laptop|máy tính|tablet|tech)/i, r: "Đồ công nghệ hot nhất nền tảng! 📱\nKiểm tra kỹ mô tả, yêu cầu video test trước khi mua.\nNhớ test máy ngay khi nhận hàng nhé!" },
  { p: /(thời tiết|nhiệt độ|mưa|nắng|weather)/i, r: "Mình không giỏi dự báo thời tiết 😄 Nhưng trời mưa thì ở nhà lướt 2ndHand săn áo khoác / đồ mưa cũng hay! Muốn xem không?" },
  { p: /(ăn gì|đói|đồ ăn|food|nhà hàng|quán ăn)/i, r: "Đói rồi à? 😄 Mình chỉ giỏi đồ 2ndHand thôi. Nhưng đồ bếp cũ xịn trên đây nhiều: nồi, chảo, máy xay... Bạn thử xem không?" },
  { p: /(buồn|stress|mệt|chán|lo|tâm sự|khó chịu)/i, r: "Mình nghe bạn rồi 🥺 Retail therapy thật sự hiệu quả đấy! Lướt 2ndHand tìm vài món đồ xinh giá hợp lý, biết đâu tìm được deal hời làm tâm trạng vui hơn?" },
  { p: /(game|chơi game|gaming|xbox|playstation|controller|tai nghe)/i, r: "Gamer hiểu nhau! 🎮 Gear gaming second-hand xịn và rẻ hơn nhiều: tai nghe, tay cầm, màn hình, ghế... Bạn cần item gì?" },
  { p: /(xin chào|chào|hello|hi |alo|hey|yo)/i, r: "Xin chào! 👋 Mình là Trợ lý 2ndHand, hỗ trợ 24/7!\n\nMình giúp được:\n🛍️ Tìm mua đồ cũ\n💰 Tư vấn đăng bán\n📦 Theo dõi đơn hàng\n🛡️ Xử lý khiếu nại\n\nBạn cần gì hôm nay?" },
  { p: /(cảm ơn|thanks|ok|được|tốt|hay|tuyệt)/i, r: "Không có gì! 😊 Cứ hỏi thêm bất cứ lúc nào nhé. Chúc bạn mua sắm vui! 🎉" },
  { p: /(cskh|nhân viên|người thật|tư vấn viên|hỗ trợ trực tiếp)/i, r: "Mình chuyển bạn đến CSKH ngay! 🎧\nĐã ghi nhận vấn đề. Anh/chị sẽ phản hồi trong 15-30 phút nhé!" },
];

const smartReply = (text) => {
  for (const rule of KB) {
    if (rule.p.test(text)) return rule.r;
  }
  // Generic fallback - extract keywords and respond intelligently
  const words = text.trim().split(/\s+/);
  const kw = words.find(w => w.length > 3) || text.substring(0, 10);
  const fallbacks = [
    `Mình hiểu bạn đang hỏi về "${kw}". Chủ đề này mình cần tra thêm! Trong lúc đó, bạn có muốn mình hỗ trợ tìm sản phẩm liên quan trên 2ndHand không?`,
    `Câu hỏi hay đó! Về "${kw}" thì mình sẽ ghi nhận và cải thiện. Bạn cũng có thể liên hệ CSKH để được tư vấn chi tiết hơn nhé 🎧`,
    `Mình chưa có thông tin về "${kw}" ngay lúc này. Nhưng mình đoán bạn đang quan tâm đến mua/bán đồ cũ? Mình sẵn sàng hỗ trợ bạn!`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
  // Strip emoji prefix from quick actions like "🛍️ Mua hàng" → "Mua hàng"
  const cleanText = (t) => t.replace(/^[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\s]+/u, "").trim();

  // Follow-up suggestions per intent
  const FOLLOWUPS = {
    mua_hang: ["Làm sao trả hàng?", "Phí ship bao nhiêu?", "Thanh toán như thế nào?"],
    ban_hang: ["Phí bán hàng là bao nhiêu?", "Làm sao thu tiền?", "Đăng tin miễn phí không?"],
    don_hang: ["Tiền hoàn khi nào?", "Ship bao lâu tới?", "Liên hệ người bán thế nào?"],
    an_toan: ["Escrow là gì?", "Bị lừa thì làm sao?", "Gặp CSKH"],
    phi: ["Phí ship tính sao?", "Miễn phí đăng tin không?", "Có khuyến mãi phí không?"],
    voucher: ["Làm sao dùng mã?", "Tìm deal flash sale?", "Cách nhận thêm voucher?"],
    thanh_toan: ["MoMo có được không?", "Có thể COD không?", "Thanh toán có an toàn không?"],
    default: ["Hướng dẫn mua hàng", "Chính sách đổi trả", "Gặp CSKH"],
  };

  const getFollowups = (text) => {
    if (/(mua|đặt hàng)/i.test(text)) return FOLLOWUPS.mua_hang;
    if (/(bán|đăng)/i.test(text)) return FOLLOWUPS.ban_hang;
    if (/(đơn hàng|ship|giao)/i.test(text)) return FOLLOWUPS.don_hang;
    if (/(an toàn|lừa|scam|bảo vệ)/i.test(text)) return FOLLOWUPS.an_toan;
    if (/(phí|fee)/i.test(text)) return FOLLOWUPS.phi;
    if (/(voucher|mã|khuyến)/i.test(text)) return FOLLOWUPS.voucher;
    if (/(thanh toán|momo|vnpay)/i.test(text)) return FOLLOWUPS.thanh_toan;
    return FOLLOWUPS.default;
  };

  const handleSend = async (preset = null) => {
    const raw = preset || input.trim();
    if (!raw) return;
    const text = cleanText(raw); // clean for matching
    const displayText = raw; // show original with emoji

    const userMsg = { id: Date.now(), sender: "user", type: "text", text: displayText, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(p => [...p, userMsg]);
    setInput(""); setIsTyping(true);

    const delay = 800 + Math.min(text.length * 18, 1200) + Math.random() * 300;
    setTimeout(() => {
      const reply = smartReply(text);
      const followups = getFollowups(text);
      const botMsg = {
        id: Date.now() + 1, sender: "ai", type: "text",
        text: reply,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        followups // attach follow-up suggestions
      };
      setMessages(p => [...p, botMsg]);
      setIsTyping(false);
    }, delay);
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
              }}>
                {m.text}
              </div>
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