export const initialUsers = [
  { id: "u1", name: "Linh Trần", email: "linh@example.com", password: "123456", role: "admin", avatar: "https://i.pravatar.cc/150?img=47", rating: 4.9, sales: 312, verified: true, joined: "2021-03-14", bio: "Admin hệ thống. Chuyên bán đồ công nghệ chính hãng.", location: "TP. Hồ Chí Minh", following: ["u4", "u7"], followers: ["u2", "u3", "u5"] },
  { id: "u2", name: "Minh Nguyễn", email: "minh@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=12", rating: 4.7, sales: 58, verified: true, joined: "2022-07-01", bio: "Mình bán đồ điện tử và thời trang. Hàng đảm bảo!", location: "Hà Nội", following: ["u1"], followers: ["u3", "u8"] },
  { id: "u3", name: "An Phạm", email: "an@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=32", rating: 4.5, sales: 21, verified: false, joined: "2023-01-20", bio: "Thanh lý đồ dùng cá nhân không dùng đến.", location: "Đà Nẵng", following: ["u1", "u2"], followers: [] },
  { id: "u4", name: "Hoàng Lê", email: "hoang@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=11", rating: 4.8, sales: 124, verified: true, joined: "2021-11-05", bio: "Đam mê săn đồ Vintage và máy ảnh cổ.", location: "Hà Nội", following: [], followers: ["u1", "u6"] },
  { id: "u5", name: "Hương Nguyễn", email: "huong@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=5", rating: 5.0, sales: 9, verified: false, joined: "2023-05-12", bio: "Chỉ bán đồ mỹ phẩm và sách mua dư.", location: "Cần Thơ", following: ["u1"], followers: [] },
  { id: "u6", name: "Tuấn Đạt", email: "tuan@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=15", rating: 4.2, sales: 45, verified: true, joined: "2022-02-18", bio: "Chuyên đồ thể thao và giày dép nam.", location: "Hải Phòng", following: ["u4"], followers: ["u9"] },
  { id: "u7", name: "Mai Trang", email: "mai@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=44", rating: 4.9, sales: 201, verified: true, joined: "2020-09-30", bio: "Đồ mẹ và bé thanh lý giá rẻ.", location: "TP. Hồ Chí Minh", following: [], followers: ["u1", "u10"] },
  { id: "u8", name: "Dũng Trí", email: "dung@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=59", rating: 4.6, sales: 12, verified: false, joined: "2023-08-22", bio: "Sinh viên thanh lý đồ dọn trọ.", location: "Hà Nội", following: ["u2"], followers: [] },
  { id: "u9", name: "Bích Phương", email: "bich@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=41", rating: 4.4, sales: 34, verified: true, joined: "2022-10-10", bio: "Pass lại váy áo chưa mặc lần nào.", location: "Nha Trang", following: ["u6"], followers: [] },
  { id: "u10", name: "Quốc Anh", email: "quoc@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=68", rating: 5.0, sales: 5, verified: false, joined: "2024-01-05", bio: "Bán đồ công nghệ ít xài.", location: "TP. Hồ Chí Minh", following: ["u7"], followers: [] },
  { id: "u11", name: "Thanh Trúc", email: "thanh@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=21", rating: 4.7, sales: 88, verified: true, joined: "2021-06-14", bio: "Decor phòng và nội thất.", location: "Đà Lạt", following: [], followers: [] },
  { id: "u12", name: "Bảo Trần", email: "bao@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=53", rating: 4.1, sales: 19, verified: false, joined: "2023-11-20", bio: "Xe cộ và phụ kiện xe máy.", location: "Đà Nẵng", following: [], followers: [] },
  { id: "u13", name: "Kim Oanh", email: "kim@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=33", rating: 4.9, sales: 156, verified: true, joined: "2020-12-01", bio: "Sách cũ, truyện tranh quý hiếm.", location: "Huế", following: [], followers: [] },
  { id: "u14", name: "Văn Hùng", email: "hung@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=60", rating: 4.5, sales: 27, verified: false, joined: "2023-04-10", bio: "Phụ kiện máy tính, bàn phím cơ.", location: "Biên Hòa", following: [], followers: [] },
  { id: "u15", name: "Ngọc Diệp", email: "ngoc@example.com", password: "123456", role: "user", avatar: "https://i.pravatar.cc/150?img=20", rating: 4.8, sales: 72, verified: true, joined: "2022-09-05", bio: "Thời trang thiết kế sang trọng.", location: "Hà Nội", following: [], followers: [] },
];



export const initialCategories = [
  { id: "c1", name: "Điện tử", icon: "💻", count: 1240 },
  { id: "c2", name: "Thời trang", icon: "👗", count: 3870 },
  { id: "c3", name: "Nhà & Vườn", icon: "🏡", count: 980 },
  { id: "c4", name: "Thể thao", icon: "⚽", count: 670 },
  { id: "c5", name: "Sách", icon: "📚", count: 2100 },
  { id: "c6", name: "Đồ chơi & Trẻ em", icon: "🧸", count: 540 },
  { id: "c7", name: "Xe cộ", icon: "🚗", count: 310 },
  { id: "c8", name: "Nghệ thuật & Thủ công", icon: "🎨", count: 420 },
];

export const initialConditions = [
  { value: "Như mới", label: "Như mới", desc: "Hầu như chưa dùng, hoàn hảo", emoji: "🌟" },
  { value: "Rất tốt", label: "Rất tốt", desc: "Ít dấu hiệu sử dụng", emoji: "✨" },
  { value: "Tốt", label: "Tốt", desc: "Dùng nhiều nhưng còn hoạt động tốt", emoji: "👍" },
  { value: "Khá", label: "Khá", desc: "Có hao mòn đáng kể", emoji: "📦" },
];

export const initialProducts = [
  // Điện tử (c1)
  { id: "p1", title: "Sony WH-1000XM5 - Tai Nghe Chống Ồn", price: 2800000, condition: "Như mới", category: "c1", sellerId: "u2", images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"], description: "Mới dùng 3 lần. Còn đầy đủ hộp, cáp và túi đựng. Không trầy xước.", specs: { brand: "Sony", warranty: "8 tháng", yearBought: "2023" }, location: "TP. Hồ Chí Minh", format: "buy-now", bids: 0, views: 241, watchers: 18, createdAt: "2024-05-10", endDate: null, shipping: 35000, tags: ["Điện tử", "Âm thanh"] },
  { id: "p3", title: "MacBook Air M2 - 8GB 256GB Màu Xám", price: 22500000, condition: "Như mới", category: "c1", sellerId: "u2", images: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600"], description: "Mua được 6 tháng. Apple Care đến 2026. Dưới đáy có trầy nhỏ.", specs: { brand: "Apple", warranty: "Đến 2026", yearBought: "2023" }, location: "Đà Nẵng", format: "buy-now", bids: 0, views: 520, watchers: 43, createdAt: "2024-05-08", endDate: null, shipping: 0, tags: ["Điện tử", "Apple"] },
  { id: "p6", title: "Máy Ảnh Canon EOS 90D - Body Only", price: 18500000, condition: "Tốt", category: "c1", sellerId: "u4", images: ["https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600"], description: "Số lần bấm ~12.000. Kèm battery grip. Hoạt động hoàn hảo.", specs: { brand: "Canon", warranty: "Hết bảo hành", yearBought: "2021" }, location: "Hà Nội", format: "auction", bids: 3, currentBid: 18800000, views: 310, watchers: 31, createdAt: "2024-05-07", endDate: "2024-06-25", shipping: 80000, tags: ["Máy ảnh", "Canon"] },
  { id: "p9", title: "iPad Pro 11 inch M2 - 256GB WiFi", price: 16500000, condition: "Như mới", category: "c1", sellerId: "u1", images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600"], description: "Mới mua 2 tháng. Kèm bao da Apple.", specs: { brand: "Apple", warranty: "10 tháng", yearBought: "2024" }, location: "TP. Hồ Chí Minh", format: "buy-now", bids: 0, views: 430, watchers: 55, createdAt: "2024-05-15", endDate: null, shipping: 0, tags: ["Điện tử", "Apple"] },
  { id: "p11", title: "DJI Mini 3 Pro - Drone Quay Phim 4K", price: 12800000, condition: "Như mới", category: "c1", sellerId: "u10", images: ["https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600"], description: "Bay khoảng 5 lần. Full phụ kiện, pin dự phòng x2. Chưa rơi.", specs: { brand: "DJI", warranty: "1 tháng", yearBought: "2023" }, location: "TP. Hồ Chí Minh", format: "auction", bids: 2, currentBid: 13000000, views: 178, watchers: 27, createdAt: "2024-05-17", endDate: "2024-07-01", shipping: 50000, tags: ["Điện tử", "Drone"] },
  { id: "p14", title: "Bàn phím cơ Keychron K8 Pro", price: 1500000, condition: "Rất tốt", category: "c1", sellerId: "u14", images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=600"], description: "Đã lube switch Gateron Brown. Gõ cực êm.", specs: { brand: "Keychron", warranty: "Hết bảo hành", yearBought: "2022" }, location: "Biên Hòa", format: "buy-now", bids: 0, views: 120, watchers: 8, createdAt: "2024-05-19", endDate: null, shipping: 25000, tags: ["Điện tử", "Bàn phím"] },
  { id: "p15", title: "Chuột Logitech MX Master 3S", price: 1800000, condition: "Tốt", category: "c1", sellerId: "u1", images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"], description: "Chuột làm việc đỉnh cao. Pin còn rất trâu.", specs: { brand: "Logitech", warranty: "Hết bảo hành", yearBought: "2022" }, location: "TP. Hồ Chí Minh", format: "buy-now", bids: 0, views: 89, watchers: 15, createdAt: "2024-05-20", endDate: null, shipping: 15000, tags: ["Điện tử", "Chuột"] },

  // Thời trang (c2)
  { id: "p2", title: "Áo Khoác Jeans Levi's 501 Vintage - Size M", price: 650000, condition: "Tốt", category: "c2", sellerId: "u3", images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600"], description: "Áo jeans Levi's cổ điển thập niên 90. Màu phai nhẹ theo thời gian.", specs: { brand: "Levi's", material: "Denim", yearBought: "Vintage" }, location: "Hà Nội", format: "auction", bids: 7, currentBid: 680000, views: 89, watchers: 12, createdAt: "2024-05-12", endDate: "2024-06-30", shipping: 30000, tags: ["Thời trang", "Vintage"] },
  { id: "p5", title: "Nike Air Max 90 - Size 42 - Đen/Trắng", price: 1800000, condition: "Tốt", category: "c2", sellerId: "u6", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"], description: "Mang khoảng 10 lần. Sạch sẽ, không trầy lớn.", specs: { brand: "Nike", material: "Da tổng hợp", yearBought: "2023" }, location: "Hải Phòng", format: "buy-now", bids: 0, views: 145, watchers: 22, createdAt: "2024-05-09", endDate: null, shipping: 35000, tags: ["Giày dép", "Nike"] },
  { id: "p10", title: "Váy Midi Hoa Nhí Vintage - Size S/M", price: 280000, condition: "Rất tốt", category: "c2", sellerId: "u9", images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"], description: "Váy hoa xinh xắn, mặc vài lần. Giặt nhẹ tay.", specs: { brand: "No Brand", material: "Voan", yearBought: "2023" }, location: "Nha Trang", format: "buy-now", bids: 0, views: 92, watchers: 14, createdAt: "2024-05-16", endDate: null, shipping: 20000, tags: ["Thời trang", "Váy"] },
  { id: "p16", title: "Túi xách da thật Chanel Boy Đen", price: 45000000, condition: "Khá", category: "c2", sellerId: "u15", images: ["https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600"], description: "Túi Auth 100%. Có xước nhẹ ở góc túi.", specs: { brand: "Chanel", material: "Da Calfskin", yearBought: "2019" }, location: "Hà Nội", format: "buy-now", bids: 0, views: 560, watchers: 80, createdAt: "2024-05-21", endDate: null, shipping: 0, tags: ["Thời trang", "Túi xách", "Hàng hiệu"] },
  { id: "p17", title: "Giày adidas Ultraboost 22 Nam Size 43", price: 1200000, condition: "Tốt", category: "c2", sellerId: "u6", images: ["https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600"], description: "Đế còn êm, lưới chưa rách. Phù hợp chạy bộ.", specs: { brand: "adidas", material: "Vải lưới", yearBought: "2022" }, location: "Hải Phòng", format: "buy-now", bids: 0, views: 75, watchers: 5, createdAt: "2024-05-22", endDate: null, shipping: 25000, tags: ["Giày dép", "adidas", "Thể thao"] },

  // Nhà & Vườn (c3)
  { id: "p4", title: "Kệ Sách IKEA KALLAX 4x4 - Màu Trắng", price: 1200000, condition: "Tốt", category: "c3", sellerId: "u11", images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"], description: "Đã tháo rời để vận chuyển. Đầy đủ phụ kiện và ốc vít.", specs: { brand: "IKEA", material: "Gỗ ép", yearBought: "2021" }, location: "Đà Lạt", format: "buy-now", bids: 0, views: 67, watchers: 5, createdAt: "2024-05-11", endDate: null, shipping: 150000, tags: ["Nội thất", "IKEA"] },
  { id: "p18", title: "Ghế Sofa Đơn Bọc Nhung Trắng Xám", price: 850000, condition: "Rất tốt", category: "c3", sellerId: "u11", images: ["https://images.unsplash.com/photo-1519947486511-46149fa0a254?w=600"], description: "Sofa êm ái, màu xám sang trọng. Phù hợp phòng ngủ.", specs: { brand: "No Brand", material: "Nhung", yearBought: "2023" }, location: "Đà Lạt", format: "buy-now", bids: 0, views: 110, watchers: 9, createdAt: "2024-05-21", endDate: null, shipping: 100000, tags: ["Nội thất", "Sofa"] },
  { id: "p19", title: "Máy Lọc Không Khí Xiaomi Mi 3H", price: 1500000, condition: "Tốt", category: "c3", sellerId: "u10", images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600"], description: "Lõi lọc vừa thay mới. Dùng tốt cho phòng 30m2.", specs: { brand: "Xiaomi", warranty: "Hết bảo hành", yearBought: "2021" }, location: "TP. Hồ Chí Minh", format: "buy-now", bids: 0, views: 240, watchers: 32, createdAt: "2024-05-20", endDate: null, shipping: 50000, tags: ["Gia dụng", "Xiaomi"] },

  // Thể thao (c4)
  { id: "p8", title: "Thảm Yoga Premium 6mm - Cork Chống Trượt", price: 320000, condition: "Như mới", category: "c4", sellerId: "u8", images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600"], description: "Dùng 2 lần. Bề mặt cork thân thiện môi trường.", specs: { brand: "Yoga Design", material: "Cork tự nhiên", yearBought: "2024" }, location: "Hà Nội", format: "buy-now", bids: 0, views: 56, watchers: 8, createdAt: "2024-05-14", endDate: null, shipping: 25000, tags: ["Thể thao", "Yoga"] },
  { id: "p20", title: "Vợt Cầu Lông Yonex Astrox 88D Pro", price: 2100000, condition: "Khá", category: "c4", sellerId: "u6", images: ["https://images.unsplash.com/photo-1622279457486-640c4cb68580?w=600"], description: "Trầy xước do vớt cầu, khung không nứt gãy. Đang đan cước 11kg.", specs: { brand: "Yonex", warranty: "Không", yearBought: "2022" }, location: "Hải Phòng", format: "buy-now", bids: 0, views: 320, watchers: 45, createdAt: "2024-05-18", endDate: null, shipping: 30000, tags: ["Thể thao", "Cầu lông"] },

  // Sách (c5)
  { id: "p7", title: "Sách 'Nhà Giả Kim' - Paulo Coelho (Bìa Cứng)", price: 85000, condition: "Rất tốt", category: "c5", sellerId: "u13", images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600"], description: "Bản bìa cứng. Không có ghi chú hay đánh dấu.", specs: { brand: "NXB Nhã Nam", material: "Giấy cứng", yearBought: "2022" }, location: "Huế", format: "buy-now", bids: 0, views: 28, watchers: 2, createdAt: "2024-05-13", endDate: null, shipping: 15000, tags: ["Sách"] },
  { id: "p21", title: "Boxset Harry Potter 7 Cuốn - Bản Tiếng Anh", price: 1200000, condition: "Như mới", category: "c5", sellerId: "u13", images: ["https://images.unsplash.com/photo-1626618012641-bfb7c2c4b229?w=600"], description: "Chưa đọc cuốn nào. Hộp bìa cứng đẹp.", specs: { brand: "Bloomsbury", material: "Giấy xốp", yearBought: "2023" }, location: "Huế", format: "buy-now", bids: 0, views: 180, watchers: 21, createdAt: "2024-05-19", endDate: null, shipping: 30000, tags: ["Sách", "Tiếng Anh"] },

  // Trẻ em (c6)
  { id: "p22", title: "Xe Đẩy Trẻ Em Baobaohao V3", price: 550000, condition: "Tốt", category: "c6", sellerId: "u7", images: ["https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600"], description: "Xe gấp gọn nhẹ nhàng. Bánh trơn tru.", specs: { brand: "Baobaohao", material: "Hợp kim nhôm", yearBought: "2022" }, location: "TP. Hồ Chí Minh", format: "buy-now", bids: 0, views: 90, watchers: 12, createdAt: "2024-05-15", endDate: null, shipping: 50000, tags: ["Đồ chơi", "Mẹ & Bé"] },
  { id: "p23", title: "Ghế Ăn Dặm Hanbei Có Bánh Xe", price: 300000, condition: "Khá", category: "c6", sellerId: "u7", images: ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600"], description: "Dùng trầy xước nhưng còn rất chắc chắn. Có đệm bọc.", specs: { brand: "Hanbei", material: "Nhựa ABS", yearBought: "2021" }, location: "TP. Hồ Chí Minh", format: "buy-now", bids: 0, views: 40, watchers: 3, createdAt: "2024-05-16", endDate: null, shipping: 40000, tags: ["Mẹ & Bé"] },

  // Xe cộ (c7)
  { id: "p12", title: "Xe Đạp Thể Thao Giant ATX 2022 - Size M", price: 4500000, condition: "Tốt", category: "c7", sellerId: "u12", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"], description: "Thay lốp mới 3 tháng trước. Phanh tốt.", specs: { brand: "Giant", warranty: "Không", yearBought: "2022" }, location: "Đà Nẵng", format: "buy-now", bids: 0, views: 203, watchers: 19, createdAt: "2024-05-18", endDate: null, shipping: 200000, tags: ["Xe cộ", "Giant"] },
  { id: "p24", title: "Mũ Bảo Hiểm Fullface Royal M138", price: 450000, condition: "Rất tốt", category: "c7", sellerId: "u12", images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"], description: "Đội vài lần đi phượt. Không trầy xước.", specs: { brand: "Royal", material: "Nhựa ABS", yearBought: "2023" }, location: "Đà Nẵng", format: "buy-now", bids: 0, views: 130, watchers: 11, createdAt: "2024-05-20", endDate: null, shipping: 30000, tags: ["Xe cộ", "Phụ kiện"] },

  // Thủ công (c8)
  { id: "p25", title: "Tranh Sơn Mài Phong Cảnh Đồng Quê", price: 1500000, condition: "Như mới", category: "c8", sellerId: "u11", images: ["https://images.unsplash.com/photo-1579762715111-a6e19c402129?w=600"], description: "Tranh đẹp, khung gỗ chắc chắn. Kích thước 60x90cm.", specs: { brand: "Handmade", material: "Sơn mài", yearBought: "2020" }, location: "Đà Lạt", format: "buy-now", bids: 0, views: 88, watchers: 16, createdAt: "2024-05-12", endDate: null, shipping: 60000, tags: ["Nghệ thuật", "Decor"] }
];

export const initialOrders = [
  { id: "o1", buyerId: "u2", sellerId: "u11", productId: "p4", amount: 1350000, status: "delivered", createdAt: "2024-04-20", steps: ["placed","confirmed","shipped","delivered"], address: "123 Nguyễn Huệ, Q1, TP.HCM", payment: "cod", history: [{status: "placed", time: "2024-04-20 10:00"}, {status: "confirmed", time: "2024-04-20 14:00"}, {status: "shipped", time: "2024-04-21 08:00"}, {status: "delivered", time: "2024-04-23 15:30"}] },
  { id: "o2", buyerId: "u3", sellerId: "u2", productId: "p1", amount: 2835000, status: "shipped", createdAt: "2024-05-10", steps: ["placed","confirmed","shipped"], address: "45 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội", payment: "momo", history: [{status: "placed", time: "2024-05-10 09:15"}, {status: "confirmed", time: "2024-05-11 10:00"}, {status: "shipped", time: "2024-05-12 16:45"}] },
  { id: "o3", buyerId: "u8", sellerId: "u1", productId: "p15", amount: 1815000, status: "confirmed", createdAt: "2024-05-18", steps: ["placed","confirmed"], address: "12 Chùa Láng, Hà Nội", payment: "card", history: [{status: "placed", time: "2024-05-18 20:10"}, {status: "confirmed", time: "2024-05-19 08:00"}] },
  { id: "o4", buyerId: "u1", sellerId: "u4", productId: "p6", amount: 18880000, status: "placed", createdAt: "2024-05-22", steps: ["placed"], address: "Landmark 81, Bình Thạnh, TP.HCM", payment: "bank_transfer", history: [{status: "placed", time: "2024-05-22 14:00"}] },
  { id: "o5", buyerId: "u9", sellerId: "u15", productId: "p16", amount: 45000000, status: "delivered", createdAt: "2024-05-01", steps: ["placed","confirmed","shipped","delivered"], address: "Hòn Chồng, Nha Trang", payment: "bank_transfer", history: [{status: "placed", time: "2024-05-01 09:00"}, {status: "confirmed", time: "2024-05-01 10:00"}, {status: "shipped", time: "2024-05-02 14:00"}, {status: "delivered", time: "2024-05-05 16:20"}] },
];

export const initialMessages = [
  { id: "m1", chatId: "c_u2_u11_p4", senderId: "u2", text: "Xin chào! Kệ sách có fix tiền ship không ạ?", time: "10:32 SA", productId: "p4" },
  { id: "m2", chatId: "c_u2_u11_p4", senderId: "u11", text: "Ship nội thành hơi đắt bạn ạ, nhưng mình share 50k ship nhé.", time: "10:35 SA", productId: "p4", reactions: { "👍": 1 } },
  { id: "m3", chatId: "c_u2_u11_p4", senderId: "u2", text: "Ok bạn, mình đặt qua web nhé.", time: "10:38 SA", productId: "p4", replyTo: { id: "m2", text: "Ship nội thành hơi đắt bạn ạ, nhưng mình share 50k ship nhé." } },
  { id: "m4", chatId: "c_u8_u1_p15", senderId: "u8", text: "Chuột MX Master còn bảo hành hãng không anh?", time: "14:10 CH", productId: "p15" },
  { id: "m5", chatId: "c_u8_u1_p15", senderId: "u1", text: "Hết bảo hành rồi em, nhưng bao test 1 tuần nhé.", time: "14:20 CH", productId: "p15" },
  { id: "m6", chatId: "c_u8_u1_p15", senderId: "u8", text: "Dạ vâng, để em chốt trên app.", time: "14:22 CH", productId: "p15", reactions: { "❤️": 1 } },
];

export const initialReviews = [
  { id: "r1", reviewerId: "u2", sellerId: "u11", productId: "p4", rating: 5, comment: "Đóng gói rất kỹ, kệ còn mới đúng mô tả. Chủ shop nhiệt tình hỗ trợ tiền ship.", date: "2024-04-25" },
  { id: "r2", reviewerId: "u9", sellerId: "u15", productId: "p16", rating: 4, comment: "Túi Authentic chuẩn, tuy xước góc hơi to so với hình nhưng giá này là ổn.", date: "2024-05-06" },
  { id: "r3", reviewerId: "u1", sellerId: "u4", productId: "p6", rating: 5, comment: "Giao dịch nhanh gọn lẹ. Máy ảnh ngoại hình đẹp xuất sắc.", date: "2024-05-23" },
];

export const initialNotifications = [
  { id: "n1", userId: "u1", type: "order", message: "Đơn hàng #O3 đã được thanh toán", time: "1 giờ trước", read: false, icon: "💳" },
  { id: "n2", userId: "u1", type: "message", message: "Dũng Trí nhắn tin cho bạn", time: "2 giờ trước", read: false, icon: "💬" },
  { id: "n3", userId: "u1", type: "system", message: "Chào mừng Linh Trần đến với Hand-Me-On!", time: "1 năm trước", read: true, icon: "🎉" },
  { id: "n4", userId: "u2", type: "order", message: "Đơn hàng #O2 đang được giao đến bạn", time: "1 ngày trước", read: true, icon: "🚚" },
  { id: "n5", userId: "u2", type: "review", message: "Bạn nhận được đánh giá 5 sao từ u11", time: "2 ngày trước", read: true, icon: "⭐" },
];

export const initialReports = [
  { desc: "Suspicious listing – possible counterfeit goods", ref: "p6", severity: "High", time: "2h ago" },
  { desc: "User harassment reported in chat", ref: "u3", severity: "Medium", time: "5h ago" },
  { desc: "Price manipulation detected on auction", ref: "p2", severity: "Low", time: "1d ago" },
];

export const initialSystemSettings = {
  maintenanceMode: false,
  platformFee: 5,
  allowRegistration: true,
};

// Flash Sales
export const initialFlashSales = [
  { id: "fs1", productId: "p1", originalPrice: 2800000, salePrice: 1960000, discount: 30, endTime: Date.now() + 2 * 3600 * 1000, stock: 5, sold: 3, label: "⚡ Flash Sale" },
  { id: "fs2", productId: "p3", originalPrice: 22500000, salePrice: 16875000, discount: 25, endTime: Date.now() + 4 * 3600 * 1000, stock: 3, sold: 1, label: "🔥 Hot Deal" },
  { id: "fs3", productId: "p5", originalPrice: 1800000, salePrice: 1260000, discount: 30, endTime: Date.now() + 1 * 3600 * 1000, stock: 10, sold: 7, label: "⚡ Flash Sale" },
  { id: "fs4", productId: "p9", originalPrice: 16500000, salePrice: 12375000, discount: 25, endTime: Date.now() + 6 * 3600 * 1000, stock: 2, sold: 0, label: "💎 Super Deal" },
  { id: "fs5", productId: "p20", originalPrice: 2100000, salePrice: 1470000, discount: 30, endTime: Date.now() + 3 * 3600 * 1000, stock: 8, sold: 4, label: "⚡ Flash Sale" },
  { id: "fs6", productId: "p16", originalPrice: 45000000, salePrice: 36000000, discount: 20, endTime: Date.now() + 12 * 3600 * 1000, stock: 1, sold: 0, label: "👑 VIP Deal" },
];

// Coupons / Vouchers
export const initialCoupons = [
  { code: "HANDON10", discount: 10, type: "percent", minOrder: 500000, maxDiscount: 200000, expiry: "2024-12-31", desc: "Giảm 10% cho đơn từ 500K", used: 0, limit: 100 },
  { code: "NEWUSER50K", discount: 50000, type: "fixed", minOrder: 200000, maxDiscount: 50000, expiry: "2024-12-31", desc: "Giảm 50.000đ cho người dùng mới", used: 12, limit: 500 },
  { code: "SUMMER20", discount: 20, type: "percent", minOrder: 1000000, maxDiscount: 500000, expiry: "2024-08-31", desc: "Sale hè giảm 20%", used: 45, limit: 200 },
  { code: "SHIP0", discount: 0, type: "freeship", minOrder: 300000, maxDiscount: 35000, expiry: "2024-12-31", desc: "Miễn phí vận chuyển", used: 88, limit: 1000 },
];

// Product Q&A
export const initialQnA = [
  { id: "q1", productId: "p1", userId: "u3", question: "Tai nghe có còn bảo hành không ạ?", answer: "Còn 8 tháng bảo hành hãng nhé!", answeredAt: "2024-05-11", askedAt: "2024-05-10" },
  { id: "q2", productId: "p3", userId: "u5", question: "MacBook có thể kiểm tra trước khi mua không?", answer: "Bạn có thể đến trực tiếp tại Đà Nẵng để xem hàng nhé.", answeredAt: "2024-05-09", askedAt: "2024-05-08" },
  { id: "q3", productId: "p6", userId: "u8", question: "Số lần bấm màn trập chính xác là bao nhiêu?", answer: null, answeredAt: null, askedAt: "2024-05-14" },
];
