import React, { useState, useEffect } from "react";
import { DS } from "../../design/tokens";
import fakeApi from "../../database/fakeApi";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { Search, Eye, XCircle, CheckCircle, Truck, DollarSign } from "lucide-react";

export default function OrdersTab({ users, onRefresh }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const data = await fakeApi.getAllOrdersAdmin();
    setOrders(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Xác nhận chuyển trạng thái đơn hàng sang "${newStatus.toUpperCase()}"?`)) return;
    try {
      await fakeApi.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Lỗi khi cập nhật đơn hàng: " + err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    
    const buyer = users?.find(u => u.id === o.buyerId);
    const seller = users?.find(u => u.id === o.sellerId);
    const itemTitles = o.items?.map(i => i.title).join(" ").toLowerCase() || "";
    
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemTitles.includes(searchTerm.toLowerCase()) ||
      buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const completedAmount = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingEscrow = orders.filter(o => o.status !== "completed" && o.status !== "cancelled").reduce((sum, o) => sum + (o.amount || 0), 0);
  const commissionCollected = orders.reduce((sum, o) => sum + (o.commission || 0), 0);

  if (loading) return <div>Đang tải danh sách đơn hàng...</div>;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      
      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "#fff", padding: 24, borderRadius: 20, border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: DS.primaryLight, display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", color: DS.primary }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted }}>Tổng Giao Dịch</p>
            <h4 style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</h4>
          </div>
        </div>

        <div style={{ background: "#fff", padding: 24, borderRadius: 20, border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FEF3C7", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", color: "#D97706" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted }}>Đang Tạm Giữ (Escrow)</p>
            <h4 style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{new Intl.NumberFormat('vi-VN').format(pendingEscrow)}đ</h4>
          </div>
        </div>

        <div style={{ background: "#fff", padding: 24, borderRadius: 20, border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: DS.successLight, display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", color: DS.success }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted }}>Thực Thu (Đã Giao)</p>
            <h4 style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{new Intl.NumberFormat('vi-VN').format(completedAmount)}đ</h4>
          </div>
        </div>

        <div style={{ background: "#fff", padding: 24, borderRadius: 20, border: `1px solid ${DS.border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#E0F2FE", display: "flex", alignItems: "center", justifyValue: "center", justifyContent: "center", color: "#0284C7" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ fontSize: 12, color: DS.textMuted }}>Phí Nền Tảng Thu</p>
            <h4 style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{new Intl.NumberFormat('vi-VN').format(commissionCollected)}đ</h4>
          </div>
        </div>
      </div>

      {/* Header and Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Quản lý Đơn hàng & Escrow</h3>
          <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>Theo dõi dòng tiền, duyệt hoàn thành giao dịch và xử lý khiếu nại</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: DS.textMuted }} />
            <input
              type="text"
              placeholder="Tìm kiếm mã, người mua/bán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px 14px 10px 40px",
                borderRadius: 12,
                border: `1.5px solid ${DS.border}`,
                fontSize: 14,
                outline: "none",
                width: 260
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters Status tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "pending", "shipping", "completed", "cancelled"].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: `1.5px solid ${filterStatus === status ? DS.primary : DS.border}`,
              background: filterStatus === status ? DS.primaryLight : "#fff",
              color: filterStatus === status ? DS.primary : DS.textSecondary,
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "capitalize"
            }}
          >
            {status === "all" ? "Tất cả" : status === "pending" ? "Chờ xử lý" : status === "shipping" ? "Đang giao" : status === "completed" ? "Hoàn thành" : "Đã hủy"}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead style={{ background: DS.bgHover, borderBottom: `1px solid ${DS.border}`, textAlign: "left" }}>
            <tr>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Mã Đơn</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Sản phẩm</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Người mua / bán</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Tổng tiền</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Trạng thái</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary, textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(o => {
              const buyer = users?.find(u => u.id === o.buyerId);
              const seller = users?.find(u => u.id === o.sellerId);
              return (
                <tr key={o.id} style={{ borderBottom: `1px solid ${DS.border}`, transition: "background 0.2s" }} className="hover-row">
                  <td style={{ padding: "16px 20px", fontWeight: 700, color: DS.textMuted }}>#{o.id.substring(0, 8)}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontWeight: 700, color: DS.textPrimary }}>
                        {o.items?.[0]?.title} {o.items?.length > 1 && `(+${o.items.length - 1})`}
                      </span>
                      <span style={{ fontSize: 11, color: DS.textMuted }}>Ngày mua: {o.createdAt ? new Date(o.createdAt).toLocaleString() : "Không rõ"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13, color: DS.textPrimary }}>Mua: <b>{buyer?.name || o.buyerId}</b></span>
                      <span style={{ fontSize: 13, color: DS.textSecondary }}>Bán: <b>{seller?.name || o.sellerId}</b></span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", fontWeight: 700 }}>
                    {new Intl.NumberFormat('vi-VN').format(o.amount)}đ
                    {o.commission > 0 && <div style={{ fontSize: 10, color: DS.primary, fontWeight: 600 }}>Phí: {new Intl.NumberFormat('vi-VN').format(o.commission)}đ</div>}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <Badge color={
                      o.status === "completed" ? DS.success :
                      o.status === "cancelled" ? DS.error :
                      o.status === "shipping" ? "#3B82F6" : "#F59E0B"
                    }>
                      {o.status === "completed" ? "Đã hoàn thành" :
                       o.status === "cancelled" ? "Đã hủy" :
                       o.status === "shipping" ? "Đang giao hàng" : "Chờ xử lý"}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(o)}>
                        <Eye size={14} style={{ marginRight: 4 }} /> Xem
                      </Button>
                      {o.status === "pending" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(o.id, "shipping")} style={{ color: "#3B82F6", borderColor: "#3B82F6" }}>
                            <Truck size={14} style={{ marginRight: 4 }} /> Giao
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(o.id, "cancelled")} style={{ color: DS.error, borderColor: DS.error }}>
                            <XCircle size={14} style={{ marginRight: 4 }} /> Hủy
                          </Button>
                        </>
                      )}
                      {o.status === "shipping" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(o.id, "completed")} style={{ color: DS.success, borderColor: DS.success }}>
                            <CheckCircle size={14} style={{ marginRight: 4 }} /> Giải ngân
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(o.id, "cancelled")} style={{ color: DS.error, borderColor: DS.error }}>
                            <XCircle size={14} style={{ marginRight: 4 }} /> Hủy
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: DS.textMuted }}>Không có đơn hàng nào khớp với bộ lọc.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, animation: "fadeIn 0.2s ease"
        }}>
          <div style={{
            background: "#fff", width: "90%", maxWidth: 600, padding: 32, borderRadius: 24,
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)", position: "relative"
          }}>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{
                position: "absolute", top: 24, right: 24, background: "none", border: "none",
                fontSize: 20, cursor: "pointer", color: DS.textMuted
              }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Chi Tiết Đơn Hàng #{selectedOrder.id.substring(0, 12)}</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <p style={{ fontSize: 12, color: DS.textMuted }}>Người mua:</p>
                <p style={{ fontWeight: 700 }}>{users?.find(u => u.id === selectedOrder.buyerId)?.name || selectedOrder.buyerId}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: DS.textMuted }}>Người bán:</p>
                <p style={{ fontWeight: 700 }}>{users?.find(u => u.id === selectedOrder.sellerId)?.name || selectedOrder.sellerId}</p>
              </div>
            </div>

            <div style={{ borderBottom: `1.5px solid ${DS.border}`, paddingBottom: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 8 }}>Sản phẩm:</p>
              {selectedOrder.items?.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                  <span>{item.title} <span style={{ color: DS.textMuted }}>x{item.qty || 1}</span></span>
                  <span style={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN').format(item.price)}đ</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 16 }}>
              <span>Phí vận chuyển:</span>
              <span style={{ fontWeight: 700 }}>{new Intl.NumberFormat('vi-VN').format(selectedOrder.shipping || 0)}đ</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, background: DS.bgHover, padding: 12, borderRadius: 12, marginBottom: 24 }}>
              <span>Tổng cộng:</span>
              <span style={{ color: DS.primary }}>{new Intl.NumberFormat('vi-VN').format(selectedOrder.amount)}đ</span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, color: DS.textMuted, marginBottom: 8 }}>Lịch sử trạng thái:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selectedOrder.history?.map((h, index) => (
                  <div key={index} style={{ display: "flex", gap: 12, fontSize: 13 }}>
                    <span style={{ color: DS.textMuted, minWidth: 120 }}>{h.time}</span>
                    <span style={{ fontWeight: 600 }}>{h.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Button onClick={() => setSelectedOrder(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
