import fs from 'fs';
import { 
  initialUsers, 
  initialCategories, 
  initialConditions, 
  initialProducts, 
  initialOrders, 
  initialMessages, 
  initialReviews, 
  initialNotifications, 
  initialReports, 
  initialSystemSettings, 
  initialFlashSales, 
  initialCoupons, 
  initialQnA 
} from './src/api/mockData.js';

const db = {
  users: initialUsers,
  categories: initialCategories,
  conditions: initialConditions,
  products: initialProducts,
  orders: initialOrders,
  messages: initialMessages,
  reviews: initialReviews,
  notifications: initialNotifications,
  reports: initialReports,
  settings: initialSystemSettings,
  flashSales: initialFlashSales,
  coupons: initialCoupons,
  qna: initialQnA
};

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log('db.json successfully generated from src/api/mockData.js');
