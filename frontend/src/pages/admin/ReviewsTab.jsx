import React, { useState, useEffect } from "react";
import { DS } from "../../design/tokens";
import fakeApi from "../../database/fakeApi";
import Button from "../../components/common/Button";

export default function ReviewsTab({ products, users, onRefresh }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fakeApi.getAllReviews()
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [onRefresh]);

  const handleDeleteReview = async (id) => {
    if (window.confirm("Xóa đánh giá này?")) {
      await fakeApi.deleteReview(id);
      onRefresh();
    }
  };

  const handleSeedReviews = async () => {
    if (!window.confirm("Thêm 5 đánh giá ngẫu nhiên (Seeding)?")) return;
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    if (!randomProduct || !randomUser) return;

    for (let i = 0; i < 5; i++) {
      const review = {
        productId: randomProduct.id,
        reviewerId: randomUser.id,
        sellerId: randomProduct.sellerId,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        comment: ["Sản phẩm cực kỳ tốt, đúng như mô tả!", "Giao hàng siêu nhanh, đóng gói cẩn thận", "Rất ưng ý, sẽ ủng hộ shop tiếp", "Hàng chuẩn, giá cả hợp lý", "Chất lượng tuyệt vời trong tầm giá"][Math.floor(Math.random() * 5)],
      };
      await fakeApi.addReview(review);
    }
    onRefresh();
  };

  if (loading) return <div>Đang tải đánh giá...</div>;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>Quản lý Đánh giá (Reviews)</h3>
          <p style={{ fontSize: 12, color: DS.textMuted, marginTop: 4 }}>Kiểm duyệt đánh giá người dùng và tiến hành seeding</p>
        </div>
        <Button onClick={handleSeedReviews}>🌟 Seeding ngẫu nhiên (5)</Button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead style={{ background: DS.bgHover, borderBottom: `1px solid ${DS.border}`, textAlign: "left" }}>
            <tr>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Sản phẩm</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Người đánh giá</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Đánh giá</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary }}>Nội dung</th>
              <th style={{ padding: "16px 20px", fontWeight: 700, color: DS.textSecondary, textAlign: "right" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => {
              const product = products?.find(p => p.id === r.productId);
              const user = users?.find(u => u.id === (r.reviewerId || r.userId));
              return (
                <tr key={r.id} style={{ borderBottom: `1px solid ${DS.border}` }}>
                  <td style={{ padding: "16px 20px", fontWeight: 600 }}>{product?.title || r.productId}</td>
                  <td style={{ padding: "16px 20px", color: DS.textMuted }}>{user?.name || r.reviewerId || r.userId}</td>
                  <td style={{ padding: "16px 20px", color: "#F59E0B", fontWeight: 700 }}>{"⭐".repeat(r.rating)}</td>
                  <td style={{ padding: "16px 20px", color: DS.textSecondary }}>{r.comment}</td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteReview(r.id)} style={{ color: DS.error, borderColor: DS.error }}>Xóa</Button>
                  </td>
                </tr>
              );
            })}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: DS.textMuted }}>Không có đánh giá nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
