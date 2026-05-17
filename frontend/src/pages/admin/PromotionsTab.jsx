import { useState } from "react";
import { DS } from "../../design/tokens";
import { formatPrice } from "../../utils/formatters";
import Button from "../../components/common/Button";
import useApi from "../../hooks/useApi";
import fakeApi from "../../database/fakeApi";

export default function PromotionsTab({ products, onRefresh }) {
  const [activeSubTab, setActiveSubTab] = useState("supersale");
  const [showAddSS, setShowAddSS] = useState(false);
  const [showAddCombo, setShowAddCombo] = useState(false);
  
  const { data: superSales } = useApi(() => fakeApi.getSuperSales(), [activeSubTab]);
  const { data: combos } = useApi(() => fakeApi.getCombos(), [activeSubTab]);

  const [newSS, setNewSS] = useState({ productId: "", salePrice: 0, discount: 0, endTime: "", stock: 10 });
  const [newCombo, setNewCombo] = useState({ name: "", productIds: [], price: 0, description: "" });

  const handleAddSS = async (e) => {
    e.preventDefault();
    if (!newSS.productId || !newSS.salePrice) return alert("Vui lòng nhập đủ thông tin");
    await fakeApi.createSuperSale(newSS);
    setShowAddSS(false);
    onRefresh();
  };

  const handleAddCombo = async (e) => {
    e.preventDefault();
    if (!newCombo.name || newCombo.productIds.length < 2) return alert("Combo cần ít nhất 2 sản phẩm");
    await fakeApi.createCombo(newCombo);
    setShowAddCombo(false);
    onRefresh();
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 32 }}>
        <button 
          onClick={() => setActiveSubTab("supersale")}
          style={{ padding: "10px 24px", borderRadius: 12, background: activeSubTab === "supersale" ? DS.primary : "#fff", color: activeSubTab === "supersale" ? "#fff" : DS.textSecondary, border: `1px solid ${activeSubTab === "supersale" ? DS.primary : DS.border}`, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
        >
          🔥 Siêu Sale
        </button>
        <button 
          onClick={() => setActiveSubTab("combo")}
          style={{ padding: "10px 24px", borderRadius: 12, background: activeSubTab === "combo" ? DS.primary : "#fff", color: activeSubTab === "combo" ? "#fff" : DS.textSecondary, border: `1px solid ${activeSubTab === "combo" ? DS.primary : DS.border}`, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
        >
          📦 Combo Tiết Kiệm
        </button>
      </div>

      {activeSubTab === "supersale" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: DS.textPrimary }}>Danh sách Siêu Sale</h3>
            <Button onClick={() => setShowAddSS(true)}>+ Thêm Siêu Sale</Button>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "#F8FAFC" }}>
                <tr>
                  <th style={{ padding: "16px 24px", fontSize: 13, color: DS.textMuted }}>Sản phẩm</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, color: DS.textMuted }}>Giá gốc</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, color: DS.textMuted }}>Giá Sale</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, color: DS.textMuted }}>Giảm</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, color: DS.textMuted }}>Kho / Đã bán</th>
                  <th style={{ padding: "16px 24px", fontSize: 13, color: DS.textMuted }}>Kết thúc</th>
                </tr>
              </thead>
              <tbody>
                {superSales?.map(ss => (
                  <tr key={ss.id} style={{ borderBottom: `1px solid ${DS.border}` }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={ss.product?.images[0]} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{ss.product?.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 14 }}>{formatPrice(ss.product?.price)}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: DS.error, fontWeight: 700 }}>{formatPrice(ss.salePrice)}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14 }}><span style={{ color: DS.error }}>-{ss.discount}%</span></td>
                    <td style={{ padding: "16px 24px", fontSize: 14 }}>{ss.stock} / {ss.sold}</td>
                    <td style={{ padding: "16px 24px", fontSize: 14, color: DS.textMuted }}>{new Date(ss.endTime).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: DS.textPrimary }}>Danh sách Combo</h3>
            <Button onClick={() => setShowAddCombo(true)}>+ Tạo Combo Mới</Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
            {combos?.map(combo => (
              <div key={combo.id} style={{ background: "#fff", borderRadius: 20, border: `1px solid ${DS.border}`, padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <h4 style={{ fontWeight: 800, fontSize: 16 }}>{combo.name}</h4>
                  <span style={{ color: DS.success, fontWeight: 900 }}>{formatPrice(combo.price)}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {combo.products?.map(p => (
                    <img key={p.id} src={p.images[0]} style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }} title={p.title} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: DS.textMuted, lineHeight: 1.5 }}>{combo.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals could be implemented here */}
      {(showAddSS || showAddCombo) && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>{showAddSS ? "Thêm sản phẩm Siêu Sale" : "Tạo Combo Tiết kiệm"}</h3>
            
            <form onSubmit={showAddSS ? handleAddSS : handleAddCombo}>
              {showAddSS ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Sản phẩm</label>
                    <select 
                      style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${DS.border}` }}
                      onChange={e => setNewSS({...newSS, productId: e.target.value})}
                    >
                      <option value="">Chọn sản phẩm...</option>
                      {products?.map(p => <option key={p.id} value={p.id}>{p.title} ({formatPrice(p.price)})</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Giá Sale</label>
                      <input type="number" style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${DS.border}` }} onChange={e => setNewSS({...newSS, salePrice: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>% Giảm</label>
                      <input type="number" style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${DS.border}` }} onChange={e => setNewSS({...newSS, discount: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tên Combo</label>
                    <input type="text" style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${DS.border}` }} onChange={e => setNewCombo({...newCombo, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Giá Combo</label>
                    <input type="number" style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${DS.border}` }} onChange={e => setNewCombo({...newCombo, price: Number(e.target.value)})} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                <Button fullWidth variant="outline" onClick={() => { setShowAddSS(false); setShowAddCombo(false); }}>Hủy</Button>
                <Button fullWidth type="submit">Xác nhận</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
