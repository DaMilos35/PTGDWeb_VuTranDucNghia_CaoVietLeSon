import { sequelize, User, Product, Category } from './models/index.js';
import bcrypt from 'bcryptjs';

const LOCATIONS = [
  'Quận 1, TP. Hồ Chí Minh',
  'Quận Bình Thạnh, TP. Hồ Chí Minh',
  'Quận 7, TP. Hồ Chí Minh',
  'Quận Gò Vấp, TP. Hồ Chí Minh',
  'Quận Thủ Đức, TP. Hồ Chí Minh',
  'Quận Cầu Giấy, Hà Nội',
  'Quận Đống Đa, Hà Nội',
  'Quận Ba Đình, Hà Nội',
  'Quận Hai Bà Trưng, Hà Nội',
  'Quận Hoàn Kiếm, Hà Nội',
  'Quận Hải Châu, Đà Nẵng',
  'Quận Thanh Khê, Đà Nẵng',
  'Quận Sơn Trà, Đà Nẵng'
];

const BASE_MODELS = [
  {
    name: 'iPhone 14 Pro Max',
    category: 'c2',
    price: 21500000,
    images: ['https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-unboxing-a-new-smartphone-40733-large.mp4',
    description: 'Điện thoại iPhone 14 Pro Max bản chính hãng VN/A. Máy dùng cực kỳ giữ gìn, chưa sửa chữa, pin trâu sóng khỏe.',
    specs: { Dung_lượng: ['128GB', '256GB', '512GB'], Màu_sắc: ['Tím', 'Vàng', 'Đen', 'Trắng'], Tình_trạng: ['99%', '98%', 'Như mới'] }
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    category: 'c2',
    price: 18900000,
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-blank-screen-40742-large.mp4',
    description: 'Bán Samsung Galaxy S23 Ultra chính hãng mua tại TGDD. Camera 200MP siêu nét, bút S-pen tiện lợi, fullbox.',
    specs: { Dung_lượng: ['256GB', '512GB'], Màu_sắc: ['Xanh Green', 'Đen Phantom', 'Kem Cream'], Tình_trạng: ['99%', '95%', '98%'] }
  },
  {
    name: 'MacBook Pro M2',
    category: 'c2',
    price: 28500000,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-a-laptop-computer-sitting-on-a-desk-42171-large.mp4',
    description: 'MacBook Pro M2 màn hình Retina siêu nét. Máy nguyên zin, pin sạc ít lần, hiệu năng siêu đỉnh cho lập trình và đồ họa.',
    specs: { Cấu_hình: ['8GB RAM / 256GB SSD', '16GB RAM / 512GB SSD'], Màu_sắc: ['Xám Không Gian', 'Bạc'], Tình_trạng: ['Như mới', '99%'] }
  },
  {
    name: 'Xe máy Vespa Sprint 125',
    category: 'c5',
    price: 48000000,
    images: ['https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-4348-large.mp4',
    description: 'Xe máy Vespa Sprint 125cc đăng ký chính chủ. Máy móc nguyên bản chạy cực bốc và êm ái, bảo dưỡng định kỳ đầy đủ.',
    specs: { Đời_xe: ['2020', '2021', '2022'], Màu_sắc: ['Đen nhám', 'Trắng bóng', 'Đỏ mận'], Tình_trạng: ['95%', '99%'] }
  },
  {
    name: 'Honda Wave Alpha 110',
    category: 'c5',
    price: 13500000,
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-4348-large.mp4',
    description: 'Honda Wave Alpha 110cc tiết kiệm xăng vô đối. Xe đi làm đi học cực bền, giấy tờ pháp lý rõ ràng sang tên nhanh gọn.',
    specs: { Đời_xe: ['2019', '2021', '2022'], Màu_sắc: ['Xanh', 'Đỏ', 'Trắng', 'Đen'], Tình_trạng: ['90%', '95%', '98%'] }
  },
  {
    name: 'Ghế công thái học Sihoo M57',
    category: 'c7',
    price: 24000000,
    images: ['https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-person-scrolling-on-a-tablet-40736-large.mp4',
    description: 'Thanh lý ghế công thái học Sihoo M57 đỡ lưng cực tốt, tránh đau mỏi vai gáy cho dân văn phòng ngồi lâu.',
    specs: { Màu_sắc: ['Đen', 'Xám'], Tình_trạng: ['95%', '98%', 'Như mới'] }
  },
  {
    name: 'Đồng hồ Seiko 5 Automatic',
    category: 'c4',
    price: 3200000,
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-4348-large.mp4',
    description: 'Đồng hồ cơ Seiko 5 cổ điển mặt số dạ quang siêu đẹp. Chống nước tốt, giữ giờ lâu, đeo cực kỳ sang trọng.',
    specs: { Màu_mặt: ['Đen', 'Xanh dương', 'Trắng'], Tình_trạng: ['99%', '98%'] }
  },
  {
    name: 'Giày Nike Air Force 1',
    category: 'c3',
    price: 1650000,
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=60'],
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-4348-large.mp4',
    description: 'Giày Nike Air Force 1 All White chính hãng mua tại Store. Đế còn cực đẹp, đi êm chân, phối đồ gì cũng chất.',
    specs: { Size: ['39', '40', '41', '42'], Tình_trạng: ['95%', '98%', '99%'] }
  }
];

const AD_TEMPLATES = [
  '{action} {model} {spec1} {spec2} cực chất lượng',
  '{model} {spec1} màu {spec2} {condition} nguyên bản',
  'Cần bán gấp {model} {spec1} mới {condition}',
  'Thanh lý {model} {spec1} {spec2} giá rẻ'
];

const ACTIONS = ['Bán', 'Cần bán', 'Thanh lý', 'Nhượng lại'];

async function run() {
  console.log('Syncing database...');
  await sequelize.sync({ force: true });
  console.log('Database resynced.');

  // 1. Seed Categories
  const categories = [
    { id: 'c1', name: 'Tất Cả', icon: '🛍️' },
    { id: 'c2', name: 'Đồ Điện Tử', icon: '📱' },
    { id: 'c3', name: 'Thời Trang', icon: '👕' },
    { id: 'c4', name: 'Đồng Hồ & Phụ Kiện', icon: '⌚' },
    { id: 'c5', name: 'Xe Cộ', icon: '🏍️' },
    { id: 'c6', name: 'Giải Trí & Sở Thích', icon: '🎮' },
    { id: 'c7', name: 'Nội Thất & Đồ Gia Dụng', icon: '🏠' }
  ];
  await Category.bulkCreate(categories);
  console.log('Categories seeded.');

  // 2. Seed Users
  console.log('Generating 20 users with hashed passwords...');
  const users = [];
  const hashedPassword = await bcrypt.hash('123', 10);
  for (let i = 1; i <= 20; i++) {
    users.push({
      id: `u${i}`,
      name: i === 1 ? 'Vũ Trần Đức Nghĩa' : i === 2 ? 'Cao Việt Lê Sơn' : `Thương nhân Chợ Tốt #${i}`,
      email: i === 1 ? 'nghia@example.com' : i === 2 ? 'son@example.com' : `user${i}@example.com`,
      password: hashedPassword,
      avatar: `https://i.pravatar.cc/150?u=u${i}`,
      role: i === 1 ? 'admin' : 'user',
      location: LOCATIONS[i % LOCATIONS.length],
      balance: 15000000,
      coins: 200,
      joined: '2023-01-15',
      verified: i % 3 === 0
    });
  }
  await User.bulkCreate(users);
  console.log('20 Users seeded.');

  // 3. Generate 20,000 products combinatorial
  console.log('Generating 20,000 highly consistent products...');
  const products = [];
  const totalToGenerate = 20000;
  
  for (let i = 1; i <= totalToGenerate; i++) {
    const base = BASE_MODELS[i % BASE_MODELS.length];
    
    // Extract specs
    const keys = Object.keys(base.specs);
    const spec1Key = keys[0];
    const spec2Key = keys[1];
    const spec1List = base.specs[spec1Key];
    const spec2List = base.specs[spec2Key];
    const condList = base.specs.Tình_trạng || ['99%', '98%'];
    
    const spec1 = spec1List[i % spec1List.length];
    const spec2 = spec2List[i % spec2List.length];
    const cond = condList[i % condList.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const action = ACTIONS[i % ACTIONS.length];
    
    // Title formulation
    const template = AD_TEMPLATES[i % AD_TEMPLATES.length];
    const title = template
      .replace('{action}', action)
      .replace('{model}', base.name)
      .replace('{spec1}', spec1)
      .replace('{spec2}', spec2)
      .replace('{condition}', cond);

    // Price variation (-10% to +10%)
    const pct = ((i % 21) - 10) / 100; // -0.10 to +0.10
    const price = Math.round((base.price * (1 + pct)) / 10000) * 10000; // Round to nearest 10,000

    products.push({
      id: `p${i}`,
      title,
      price,
      category: base.category,
      sellerId: `u${(i % 20) + 1}`,
      status: 'available',
      videoUrl: base.videoUrl,
      stock: (i % 3) + 1,
      sold: i % 10 === 0 ? (i % 5) : 0,
      discount: i % 15 === 0 ? 10 : 0,
      rating: 4.5 + (i % 6) * 0.1,
      reviewCount: i % 8 === 0 ? (i % 20) : 0,
      condition: cond === 'Như mới' ? 'like-new' : cond === '99%' ? 'excellent' : 'good',
      description: `${base.description}\n\nThông số chi tiết:\n- ${spec1Key.replace('_', ' ')}: ${spec1}\n- ${spec2Key.replace('_', ' ')}: ${spec2}\n- Địa chỉ xem hàng: ${location}`,
      location,
      format: i % 10 === 0 ? 'auction' : 'fixed',
      bids: i % 10 === 0 ? (i % 4) : 0,
      currentBid: i % 10 === 0 ? price : null,
      views: 50 + (i % 500),
      watchers: 2 + (i % 30),
      shipping: 30000,
      endDate: i % 10 === 0 ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null,
      images: base.images,
      specs: { [spec1Key]: spec1, [spec2Key]: spec2 }
    });

    if (i % 5000 === 0) {
      console.log(`Generated ${i} products...`);
    }
  }

  // Insert in chunks of 5000 to prevent memory limit errors
  const chunkSize = 5000;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    await Product.bulkCreate(chunk);
    console.log(`Successfully seeded products chunk [${i} to ${i + chunk.length}]`);
  }

  // 4. Seed Reviews
  console.log('Generating realistic reviews...');
  const reviews = [];
  const commentTemplates = [
    "Sản phẩm dùng cực kỳ tốt, hình thức như mới. Người bán hỗ trợ nhiệt tình!",
    "Đóng gói cẩn thận, giao hàng siêu nhanh. Đánh giá 5 sao cho shop.",
    "Hàng dùng rất ổn áp, giá cả hợp lý, đúng mô tả.",
    "Giao hàng nhanh, đóng gói đẹp, sản phẩm chất lượng vượt mong đợi.",
    "Mua lần thứ 2 của shop rồi vẫn rất ưng ý. Chúc shop buôn may bán đắt!",
    "Chất lượng sản phẩm tuyệt vời, phục vụ rất chu đáo.",
    "Hàng tốt trong tầm giá, mọi người nên mua nhé."
  ];

  for (let i = 0; i < 150; i++) {
    const randomProductIndex = Math.floor(Math.random() * 100); 
    const productId = `p${randomProductIndex}`;
    const reviewerId = `u${(i % 19) + 2}`; 
    const sellerId = `u${(randomProductIndex % 20) + 1}`; 

    if (reviewerId === sellerId) continue;

    reviews.push({
      id: `r_${i}_${Date.now()}`,
      productId,
      userId: reviewerId,
      sellerId,
      rating: 4 + (i % 2), 
      comment: commentTemplates[i % commentTemplates.length],
      date: new Date(Date.now() - (i % 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      images: JSON.stringify([])
    });
  }
  
  const { Review } = await import('./models/index.js');
  await Review.bulkCreate(reviews);
  console.log(`Successfully seeded ${reviews.length} realistic reviews!`);

  console.log('Database seed of 20,000 items completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
