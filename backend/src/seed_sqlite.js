import { fakerVI as faker } from '@faker-js/faker';
import { sequelize } from './models/index.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

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

const NUM_USERS = 50;
const NUM_PRODUCTS = 10000;

faker.seed(123);

async function seed() {
  console.log("Syncing database...");
  await sequelize.sync({ force: true });

  console.log("Seeding categories...");
  await Category.bulkCreate(CATEGORIES);
  console.log("Categories seeded.");

  console.log(`Generating ${NUM_USERS} users...`);
  const users = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const name = faker.person.fullName();
    users.push({
      id: `u${i + 1}`,
      name,
      email: `user${i+1}@example.com`,
      password: "123",
      avatar: `https://i.pravatar.cc/150?u=u${i + 1}`,
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

  for (let c of chunkArray(users, 50)) {
    await Promise.all(c.map(u => User.create(u)));
  }
  console.log("Users seeded.");

  console.log(`Generating ${NUM_PRODUCTS} products...`);
  const products = [];
  for (let i = 0; i < NUM_PRODUCTS; i++) {
    const cat = faker.helpers.arrayElement(CATEGORIES);
    const kwList = ["smartphone", "laptop", "fashion", "book", "vintage", "car", "baby", "watch", "furniture"];
    const kw = faker.helpers.arrayElement(kwList);
    
    products.push({
      id: `p${i + 1}`,
      title: `${faker.commerce.productName()} (${kw})`,
      price: Math.floor(faker.number.int({ min: 10, max: 2000 })) * 10000,
      condition: faker.helpers.arrayElement(CONDITIONS).value,
      category: cat.id,
      sellerId: `u${faker.number.int({ min: 1, max: NUM_USERS })}`,
      images: [
        `https://picsum.photos/seed/${kw}-${i}-1/800/600`,
        `https://picsum.photos/seed/${kw}-${i}-2/800/600`
      ],
      videoUrl: Math.random() > 0.5 ? faker.helpers.arrayElement(MOCK_VIDEOS) : null,
      description: faker.commerce.productDescription(),
      location: faker.helpers.arrayElement(LOCATIONS),
      format: Math.random() > 0.8 ? "auction" : "buy-now",
      views: faker.number.int({ min: 0, max: 5000 }),
      status: "available",
      shipping: Math.random() > 0.4 ? 0 : 35000,
      specs: { brand: faker.company.name() },
      tags: [kw, "second-hand", cat.id]
    });
  }

  const pChunks = chunkArray(products, 100);
  for (let i = 0; i < pChunks.length; i++) {
    await Promise.all(pChunks[i].map(p => Product.create(p)));
    if (i % 10 === 0) console.log(`Seeded ${(i + 1) * 100} products...`);
  }
  console.log("Products seeded.");

  console.log("Database seed complete!");
  process.exit(0);
}

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
