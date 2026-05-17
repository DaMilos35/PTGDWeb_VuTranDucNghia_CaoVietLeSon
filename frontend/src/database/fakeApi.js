import { CATEGORIES, LOCATIONS } from "./constants";
import { saveMessageLocal, getMessagesLocal, getChatListLocal } from "./chatStorage";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';
const UPLOAD_API_URL = 'http://localhost:5000';

const fetchApi = async (endpoint, options = {}) => {
  try {
    let baseUrl = API_URL;
    if (endpoint.startsWith('/users') || endpoint.startsWith('/products') || endpoint.startsWith('/orders') || endpoint.startsWith('/sales') || endpoint.startsWith('/admin')) {
      baseUrl = 'http://localhost:5000/api';
    }
    
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || errBody.error || `API Error: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    throw err;
  }
};

const getStableRandom = (id, seed = 0) => {
  let hash = 0;
  const str = id + seed;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const INITIAL_DB_PATH = 'shared/data/db.json'; // This is just for reference

const fakeApi = {
  // ─── Categories ─────────────────────────────────────────────────────────────
  getCategories: async () => {
    const prods = await fetchApi('/products').catch(() => []);
    // Only count available products to match UI
    const availableProds = prods.filter(p => p.status !== 'sold');
    return CATEGORIES.map(c => ({
      ...c,
      count: availableProds.filter(p => p.category === c.id).length
    }));
  },

  // ─── Products ────────────────────────────────────────────────────────────────
  getProducts: async (filters = {}) => {
    let products = await fetchApi('/products').catch(() => []);

    // Filtering
    let filtered = products.filter(p => {
      if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category && filters.category.length > 0 && !filters.category.includes(p.category)) return false;
      if (filters.condition && filters.condition.length > 0 && !filters.condition.includes(p.condition)) return false;
      if (filters.location && filters.location !== 'all' && p.location !== filters.location) return false;
      if (!filters.includeSold && p.status === 'sold') return false;
      if (filters.minPrice && p.price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      return true;
    });

    // Sorting
    if (filters.sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (filters.sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (filters.sortBy === 'views') filtered.sort((a, b) => b.views - a.views);
    else filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  },

  deleteProduct: async (id) => fetchApi(`/products/${id}`, { method: 'DELETE' }),
  updateProduct: async (id, data) => fetchApi(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getLocations: async () => LOCATIONS,

  getProductsBySeller: async (sellerId) => {
    const all = await fetchApi('/products').catch(() => []);
    return all.filter(p => p.sellerId === sellerId);
  },

  createListing: async (data) => {
    const newProduct = {
      id: `p${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      views: 0,
      bids: 0,
      currentBid: data.format === 'auction' ? data.price : 0
    };
    return fetchApi('/products', { method: 'POST', body: JSON.stringify(newProduct) });
  },

  getSmartRecommendations: async (userId) => {
    const products = await fetchApi('/products').catch(() => []);
    // Simple random shuffle for demo; in production this would use user history
    return products.sort(() => 0.5 - Math.random()).slice(0, 4);
  },

  getProductById: async (id) => fetchApi(`/products/${id}`),
  getUserById: async (id) => fetchApi(`/users/${id}`),

  // ─── Auth ────────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi đăng nhập');
    }
    return res.json();
  },

  register: async (data) => {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi đăng ký');
    }
    return res.json();
  },

  updateProfile: async (userId, data) => {
    return fetchApi(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${UPLOAD_API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  updateUser: async (userId, data) => {
    return fetchApi(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  getFlashSales: async () => {
    try {
      const [salesRes, products] = await Promise.all([
        fetchApi('/sales').catch(() => []),
        fetchApi('/products').catch(() => [])
      ]);
      const approvedSales = salesRes.filter(s => s.status === 'approved');
      if (approvedSales.length > 0) {
        return approvedSales.map(ss => ({
          ...ss,
          product: products.find(p => p.id === ss.productId),
          originalPrice: products.find(p => p.id === ss.productId)?.price || 0
        }));
      }
      // Fallback to random products if no superSales in DB
      return products
        .filter(p => p.status === 'available')
        .sort(() => 0.5 - Math.random())
        .slice(0, 6)
        .map(p => ({
          id: `fs_${p.id}`,
          product: p,
          discount: Math.floor(Math.random() * 40) + 10,
          salePrice: p.price * 0.7,
          originalPrice: p.price,
          endTime: new Date(Date.now() + (Math.random() * 8 + 2) * 3600000).toISOString(),
          stock: 10,
          sold: Math.floor(Math.random() * 5)
        }));
    } catch (err) {
      console.error("Error fetching flash sales:", err);
      return [];
    }
  },

  // ─── Lives & Videos ────────────────────────────────────────────────────────
  getLives: async () => {
    try {
      const lives = await fetchApi('/lives').catch(() => []);
      if (lives.length > 0) return lives;
      // Fallback/Mock data if DB is empty
      const products = await fetchApi('/products').catch(() => []);
      const sellers = await fetchApi('/users').catch(() => []);
      
      return [
        {
          id: "l1",
          title: "Săn deal đồ công nghệ cũ cực hời 💻",
          viewers: 1240,
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
          sellerId: sellers[0]?.id || "u1",
          productIds: products.slice(0, 3).map(p => p.id),
          isLive: true
        },
        {
          id: "l2",
          title: "Thanh lý tủ đồ Vintage 👗",
          viewers: 850,
          videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          sellerId: sellers[1]?.id || "u2",
          productIds: products.slice(3, 6).map(p => p.id),
          isLive: true
        }
      ];
    } catch { return []; }
  },

  // ─── Super Sales & Combos ──────────────────────────────────────────────────
  getSuperSales: async () => {
    const [salesRes, products] = await Promise.all([
      fetchApi('/sales').catch(() => []),
      fetchApi('/products').catch(() => [])
    ]);
    const approvedSales = salesRes.filter(s => s.status === 'approved');
    return approvedSales.map(ss => ({
      ...ss,
      product: products.find(p => p.id === ss.productId)
    }));
  },

  getCombos: async () => {
    const [combos, products] = await Promise.all([
      fetchApi('/combos').catch(() => []),
      fetchApi('/products').catch(() => [])
    ]);
    return combos.map(c => ({
      ...c,
      products: products.filter(p => c.productIds.includes(p.id))
    }));
  },

  // ─── Suggestions & Admin Messages ──────────────────────────────────────────
  sendSuggestion: async (userId, content) => {
    const suggestion = {
      id: `sug${Date.now()}`,
      userId,
      content,
      type: 'suggestion',
      status: 'unread',
      createdAt: new Date().toISOString()
    };
    return fetchApi('/adminMessages', { method: 'POST', body: JSON.stringify(suggestion) });
  },

  getAdminMessages: async () => fetchApi('/adminMessages').catch(() => []),

  createSuperSale: async (data) => {
    return fetch('http://localhost:5000/api/sales', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    }).then(r => r.json());
  },

  createCombo: async (data) => {
    const newCombo = { id: `cb${Date.now()}`, ...data };
    return fetchApi('/combos', { method: 'POST', body: JSON.stringify(newCombo) });
  },

  // ─── Leaderboard ─────────────────────────────────────────────────────────────
  getLeaderboard: async () => {
    const users = await fetchApi('/users').catch(() => []);
    return users.sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 10);
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────
  getAdminStats: async () => fetchApi('/admin/stats'),

  getRecentActivity: async () => fetchApi('/admin/activity'),

  toggleUserBan: async (id) => {
    const u = await fetchApi(`/users/${id}`);
    return fetchApi(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ banned: !u.banned }) });
  },

  toggleUserVerify: async (userId) => {
    const user = await fetchApi(`/users/${userId}`);
    return fetchApi(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ verified: !user.verified }) });
  },

  getAllUsers: async () => fetchApi('/users').catch(() => []),
  getProductsAdmin: async () => fetchApi('/products').catch(() => []),
  getPendingProducts: async () => {
    const products = await fetchApi('/products').catch(() => []);
    return products.filter(p => p.status === 'pending');
  },
  getSystemSettings: async () => fetchApi('/settings').catch(() => ({ 
    platformFee: 7, 
    maintenanceMode: false, 
    globalAnnouncement: "Chào mừng bạn đến với Hand-Me-On! Chúc bạn mua bán vui vẻ.",
    allowGuestCheckout: true
  })),
  updateSystemSettings: async (data) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  removeProduct: async (id) => fetchApi(`/products/${id}`, { method: 'DELETE' }),

  dismissReport: async (id) => {
    const r = await fetchApi(`/reports/${id}`);
    return fetchApi(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) });
  },

  markAllSuggestionsRead: async () => {
    const all = await fetchApi('/adminMessages').catch(() => []);
    const unread = all.filter(s => s.status === 'unread');
    await Promise.all(unread.map(s => fetchApi(`/adminMessages/${s.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'read' }) })));
    return true;
  },

  getRevenueByCategory: async () => {
    const products = await fetchApi('/products').catch(() => []);
    const orders = await fetchApi('/orders').catch(() => []);
    const catMap = {};
    products.forEach(p => {
      if (!catMap[p.category]) catMap[p.category] = { revenue: 0, products: 0, orders: 0 };
      catMap[p.category].products++;
    });
    orders.forEach(o => {
      const product = products.find(p => p.id === o.productId);
      if (product && catMap[product.category]) {
        catMap[product.category].revenue += o.amount || 0;
        catMap[product.category].orders++;
      }
    });
    // Fallback with mock data
    return [
      { category: 'Điện tử', icon: '💻', revenue: 50000000, products: 120, orders: 40 },
      { category: 'Thời trang', icon: '👗', revenue: 20000000, products: 300, orders: 80 },
      { category: 'Nhà & Vườn', icon: '🏡', revenue: 8000000, products: 90, orders: 20 },
      { category: 'Sách', icon: '📚', revenue: 3000000, products: 200, orders: 60 },
    ];
  },

  getAllCoupons: async () => fetchApi('/coupons').catch(() => []),
  deleteCoupon: async (id) => fetchApi(`/coupons/${id}`, { method: 'DELETE' }).catch(() => null),
  removeProduct: async (id) => fetchApi(`/products/${id}`, { method: 'DELETE' }).catch(() => null),
  dismissReport: async (id) => {
    return fetchApi(`/reports/${id}`, { method: 'DELETE' }).catch(() => true);
  },

  updateSystemSettings: async (settings) => {
    return fetchApi('/settings', { method: 'POST', body: JSON.stringify(settings) }).catch(() => null);
  },

  // ─── Cart (Server + LocalStorage) ──────────────────────────────────────────
  getCart: async (userId = null) => {
    if (userId) {
      try {
        const user = await fetchApi(`/users/${userId}`);
        return user.cart || [];
      } catch { return []; }
    }
    try {
      const stored = localStorage.getItem('handmeon_cart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  addToCart: async (item, userId = null) => {
    const cart = await fakeApi.getCart(userId);
    const exists = cart.find(i => i.id === item.id);
    const updated = exists ? cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { ...item, qty: 1 }];

    if (userId) {
      await fetchApi(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ cart: updated }) });
    } else {
      localStorage.setItem('handmeon_cart', JSON.stringify(updated));
    }
    return updated;
  },

  removeFromCart: async (id, userId = null) => {
    const cart = await fakeApi.getCart(userId);
    const updated = cart.filter(i => i.id !== id);
    if (userId) {
      await fetchApi(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ cart: updated }) });
    } else {
      localStorage.setItem('handmeon_cart', JSON.stringify(updated));
    }
    return updated;
  },

  clearCart: async (userId = null) => {
    if (userId) {
      await fetchApi(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ cart: [] }) });
    } else {
      localStorage.setItem('handmeon_cart', JSON.stringify([]));
    }
    return [];
  },

  // ─── Coupons ─────────────────────────────────────────────────────────────────
  validateCoupon: async (code, orderTotal) => {
    const coupons = await fetchApi(`/coupons?code=${code}`).catch(() => []);
    if (coupons.length === 0) throw new Error('Mã giảm giá không tồn tại');
    const coupon = coupons[0];
    if (orderTotal < coupon.minOrder) throw new Error(`Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ`);
    let discountAmount = 0;
    if (coupon.type === 'percent') discountAmount = Math.min(orderTotal * coupon.discount / 100, coupon.maxDiscount);
    else if (coupon.type === 'fixed') discountAmount = coupon.discount;
    else if (coupon.type === 'freeship') discountAmount = coupon.maxDiscount;
    return { coupon, discountAmount };
  },

  applyCoupon: async (code) => true,

  // ─── Offers / Negotiation ──────────────────────────────────────────────────
  sendOffer: async (productId, buyerId, sellerId, price) => {
    const offer = {
      id: `off${Date.now()}`,
      productId, buyerId, sellerId, price,
      status: 'pending', // 'pending' | 'accepted' | 'rejected'
      createdAt: new Date().toISOString()
    };
    const saved = await fetchApi('/offers', { method: 'POST', body: JSON.stringify(offer) });

    // Also send a system message to the chat
    const chatId = [buyerId, sellerId].sort().join('_') + '_' + productId;
    await fetchApi('/messages', {
      method: 'POST', body: JSON.stringify({
        id: `m${Date.now()}`,
        chatId, senderId: buyerId,
        text: `đã gửi một lời đề nghị giá: ${new Intl.NumberFormat('vi-VN').format(price)}đ`,
        type: 'offer',
        offerId: saved.id,
        timestamp: 'Vừa xong'
      })
    });

    return saved;
  },

  respondToOffer: async (offerId, status) => {
    return fetchApi(`/offers/${offerId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },

  getOffers: async (userId) => {
    const all = await fetchApi('/offers').catch(() => []);
    return all.filter(o => o.buyerId === userId || o.sellerId === userId);
  },
  getOrders: async (userId) => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const orders = await res.json();
      return orders.filter(o => o.buyerId === userId || o.sellerId === userId);
    } catch { return []; }
  },

  createOrder: async (orderData) => {
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const saved = await res.json();

    // Mark products as reserved immediately
    if (orderData.items) {
      for (const item of orderData.items) {
        await fetch('http://localhost:5000/api/products/' + item.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'reserved' })
        }).catch(() => {});
      }
    }

    // Notify seller
    await fakeApi.sendNotification(orderData.sellerId, 'Đơn hàng mới!', `Bạn có đơn hàng mới trị giá ${new Intl.NumberFormat('vi-VN').format(orderData.amount)}đ. Vui lòng xác nhận sớm!`, 'order');
    return saved;
  },

  markProductSold: async (productId) => {
    return fetchApi(`/products/${productId}`, { method: 'PATCH', body: JSON.stringify({ status: 'sold' }) }).catch(() => { });
  },

  sendNotification: async (userId, title, body, type = 'system') => {
    const notif = {
      id: `n${Date.now()}`, userId, title, body, type, read: false,
      createdAt: new Date().toISOString()
    };
    return fetchApi('/notifications', { method: 'POST', body: JSON.stringify(notif) }).catch(() => { });
  },

  getSellerStats: async (sellerId) => {
    const random = getStableRandom(sellerId);
    const responseRate = 85 + (random % 15); // 85% to 100%
    const prepTime = (random % 3) === 0 ? "< 1 ngày" : (random % 3 === 1 ? "1-2 ngày" : "2-3 ngày");
    const activeListings = 5 + (random % 50);
    
    return {
      responseRate: `${responseRate}%`,
      prepTime,
      activeListings
    };
  },

  releaseEscrow: async (orderId) => {
    const order = await fetchApi(`/orders/${orderId}`);
    const settings = await fakeApi.getSystemSettings();
    const feePercent = settings.platformFee || 7;
    const commission = Math.round((order.amount || 0) * feePercent / 100);
    const sellerNet = (order.amount || 0) - commission;

    // Credit seller balance
    const seller = await fetchApi(`/users/${order.sellerId}`).catch(() => null);
    if (seller) {
      await fetchApi(`/users/${order.sellerId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          balance: (seller.balance || 0) + sellerNet,
          totalRevenue: (seller.totalRevenue || 0) + sellerNet,
          sales: (seller.sales || 0) + 1
        })
      });
    }

    // Buyer gets 1% coins reward
    const buyer = await fetchApi(`/users/${order.buyerId}`).catch(() => null);
    const coinReward = Math.round((order.amount || 0) * 0.01);
    if (buyer) {
      await fetchApi(`/users/${order.buyerId}`, {
        method: 'PATCH',
        body: JSON.stringify({ coins: (buyer.coins || 0) + coinReward })
      });
    }

    // Mark products sold
    if (order.items) {
      for (const item of order.items) {
        await fetchApi(`/products/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'sold' }) }).catch(() => { });
      }
    }

    // Notify seller
    await fakeApi.sendNotification(order.sellerId, '💰 Tiền đã về ví!', `${new Intl.NumberFormat('vi-VN').format(sellerNet)}đ đã được chuyển vào ví của bạn.`, 'payment');

    const history = [...(order.history || []), { status: 'completed', time: new Date().toLocaleString('vi-VN'), text: 'Người mua đã xác nhận nhận hàng. Tiền đã chuyển cho người bán.' }];
    return fetch('http://localhost:5000/api/orders/' + orderId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', escrowStatus: 'released_to_seller', commission, history, steps: [...(order.steps || []), 'completed'] })
    }).then(r => r.json());
  },

  getOffersForSeller: async (sellerId) => {
    const [offers, products, users] = await Promise.all([
      fetchApi('/offers').catch(() => []),
      fetchApi('/products').catch(() => []),
      fetchApi('/users').catch(() => []),
    ]);
    return offers
      .filter(o => o.sellerId === sellerId)
      .map(o => ({
        ...o,
        product: products.find(p => p.id === o.productId),
        buyer: users.find(u => u.id === o.buyerId),
      }));
  },
  sendOffer: async (productId, buyerId, sellerId, price) => {
    // 1. Create the offer record
    const newOffer = {
      id: `offer_${Date.now()}`,
      productId, buyerId, sellerId, price, status: 'pending', createdAt: new Date().toISOString()
    };
    await fetchApi('/offers', { method: 'POST', body: JSON.stringify(newOffer) });

    // 2. Notify the seller
    await fakeApi.sendNotification(sellerId, '🤝 Lời đề nghị mới', `Có người muốn mua sản phẩm của bạn với giá ${new Intl.NumberFormat('vi-VN').format(price)}đ`, 'offer');

    // 3. Send a message in the chat
    const { chatId } = await fakeApi.initiateChat(buyerId, sellerId, productId);
    const msg = {
      id: `msg_${Date.now()}`,
      chatId,
      senderId: buyerId,
      text: `Tôi muốn mua sản phẩm này với giá ${new Intl.NumberFormat('vi-VN').format(price)}đ.`,
      productId,
      timestamp: new Date().toISOString(),
      isOffer: true,
      offerPrice: price,
      offerId: newOffer.id
    };
    await fetchApi('/messages', { method: 'POST', body: JSON.stringify(msg) });
    return newOffer;
  },

  acceptOffer: async (offerId) => {
    const offer = await fetchApi(`/offers/${offerId}`);
    await fetchApi(`/offers/${offerId}`, { method: 'PATCH', body: JSON.stringify({ status: 'accepted' }) });
    // Notify buyer
    await fakeApi.sendNotification(offer.buyerId, '🎉 Lời đề nghị được chấp nhận!', `Người bán đã chấp nhận giá ${new Intl.NumberFormat('vi-VN').format(offer.price)}đ của bạn.`, 'offer');
    return offer;
  },

  rejectOffer: async (offerId) => {
    const offer = await fetchApi(`/offers/${offerId}`);
    await fetchApi(`/offers/${offerId}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) });
    await fakeApi.sendNotification(offer.buyerId, 'Lời đề nghị bị từ chối', 'Người bán đã từ chối lời đề nghị giá của bạn.', 'offer');
    return offer;
  },

  incrementProductViews: async (productId) => {
    const p = await fetchApi(`/products/${productId}`);
    return fetchApi(`/products/${productId}`, { method: 'PATCH', body: JSON.stringify({ views: (p.views || 0) + 1 }) });
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await fetch('http://localhost:5000/api/orders/' + orderId);
    const order = await res.json();
    const history = [...(order.history || []), { status, time: new Date().toLocaleString('vi-VN'), text: `Trạng thái mới: ${status}` }];
    const steps = [...(order.steps || []), status];

    let shipper = order.shipper;
    if (status === 'shipping' && shipper) {
      shipper.status = "Đang giao hàng";
    } else if (status === 'completed' && shipper) {
      shipper.status = "Đã giao xong";

      // Platform Escrow Logic: Release money to seller minus commission
      const settings = await fakeApi.getSystemSettings();
      const feePercent = settings.platformFee || 7;
      const commission = Math.round((order.amount || 0) * (feePercent / 100));
      const sellerNet = (order.amount || 0) - commission;

      // Update seller balance and platform revenue
      const seller = await fetchApi(`/users/${order.sellerId}`);
      await fetchApi(`/users/${order.sellerId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          totalRevenue: (seller.totalRevenue || 0) + sellerNet,
          sales: (seller.sales || 0) + 1
        })
      });

      // Mark escrow as released
      const escrowStatus = 'released_to_seller';

      // Mark products as sold
      if (order.items) {
        for (const item of order.items) {
          await fetchApi(`/products/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'sold' }) }).catch(() => { });
        }
      }

      return fetch('http://localhost:5000/api/orders/' + orderId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, history, steps, shipper, escrowStatus, commission })
      }).then(r => r.json());
    }

    return fetch('http://localhost:5000/api/orders/' + orderId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, history, steps, shipper })
    }).then(r => r.json());
  },

  // ─── Reviews ─────────────────────────────────────────────────────────────────
  getReviews: async (sellerId) => {
    const [all, users] = await Promise.all([
      fetchApi('/reviews').catch(() => []),
      fetchApi('/users').catch(() => []),
    ]);
    return all
      .filter(r => r.sellerId === sellerId)
      .map(r => ({ ...r, user: users.find(u => u.id === r.reviewerId) }));
  },

  addReview: async (reviewData) => {
    const newReview = {
      id: `r${Date.now()}`,
      ...reviewData,
      date: new Date().toISOString().split('T')[0],
    };
    return fetchApi('/reviews', { method: 'POST', body: JSON.stringify(newReview) });
  },

  // ─── Q&A ─────────────────────────────────────────────────────────────────────
  getQnA: async (productId) => {
    const [all, users] = await Promise.all([
      fetchApi('/qna').catch(() => []),
      fetchApi('/users').catch(() => []),
    ]);
    return all
      .filter(q => q.productId === productId)
      .map(q => ({ ...q, user: users.find(u => u.id === q.userId) }));
  },

  askQuestion: async (productId, userId, question) => {
    const newQ = {
      id: `q${Date.now()}`,
      productId,
      userId,
      question,
      answer: null,
      answeredAt: null,
      askedAt: new Date().toISOString().split('T')[0],
    };
    return fetchApi('/qna', { method: 'POST', body: JSON.stringify(newQ) });
  },

  answerQuestion: async (qId, answer) => {
    return fetchApi(`/qna/${qId}`, {
      method: 'PATCH',
      body: JSON.stringify({ answer, answeredAt: new Date().toISOString().split('T')[0] }),
    });
  },
  // ─── Dashboard ───────────────────────────────────────────────────────────────
  getSellerDashboardStats: async (sellerId) => {
    return fetch('http://localhost:5000/api/dashboard/seller/' + sellerId).then(r => r.json());
  },

  // ─── Messaging ───────────────────────────────────────────────────────────────
  getChatsForUser: async (userId) => {
    const messages = await fetchApi('/messages').catch(() => []);
    const chatMap = {};
    for (const msg of messages) {
      if (!msg.chatId) continue;
      if (!chatMap[msg.chatId]) chatMap[msg.chatId] = [];
      chatMap[msg.chatId].push(msg);
    }

    const chats = [];
    for (const [chatId, msgs] of Object.entries(chatMap)) {
      // Check if this user is a participant in this chat
      const parts = chatId.split('_');
      if (!parts.includes(userId)) continue;

      const lastMsg = msgs[msgs.length - 1];
      // Find other user: any part that starts with 'u' and is not current user
      const otherUserId = parts.find(id => id.startsWith('u') && id !== userId);
      // Find product: any part that starts with 'p'
      const productIdFromChatId = parts.find(id => id.startsWith('p'));

      const otherUser = otherUserId
        ? await fetchApi(`/users/${otherUserId}`).catch(() => null)
        : null;

      let product = null;
      const prodId = lastMsg.productId || productIdFromChatId;
      if (prodId) {
        product = await fetchApi(`/products/${prodId}`).catch(() => null);
      }

      // Sort messages by timestamp
      msgs.sort((a, b) => a.id.localeCompare(b.id));
      const sortedLastMsg = msgs[msgs.length - 1];

      chats.push({
        id: chatId,
        user: otherUser,
        product,
        time: sortedLastMsg.time,
        lastMessage: sortedLastMsg.text || (sortedLastMsg.type === 'image' ? '[Hình ảnh]' : sortedLastMsg.type === 'audio' ? '[Ghi âm]' : ''),
        unreadCount: msgs.filter(m => m.senderId !== userId && !m.read).length
      });
    }
    // Sort chats by last message (newest first)
    return chats.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  },

  getChatHistory: async (chatId) => {
    const all = await fetchApi('/messages').catch(() => []);
    return all.filter(m => m.chatId === chatId);
  },

  sendMessage: async (chatId, senderId, text, productId = null, payload = {}) => {
    const msg = {
      id: `m${Date.now()}`,
      chatId,
      senderId,
      text: payload.text !== undefined ? payload.text : text,
      productId,
      read: false,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      reactions: {},
      ...payload
    };
    const res = await fetchApi('/messages', { method: 'POST', body: JSON.stringify(msg) });

    // Chatbot logic for bot_123
    if (chatId.includes('bot_123') && senderId !== 'bot_123') {
      const lowerText = (msg.text || "").toLowerCase();
      let botReply = "Xin lỗi, hiện tại tôi chưa hiểu ý bạn. Bạn có thể nói rõ hơn được không?";

      if (lowerText.includes("mua") || lowerText.includes("thanh toán")) {
        botReply = "Để mua hàng, bạn chọn sản phẩm ưng ý, bấm 'Chat ngay' để thương lượng với người bán hoặc bấm 'Mua ngay' để thanh toán qua hệ thống bảo vệ người mua Escrow nhé!";
      } else if (lowerText.includes("bán") || lowerText.includes("đăng")) {
        botReply = "Bạn có thể đăng bán bằng cách bấm vào biểu tượng '+' hoặc nút 'Đăng bán' ở góc phải màn hình. Nhớ chụp ảnh sản phẩm thật rõ nét nhé!";
      } else if (lowerText.includes("phí")) {
        botReply = "Nền tảng thu phí giao dịch là 5% trên mỗi đơn hàng thành công. Nếu giao dịch bị hủy, bạn sẽ không mất phí.";
      } else if (lowerText.includes("lỗi") || lowerText.includes("chặn") || lowerText.includes("lừa đảo") || lowerText.includes("report")) {
        botReply = "Nếu phát hiện người dùng lừa đảo hoặc vi phạm, bạn hãy vào trang cá nhân của họ và chọn 'Báo cáo vi phạm'. Đội ngũ Admin sẽ xử lý nghiêm trong 24h.";
      } else if (lowerText.match(/^(hi|hello|chào|alo)/)) {
        botReply = "Chào bạn! Mình là Trợ lý 2ndHand. Mình có thể giúp gì cho bạn hôm nay?";
      }

      setTimeout(async () => {
        const botMsg = {
          id: `m${Date.now()}_bot`,
          chatId,
          senderId: 'bot_123',
          text: botReply,
          productId,
          read: false,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          reactions: {}
        };
        await fetchApi('/messages', { method: 'POST', body: JSON.stringify(botMsg) });
        localStorage.setItem(`sync_chat_${chatId}`, Date.now().toString()); // Trigger multi-tab/UI update
      }, 1500);
    }

    return res;
  },

  markAsRead: async (chatId, currentUserId) => {
    const all = await fetchApi(`/messages?chatId=${chatId}`).catch(() => []);
    const unreadMessages = all.filter(m => m.senderId !== currentUserId && !m.read);
    if (unreadMessages.length === 0) return [];

    // Trigger local storage event for multi-tab sync
    localStorage.setItem(`sync_chat_${chatId}`, Date.now().toString());

    // Execute sequentially to prevent json-server lowdb concurrent write issues
    const results = [];
    for (const m of unreadMessages) {
      const res = await fetchApi(`/messages/${m.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ read: true })
      }).catch(e => null);
      results.push(res);
    }
    return results;
  },

  addReaction: async (messageId, emoji) => {
    const all = await fetchApi('/messages').catch(() => []);
    const msg = all.find(m => m.id === messageId);
    if (!msg) return null;

    const reactions = msg.reactions || {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;

    return fetchApi(`/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ reactions })
    });
  },

  initiateChat: async (userId, sellerId, productId) => {
    // In mock, just navigate — real impl would create/find chat room
    return { chatId: `c_${userId}_${sellerId}_${productId}` };
  },

  // ─── Follows ─────────────────────────────────────────────────────────────────
  toggleFollow: async (userId, targetId) => {
    const [currentUser, targetUser] = await Promise.all([
      fetchApi(`/users/${userId}`),
      fetchApi(`/users/${targetId}`),
    ]);
    const isFollowing = (currentUser.following || []).includes(targetId);
    const newFollowing = isFollowing
      ? (currentUser.following || []).filter(id => id !== targetId)
      : [...(currentUser.following || []), targetId];
    const newFollowers = isFollowing
      ? (targetUser.followers || []).filter(id => id !== userId)
      : [...(targetUser.followers || []), userId];

    await Promise.all([
      fetchApi(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ following: newFollowing }) }),
      fetchApi(`/users/${targetId}`, { method: 'PATCH', body: JSON.stringify({ followers: newFollowers }) }),
    ]);
    return !isFollowing;
  },

  // ─── Notifications ───────────────────────────────────────────────────────────
  getNotifications: async (userId) => {
    try {
      const all = await fetchApi('/notifications');
      return all.filter(n => n.userId === userId);
    } catch { return []; }
  },

  markNotificationsRead: async (userId) => {
    try {
      const all = await fetchApi('/notifications').catch(() => []);
      const notifs = all.filter(n => n.userId === userId && !n.read);
      await Promise.all(
        notifs.map(n => fetchApi(`/notifications/${n.id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) }))
      );
    } catch { /* silent fail */ }
    return [];
  },

  // ─── Watchlist (Server + LocalStorage) ──────────────────────────────────────
  getWatchlist: async (userId = null) => {
    if (userId) {
      try {
        const user = await fetchApi(`/users/${userId}`);
        return user.watchlist || [];
      } catch { return []; }
    }
    try {
      const stored = localStorage.getItem('handmeon_watchlist');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  },

  toggleWatchlist: async (productId, userId = null) => {
    const list = await fakeApi.getWatchlist(userId);
    const updated = list.includes(productId)
      ? list.filter(id => id !== productId)
      : [...list, productId];

    if (userId) {
      await fetchApi(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify({ watchlist: updated }) });
    } else {
      localStorage.setItem('handmeon_watchlist', JSON.stringify(updated));
    }
    return updated;
  },

  getPlatformStats: async () => {
    const orders = await fetchApi('/orders').catch(() => []);
    const completed = orders.filter(o => o.status === 'completed');
    const totalCommission = completed.reduce((sum, o) => sum + (o.commission || 0), 0);
    const totalEscrow = orders.filter(o => o.escrowStatus === 'held_by_platform').reduce((sum, o) => sum + (o.amount || 0), 0);

    return {
      totalCommission,
      totalEscrow,
      completedOrders: completed.length,
      activeEscrows: orders.filter(o => o.escrowStatus === 'held_by_platform').length
    };
  },



  getRecommendedProducts: async (limit = 4) => {
    try {
      const prods = await fetchApi('/products?status=available&_limit=20');
      return prods.sort(() => 0.5 - Math.random()).slice(0, limit);
    } catch { return []; }
  },

  // ─── Social & Notifications ────────────────────────────────────────────────


  markNotificationRead: async (id) => fetchApi(`/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) }),

  // ─── Messaging Extras ──────────────────────────────────────────────────────

  resetDatabase: async () => {
    // In a real mock environment, we'd call an endpoint that resets db.json
    // For this mock, we'll just show success.
    console.log("Database reset requested");
    return { success: true, message: "Hệ thống đã được reset về mặc định." };
  },

  // ─── Vouchers ──────────────────────────────────────────────────────────────
  getVouchers: async () => fetchApi('/vouchers').catch(() => []),
  
  createVoucher: async (data) => {
    const newVoucher = { id: `v${Date.now()}`, ...data };
    return fetchApi('/vouchers', { method: 'POST', body: JSON.stringify(newVoucher) });
  },

  getSearchPreviews: async (query) => {
    try {
      const all = await fetchApi('/products');
      return all.filter(p => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
    } catch { return []; }
  },

  getTrendingProducts: async () => {
    try {
      const prods = await fetchApi('/products?status=available&_limit=20');
      return prods.sort(() => 0.5 - Math.random()).slice(0, 8);
    } catch { return []; }
  },

  validateVoucher: async (code, amount) => {
    const vouchers = await fetchApi('/vouchers').catch(() => []);
    const v = vouchers.find(x => x.code.toUpperCase() === code.toUpperCase());
    if (!v) throw new Error("Mã giảm giá không tồn tại");
    if (amount < v.minOrder) throw new Error(`Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN').format(v.minOrder)}đ`);
    if (new Date(v.expiry) < new Date()) throw new Error("Mã giảm giá đã hết hạn");
    if (v.usedCount >= v.usageLimit) throw new Error("Mã giảm giá đã hết lượt sử dụng");
    return v;
  },

  // ─── Disputes ──────────────────────────────────────────────────────────────
  getDisputes: async () => {
    const [disputes, users, orders] = await Promise.all([
      fetchApi('/disputes').catch(() => []),
      fetchApi('/users').catch(() => []),
      fetchApi('/orders').catch(() => [])
    ]);
    return disputes.map(d => ({
      ...d,
      buyer: users.find(u => u.id === d.buyerId),
      seller: users.find(u => u.id === d.sellerId),
      order: orders.find(o => o.id === d.orderId)
    }));
  },

  resolveDispute: async (id, decision) => {
    // decision: 'refund_buyer' | 'pay_seller' | 'dismiss'
    return fetchApi(`/disputes/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'resolved', decision, resolvedAt: new Date().toISOString() }) });
  }
};

export default fakeApi;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         