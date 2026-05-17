const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
let db;
try {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (err) {
  console.error("Error reading db.json:", err);
  process.exit(1);
}

// 1. Enrich Products with videoUrl, quantity, discount, isBestSeller, rating, reviewCount
if (db.products) {
  db.products = db.products.map(p => {
    // Generate random rating between 3.5 and 5.0
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
    // Generate random review count
    const reviewCount = Math.floor(Math.random() * 200) + 5;
    // Discount percent 0-50
    const discount = Math.random() > 0.6 ? Math.floor(Math.random() * 50) + 5 : 0;
    // Best seller if sold > 20
    const soldCount = Math.floor(Math.random() * 100);
    const isBestSeller = soldCount > 20;

    return {
      ...p,
      videoUrl: p.videoUrl || (Math.random() > 0.8 ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" : null),
      quantity: p.quantity || Math.floor(Math.random() * 50) + 1,
      discount: p.discount || discount,
      soldCount: p.soldCount || soldCount,
      isBestSeller: p.isBestSeller !== undefined ? p.isBestSeller : isBestSeller,
      rating: p.rating || Number(rating),
      reviewCount: p.reviewCount || reviewCount,
    };
  });
}

// 2. Add Stats for Admin
if (!db.stats) {
  db.stats = {
    totalViews: 125430,
    totalVisitors: 45210,
    activeUsers: 3412,
    conversionRate: 2.4,
    revenue: 1250000000
  };
}

// 3. Add global reviews if not exist
if (!db.reviews) {
  db.reviews = [];
  if (db.products && db.users) {
    db.products.slice(0, 50).forEach(p => {
      const numReviews = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < numReviews; i++) {
        const user = db.users[Math.floor(Math.random() * db.users.length)];
        db.reviews.push({
          id: `r${Date.now()}_${Math.random().toString(36).substring(7)}`,
          productId: p.id,
          reviewerId: user.id,
          sellerId: p.sellerId,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
          comment: "Sản phẩm chất lượng, giao hàng nhanh chóng! Rất hài lòng.",
          date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
        });
      }
    });
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Database extended successfully with quantity, discount, bestSellers, ratings, videos, stats and reviews!");
