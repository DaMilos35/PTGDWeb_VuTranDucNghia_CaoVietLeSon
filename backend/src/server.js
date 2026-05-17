import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { sequelize, User, Product, Order, SuperSale, Review, SiteStat } from './models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Analytics Middleware
app.use(async (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/uploads')) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [stat] = await SiteStat.findOrCreate({ where: { date: today } });
      await stat.increment('pageViews');
    } catch (e) {}
  }
  next();
});

// Setup storage for uploads
const uploadDir = path.join(__dirname, '../../shared/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` });
});

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing) return res.status(400).json({ message: 'Email đã tồn tại' });
    
    const newUser = await User.create({
      id: `u${Date.now()}`,
      ...req.body,
      role: 'user',
      verified: false,
      rating: 5.0,
      sales: 0,
      joined: new Date().toISOString().split('T')[0],
      coins: 50,
      balance: 0,
      frozenBalance: 0,
      following: [],
      followers: [],
      cart: [],
      watchlist: []
    });
    res.json({ user: newUser, token: `mock-jwt-${newUser.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    if (user.password && req.body.password !== 'social' && user.password !== req.body.password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    res.json({ user, token: `mock-jwt-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER ROUTES ---
app.get('/api/users', async (req, res) => res.json(await User.findAll()));
app.get('/api/users/:id', async (req, res) => res.json(await User.findByPk(req.params.id)));
app.patch('/api/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.update(req.body);
  res.json(user);
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  let order = [];
  if (req.query.sort === 'bestseller') order = [['sold', 'DESC']];
  if (req.query.sort === 'rating') order = [['rating', 'DESC']];
  const products = await Product.findAll({ order });
  res.json(products);
});
app.post('/api/products', async (req, res) => {
  res.json(await Product.create({ id: req.body.id || `p${Date.now()}`, ...req.body }));
});
app.get('/api/products/:id', async (req, res) => res.json(await Product.findByPk(req.params.id)));
app.patch('/api/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(await product.update(req.body));
});
app.delete('/api/products/:id', async (req, res) => {
  await Product.destroy({ where: { id: req.params.id }});
  res.json({ message: 'Deleted' });
});

// --- SALES (SuperSales/FlashSales) ROUTES ---
app.get('/api/sales', async (req, res) => {
  const sales = await SuperSale.findAll();
  res.json(sales);
});
app.post('/api/sales', async (req, res) => {
  const newSale = await SuperSale.create({
    id: `ss${Date.now()}`,
    ...req.body,
    status: 'pending' // requires admin approval
  });
  res.json(newSale);
});
app.patch('/api/sales/:id/approve', async (req, res) => {
  const sale = await SuperSale.findByPk(req.params.id);
  if (!sale) return res.status(404).json({ message: 'Not found' });
  res.json(await sale.update({ status: req.body.status || 'approved' }));
});

// --- ORDERS ROUTES ---
app.get('/api/orders', async (req, res) => res.json(await Order.findAll()));
app.post('/api/orders', async (req, res) => {
  const newOrder = await Order.create({
    id: `o${Date.now()}`,
    ...req.body,
    status: 'pending',
    escrowStatus: 'held_by_platform',
    history: [{ status: 'pending', time: new Date().toLocaleString('vi-VN'), text: "Đơn hàng đã được đặt" }],
    steps: ['pending']
  });
  res.json(newOrder);
});
app.patch('/api/orders/:id', async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  res.json(await order.update(req.body));
});

// --- DASHBOARD ROUTE ---
app.get('/api/dashboard/seller/:id', async (req, res) => {
  const sellerId = req.params.id;
  const products = await Product.findAll({ where: { sellerId } });
  const orders = await Order.findAll({ where: { sellerId } });

  const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingConfirm = orders.filter(o => o.status === 'pending').length;
  const pendingPickup = orders.filter(o => o.status === 'paid').length;
  const processed = orders.filter(o => o.status === 'completed').length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  res.json({
    revenue: revenue,
    totalSales: orders.length,
    activeListings: products.length,
    avgRating: 5.0, // Mock for now
    todo: {
      pendingConfirm,
      pendingPickup,
      processed,
      cancelled
    },
    trends: { revenue: "+18%", sales: "+12%", rating: "+0.2" },
    revenueChart: [0, 0, 0, 0, 0, revenue],
    months: ["T11", "T12", "T1", "T2", "T3", "T4"]
  });
});

// --- ADMIN ROUTES ---
app.get('/api/admin/stats', async (req, res) => {
  const users = await User.count();
  const products = await Product.count();
  const orders = await Order.findAll();
  
  const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || 0), 0);
  const commission = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.commission || 0), 0);
  const recentOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const today = new Date().toISOString().split('T')[0];
  const stat = await SiteStat.findOne({ where: { date: today }});
  const pageViews = stat ? stat.pageViews : 0;

  res.json({
    totalUsers: users,
    totalProducts: products,
    totalOrders: orders.length,
    totalRevenue: revenue,
    totalCommission: commission,
    pageViewsToday: pageViews,
    recentOrders,
    reports: [] // Will implement reports model fully if needed
  });
});

app.get('/api/admin/activity', async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']], limit: 3 });
  const products = await Product.findAll({ order: [['createdAt', 'DESC']], limit: 3 });
  const orders = await Order.findAll({ order: [['createdAt', 'DESC']], limit: 3 });

  const activity = [
    ...users.map(u => ({ icon: "👤", text: `${u.name} đăng ký`, time: u.createdAt, color: "#DBEAFE", type: 'user' })),
    ...products.map(p => ({ icon: "📦", text: `SP mới: ${p.title}`, time: p.createdAt, color: "#FEF3C7", type: 'product' })),
    ...orders.map(o => ({ icon: "💰", text: `Đơn #${o.id} mới`, time: o.createdAt, color: "#DCFCE7", type: 'order' })),
  ];
  
  res.json(activity.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6));
});

sequelize.sync().then(() => {
  console.log('Database synced successfully.');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => console.error(err));
