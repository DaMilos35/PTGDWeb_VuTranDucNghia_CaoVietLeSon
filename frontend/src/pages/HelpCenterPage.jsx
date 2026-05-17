import React, { useState } from 'react';
import { DS } from '../design/tokens';
import { useApp } from '../context/AppContext';

const FAQS = [
  { q: "Làm thế nào để mua hàng trên Hand-Me-On?", a: "Bạn chỉ cần tìm sản phẩm mình thích, nhấn 'Thêm vào giỏ' hoặc 'Mua ngay'. Sau đó thực hiện các bước thanh toán và nhập địa chỉ nhận hàng. Hệ thống HMO Protection sẽ bảo vệ giao dịch của bạn." },
  { q: "HMO Protection là gì?", a: "HMO Protection là dịch vụ bảo vệ người mua độc quyền. Tiền của bạn được giữ an toàn bởi Hand-Me-On cho đến khi bạn xác nhận đã nhận hàng và hài lòng với sản phẩm. Nếu có vấn đề, chúng tôi hoàn tiền 100%." },
  { q: "Tôi có thể trả giá sản phẩm không?", a: "Có! Bạn có thể sử dụng nút 'Trả giá' trên trang chi tiết sản phẩm để thương lượng trực tiếp với người bán qua hệ thống Offer. Người bán sẽ nhận được thông báo và có thể chấp nhận, từ chối hoặc đề nghị giá khác." },
  { q: "Làm sao để trở thành người bán?", a: "Bạn chỉ cần vào mục 'Đăng tin', tải lên hình ảnh và mô tả sản phẩm. Sau khi hoàn thành, sản phẩm sẽ xuất hiện ngay trên sàn. Không mất phí đăng tin, chỉ mất phí giao dịch 7% khi bán được hàng." },
  { q: "Phí vận chuyển được tính như thế nào?", a: "Phí vận chuyển tùy thuộc vào vị trí của bạn và người bán, cũng như khối lượng sản phẩm. Một số người bán có thể hỗ trợ miễn phí vận chuyển. Phí sẽ hiển thị rõ trong quá trình thanh toán." },
  { q: "Làm sao để hoàn tiền nếu hàng bị lỗi?", a: "Trong vòng 3 ngày sau khi nhận hàng, nếu sản phẩm không đúng mô tả, bạn có thể mở khiếu nại ngay trong trang Đơn hàng. Đội hỗ trợ sẽ xử lý trong vòng 24 giờ và hoàn tiền nếu khiếu nại hợp lệ." },
  { q: "HMO Coins là gì?", a: "HMO Coins là đồng tiền ảo trong hệ thống. Bạn nhận được Coins khi mua hàng, giới thiệu bạn bè, hoặc tham gia các sự kiện. Coins có thể dùng để giảm giá hoặc đổi voucher mua sắm." },
];

const CATEGORIES = [
  { icon: '🛍️', label: 'Mua hàng', desc: '15 bài viết', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
  { icon: '🏷️', label: 'Bán hàng', desc: '12 bài viết', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  { icon: '💳', label: 'Thanh toán', desc: '8 bài viết', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  { icon: '🚚', label: 'Vận chuyển', desc: '10 bài viết', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  { icon: '🔐', label: 'Bảo mật', desc: '6 bài viết', color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  { icon: '🪙', label: 'HMO Coins', desc: '9 bài viết', color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
];

export default function HelpCenterPage() {
  const { setView } = useApp();
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(null);
  const [hovCat, setHovCat] = useState(null);

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'Be Vietnam Pro, sans-serif', background: 'var(--bg-main)', minHeight: '100vh' }}>

      {/* ── Hero Section ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243e 100%)',
        padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        {/* Animated blobs */}
        <div style={{ position: 'absolute', top: -80, left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)', animation: 'floatBlob 6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)', animation: 'floatBlob 8s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '30%', right: '5%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)', animation: 'floatBlob 7s ease-in-out infinite 2s' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 99, padding: '6px 18px', marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Hỗ trợ 24/7</span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Trung tâm Trợ giúp<br /><span style={{ background: 'linear-gradient(135deg, #6C63FF, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hand-Me-On</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Tìm kiếm câu trả lời cho mọi thắc mắc về nền tảng mua bán đồ secondhand hàng đầu Việt Nam.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 20, zIndex: 1 }}>🔍</div>
            <input
              placeholder="Tìm kiếm câu hỏi, chủ đề..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '18px 20px 18px 56px', borderRadius: 99,
                border: '2px solid rgba(108,99,255,0.4)', background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)', color: '#fff', fontSize: 16,
                outline: 'none', fontFamily: 'inherit', transition: 'all 0.3s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.12)'; e.target.style.borderColor = '#6C63FF'; }}
              onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(108,99,255,0.4)'; }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}
              >✕</button>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 48 }}>
            {[['500+', 'Bài viết hỗ trợ'], ['< 2 phút', 'Thời gian phản hồi'], ['98%', 'Hài lòng']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Cards ── */}
      <div style={{ maxWidth: 960, margin: '-40px auto 0', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.label}
              onMouseEnter={() => setHovCat(i)}
              onMouseLeave={() => setHovCat(null)}
              onClick={() => setSearch(cat.label)}
              style={{
                background: hovCat === i ? cat.bg : '#fff',
                border: `1.5px solid ${hovCat === i ? cat.color : '#E2E8F0'}`,
                borderRadius: 20, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
                boxShadow: hovCat === i ? `0 12px 32px ${cat.bg}` : '0 2px 12px rgba(0,0,0,0.05)',
                transform: hovCat === i ? 'translateY(-6px) scale(1.02)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12, filter: hovCat === i ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none', transition: '0.3s' }}>{cat.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: hovCat === i ? cat.color : '#0F172A', marginBottom: 4 }}>{cat.label}</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>{cat.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Popular Articles ── */}
        <div style={{ marginTop: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {search ? `Kết quả cho "${search}"` : '❓ Câu hỏi thường gặp'}
            </h2>
            {search && (
              <span style={{ fontSize: 13, color: '#6C63FF', fontWeight: 600 }}>{filtered.length} kết quả</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 24, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Không tìm thấy kết quả</h3>
              <p style={{ color: '#64748B', marginBottom: 24 }}>Thử tìm với từ khóa khác hoặc liên hệ hỗ trợ trực tiếp</p>
              <button
                onClick={() => setSearch('')}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#6C63FF,#A78BFA)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >Xem tất cả câu hỏi</button>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
              {filtered.map((faq, i) => (
                <div key={i} style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    style={{
                      width: '100%', padding: '22px 28px', display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', background: openIdx === i ? 'rgba(108,99,255,0.04)' : 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                        background: openIdx === i ? 'linear-gradient(135deg,#6C63FF,#A78BFA)' : '#F1F5F9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, transition: '0.3s',
                      }}>
                        {openIdx === i ? '💡' : '❓'}
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.4 }}>{faq.q}</span>
                    </div>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', background: openIdx === i ? '#6C63FF' : '#F1F5F9',
                      color: openIdx === i ? '#fff' : '#64748B', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 16, flexShrink: 0, transition: 'all 0.3s',
                      transform: openIdx === i ? 'rotate(45deg)' : 'none',
                    }}>+</span>
                  </button>
                  {openIdx === i && (
                    <div style={{ padding: '0 28px 22px 74px', color: '#475569', lineHeight: 1.75, fontSize: 15, animation: 'fadeIn 0.2s ease' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Contact Support ── */}
        <div style={{ marginTop: 60, borderRadius: 28, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #0F0C29 0%, #302B63 100%)' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(108,99,255,0.3)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '30%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(236,72,153,0.2)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '48px 40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 24 }}>
            <div>
              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '4px 14px', marginBottom: 16 }}>
                <span style={{ width: 7, height: 7, background: '#22C55E', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>Online ngay bây giờ</span>
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Vẫn cần trợ giúp?</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Đội ngũ hỗ trợ luôn sẵn sàng 24/7 để giải đáp mọi thắc mắc.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setView('messaging')}
                style={{ padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg,#6C63FF,#A78BFA)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(108,99,255,0.4)', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >💬 Nhắn tin trực tiếp</button>
              <button
                style={{ padding: '14px 28px', borderRadius: 14, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >📧 Gửi Email</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatBlob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
