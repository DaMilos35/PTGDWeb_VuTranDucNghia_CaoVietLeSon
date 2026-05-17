const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Add Vouchers
db.vouchers = [
  { id: "v1", code: "NEWUSER50", discount: 50000, minOrder: 200000, type: "fixed", expiry: "2026-12-31", usageLimit: 100, usedCount: 15 },
  { id: "v2", code: "FREESHIP", discount: 30000, minOrder: 0, type: "shipping", expiry: "2026-12-31", usageLimit: 500, usedCount: 88 },
  { id: "v3", code: "HMO10", discount: 10, minOrder: 500000, type: "percentage", expiry: "2026-06-30", usageLimit: 50, usedCount: 5 }
];

// Add Disputes (empty for now)
db.disputes = [
  { id: "d1", orderId: "o123", buyerId: "u2", sellerId: "u1", reason: "Hàng không giống mô tả", status: "pending", createdAt: new Date().toISOString() }
];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log("Database updated with Vouchers and Disputes.");
