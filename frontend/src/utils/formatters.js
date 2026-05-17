// ============================================================
// UTILITY FUNCTIONS — Hand-Me-On
// ============================================================

export const formatPrice = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(n)
    .replace("₫", "đ");

export const formatNumber = (n) =>
  new Intl.NumberFormat("vi-VN").format(n);

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return "Hôm qua";
  if (days < 7) return `${days} ngày trước`;
  if (weeks < 5) return `${weeks} tuần trước`;
  if (months < 12) return `${months} tháng trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const truncate = (str, len = 60) =>
  str && str.length > len ? str.slice(0, len) + "..." : str;

export const getCategoryName = (id) => {
  const cats = {
    c1: "Điện tử",
    c2: "Thời trang",
    c3: "Nhà & Vườn",
    c4: "Sách",
    c5: "Thể thao",
    c6: "Xe cộ",
    c7: "Mẹ & Bé",
    c8: "Phụ kiện",
    c9: "Nội thất",
    c10: "Đồ cổ"
  };
  return cats[id] || id;
};
