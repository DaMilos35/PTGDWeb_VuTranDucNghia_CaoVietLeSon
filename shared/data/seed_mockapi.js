/**
 * seed_mockapi_full.js
 * =============================================
 * Seed toàn bộ dữ liệu lên MockAPI.io
 * URL: https://6976c5a9c0c36a2a9951c9d8.mockapi.io
 *
 * CÁCH DÙNG:
 *   node seed_mockapi_full.js
 *
 * YÊU CẦU:
 *   - Node.js >= 18 (có built-in fetch)
 *   - Tạo đủ các resource sau trên MockAPI dashboard:
 *       users, categories, products, orders,
 *       reviews, coupons, notifications, flashSales,
 *       messages, qna, settings
 * =============================================
 */

const API_URL = "https://6976c5a9c0c36a2a9951c9d8.mockapi.io";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── POST một item, retry nếu 429 ──────────────────────────────
async function postItem(resource, item, attempt = 0) {
  const res = await fetch(`${API_URL}/${resource}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (res.status === 429 && attempt < 3) {
    console.warn(`    ⚠ Rate limit – chờ 2s rồi thử lại...`);
    await delay(2000);
    return postItem(resource, item, attempt + 1);
  }
  return res;
}

// ─── Seed một resource ─────────────────────────────────────────
async function seedResource(resource, items) {
  if (!items || items.length === 0) {
    console.log(`  ↷  ${resource}: bỏ qua (không có dữ liệu)`);
    return;
  }
  console.log(`\n📦 Seeding [${resource}] — ${items.length} items...`);
  let ok = 0, fail = 0;
  for (const item of items) {
    try {
      const res = await postItem(resource, item);
      if (res.ok) {
        ok++;
        process.stdout.write(`\r    ✓ ${ok}/${items.length}`);
      } else {
        fail++;
        const txt = await res.text();
        if (res.status === 404) {
          console.error(`\n  ✗ Resource /${resource} chưa tồn tại trên MockAPI! Tạo nó trong dashboard rồi chạy lại.`);
          return;
        }
        console.error(`\n  ✗ ${item.id || "?"} → ${res.status}: ${txt.slice(0, 80)}`);
      }
    } catch (err) {
      fail++;
      console.error(`\n  ✗ Network error:`, err.message);
    }
    await delay(150); // tránh rate-limit
  }
  console.log(`\n  ✅ Xong: ${ok} thành công, ${fail} lỗi`);
}

// ══════════════════════════════════════════════════════════════
// DỮ LIỆU
// ══════════════════════════════════════════════════════════════

// ─── CATEGORIES ───────────────────────────────────────────────
const categories = [
  { id: "c1", name: "Điện tử", icon: "💻", count: 148 },
  { id: "c2", name: "Thời trang", icon: "👗", count: 97 },
  { id: "c3", name: "Nhà & Vườn", icon: "🏡", count: 63 },
  { id: "c4", name: "Sách", icon: "📚", count: 82 },
  { id: "c5", name: "Thể thao & Du lịch", icon: "🏕️", count: 44 },
  { id: "c6", name: "Xe cộ", icon: "🛵", count: 29 },
  { id: "c7", name: "Mẹ & Bé", icon: "🍼", count: 51 },
  { id: "c8", name: "Phụ kiện", icon: "⌚", count: 76 },
  { id: "c9", name: "Nội thất", icon: "🛋️", count: 35 },
  { id: "c10", name: "Đồ cổ & Sưu tầm", icon: "🏺", count: 18 },
];

// ─── USERS ────────────────────────────────────────────────────
const users = [
  {
    id: "u1", name: "Linh Trần", email: "linh@example.com", password: "123456",
    avatar: "https://i.pravatar.cc/150?img=47", role: "admin",
    location: "TP. Hồ Chí Minh", verified: true, joined: "2021-03-14",
    sales: 312, avgRating: 4.9, totalRevenue: 343327850,
    bio: "Admin hệ thống. Chuyên bán đồ công nghệ chính hãng.",
    coins: 48880, rating: 4.9, following: ["u4", "u7"], followers: ["u2", "u3", "u5"],
    cart: [],
    addresses: [{ id: "addr1", name: "Linh Trần", phone: "0947460977", address: "123 Nguyễn Huệ", city: "TP. Hồ Chí Minh", isDefault: true }]
  },
  {
    id: "u2", name: "Minh Nguyễn", email: "minh@example.com", password: "123456",
    avatar: "https://i.pravatar.cc/150?img=12", role: "user",
    location: "Quận Cầu Giấy, Hà Nội", verified: true, joined: "2023-06-19T22:04:53.351Z",
    sales: 131, avgRating: 4.0, totalRevenue: 397805329,
    bio: "Mình chuyên thanh lý đồ cá nhân và gia đình.", coins: 1090, rating: 4.0,
    following: [], followers: ["u1"], cart: [],
    addresses: [{ id: "addr1", name: "Minh Nguyễn", phone: "0904018696", address: "551 Đinh Tiên Hoàng", city: "Hà Nội", isDefault: true }]
  },
  {
    id: "u3", name: "Lê Hoàng Yến", email: "le.yen@gmail.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=11", role: "seller",
    location: "Quận Hải Châu, Đà Nẵng", verified: true, joined: "2023-09-15T11:10:42.127Z",
    sales: 144, avgRating: 4.2, totalRevenue: 490117219,
    bio: "Shop thời trang secondhand chất lượng cao.", coins: 76132, rating: 4.2,
    following: ["u1"], followers: ["u1", "u4"], cart: [],
    addresses: [{ id: "addr1", name: "Lê Hoàng Yến", phone: "0905678901", address: "88 Trần Phú", city: "Đà Nẵng", isDefault: true }]
  },
  {
    id: "u4", name: "Phạm Minh Tuấn", email: "tuan.pham@yahoo.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=49", role: "seller",
    location: "Thành phố Hải Phòng", verified: true, joined: "2022-09-04T11:17:42.264Z",
    sales: 59, avgRating: 4.9, totalRevenue: 460169521,
    bio: "Bán đồ điện tử, máy tính chính hãng.", coins: 2025, rating: 4.9,
    following: ["u2"], followers: ["u1"], cart: [],
    addresses: [{ id: "addr1", name: "Phạm Minh Tuấn", phone: "0912345600", address: "29 Lê Lợi", city: "Hải Phòng", isDefault: true }]
  },
  {
    id: "u5", name: "Hoàng Kim Ngọc", email: "ngoc.hoang@gmail.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=14", role: "seller",
    location: "Quận Đống Đa, Hà Nội", verified: true, joined: "2022-11-30T23:08:14.062Z",
    sales: 85, avgRating: 4.3, totalRevenue: 325885946,
    bio: "Thanh lý đồ gia đình và nội thất.", coins: 37104, rating: 4.3,
    following: [], followers: ["u1", "u2"], cart: [],
    addresses: [{ id: "addr1", name: "Hoàng Kim Ngọc", phone: "0978265507", address: "14 Tôn Đức Thắng", city: "Hà Nội", isDefault: true }]
  },
  {
    id: "u6", name: "Vũ Đức Trí", email: "tri.vu@hotmail.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=32", role: "user",
    location: "Quận 1, TP. Hồ Chí Minh", verified: true, joined: "2024-01-26T01:21:18.517Z",
    sales: 143, avgRating: 4.3, totalRevenue: 112541687,
    bio: "Mình bán đồ dùng cá nhân ít dùng.", coins: 23010, rating: 4.3,
    following: ["u3"], followers: [], cart: [],
    addresses: [{ id: "addr1", name: "Vũ Đức Trí", phone: "0909367351", address: "77 Lý Tự Trọng", city: "TP. Hồ Chí Minh", isDefault: true }]
  },
  {
    id: "u7", name: "Đặng Thu Thủy", email: "thuy.dang@gmail.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=31", role: "seller",
    location: "Thành phố Cần Thơ", verified: false, joined: "2023-06-27T21:40:48.819Z",
    sales: 175, avgRating: 3.9, totalRevenue: 281888182,
    bio: "Shop mẹ và bé uy tín tại Cần Thơ.", coins: 61278, rating: 3.9,
    following: [], followers: ["u1"], cart: [],
    addresses: [{ id: "addr1", name: "Đặng Thu Thủy", phone: "0902032374", address: "55 Ngô Quyền", city: "Cần Thơ", isDefault: true }]
  },
  {
    id: "u8", name: "Bùi Trọng Nghĩa", email: "nghia.bui@gmail.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=33", role: "user",
    location: "Thành phố Vinh, Nghệ An", verified: true, joined: "2024-03-10T08:00:00.000Z",
    sales: 22, avgRating: 4.6, totalRevenue: 55000000,
    bio: "Bán sách cũ và đồ sưu tầm.", coins: 8000, rating: 4.6,
    following: ["u1", "u4"], followers: ["u3"], cart: [],
    addresses: [{ id: "addr1", name: "Bùi Trọng Nghĩa", phone: "0916000111", address: "10 Lê Hồng Phong", city: "Vinh", isDefault: true }]
  },
  {
    id: "u9", name: "Đỗ Mai Phương", email: "phuong.do@gmail.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=48", role: "seller",
    location: "Thành phố Nha Trang, Khánh Hòa", verified: true, joined: "2023-01-05T00:00:00.000Z",
    sales: 67, avgRating: 4.7, totalRevenue: 198000000,
    bio: "Chuyên phụ kiện thời trang và đồng hồ.", coins: 15000, rating: 4.7,
    following: ["u5"], followers: ["u6", "u8"], cart: [],
    addresses: [{ id: "addr1", name: "Đỗ Mai Phương", phone: "0935111222", address: "32 Nguyễn Thiện Thuật", city: "Nha Trang", isDefault: true }]
  },
  {
    id: "u10", name: "Hồ Quang Hiếu", email: "hieu.ho@gmail.com", password: "demo",
    avatar: "https://i.pravatar.cc/150?img=13", role: "seller",
    location: "Thành phố Huế", verified: false, joined: "2024-07-20T12:00:00.000Z",
    sales: 11, avgRating: 4.1, totalRevenue: 32000000,
    bio: "Thanh lý đồ xe cộ và phụ tùng.", coins: 3500, rating: 4.1,
    following: [], followers: ["u2"], cart: [],
    addresses: [{ id: "addr1", name: "Hồ Quang Hiếu", phone: "0901999888", address: "9 Lê Lợi", city: "Huế", isDefault: true }]
  },
];

// ─── PRODUCTS ─────────────────────────────────────────────────
const products = [
  // Điện tử (c1)
  { id: "p1", title: "iPhone 14 Pro Max 256GB VN/A Tím", price: 22500000, category: "c1", condition: "Như mới", sellerId: "u4", location: "Thành phố Hải Phòng", description: "Máy dùng ốp từ ngày đầu, pin còn 91%, Full hộp phụ kiện gốc. Bán vì lên đời.", images: ["https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600"], shipping: 0, specs: { brand: "Apple", storage: "256GB", color: "Tím" }, createdAt: "2026-04-10T08:00:00.000Z", views: 823, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p2", title: "MacBook Air M2 8/256 Midnight 2022", price: 24800000, category: "c1", condition: "Như mới", sellerId: "u1", location: "TP. Hồ Chí Minh", description: "Mua tháng 12/2022, dùng nhẹ, không trầy. Kèm túi chính hãng.", images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"], shipping: 0, specs: { brand: "Apple", chip: "M2", ram: "8GB", storage: "256GB" }, createdAt: "2026-03-28T10:00:00.000Z", views: 1540, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p3", title: "Laptop Dell XPS 15 9500 i7/16/512", price: 19500000, category: "c1", condition: "Rất tốt", sellerId: "u4", location: "Thành phố Hải Phòng", description: "Máy đẹp 95%, pin 5-6 tiếng, chạy mượt mà. Kèm cáp sạc gốc.", images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600"], shipping: 50000, specs: { brand: "Dell", cpu: "i7-10750H", ram: "16GB", storage: "512GB SSD" }, createdAt: "2026-03-15T07:00:00.000Z", views: 674, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p4", title: "Tai nghe Sony WH-1000XM5 Chống ồn", price: 5800000, category: "c1", condition: "Như mới", sellerId: "u9", location: "Thành phố Nha Trang, Khánh Hòa", description: "Mua tháng 2/2025, dùng chưa đến 1 tháng. Full hộp, bảo hành còn 10 tháng.", images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600"], shipping: 30000, specs: { brand: "Sony", type: "Over-ear", ANC: "Yes" }, createdAt: "2026-04-01T09:00:00.000Z", views: 412, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p5", title: "iPad Air 5 M1 Wi-Fi 64GB Xanh Dương", price: 12500000, category: "c1", condition: "Rất tốt", sellerId: "u3", location: "Quận Hải Châu, Đà Nẵng", description: "Nguyên bản, pin 88%, có Apple Pencil 2 tặng kèm.", images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600"], shipping: 0, specs: { brand: "Apple", chip: "M1", storage: "64GB", connectivity: "Wi-Fi" }, createdAt: "2026-02-20T14:00:00.000Z", views: 988, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p6", title: "Samsung Galaxy S24 Ultra 256GB Đen", price: 26000000, category: "c1", condition: "Như mới", sellerId: "u6", location: "Quận 1, TP. Hồ Chí Minh", description: "Máy còn bảo hành 8 tháng, kèm S-Pen, ốp lưng gốc.", images: ["https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600"], shipping: 0, specs: { brand: "Samsung", storage: "256GB", color: "Đen" }, createdAt: "2026-04-05T11:00:00.000Z", views: 556, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p7", title: "Màn hình LG 27UK850-W 4K IPS 27inch", price: 5200000, category: "c1", condition: "Tốt", sellerId: "u4", location: "Thành phố Hải Phòng", description: "Màn hình đẹp, không pixel lỗi. Kèm cáp DisplayPort.", images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600"], shipping: 100000, specs: { brand: "LG", size: "27 inch", resolution: "4K", panel: "IPS" }, createdAt: "2026-01-10T08:00:00.000Z", views: 345, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p8", title: "Apple Watch Series 8 45mm GPS Xám", price: 7200000, category: "c1", condition: "Như mới", sellerId: "u1", location: "TP. Hồ Chí Minh", description: "Đồng hồ đẹp như mới, pin còn tốt. Kèm 2 dây đeo.", images: ["https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600"], shipping: 0, specs: { brand: "Apple", size: "45mm", connectivity: "GPS" }, createdAt: "2026-03-01T13:00:00.000Z", views: 791, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Thời trang (c2)
  { id: "p9", title: "Áo khoác The North Face Gore-Tex Đen Size L", price: 1200000, category: "c2", condition: "Rất tốt", sellerId: "u3", location: "Quận Hải Châu, Đà Nẵng", description: "Áo mua ở Mỹ, dùng 3 lần, chống nước cực tốt. Size L (vừa người 65-75kg).", images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=600"], shipping: 30000, specs: { brand: "The North Face", size: "L", color: "Đen" }, createdAt: "2026-03-10T10:00:00.000Z", views: 280, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p10", title: "Giày Nike Air Force 1 Low Trắng Size 42", price: 1500000, category: "c2", condition: "Như mới", sellerId: "u6", location: "Quận 1, TP. Hồ Chí Minh", description: "Giày real, mua tại NikeID, dùng 2-3 lần. Full box bill.", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"], shipping: 30000, specs: { brand: "Nike", size: "42", color: "Trắng" }, createdAt: "2026-04-08T15:00:00.000Z", views: 620, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p11", title: "Túi Tote Canvas Uniqlo beige", price: 180000, category: "c2", condition: "Như mới", sellerId: "u5", location: "Quận Đống Đa, Hà Nội", description: "Mua 2 dùng 1, nguyên tag. Màu beige nhẹ nhàng.", images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"], shipping: 25000, specs: { brand: "Uniqlo", color: "Beige" }, createdAt: "2026-04-12T09:00:00.000Z", views: 167, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p12", title: "Đầm midi linen trắng size S mới 100%", price: 320000, category: "c2", condition: "Như mới", sellerId: "u3", location: "Quận Hải Châu, Đà Nẵng", description: "Mua online nhưng size hơi rộng. Còn nguyên tag giá 480k.", images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600"], shipping: 25000, specs: { material: "Linen", size: "S", color: "Trắng" }, createdAt: "2026-04-14T08:00:00.000Z", views: 231, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Nhà & Vườn (c3)
  { id: "p13", title: "Ghế công thái học Ergohuman ME7ERG Đen", price: 5500000, category: "c3", condition: "Tốt", sellerId: "u5", location: "Quận Đống Đa, Hà Nội", description: "Ghế ngồi siêu tốt cho dân văn phòng, dùng 1.5 năm, còn rất chắc chắn.", images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600"], shipping: 200000, specs: { brand: "Ergohuman", type: "Lưới" }, createdAt: "2026-02-01T08:00:00.000Z", views: 510, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p14", title: "Nồi chiên không dầu Xiaomi Smart 6L", price: 850000, category: "c3", condition: "Rất tốt", sellerId: "u7", location: "Thành phố Cần Thơ", description: "Mới dùng 4 tháng, còn bảo hành 8 tháng. Kết nối app điện thoại.", images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600"], shipping: 50000, specs: { brand: "Xiaomi", capacity: "6L" }, createdAt: "2026-04-02T10:00:00.000Z", views: 389, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p15", title: "Robot hút bụi Roborock S7 Max Ultra", price: 8200000, category: "c3", condition: "Như mới", sellerId: "u1", location: "TP. Hồ Chí Minh", description: "Dùng 2 tháng, còn bảo hành 10 tháng. Kèm dock rửa lau tự động.", images: ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600"], shipping: 0, specs: { brand: "Roborock", model: "S7 Max Ultra" }, createdAt: "2026-03-20T14:00:00.000Z", views: 745, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Sách (c4)
  { id: "p16", title: "Trọn bộ Harry Potter 7 tập bìa cứng", price: 1200000, category: "c4", condition: "Rất tốt", sellerId: "u8", location: "Thành phố Vinh, Nghệ An", description: "Bản bìa cứng đặc biệt 20 năm, còn rất mới. Tặng kèm hộp đựng gốc.", images: ["https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=600"], shipping: 30000, specs: { publisher: "NXB Trẻ", language: "Tiếng Việt" }, createdAt: "2026-01-15T08:00:00.000Z", views: 432, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p17", title: "Bộ sách Kỹ năng lập trình Python (5 cuốn)", price: 450000, category: "c4", condition: "Tốt", sellerId: "u8", location: "Thành phố Vinh, Nghệ An", description: "Dùng học xong, còn sạch sẽ ít bút chì ghi chú. Phù hợp người mới bắt đầu.", images: ["https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600"], shipping: 30000, specs: { topic: "Programming", language: "Tiếng Việt" }, createdAt: "2026-02-10T11:00:00.000Z", views: 198, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p18", title: "Đắc Nhân Tâm - Bìa Cứng Mạ Vàng", price: 95000, category: "c4", condition: "Như mới", sellerId: "u5", location: "Quận Đống Đa, Hà Nội", description: "Mua về tặng người thân nhưng họ đã có rồi. Còn nguyên seal.", images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"], shipping: 20000, specs: { publisher: "First News", author: "Dale Carnegie" }, createdAt: "2026-04-15T08:00:00.000Z", views: 87, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Thể thao (c5)
  { id: "p19", title: "Vợt cầu lông Yonex Astrox 88D Pro", price: 2800000, category: "c5", condition: "Rất tốt", sellerId: "u6", location: "Quận 1, TP. Hồ Chí Minh", description: "Vợt chuyên công, dùng khoảng 15 buổi, còn căng dây tốt.", images: ["https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600"], shipping: 30000, specs: { brand: "Yonex", model: "Astrox 88D Pro", weight: "4U" }, createdAt: "2026-03-25T09:00:00.000Z", views: 321, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p20", title: "Xe đạp thể thao Giant ATX 810 2023", price: 5800000, category: "c5", condition: "Tốt", sellerId: "u10", location: "Thành phố Huế", description: "Đi được khoảng 500km, lốp mới thay, phanh đĩa còn tốt.", images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"], shipping: 300000, specs: { brand: "Giant", model: "ATX 810", year: "2023" }, createdAt: "2026-02-28T10:00:00.000Z", views: 492, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Xe cộ (c6)
  { id: "p21", title: "Xe máy Honda Vision 2022 Chính chủ", price: 32000000, category: "c6", condition: "Rất tốt", sellerId: "u10", location: "Thành phố Huế", description: "Xe chính chủ nữ đi, đi được 12.000km, máy zin 100%, còn bảo hành.", images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"], shipping: 0, specs: { brand: "Honda", model: "Vision 2022", km: "12.000" }, createdAt: "2026-04-01T08:00:00.000Z", views: 1230, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Mẹ & Bé (c7)
  { id: "p22", title: "Máy hút sữa Medela Pump In Style", price: 2800000, category: "c7", condition: "Rất tốt", sellerId: "u7", location: "Thành phố Cần Thơ", description: "Dùng được 4 tháng, vệ sinh sạch sẽ. Kèm phụ kiện đầy đủ.", images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600"], shipping: 30000, specs: { brand: "Medela", model: "Pump In Style" }, createdAt: "2026-03-05T11:00:00.000Z", views: 276, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p23", title: "Xe đẩy em bé Joie Mytrax Flex", price: 4500000, category: "c7", condition: "Tốt", sellerId: "u7", location: "Thành phố Cần Thơ", description: "Con lớn rồi nên thanh lý. Xe còn đẹp, sạch, đầy đủ phụ kiện.", images: ["https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600"], shipping: 150000, specs: { brand: "Joie", model: "Mytrax Flex" }, createdAt: "2026-02-14T09:00:00.000Z", views: 344, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Phụ kiện (c8)
  { id: "p24", title: "Đồng hồ Casio G-Shock GA-2100 Đen Vàng", price: 2100000, category: "c8", condition: "Như mới", sellerId: "u9", location: "Thành phố Nha Trang, Khánh Hòa", description: "Mua tháng 9/2025, đeo được 2 lần. Full hộp đầy đủ.", images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"], shipping: 25000, specs: { brand: "Casio", model: "GA-2100", color: "Đen Vàng" }, createdAt: "2026-04-09T08:00:00.000Z", views: 567, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p25", title: "Kính Ray-Ban Aviator Classic Gold", price: 1800000, category: "c8", condition: "Rất tốt", sellerId: "u3", location: "Quận Hải Châu, Đà Nẵng", description: "Kính real mua tại Singapore, dùng 6 tháng, không trầy.", images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600"], shipping: 25000, specs: { brand: "Ray-Ban", model: "Aviator Classic", color: "Gold" }, createdAt: "2026-03-18T14:00:00.000Z", views: 312, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Nội thất (c9)
  { id: "p26", title: "Bàn làm việc gỗ thông nguyên tấm 140x70cm", price: 1500000, category: "c9", condition: "Tốt", sellerId: "u5", location: "Quận Đống Đa, Hà Nội", description: "Gỗ thông tự nhiên đẹp, chân sắt chắc chắn. Thanh lý vì chuyển nhà.", images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600"], shipping: 200000, specs: { material: "Gỗ thông", dimensions: "140x70cm" }, createdAt: "2026-03-12T10:00:00.000Z", views: 428, format: "Bán ngay", bids: 0, currentBid: 0 },
  { id: "p27", title: "Kệ sách 5 tầng gỗ MDF trắng 80cm", price: 680000, category: "c9", condition: "Rất tốt", sellerId: "u2", location: "Quận Cầu Giấy, Hà Nội", description: "Kệ đẹp, mới dùng 6 tháng. Có thể tháo rời để vận chuyển.", images: ["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600"], shipping: 100000, specs: { material: "MDF", color: "Trắng", height: "150cm" }, createdAt: "2026-04-03T09:00:00.000Z", views: 190, format: "Bán ngay", bids: 0, currentBid: 0 },

  // Đồ cổ & Sưu tầm (c10)
  { id: "p28", title: "Đồng hồ quả lắc Hermle vai bò 1970s", price: 8500000, category: "c10", condition: "Tốt", sellerId: "u8", location: "Thành phố Vinh, Nghệ An", description: "Đồng hồ cổ Đức sản xuất thập niên 70, chạy tốt, âm thanh chuông đẹp.", images: ["https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=600"], shipping: 100000, specs: { brand: "Hermle", year: "~1970", origin: "Đức" }, createdAt: "2026-01-20T08:00:00.000Z", views: 334, format: "Đấu giá", bids: 5, currentBid: 8500000 },
  { id: "p29", title: "Máy ảnh film Nikon FM2 body + lens 50mm", price: 4200000, category: "c10", condition: "Rất tốt", sellerId: "u6", location: "Quận 1, TP. Hồ Chí Minh", description: "Body nguyên bản, màn ngắm sáng, bộ đôi kinh điển.", images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600"], shipping: 50000, specs: { brand: "Nikon", model: "FM2", lens: "50mm f/1.4" }, createdAt: "2026-02-05T15:00:00.000Z", views: 678, format: "Đấu giá", bids: 8, currentBid: 4200000 },
  { id: "p30", title: "Bộ đĩa than Beatles Abbey Road Limited", price: 1200000, category: "c10", condition: "Như mới", sellerId: "u8", location: "Thành phố Vinh, Nghệ An", description: "Bản giới hạn 50 năm, còn nguyên seal chưa mở.", images: ["https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600"], shipping: 30000, specs: { artist: "The Beatles", album: "Abbey Road", edition: "50th Anniversary" }, createdAt: "2026-03-22T12:00:00.000Z", views: 215, format: "Bán ngay", bids: 0, currentBid: 0 },
];

// ─── ORDERS ───────────────────────────────────────────────────
const orders = [
  {
    id: "o1", buyerId: "u2", sellerId: "u4", productId: "p3",
    status: "completed", totalAmount: 19700000, shippingFee: 50000,
    paymentMethod: "bank_transfer",
    shippingAddress: { name: "Minh Nguyễn", phone: "0904018696", address: "551 Đinh Tiên Hoàng", city: "Hà Nội" },
    createdAt: "2026-03-18T10:00:00.000Z",
    history: [
      { status: "pending", time: "18/03/2026 10:00" },
      { status: "paid", time: "18/03/2026 10:30" },
      { status: "shipping", time: "19/03/2026 08:00" },
      { status: "completed", time: "21/03/2026 15:00" }
    ]
  },
  {
    id: "o2", buyerId: "u6", sellerId: "u1", productId: "p2",
    status: "shipping", totalAmount: 24800000, shippingFee: 0,
    paymentMethod: "cod",
    shippingAddress: { name: "Vũ Đức Trí", phone: "0909367351", address: "77 Lý Tự Trọng", city: "TP. Hồ Chí Minh" },
    createdAt: "2026-04-30T14:00:00.000Z",
    history: [
      { status: "pending", time: "30/04/2026 14:00" },
      { status: "paid", time: "30/04/2026 14:05" },
      { status: "shipping", time: "01/05/2026 09:00" }
    ]
  },
  {
    id: "o3", buyerId: "u3", sellerId: "u9", productId: "p24",
    status: "completed", totalAmount: 2125000, shippingFee: 25000,
    paymentMethod: "momo",
    shippingAddress: { name: "Lê Hoàng Yến", phone: "0905678901", address: "88 Trần Phú", city: "Đà Nẵng" },
    createdAt: "2026-04-15T09:00:00.000Z",
    history: [
      { status: "pending", time: "15/04/2026 09:00" },
      { status: "paid", time: "15/04/2026 09:15" },
      { status: "shipping", time: "16/04/2026 10:00" },
      { status: "completed", time: "18/04/2026 16:30" }
    ]
  },
  {
    id: "o4", buyerId: "u5", sellerId: "u7", productId: "p22",
    status: "pending", totalAmount: 2830000, shippingFee: 30000,
    paymentMethod: "bank_transfer",
    shippingAddress: { name: "Hoàng Kim Ngọc", phone: "0978265507", address: "14 Tôn Đức Thắng", city: "Hà Nội" },
    createdAt: "2026-05-04T11:00:00.000Z",
    history: [{ status: "pending", time: "04/05/2026 11:00" }]
  },
  {
    id: "o5", buyerId: "u8", sellerId: "u10", productId: "p20",
    status: "cancelled", totalAmount: 6100000, shippingFee: 300000,
    paymentMethod: "cod",
    shippingAddress: { name: "Bùi Trọng Nghĩa", phone: "0916000111", address: "10 Lê Hồng Phong", city: "Vinh" },
    createdAt: "2026-04-25T08:00:00.000Z",
    history: [
      { status: "pending", time: "25/04/2026 08:00" },
      { status: "cancelled", time: "25/04/2026 10:00" }
    ]
  },
  {
    id: "o6", buyerId: "u1", sellerId: "u8", productId: "p16",
    status: "completed", totalAmount: 1230000, shippingFee: 30000,
    paymentMethod: "momo",
    shippingAddress: { name: "Linh Trần", phone: "0947460977", address: "123 Nguyễn Huệ", city: "TP. Hồ Chí Minh" },
    createdAt: "2026-03-02T12:00:00.000Z",
    history: [
      { status: "pending", time: "02/03/2026 12:00" },
      { status: "paid", time: "02/03/2026 12:30" },
      { status: "shipping", time: "03/03/2026 08:00" },
      { status: "completed", time: "05/03/2026 14:00" }
    ]
  },
];

// ─── REVIEWS ──────────────────────────────────────────────────
const reviews = [
  { id: "r1", productId: "p3", orderId: "o1", buyerId: "u2", sellerId: "u4", rating: 5, comment: "Máy đúng như mô tả, seller giao hàng nhanh, đóng gói cẩn thận. Sẽ mua lại!", createdAt: "2026-03-22T10:00:00.000Z" },
  { id: "r2", productId: "p24", orderId: "o3", buyerId: "u3", sellerId: "u9", rating: 5, comment: "Đồng hồ đẹp y hình, chất lượng tốt. Seller nhiệt tình tư vấn.", createdAt: "2026-04-19T11:00:00.000Z" },
  { id: "r3", productId: "p16", orderId: "o6", buyerId: "u1", sellerId: "u8", rating: 4, comment: "Sách còn đẹp, đóng gói cẩn thận. Giao hàng hơi chậm 1 ngày nhưng chấp nhận được.", createdAt: "2026-03-06T15:00:00.000Z" },
  { id: "r4", productId: "p5", orderId: null, buyerId: "u6", sellerId: "u3", rating: 5, comment: "iPad chất lượng tuyệt vời, kèm bút Apple Pencil rất đáng đồng tiền!", createdAt: "2026-02-28T09:00:00.000Z" },
  { id: "r5", productId: "p13", orderId: null, buyerId: "u2", sellerId: "u5", rating: 4, comment: "Ghế ngồi êm ái, đúng như mô tả 95%. Seller hỗ trợ giao tận nhà.", createdAt: "2026-02-15T14:00:00.000Z" },
];

// ─── COUPONS ──────────────────────────────────────────────────
const coupons = [
  { id: "cp1", code: "FREESHIP50", type: "freeship", category: "shipping", discount: 0, maxDiscount: 50000, minOrder: 150000, limit: 100, used: 15, expiry: "2026-06-30T23:59:59.000Z", desc: "Miễn phí vận chuyển tối đa 50K", isActive: true },
  { id: "cp2", code: "HANDON10", type: "percent", category: "global", discount: 10, maxDiscount: 50000, minOrder: 0, limit: 100, used: 22, expiry: "2027-02-28T23:59:59.000Z", desc: "Giảm 10% tổng đơn hàng (Tối đa 50K)", isActive: true },
  { id: "cp3", code: "APPLE500", type: "fixed", category: "shop", discount: 500000, maxDiscount: 500000, minOrder: 10000000, limit: 10, used: 2, expiry: "2026-11-30T23:59:59.000Z", desc: "Mã giảm 500K cho đơn hàng Apple từ 10 triệu", isActive: true },
  { id: "cp4", code: "NEWUSER30", type: "percent", category: "global", discount: 30, maxDiscount: 100000, minOrder: 0, limit: 200, used: 0, expiry: "2026-12-31T23:59:59.000Z", desc: "Ưu đãi 30% cho người dùng mới (Tối đa 100K)", isActive: true },
  { id: "cp5", code: "SUMMER2026", type: "fixed", category: "global", discount: 200000, maxDiscount: 200000, minOrder: 2000000, limit: 50, used: 5, expiry: "2026-08-31T23:59:59.000Z", desc: "Mã mùa hè - Giảm 200K cho đơn từ 2 triệu", isActive: true },
];

// ─── FLASH SALES ──────────────────────────────────────────────
const flashSales = [
  {
    id: "fs1", name: "Flash Sale Thứ 6 Vui Vẻ", discount: 30,
    startTime: "2026-05-08T12:00:00.000Z", endTime: "2026-05-08T14:00:00.000Z",
    productIds: ["p1", "p4", "p8", "p9", "p24"],
    isActive: true
  },
  {
    id: "fs2", name: "Deal Cuối Tuần - Điện tử giảm sốc", discount: 20,
    startTime: "2026-05-10T08:00:00.000Z", endTime: "2026-05-11T23:59:00.000Z",
    productIds: ["p2", "p3", "p5", "p6", "p7"],
    isActive: true
  },
  {
    id: "fs3", name: "Thanh Lý Nhanh - Giảm 15%", discount: 15,
    startTime: "2026-05-05T00:00:00.000Z", endTime: "2026-05-07T23:59:00.000Z",
    productIds: ["p10", "p11", "p12", "p13", "p14"],
    isActive: false
  },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────
const notifications = [
  { id: "n1", userId: "u2", type: "order", title: "Đơn hàng đang giao", body: "Đơn hàng #o2 MacBook Air M2 của bạn đang trên đường giao.", isRead: false, createdAt: "2026-05-01T09:00:00.000Z", link: "/orders/o2" },
  { id: "n2", userId: "u4", type: "order", title: "Bạn có đơn hàng mới", body: "Có người vừa đặt mua Dell XPS 15 của bạn. Xác nhận ngay!", isRead: false, createdAt: "2026-05-04T11:05:00.000Z", link: "/seller/orders" },
  { id: "n3", userId: "u5", type: "order", title: "Đơn hàng chờ thanh toán", body: "Đơn #o4 máy hút sữa Medela đang chờ người mua thanh toán.", isRead: true, createdAt: "2026-05-04T11:00:00.000Z", link: "/orders/o4" },
  { id: "n4", userId: "u1", type: "system", title: "Hệ thống bảo trì 23:00 hôm nay", body: "Hệ thống sẽ bảo trì từ 23:00-01:00. Một số tính năng có thể gián đoạn.", isRead: true, createdAt: "2026-05-03T18:00:00.000Z", link: null },
  { id: "n5", userId: "u3", type: "review", title: "Bạn có đánh giá mới", body: "Người mua vừa đánh giá 5 sao cho sản phẩm đồng hồ G-Shock của bạn!", isRead: false, createdAt: "2026-04-19T11:30:00.000Z", link: "/seller/reviews" },
  { id: "n6", userId: "u6", type: "promo", title: "Flash Sale bắt đầu trong 2 giờ", body: "Flash Sale Thứ 6 Vui Vẻ sắp bắt đầu! Đừng bỏ lỡ giảm đến 30%.", isRead: false, createdAt: "2026-05-08T10:00:00.000Z", link: "/flash-sale" },
  { id: "n7", userId: "u2", type: "review", title: "Đánh giá của bạn được ghi nhận", body: "Cảm ơn bạn đã đánh giá đơn hàng Dell XPS 15. Đánh giá đã được đăng!", isRead: true, createdAt: "2026-03-22T10:30:00.000Z", link: "/reviews/r1" },
  { id: "n8", userId: "u8", type: "promo", title: "Coupon mới cho bạn", body: "Bạn vừa nhận được coupon NEWUSER30 - Giảm 30% cho đơn hàng đầu tiên!", isRead: false, createdAt: "2026-04-01T08:00:00.000Z", link: "/coupons" },
];

// ─── MESSAGES ─────────────────────────────────────────────────
const messages = [
  { id: "m1", senderId: "u2", receiverId: "u4", productId: "p3", content: "Bạn ơi, máy còn bảo hành không ạ? Mình quan tâm muốn mua.", createdAt: "2026-03-16T09:00:00.000Z", isRead: true },
  { id: "m2", senderId: "u4", receiverId: "u2", productId: "p3", content: "Máy còn bảo hành chính hãng Dell 4 tháng bạn nhé. Bạn muốn xem máy trực tiếp không?", createdAt: "2026-03-16T09:30:00.000Z", isRead: true },
  { id: "m3", senderId: "u2", receiverId: "u4", productId: "p3", content: "Cho mình hỏi giá có thể giảm thêm không ạ?", createdAt: "2026-03-16T10:00:00.000Z", isRead: true },
  { id: "m4", senderId: "u4", receiverId: "u2", productId: "p3", content: "Bạn ơi giá này mình đã fix rồi, nhưng mình sẽ tặng kèm túi chống sốc nhé!", createdAt: "2026-03-16T10:15:00.000Z", isRead: true },
  { id: "m5", senderId: "u6", receiverId: "u1", productId: "p2", content: "MacBook còn không ạ? Mình muốn mua ngay hôm nay.", createdAt: "2026-04-29T14:00:00.000Z", isRead: true },
  { id: "m6", senderId: "u1", receiverId: "u6", productId: "p2", content: "Còn bạn ơi! Bạn ở đâu để mình ship hoặc gặp mặt trao đổi?", createdAt: "2026-04-29T14:05:00.000Z", isRead: true },
  { id: "m7", senderId: "u3", receiverId: "u9", productId: "p24", content: "Bạn cho mình hỏi đồng hồ có kèm hộp và giấy tờ gốc không?", createdAt: "2026-04-14T08:00:00.000Z", isRead: true },
  { id: "m8", senderId: "u9", receiverId: "u3", productId: "p24", content: "Có đầy đủ hộp, manual, và bill mua hàng bạn nhé!", createdAt: "2026-04-14T08:30:00.000Z", isRead: true },
  { id: "m9", senderId: "u5", receiverId: "u7", productId: "p22", content: "Máy hút sữa còn đủ phụ kiện không bạn? Mình cần mua gấp.", createdAt: "2026-05-03T10:00:00.000Z", isRead: false },
];

// ─── Q&A ──────────────────────────────────────────────────────
const qna = [
  { id: "q1", productId: "p1", userId: "u5", question: "Máy có bị iCloud lock không bạn?", answer: "Không bạn ơi, máy clean 100%, có thể kích hoạt bình thường.", answeredAt: "2026-04-11T10:00:00.000Z", createdAt: "2026-04-11T09:00:00.000Z" },
  { id: "q2", productId: "p2", userId: "u3", question: "MacBook có vết trầy không bạn?", answer: "Không có vết trầy, máy đẹp 99% bạn nhé!", answeredAt: "2026-03-29T08:00:00.000Z", createdAt: "2026-03-28T20:00:00.000Z" },
  { id: "q3", productId: "p21", userId: "u8", question: "Xe có sổ đăng ký chính chủ chưa?", answer: "Xe chính chủ tên mình, sang tên dễ dàng bạn ơi.", answeredAt: "2026-04-02T09:00:00.000Z", createdAt: "2026-04-02T08:00:00.000Z" },
  { id: "q4", productId: "p28", userId: "u2", question: "Đồng hồ có chứng nhận xuất xứ không?", answer: null, answeredAt: null, createdAt: "2026-05-01T14:00:00.000Z" },
  { id: "q5", productId: "p4", userId: "u7", question: "Tai nghe kết nối multipoint không bạn?", answer: "Có bạn, kết nối được 2 thiết bị cùng lúc.", answeredAt: "2026-04-03T10:00:00.000Z", createdAt: "2026-04-02T16:00:00.000Z" },
];

// ─── SETTINGS ─────────────────────────────────────────────────
const settings = [
  {
    id: "system",
    maintenanceMode: false,
    platformFee: 5,
    allowRegistration: true,
    maxImagesPerProduct: 8,
    flashSaleEnabled: true,
    reviewEnabled: true,
    chatEnabled: true,
    siteName: "Hand-Me-On",
    supportEmail: "support@hand-me-on.vn",
    updatedAt: "2026-05-01T00:00:00.000Z"
  }
];

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
const RESOURCES = [
  { key: "categories", data: categories },
  { key: "users", data: users },
  { key: "products", data: products },
  { key: "orders", data: orders },
  { key: "reviews", data: reviews },
  { key: "coupons", data: coupons },
  { key: "flashSales", data: flashSales },
  { key: "notifications", data: notifications },
  { key: "messages", data: messages },
  { key: "qna", data: qna },
  { key: "settings", data: settings },
];

async function main() {
  console.log("🚀 Bắt đầu seed dữ liệu lên MockAPI...");
  console.log(`   URL: ${API_URL}\n`);
  console.log("⚠️  Lưu ý: Đảm bảo đã tạo đủ các resource sau trong MockAPI dashboard:");
  console.log("   categories, users, products, orders, reviews, coupons,");
  console.log("   flashSales, notifications, messages, qna, settings\n");

  for (const { key, data } of RESOURCES) {
    await seedResource(key, data);
    await delay(300);
  }

  console.log("\n✨ Seed hoàn tất!");
  console.log("\n📊 Tổng kết dữ liệu đã seed:");
  for (const { key, data } of RESOURCES) {
    console.log(`   ${key.padEnd(16)} → ${data.length} items`);
  }
}

main().catch(console.error);