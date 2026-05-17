import { useState } from "react";
import { DS } from "../../design/tokens";
import { formatPrice } from "../../utils/formatters";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import useApi from "../../hooks/useApi";
import fakeApi from "../../database/fakeApi";
import { Gavel, AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react";

export default function DisputesTab() {
  const { data: disputes, refresh } = useApi(() => fakeApi.getDisputes(), []);

  const handleResolve = async (id, decision) => {
    if (window.confirm("Xác nhận quyết định phân xử này? Hành động này sẽ thay đổi trạng thái đơn hàng và ví tiền của người dùng.")) {
      await fakeApi.resolveDispute(id, decision);
      refresh();
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800 }}>Trung tâm Phân xử Tranh chấp</h3>
        <p style={{ fontSize: 13, color: DS.textMuted }}>Giải quyết khiếu nại giữa người mua và người bán</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {disputes?.length === 0 ? (
          <div className="glass-panel" style={{ padding: 60, textAlign: "center", borderRadius: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛡️</div>
            <div style={{ fontWeight: 600, color: DS.textMuted }}>Không có tranh chấp nào cần xử lý</div>
          </div>
        ) : (
          disputes?.map(d => (
            <div key={d.id} className="glass-panel" style={{ borderRadius: 24, overflow: "hidden", borderLeft: `6px solid ${d.status === 'pending' ? DS.warning : DS.success}` }}>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ background: DS.bgHover, padding: 10, borderRadius: 12 }}>
                      <Gavel size={24} color={d.status === 'pending' ? DS.warning : DS.success} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Tranh chấp #{d.id}</h4>
                        <Badge color={d.status === 'pending' ? DS.warning : DS.success} bg={d.status === 'pending' ? DS.warningLight : DS.successLight}>
                          {d.status === 'pending' ? 'Đang chờ' : 'Đã giải quyết'}
                        </Badge>
                      </div>
                      <p style={{ fontSize: 12, color: DS.textMuted }}>Đơn hàng: {d.orderId} • {new Date(d.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: DS.primary }}>{formatPrice(d.order?.amount || 0)}</p>
                    <p style={{ fontSize: 11, color: DS.textMuted }}>Giá trị giao dịch</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: DS.bgHover, padding: 20, borderRadius: 16, marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Người khiếu nại (Buyer)</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={d.buyer?.avatar} style={{ width: 24, height: 24, borderRadius: "50%" }} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{d.buyer?.name}</span>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 800, color: DS.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Người bị khiếu nại (Seller)</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <img src={d.seller?.avatar} style={{ width: 24, height: 24, borderRadius: "50%" }} />
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{d.seller?.name}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Lý do khiếu nại:</p>
                  <p style={{ fontSize: 14, color: DS.textSecondary, lineHeight: 1.6, padding: "12px 16px", background: "#fff", borderRadius: 12, border: `1px solid ${DS.border}` }}>
                    {d.reason}
                  </p>
                </div>

                {d.status === 'pending' ? (
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <Button variant="outline" size="sm" onClick={() => handleResolve(d.id, 'dismiss')} style={{ borderColor: DS.textMuted, color: DS.textMuted }}>
                      <XCircle size={16} /> Bác bỏ khiếu nại
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleResolve(d.id, 'pay_seller')} style={{ borderColor: DS.primary, color: DS.primary }}>
                      <CheckCircle size={16} /> Thanh toán cho Seller
                    </Button>
                    <Button size="sm" onClick={() => handleResolve(d.id, 'refund_buyer')} style={{ background: DS.error, borderColor: DS.error }}>
                      <AlertCircle size={16} /> Hoàn tiền cho Buyer
                    </Button>
                  </div>
                ) : (
                  <div style={{ background: DS.successLight, padding: 12, borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={18} color={DS.success} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: DS.success }}>
                      Kết quả: {d.decision === 'refund_buyer' ? 'Đã hoàn tiền cho người mua' : d.decision === 'pay_seller' ? 'Đã giải ngân cho người bán' : 'Khiếu nại bị bác bỏ'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
