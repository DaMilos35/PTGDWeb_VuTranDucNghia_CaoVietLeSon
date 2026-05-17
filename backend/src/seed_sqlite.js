import { fakerVI as faker } from '@faker-js/faker';
import { sequelize } from './models/index.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import bcrypt from 'bcryptjs';

// Constant data for simulation
const CATEGORIES = [
  { id: "c1", name: "Điện thoại & Phụ kiện", icon: "📱", color: "#ECFDF5", text: "#059669" },
  { id: "c2", name: "Thời trang nam/nữ", icon: "👕", color: "#EFF6FF", text: "#2563EB" },
  { id: "c3", name: "Nhà cửa & Đời sống", icon: "🏠", color: "#FEF2F2", text: "#DC2626" },
  { id: "c4", name: "Sách & Tạp chí", icon: "📚", color: "#FFFBEB", text: "#D97706" },
  { id: "c5", name: "Thể thao & Dã ngoại", icon: "⛺", color: "#F5F3FF", text: "#7C3AED" },
  { id: "c6", name: "Xe cộ & Phụ tùng", icon: "🏍️", color: "#F0FDF4", text: "#16A34A" },
  { id: "c7", name: "Mẹ & Bé", icon: "👶", color: "#FDF4FF", text: "#C026D3" },
  { id: "c8", name: "Đồng hồ & Trang sức", icon: "⌚", color: "#FAFAFA", text: "#52525B" },
  { id: "c9", name: "Nội thất", icon: "🪑", color: "#FFF1F2", text: "#E11D48" },
  { id: "c10", name: "Đồ cổ & Sưu tầm", icon: "🏺", color: "#FFF7ED", text: "#EA580C" }
];

const LOCATIONS = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng", "Bình Dương", "Đồng Nai"];
const CONDITIONS = [
  { value: 'new', label: 'Mới nguyên seal' },
  { value: 'like-new', label: 'Như mới (99%)' },
  { value: 'good', label: 'Tốt (95-98%)' },
  { value: 'fair', label: 'Khá (90-95%)' },
  { value: 'poor', label: 'Cũ (<90%)' }
];

const MOCK_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://joy1.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190828_27_Supermarket_14_preview.mp4"
];

const REALISTIC_PRODUCTS = [
  {
    title: "iPhone 13 Pro Max 256GB Xanh Sierra, nguyên bản 100%",
    price: 13500000,
    condition: "like-new",
    category: "c1",
    images: ["https://images.unsplash.com/photo-1632661674596-618d8b64d641?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1647427017058-29408fa232b6?q=80&w=800&auto=format&fit=crop"],
    description: "Cần lên đời nên pass lại iPhone 13 Pro Max 256GB màu Xanh Sierra. Máy dùng kỹ, dán ốp lưng cường lực từ lúc mới mua. Pin còn 89%, bao test thoải mái.",
    tags: ["iphone", "apple", "smartphone", "pro max"]
  },
  {
    title: "Đồng hồ Seiko 5 Automatic SNK809 dây dù đen",
    price: 1800000,
    condition: "good",
    category: "c8",
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop"],
    description: "Đồng hồ cơ Seiko SNK809 size 37mm, zin all. Đã sử dụng 1 năm, ngoại hình còn khoảng 95%, xước xát lông mèo nhẹ. Máy chạy chuẩn giờ.",
    tags: ["seiko", "watch", "đồng hồ", "automatic"]
  },
  {
    title: "Áo Khoác Nam The North Face Gore-Tex Chính Hãng",
    price: 850000,
    condition: "new",
    category: "c2",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"],
    description: "Áo gió TNF chống nước tuyệt đối Gore-Tex, còn nguyên tem tag, mua về nhưng mặc không vừa size (Size L - Á). Pass lỗ nhanh cho ai cần.",
    tags: ["fashion", "áo khoác", "tnf", "the north face"]
  },
  {
    title: "MacBook Pro M1 2020 8GB/256GB Cũ Bạc Rất Đẹp",
    price: 16500000,
    condition: "like-new",
    category: "c1",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"],
    description: "Macbook Pro M1 2020 màu Silver siêu sang trọng, phù hợp làm đồ họa nhẹ, code, văn phòng. Phím ngon chưa bóng, sạc zin đi kèm.",
    tags: ["macbook", "laptop", "apple", "m1"]
  },
  {
    title: "Ghế Xoay Văn Phòng Công Thái Học - Lưới Siêu Thoáng",
    price: 450000,
    condition: "fair",
    category: "c9",
    images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800&auto=format&fit=crop"],
    description: "Thanh lý ghế xoay văn phòng lưới đen, đệm còn êm. Do chuyển nhà nên cần nhượng lại gấp trong ngày.",
    tags: ["ghế", "nội thất", "văn phòng", "thanh lý"]
  },
  {
    title: "Bộ truyện Harry Potter Full 7 tập Tiếng Việt",
    price: 600000,
    condition: "good",
    category: "c4",
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"],
    description: "Trọn bộ 7 tập truyện Harry Potter bản dịch NXB Trẻ, mua về đọc đúng 1 lần rồi cất tủ, không quăn mép.",
    tags: ["sách", "harry potter", "truyện"]
  },
  {
    title: "Sony A6000 + Lens Kit 16-50mm Tặng Thẻ 32GB",
    price: 7200000,
    condition: "good",
    category: "c1",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop"],
    description: "Tập chụp ảnh xong đã nâng cấp nên pass bộ Sony A6000. Sensor sạch, lens không mốc rễ, khoảng 12k shots.",
    tags: ["camera", "máy ảnh", "sony", "a6000"]
  },
  {
    title: "Giày Sneaker Nike Air Force 1 Trắng Size 42",
    price: 1100000,
    condition: "like-new",
    category: "c2",
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?q=80&w=800&auto=format&fit=crop"],
    description: "Nike AF1 full trắng, auth 100%, mới đi đúng 1 lần dự tiệc, đế sạch như mới. Đã dán sole bảo vệ.",
    tags: ["giày", "sneaker", "nike", "af1"]
  },
  {
    title: "Đàn Guitar Classic Yamaha C40 Chính Hãng",
    price: 1400000,
    condition: "good",
    category: "c10",
    images: ["https://images.unsplash.com/photo-1550227188-4fc3c4de6553?q=80&w=800&auto=format&fit=crop"],
    description: "Đàn guitar classic Yamaha C40 mua tại shop, tiếng ấm, cần thẳng tắp, phím bấm êm tay phù hợp người mới tập.",
    tags: ["âm nhạc", "guitar", "yamaha"]
  },
  {
    title: "Sofa Giường Đa Năng Bọc Nỉ Màu Ghi Cực Đẹp",
    price: 2500000,
    condition: "fair",
    category: "c9",
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"],
    description: "Thanh lý bộ sofa giường nỉ, kéo ra thành giường rộng 1m2. Dài 1m8. Phù hợp phòng khách hoặc chung cư mini.",
    tags: ["sofa", "nội thất", "thanh lý"]
  }
];

const NUM_USERS = 20;

faker.seed(123);

async function seed() {
  console.log("Syncing database...");
  await sequelize.sync({ force: true }); // This recreates the entire database!

  console.log("Seeding categories...");
  await Category.bulkCreate(CATEGORIES);
  console.log("Categories seeded.");

const VIETNAMESE_SURNAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý", "Đoàn"];
const MALE_MIDDLE = ["Văn", "Hữu", "Đức", "Công", "Minh", "Quang", "Gia", "Thế", "Hoàng", "Trọng", "Tuấn", "Thanh", "Quốc", "Đình", "Nhật", "Hải", "Xuân"];
const FEMALE_MIDDLE = ["Thị", "Thu", "Phương", "Ngọc", "Hồng", "Mai", "Kim", "Minh", "Thanh", "Bích", "Kiều", "Tuyết", "Xuân", "Hoàng", "Như"];
const MALE_FIRST = ["Nam", "Long", "Cường", "Dũng", "Sơn", "Tuấn", "Hải", "Hùng", "Thắng", "Khoa", "Bách", "Kiên", "Bình", "Đạt", "Phát", "Tài", "Thành", "Vinh", "Khánh", "Phúc", "Nhân", "Nghĩa", "Trí", "Hiếu", "Toàn", "Phú", "Khôi", "Hiệp"];
const FEMALE_FIRST = ["Lan", "Hà", "Hương", "Trang", "Linh", "Thảo", "Hạnh", "Anh", "Nhung", "Nga", "Ngọc", "Oanh", "Tâm", "Vy", "Yến", "My", "Trâm", "Ngân", "Quyên", "Duyên", "Thắm", "Mai", "Như", "Uyên", "Tú", "Thủy", "Chi", "Quỳnh"];

function generateRealNameAndAvatar() {
  const isMale = Math.random() > 0.5;
  const surname = faker.helpers.arrayElement(VIETNAMESE_SURNAMES);
  const middle = isMale ? faker.helpers.arrayElement(MALE_MIDDLE) : faker.helpers.arrayElement(FEMALE_MIDDLE);
  const first = isMale ? faker.helpers.arrayElement(MALE_FIRST) : faker.helpers.arrayElement(FEMALE_FIRST);
  const name = `${surname} ${middle} ${first}`;
  const genderType = isMale ? "men" : "women";
  const avatarId = faker.number.int({ min: 1, max: 90 });
  const avatar = `https://randomuser.me/api/portraits/${genderType}/${avatarId}.jpg`;
  return { name, avatar };
}

  console.log(`Generating ${NUM_USERS} users...`);
  const users = [];
  const defaultPassword = await bcrypt.hash("123", 10);
  for (let i = 0; i < NUM_USERS; i++) {
    const { name, avatar } = generateRealNameAndAvatar();
    users.push({
      id: `u${i + 1}`,
      name,
      email: `user${i+1}@example.com`,
      password: defaultPassword,
      avatar: i === 0 ? "https://randomuser.me/api/portraits/men/4.jpg" : avatar,
      role: i === 0 ? "admin" : "user",
      location: faker.helpers.arrayElement(LOCATIONS),
      verified: faker.datatype.boolean(0.7),
      joined: faker.date.past({ years: 2 }).toISOString().split('T')[0],
      sales: faker.number.int({ min: 0, max: 200 }),
      rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      bio: `Xin chào, mình là ${name}.`,
      coins: faker.number.int({ min: 0, max: 10000 }),
      balance: faker.number.int({ min: 0, max: 5000000 }),
      frozenBalance: 0,
      watchlist: [],
      cart: [],
      following: [],
      followers: []
    });
  }

  await Promise.all(users.map(u => User.create(u)));
  console.log("Users seeded.");

  console.log("Generating REALISTIC products...");
  const products = [];
  
  // First, add our 10 realistic products
  REALISTIC_PRODUCTS.forEach((rp, i) => {
    products.push({
      id: `p${i + 1}`,
      title: rp.title,
      price: rp.price,
      condition: rp.condition,
      category: rp.category,
      sellerId: `u${faker.number.int({ min: 1, max: NUM_USERS })}`,
      images: rp.images,
      videoUrl: i % 2 === 0 ? faker.helpers.arrayElement(MOCK_VIDEOS) : null,
      description: rp.description,
      location: faker.helpers.arrayElement(LOCATIONS),
      format: "buy-now",
      views: faker.number.int({ min: 100, max: 5000 }),
      status: "available",
      shipping: Math.random() > 0.4 ? 0 : 35000,
      specs: { brand: "Thương hiệu nổi tiếng" },
      tags: rp.tags,
      stock: faker.number.int({ min: 1, max: 20 }),
      sold: faker.number.int({ min: 0, max: 50 }),
      discount: faker.helpers.arrayElement([0, 5, 10, 15, 20]),
      rating: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
      reviewCount: faker.number.int({ min: 5, max: 150 })
    });
  });

  // Then add about 40 more slightly varied products for volume
  for (let i = 11; i <= 50; i++) {
    const rp = faker.helpers.arrayElement(REALISTIC_PRODUCTS);
    const catId = rp.category;
    const isAuction = Math.random() > 0.8;
    products.push({
      id: `p${i}`,
      title: `${rp.title} (Bản phụ ${i})`,
      price: Math.floor(rp.price * faker.number.float({ min: 0.8, max: 1.2 })),
      condition: faker.helpers.arrayElement(CONDITIONS).value,
      category: catId,
      sellerId: `u${faker.number.int({ min: 1, max: NUM_USERS })}`,
      images: rp.images,
      videoUrl: Math.random() > 0.7 ? faker.helpers.arrayElement(MOCK_VIDEOS) : null,
      description: rp.description + " Mua bán nhanh gọn lẹ.",
      location: faker.helpers.arrayElement(LOCATIONS),
      format: isAuction ? "auction" : "buy-now",
      views: faker.number.int({ min: 10, max: 1000 }),
      status: "available",
      shipping: Math.random() > 0.4 ? 0 : 35000,
      specs: { brand: "Various" },
      tags: rp.tags,
      bids: isAuction ? faker.number.int({ min: 0, max: 10 }) : 0,
      currentBid: isAuction ? rp.price * 1.1 : null,
      stock: faker.number.int({ min: 1, max: 5 }),
      sold: faker.number.int({ min: 0, max: 5 }),
      discount: faker.helpers.arrayElement([0, 0, 0, 5, 10]),
      rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
      reviewCount: faker.number.int({ min: 0, max: 30 })
    });
  }

  await Promise.all(products.map(p => Product.create(p)));
  console.log(`Seeded ${products.length} REALISTIC products.`);

  console.log("Database seed complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
