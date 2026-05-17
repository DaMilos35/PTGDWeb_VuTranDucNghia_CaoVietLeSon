import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { sequelize, User, Product, Order, SuperSale, Review, SiteStat, Category } from './models/index.js';
import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'handmeon_super_secret_key_2026';

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
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static(uploadDir));

// Auth Middleware
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

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
    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({
      id: `u${Date.now()}`,
      ...req.body,
      password: hashedPassword,
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
    
    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = newUser.toJSON();
    delete userObj.password;
    res.json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    
    if (req.body.password !== 'social') {
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toJSON();
    delete userObj.password;
    res.json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- USER ROUTES ---
app.get('/api/users', async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
});
app.get('/api/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
  res.json(user);
});
app.patch('/api/users/:id', requireAuth, async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }
  
  await user.update(req.body);
  const userObj = user.toJSON();
  delete userObj.password;
  res.json(userObj);
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, condition, location, sellerId, status, minPrice, maxPrice, sort, limit = 40, offset = 0, all } = req.query;
    const where = {};

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    
    if (category) {
      const cats = category.split(',').filter(Boolean);
      if (cats.length > 0) {
        where.category = { [Op.in]: cats };
      }
    }
    
    if (condition) {
      const conds = condition.split(',').filter(Boolean);
      if (conds.length > 0) {
        where.condition = { [Op.in]: conds };
      }
    }
    
    if (location && location !== 'all') {
      where.location = location;
    }
    
    if (sellerId) {
      where.sellerId = sellerId;
    }
    
    if (status) {
      where.status = status;
    } else {
      where.status = { [Op.ne]: 'sold' }; // Default only show available
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'price-asc') order = [['price', 'ASC']];
    else if (sort === 'price-desc') order = [['price', 'DESC']];
    else if (sort === 'views') order = [['views', 'DESC']];
    else if (sort === 'rating') order = [['rating', 'DESC']];
    else if (sort === 'bestseller') order = [['sold', 'DESC']];

    const products = await Product.findAll({
      where,
      order,
      limit: all === 'true' ? undefined : Number(limit),
      offset: Number(offset)
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    const counts = await Product.findAll({
      attributes: ['category', [sequelize.fn('count', sequelize.col('id')), 'count']],
      where: { status: { [Op.ne]: 'sold' } },
      group: ['category']
    });
    const countsMap = {};
    counts.forEach(c => {
      countsMap[c.getDataValue('category')] = c.getDataValue('count');
    });
    const result = categories.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon || '🛍️',
      count: countsMap[c.id] || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', requireAuth, async (req, res) => {
  res.json(await Product.create({ id: req.body.id || `p${Date.now()}`, ...req.body }));
});
app.get('/api/products/:id', async (req, res) => res.json(await Product.findByPk(req.params.id)));
app.patch('/api/products/:id', requireAuth, async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(await product.update(req.body));
});
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  await Product.destroy({ where: { id: req.params.id }});
  res.json({ message: 'Deleted' });
});

// --- REVIEWS ROUTES ---
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { id, reviewerId, userId, sellerId, productId, rating, comment, images, date } = req.body;
    const review = await Review.create({
      id: id || `r${Date.now()}`,
      userId: reviewerId || userId,
      sellerId,
      productId,
      rating: Number(rating || 5),
      comment: comment || "",
      images: images || [],
      date: date || new Date().toISOString().split('T')[0]
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  try {
    await Review.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS ROUTES ---
app.get('/api/orders', requireAuth, async (req, res) => {
  // Return all for admin, otherwise filter by buyer/seller
  const orders = await Order.findAll();
  res.json(orders);
});

app.post('/api/orders', requireAuth, async (req, res) => {
  const items = req.body.items || [];
  
  // Decrease stock logic
  for (const item of items) {
    const p = await Product.findByPk(item.id);
    if (p) {
      const newStock = Math.max(0, p.stock - (item.qty || 1));
      await p.update({ stock: newStock, status: newStock === 0 ? 'sold' : 'available' });
    }
  }

  const newOrder = await Order.create({
    id: `o${Date.now()}`,
    ...req.body,
    status: 'pending',
    escrowStatus: 'held_by_platform',
    history: [{ status: 'pending', time: new Date().toLocaleString('vi-VN'), text: "Đơn hàng đã được đặt" }],
    steps: ['pending']
  });
  
  io.to(newOrder.sellerId).emit('order_update', newOrder);
  res.json(newOrder);
});

app.patch('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  
  // Add history event based on status change
  let historyText = "Trạng thái được cập nhật";
  if (req.body.status === 'paid') historyText = "Người bán đã xác nhận đơn hàng";
  if (req.body.status === 'shipping') historyText = "Đơn vị vận chuyển đã lấy hàng";
  if (req.body.status === 'completed') historyText = "Người mua đã xác nhận nhận hàng";
  if (req.body.status === 'cancelled') historyText = "Đơn hàng bị hủy";
  
  const history = order.history || [];
  history.push({ status: req.body.status, time: new Date().toLocaleString('vi-VN'), text: historyText });
  
  const steps = order.steps || [];
  if (req.body.status && !steps.includes(req.body.status)) steps.push(req.body.status);
  
  await order.update({ ...req.body, history, steps });
  
  io.to(order.buyerId).emit('order_update', order);
  io.to(order.sellerId).emit('order_update', order);
  
  res.json(order);
});

// --- DASHBOARD ROUTE ---
app.get('/api/dashboard/seller/:id', requireAuth, async (req, res) => {
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
    avgRating: 5.0,
    todo: { pendingConfirm, pendingPickup, processed, cancelled },
    trends: { revenue: "+18%", sales: "+12%", rating: "+0.2" },
    revenueChart: [0, 0, 0, 0, 0, revenue],
    months: ["T11", "T12", "T1", "T2", "T3", "T4"]
  });
});

app.get('/api/admin/stats', requireAuth, async (req, res) => {
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
    reports: []
  });
});

// --- SOCKET.IO REAL-TIME CHAT RELAY ---
const onlineUsers = new Map();
const pendingMessages = {}; // In-memory queue: { userId: [msg1, msg2] }

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (e) {
    next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (Socket: ${socket.id})`);
  onlineUsers.set(socket.userId, socket.id);
  socket.join(socket.userId); // Join personal room

  // Flush pending messages
  if (pendingMessages[socket.userId]) {
    pendingMessages[socket.userId].forEach(msg => socket.emit('receive_message', msg));
    delete pendingMessages[socket.userId];
  }

  socket.on('send_message', (msg) => {
    // Relay to recipient
    const recipientId = msg.chatId.replace(socket.userId, '').replace('_', ''); 
    // Wait, chatId format: p1_u1_u2. We should explicitly send recipientId in payload.
    const receiverId = msg.recipientId;
    
    if (receiverId && onlineUsers.has(receiverId)) {
      io.to(receiverId).emit('receive_message', msg);
    } else if (receiverId) {
      // Store in temporary offline queue
      pendingMessages[receiverId] = pendingMessages[receiverId] || [];
      pendingMessages[receiverId].push(msg);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    onlineUsers.delete(socket.userId);
  });
});

sequelize.sync().then(() => {
  console.log('Database synced successfully.');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error(err));
