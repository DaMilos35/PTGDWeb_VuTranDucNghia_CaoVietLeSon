import { useState } from "react";
import { DS } from "../../design/tokens";
import { formatPrice } from "../../utils/formatters";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import useApi from "../../hooks/useApi";
import fakeApi from "../../database/fakeApi";
import { Ticket, Plus, Trash2, Calendar, Users } from "lucide-react";

export default function VouchersTab() {
  const { data: vouchers, refresh } = useApi(() => fakeApi.getVouchers(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [newV, setNewV] = useState({ code: "", discount: 0, minOrder: 0, type: "fixed", expiry: "", usageLimit: 100 });

  const handleAdd = async (e) => {
    e.preventDefault();
    await fakeApi.createVoucher(newV);
    setShowAdd(false);
    refresh();
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Quản lý Voucher & Khuyến mãi</h3>
          <p style={{ fontSize: 13, color: DS.textMuted }}>Tạo mã giảm giá để thu hút người dùng</p>
        </div>
        <Button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={18} /> Tạo mã mới
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {vouchers?.map(v => (
          <div key={v.id} className="glass-panel" style={{ padding: 24, borderRadius: 24, position: "relative", overflow: "hidden", borderLeft: `6px solid ${v.type === 'shipping' ? '#10b981' : DS.primary}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ background: DS.bgHover, padding: "6px 12px", borderRadius: 8, fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: DS.primary }}>
                {v.code}
              </div>
              <Badge color={new Date(v.expiry) < new Date() ? DS.error : DS.success}>
                {new Date(v.expiry) < new Date() ? 'Hết hạn' : 'Đang chạy'}
              </Badge>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 24, fontWeight: 900, color: DS.textPrimary, margin: 0 }}>
                {v.type === 'percentage' ? `${v.discount}%` : formatPrice(v.discount)}
              </p>
              <p style={{ fontSize: 12, color: DS.textMuted }}>Giảm {v.type === 'shipping' ? 'phí vận chuyển' : 'trực tiếp đơn hàng'}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12, color: DS.textSecondary }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} /> Hạn: {new Date(v.expiry).toLocaleDateString()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={14} /> Đã dùng: {v.usedCount}/{v.usageLimit}
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${DS.border}`, fontSize: 11, color: DS.textMuted }}>
              Tối thiểu: {formatPrice(v.minOrder)}
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleAdd} style={{ background: "#fff", padding: 32, borderRadius: 28, width: "100%", maxWidth: 500 }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>Tạo mã Voucher mới</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Mã Code</label>
                <input type="text" placeholder="VD: SALE10" required style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${DS.border}` }} onChange={e => setNewV({...newV, code: e.target.value.toUpperCase()})} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Loại giảm</label>
                  <select style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${DS.border}` }} onChange={e => setNewV({...newV, type: e.target.value})}>
                    <option value="fixed">Số tiền cố định</option>
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="shipping">Phí vận chuyển</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Giá trị giảm</label>
                  <input type="number" required style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${DS.border}` }} onChange={e => setNewV({...newV, discount: Number(e.target.value)})} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Đơn tối thiểu</label>
                  <input type="number" required style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${DS.border}` }} onChange={e => setNewV({...newV, minOrder: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ngày hết hạn</label>
                  <input type="date" required style={{ width: "100%", padding: 12, borderRadius: 12, border: `1.5px solid ${DS.border}` }} onChange={e => setNewV({...newV, expiry: e.target.value})} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <Button fullWidth variant="outline" type="button" onClick={() => setShowAdd(false)}>Hủy</Button>
              <Button fullWidth type="submit">Xác nhận tạo</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
