import fs from 'fs';
import { fakerVI as faker } from '@faker-js/faker';
import { CATEGORIES, LOCATIONS, CONDITIONS } from '../../frontend/src/database/constants.js';

faker.seed(999);

const REAL_NAMES = [
  "Linh Trần", "Minh Nguyễn", "Lê Hoàng Yến", "Phạm Minh Tuấn", "Hoàng Kim Ngọc",
  "Vũ Đức Trí", "Đặng Thu Thủy", "Bùi Trọng Nghĩa", "Đỗ Mai Phương", "Hồ Quang Hiếu",
  "Ngô Bá Khá", "Dương Tấn Phát", "Lý Thu Thảo", "Đinh Bích Ngọc", "Phan Thanh Hải",
  "Mai Đức Chung", "Trịnh Xuân Thanh", "Lương Bích Hữu", "Tô Lâm", "Khổng Tú Quỳnh"
];

const EBAY_PRODUCTS = {
  "c1": [
    "Apple iPhone 15 Pro Max 256GB Titanium", "Samsung Galaxy S24 Ultra AI Smartphone", "MacBook Pro M3 Max 14-inch",
    "Sony WH-1000XM5 Wireless Noise Canceling Headphones", "Canon EOS R6 Mark II Mirrorless Camera",
    "iPad Pro 12.9 M2 Wi-Fi + Cellular", "Marshall Emberton II Portable Bluetooth Speaker",
    "Keychron Q1 QMK Custom Mechanical Keyboard", "Logitech MX Master 3S Wireless Mouse",
    "Nintendo Switch OLED Model White", "GoPro HERO12 Black Action Camera", "Kindle Paperwhite 16GB"
  ],
  "c2": [
    "Nike Air Jordan 1 Retro High OG", "Adidas Yeezy Boost 350 V2 Carbon", "The North Face Nuptse 1996 Jacket",
    "Levis 501 Original Fit Jeans Men", "Seiko 5 Sports Automatic Diver Watch", "Gucci GG Marmont Shoulder Bag",
    "Louis Vuitton Neverfull MM Damier", "Ralph Lauren Classic Fit Mesh Polo", "Coach Gallery Tote Leather",
    "ZARA Floral Print Midi Dress", "Uniqlo Ultra Light Down Parka", "Lacoste Classic Pique Polo"
  ],
  "c3": [
    "Dyson V15 Detect Cordless Vacuum", "Philips Hue Smart Bulb Starter Kit", "IKEA Billy Bookcase White",
    "KitchenAid Artisan Series 5-Quart Mixer", "Nespresso Vertuo Next Coffee Machine", "Le Creuset Enameled Cast Iron Dutch Oven",
    "Xiaomi Smart Air Purifier 4 Pro", "Blueair Blue Pure 411 Auto", "T-fal Ultimate Hard Anodized Nonstick Set",
    "Eames Lounge Chair & Ottoman Replica", "Herman Miller Aeron Ergonomic Chair", "Ring Video Doorbell Pro 2"
  ],
  "c4": [
    "Harry Potter and the Sorcerer's Stone 1st Edition", "The Great Gatsby F. Scott Fitzgerald",
    "Atomic Habits by James Clear", "Thinking, Fast and Slow by Daniel Kahneman", "Sapiens: A Brief History of Humankind",
    "Dune Deluxe Edition Frank Herbert", "The Alchemist Paulo Coelho", "Rich Dad Poor Dad Robert Kiyosaki",
    "The 7 Habits of Highly Effective People", "National Geographic Magazine Collection"
  ],
  "c5": [
    "Wilson Evolution Game Basketball", "Titleist Pro V1 Golf Balls", "Yeti Tundra 45 Cooler",
    "Fitbit Charge 6 Fitness Tracker", "Bowflex SelectTech 552 Dumbbells", "Manduka PRO Yoga Mat",
    "Coleman Sundome 4-Person Tent", "Garmin Fenix 7 Sapphire Solar", "CamelBak Rogue Hydration Pack",
    "Black Diamond Spot 400 Headlamp"
  ],
  "c6": [
    "Honda Vision 2024 New Edition", "Yamaha Exciter 155 VVA GP", "Nón bảo hiểm Shoei X-Fifteen",
    "Gương chiếu hậu Rizoma Stealth", "Dầu nhớt Liqui Moly 10W40", "Khóa đĩa chống trộm Master Lock",
    "Bạt phủ xe máy Oxford cao cấp", "Găng tay da Alpinestars GP Pro", "Bugi NGK Iridium chân dài"
  ],
  "c7": [
    "Medela Freestyle Flex Breast Pump", "Pampers Baby-Dry Diapers Size 4", "Joie Mytrax Flex Stroller",
    "Philips Avent Anti-colic Baby Bottle", "LEGO Star Wars Millennium Falcon", "Fisher-Price Laugh & Learn Piggy Bank",
    "Huggies Platinum Naturemade Size L", "Máy hâm sữa tiệt trùng FatzBaby", "Coche Baby Walker"
  ],
  "c8": [
    "Apple MagSafe Case iPhone 15", "Nomad Sport Strap Apple Watch", "Anker Nano II 65W Charger",
    "DJI Osmo Mobile 6 Gimbal", "Ridge Wallet Aluminum Gunmetal", "Ray-Ban Wayfarer Classic Black",
    "Oakley Holbrook Prizm Sapphire", "Swarovski Iconic Swan Pendant", "Fossil Men's Leather Wallet"
  ],
  "c9": [
    "Bàn làm việc gỗ thông nguyên tấm 160cm", "Ghế xoay văn phòng lưới Ergohuman", "Kệ tivi gỗ công nghiệp 2m",
    "Sofa nỉ 3 chỗ ngồi hiện đại", "Tủ quần áo gỗ ép 3 cánh", "Bàn ăn mặt đá 4 ghế",
    "Giường ngủ gỗ MDF 1m8x2m", "Tab đầu giường thông minh", "Tủ giày cánh lật 3 tầng"
  ],
  "c10": [
    "Tiền cổ Đông Dương 1945", "Máy ảnh film Leica M3 Single Stroke", "Đĩa than The Beatles Rubber Soul",
    "Đồng hồ Omega Seamaster Vintage 1960s", "Tượng đồng Phật Quan Âm thế kỷ 19", "Tem thư hiếm 1954",
    "Bản đồ cổ Hà Nội 1930", "Gốm Chu Đậu phục chế cao cấp", "Máy hát loa kèn cổ điển"
  ]
};

const NUM_USERS = 100;
const NUM_PRODUCTS = 1000;
const NUM_REVIEWS = 2500;

const translateTitle = (title) => {
  // Simple "Intelligent" simulation for Vietnamese translation
  return title
    .replace("Pro Max", "Bản Pro Max Cao Cấp")
    .replace("Wireless", "Không Dây")
    .replace("Headphones", "Tai Nghe")
    .replace("Smartphone", "Điện Thoại")
    .replace("Mirrorless Camera", "Máy Ảnh Mirrorless")
    .replace("Custom Mechanical Keyboard", "Bàn Phím Cơ Tùy Chỉnh")
    .replace("Starter Kit", "Bộ Khởi Đầu")
    .replace("Coffee Machine", "Máy Pha Cà Phê")
    .replace("Vacuum", "Máy Hút Bụi")
    .replace("Ergonomic Chair", "Ghế Công Thái Học")
    .replace("Fitness Tracker", "Vòng Đeo Sức Khỏe")
    .replace("Edition", "Phiên Bản")
    .replace("White", "Màu Trắng")
    .replace("Black", "Màu Đen")
    .replace("Titanium", "Chất Liệu Titan")
    .replace("Leather", "Da Thật")
    .replace("Collection", "Bộ Sưu Tập")
    .replace("Portable", "Di Động")
    .replace("Classic", "Cổ Điển")
    .replace("Deluxe", "Bản Đặc Biệt")
    .replace("Smart", "Thông Minh")
    .replace("Wireless", "Không dây")
    .replace("Automatic", "Tự động");
};

const generateAll = () => {
  console.log('🚀 Generating 1000 products with eBay-style data...');

  const users = Array.from({ length: NUM_USERS }).map((_, i) => {
    const isReal = i < REAL_NAMES.length;
    const name = isReal ? REAL_NAMES[i] : faker.person.fullName();
    return {
      id: `u${i + 1}`,
      name,
      email: (isReal ? name.split(' ').pop().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : faker.internet.username()) + "@example.com",
      password: "123",
      avatar: `https://i.pravatar.cc/150?u=u${i + 1}`,
      role: i === 0 ? "admin" : "user",
      location: faker.helpers.arrayElement(LOCATIONS),
      verified: faker.datatype.boolean(0.7),
      joined: faker.date.past({ years: 2 }).toISOString().split('T')[0],
      sales: faker.number.int({ min: 0, max: 200 }),
      rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      bio: `Xin chào, mình là ${name}. Mình chuyên kinh doanh các mặt hàng từ eBay và thanh lý đồ cá nhân.`,
      coins: faker.number.int({ min: 0, max: 100000 }),
      watchlist: [],
      cart: [],
      following: Array.from({ length: 5 }).map(() => `u${faker.number.int({ min: 1, max: NUM_USERS })}`), // Randomly follow 5 users
      addresses: [
        { id: "addr1", name, phone: "09" + faker.string.numeric(8), address: faker.location.streetAddress(), city: faker.helpers.arrayElement(LOCATIONS), isDefault: true }
      ]
    };
  });

  const products = Array.from({ length: NUM_PRODUCTS }).map((_, i) => {
    const cat = faker.helpers.arrayElement(CATEGORIES);
    const titles = EBAY_PRODUCTS[cat.id] || ["Sản phẩm eBay đấu giá"];
    const rawTitle = faker.helpers.arrayElement(titles);
    const title = translateTitle(rawTitle) + " (" + (i + 1) + ")";
    const seller = faker.helpers.arrayElement(users);

    const IMG_KEYWORDS = {
      "c1": ["smartphone", "laptop", "headphones", "camera", "tablet", "keyboard", "monitor", "gadget"],
      "c2": ["fashion", "shoes", "jacket", "dress", "jeans", "handbag", "clothing", "sneakers"],
      "c3": ["sofa", "kitchen", "bedroom", "vacuum", "coffee", "interior", "lamp", "appliance"],
      "c4": ["book", "reading", "library", "novel", "bookshelf", "study", "education"],
      "c5": ["basketball", "gym", "fitness", "yoga", "camping", "hiking", "sports", "running"],
      "c6": ["motorcycle", "scooter", "helmet", "bike", "motorbike"],
      "c7": ["baby", "stroller", "toys", "kids", "infant", "toddler"],
      "c8": ["jewelry", "sunglasses", "wallet", "watch", "ring", "necklace"],
      "c9": ["desk", "chair", "bookcase", "table", "wardrobe", "furniture"],
      "c10": ["antique", "vintage", "coin", "collectible", "artwork"]
    };
    const kwList = IMG_KEYWORDS[cat.id] || IMG_KEYWORDS["c1"];
    const numImages = faker.number.int({ min: 2, max: 4 });
    const images = Array.from({ length: numImages }).map((_, j) => {
      const kw = kwList[(i + j) % kwList.length];
      return `https://picsum.photos/seed/${kw}-${i * 4 + j}/800/600`;
    });


    const price = Math.floor(faker.number.int({ min: 10, max: 2000 })) * 10000;

    // Extract brand from title if possible, else random from a known list
    const brands = ["Apple", "Samsung", "Sony", "Dell", "Nike", "Adidas", "Uniqlo", "IKEA", "Honda", "Yamaha", "Xiaomi", "Logitech", "Nintendo", "Canon", "Marshall"];
    const foundBrand = brands.find(b => rawTitle.toLowerCase().includes(b.toLowerCase()));
    const brand = foundBrand || faker.helpers.arrayElement(brands);

    return {
      id: `p${i + 1}`,
      title,
      price,
      brand,
      condition: faker.helpers.arrayElement(CONDITIONS).value,
      category: cat.id,
      sellerId: seller.id,
      images,
      description: `Sản phẩm [${rawTitle}] được nhập trực tiếp/mua lại từ eBay. \n\nChi tiết:\n- Thương hiệu: ${brand}\n- Tình trạng: ${faker.helpers.arrayElement(CONDITIONS).label}\n- Xuất xứ: Mỹ/Chính hãng\n- Bảo hành: 6 tháng tại shop\n\nMinh chứng: Sản phẩm có hóa đơn mua hàng và mã vận đơn rõ ràng.`,
      location: faker.helpers.arrayElement(LOCATIONS),
      format: Math.random() > 0.8 ? "auction" : "buy-now",
      views: faker.number.int({ min: 50, max: 5000 }),
      createdAt: faker.date.recent({ days: 60 }).toISOString(),
      shipping: Math.random() > 0.4 ? 0 : 35000,
      sku: `EB-${Math.random().toString(36).substring(7).toUpperCase()}`,
      isSponsored: Math.random() > 0.95,
      hasCombo: Math.random() > 0.85,
      verifiedProof: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600",
      status: "available",
      videoUrl: "https://joy1.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190828_27_Supermarket_14_preview.mp4", // Mock video for all
      protection: true // All eBay products have HMO protection
    };
  });

  // Populate followers
  users.forEach(u => {
    u.followers = users.filter(other => other.following.includes(u.id)).map(other => other.id);
  });

  const reviews = Array.from({ length: NUM_REVIEWS }).map((_, i) => {
    const p = faker.helpers.arrayElement(products);
    const u = faker.helpers.arrayElement(users);
    return {
      id: `r${i + 1}`,
      productId: p.id,
      sellerId: p.sellerId,
      reviewerId: u.id,
      rating: faker.number.int({ min: 3, max: 5 }),
      comment: faker.helpers.arrayElement([
        "Sản phẩm rất tốt, đúng như mô tả trên eBay.",
        "Giao hàng nhanh, đóng gói rất kỹ.",
        "Hàng chính hãng, check code ok.",
        "Giá hơi cao nhưng chất lượng xứng đáng.",
        "Hài lòng với sự hỗ trợ của shop.",
        "Lần đầu mua đồ eBay qua đây, rất yên tâm.",
        "Sản phẩm hơi cũ hơn mình nghĩ nhưng vẫn dùng tốt.",
        "Tuyệt vời! Sẽ ủng hộ shop dài dài."
      ]),
      date: faker.date.recent({ days: 90 }).toISOString().split('T')[0]
    };
  });

  // Sync ratings
  products.forEach(p => {
    const pReviews = reviews.filter(r => r.productId === p.id);
    p.avgRating = pReviews.length > 0 ? Number((pReviews.reduce((a, b) => a + b.rating, 0) / pReviews.length).toFixed(1)) : 4.5;
    p.reviewCount = pReviews.length;
  });

  const flashSales = products.slice(0, 20).map(p => {
    const stock = faker.number.int({ min: 20, max: 100 });
    const sold = faker.number.int({ min: 5, max: stock - 5 }); // Ensure sold < stock
    return {
      id: `fs_${p.id}`,
      productId: p.id,
      originalPrice: p.price,
      salePrice: Math.floor(p.price * 0.8),
      discount: 20,
      endTime: Date.now() + faker.number.int({ min: 2, max: 48 }) * 3600000,
      stock,
      sold,
      label: "FLASH DEAL"
    };
  });

  // Generate sample messages for first 5 users
  const messages = [];
  const sampleChats = [
    { u1: users[0].id, u2: users[1].id, p: products[0].id },
    { u1: users[0].id, u2: users[2].id, p: products[5].id },
    { u1: users[0].id, u2: users[3].id, p: products[10].id },
  ];
  sampleChats.forEach(({ u1, u2, p }, ci) => {
    const chatId = `${u1}_${u2}_${p}`;
    const convos = [
      { sender: u1, text: `Bạn ơi, sản phẩm này còn hàng không?` },
      { sender: u2, text: `Còn bạn ơi! Bạn quan tâm thì inbox nhé 😊`, reactions: { "👍": 1 } },
      { sender: u1, text: `Giá có thể giảm thêm không ạ?`, replyTo: { id: "mock_reply", text: "Còn bạn ơi! Bạn quan tâm thì inbox nhé 😊" } },
      { sender: u2, text: `Mình có thể giảm chút nếu bạn thanh toán ngay hôm nay nhé!` },
      { sender: u1, text: `OK mình lấy nhé. Giao hàng mất bao lâu?`, reactions: { "❤️": 1 } },
      { sender: u2, text: `2-3 ngày bạn nhé. Ship toàn quốc miễn phí! 🚀` },
    ];
    convos.forEach((c, idx) => {
      messages.push({
        id: `m_sample_${ci}_${idx}`,
        chatId, senderId: c.sender, text: c.text,
        time: `${8 + idx}:${String(idx * 7 % 60).padStart(2, '0')}`,
        productId: p,
        reactions: c.reactions || {},
        replyTo: c.replyTo || null,
        type: "text",
        read: true
      });
    });
  });

  // Sample QnA
  const qna = products.slice(0, 30).map((p, i) => ({
    id: `q${i + 1}`, productId: p.id,
    userId: users[i % 10].id,
    question: faker.helpers.arrayElement([
      'Sản phẩm còn bảo hành không?', 'Ship về tỉnh được không?',
      'Có thể kiểm tra hàng trước khi nhận không?', 'Có hóa đơn mua hàng không?',
      'Sản phẩm có đổi trả không?'
    ]),
    answer: i % 3 === 0 ? faker.helpers.arrayElement([
      'Vẫn còn bảo hành bạn nhé!', 'Ship toàn quốc, phí ship tính theo khu vực.',
      'Mình hỗ trợ kiểm tra hàng tại địa chỉ shop nhé!'
    ]) : null,
    answeredAt: i % 3 === 0 ? faker.date.recent({ days: 10 }).toISOString().split('T')[0] : null,
    askedAt: faker.date.recent({ days: 20 }).toISOString().split('T')[0]
  }));

  // Sample notifications
  const notifications = users.slice(0, 5).map((u, i) => ([
    { id: `n${i}_1`, userId: u.id, title: 'Đơn hàng mới!', body: 'Bạn có đơn hàng cần xử lý.', read: false, createdAt: faker.date.recent({ days: 1 }).toISOString() },
    { id: `n${i}_2`, userId: u.id, title: 'Tin nhắn mới', body: 'Ai đó đã nhắn tin hỏi về sản phẩm của bạn.', read: false, createdAt: faker.date.recent({ days: 2 }).toISOString() },
    { id: `n${i}_3`, userId: u.id, title: 'Flash Sale sắp kết thúc!', body: 'Đừng bỏ lỡ các ưu đãi hấp dẫn.', read: true, createdAt: faker.date.recent({ days: 3 }).toISOString() },
  ])).flat();

  const data = {
    users,
    products,
    reviews,
    flashSales,
    messages,
    notifications,
    qna,
    orders: [],
    offers: [],
    coupons: [
      { id: 1, code: "WELCOME", discount: 50000, type: "fixed", minOrder: 200000, maxDiscount: 50000 },
      { id: 2, code: "HMO2024", discount: 10, type: "percent", minOrder: 0, maxDiscount: 200000 },
      { id: 3, code: "EBAYDEAL", discount: 15, type: "percent", minOrder: 1000000, maxDiscount: 500000 }
    ],
    settings: {
      maintenanceMode: false,
      platformFee: 7,
      allowRegistration: true,
      escrowEnabled: true
    }
  };

  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
  console.log('✅ Successfully generated db.json with 1000 products, users, and reviews!');
};

generateAll();
