import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'shared', 'data', 'db.json');
const OUTPUT_PATH = path.join(process.cwd(), 'shared', 'data', 'db.normalized.json');

console.log('🚀 Starting normalization of db.json...');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Error: db.json not found at ${DB_PATH}`);
  process.exit(1);
}

const rawData = fs.readFileSync(DB_PATH, 'utf8');
const db = JSON.parse(rawData);

const normalizeProduct = (p) => ({
  id: p.id,
  title: p.title || 'Unknown Product',
  price: Number(p.price) || 0,
  category: p.category || 'other',
  condition: p.condition || 'used',
  description: p.description || '',
  location: p.location || 'Unknown',
  sellerId: p.sellerId || 'u1',
  status: p.status || 'available',
  views: Number(p.views) || 0,
  images: Array.isArray(p.images) ? p.images : [],
  createdAt: p.createdAt || new Date().toISOString(),
});

const normalizeUser = (u) => ({
  id: u.id,
  name: u.name || 'Anonymous User',
  email: u.email || '',
  role: u.role || 'user',
  avatar: u.avatar || `https://i.pravatar.cc/150?u=${u.id}`,
  balance: Number(u.balance) || 0,
  frozenBalance: Number(u.frozenBalance) || 0,
  coins: Number(u.coins) || 0,
  joined: u.joined || new Date().toISOString().split('T')[0],
  verified: !!u.verified,
  banned: !!u.banned,
});

if (db.products) {
  console.log(`📦 Normalizing ${db.products.length} products...`);
  db.products = db.products.map(normalizeProduct);
}

if (db.users) {
  console.log(`👤 Normalizing ${db.users.length} users...`);
  db.users = db.users.map(normalizeUser);
}

// Ensure other collections exist
db.orders = db.orders || [];
db.messages = db.messages || [];
db.notifications = db.notifications || [];
db.reviews = db.reviews || [];
db.qna = db.qna || [];
db.coupons = db.coupons || [];
db.settings = db.settings || { maintenanceMode: false, platformFee: 5, allowRegistration: true };

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(db, null, 2));
console.log(`✅ Success! Normalized data saved to ${OUTPUT_PATH}`);
