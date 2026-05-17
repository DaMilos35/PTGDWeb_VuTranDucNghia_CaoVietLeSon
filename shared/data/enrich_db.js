const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Add Super Sales
db.superSales = [
  { id: "ss1", productId: "p1", salePrice: 199000, discount: 50, endTime: new Date(Date.now() + 86400000).toISOString(), stock: 10, sold: 4 },
  { id: "ss2", productId: "p6", salePrice: 12500000, discount: 35, endTime: new Date(Date.now() + 43200000).toISOString(), stock: 5, sold: 1 },
  { id: "ss3", productId: "p13", salePrice: 8900000, discount: 40, endTime: new Date(Date.now() + 172800000).toISOString(), stock: 8, sold: 3 }
];

// 2. Add Combos
db.combos = [
  { id: "cb1", name: "Combo Game Thủ", productIds: ["p6", "p13"], price: 20000000, description: "Bàn phím cơ + Nintendo Switch OLED giá siêu hời!" },
  { id: "cb2", name: "Combo Phụ Kiện", productIds: ["p1", "p3"], price: 3500000, description: "Kính Ray-Ban + Dây đeo Apple Watch sang trọng." }
];

// 3. Add Lives
db.lives = [
  { id: "l1", title: "Thanh lý đồ Apple cực rẻ", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", productIds: ["p3", "p19"], viewers: 1429, status: "live" },
  { id: "l2", title: "Review Bàn phím & Chuột cơ", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", productIds: ["p6"], viewers: 850, status: "live" }
];

// 4. Add Suggestions/Admin Messages
db.adminMessages = [
  { id: "msg1", userId: "u2", content: "Đề xuất thêm danh mục Đồ dùng văn phòng.", type: "suggestion", status: "unread", createdAt: new Date().toISOString() }
];

// 5. Update Products with Videos
db.products.forEach(p => {
  if (p.id === 'p19') p.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  if (p.id === 'p1') p.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Database updated successfully with Super Sales, Combos, Lives, and Admin Messages.");
