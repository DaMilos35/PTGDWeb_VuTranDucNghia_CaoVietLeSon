import sequelize from '../config/database.js';
import User from './User.js';
import Product from './Product.js';
import Category from './Category.js';
import Order from './Order.js';
import SuperSale from './SuperSale.js';
import Review from './Review.js';
import SiteStat from './SiteStat.js';

// Associations
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Category.hasMany(Product, { foreignKey: 'category', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category', as: 'categoryDetail' });

User.hasMany(Order, { foreignKey: 'buyerId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Product.hasMany(Order, { foreignKey: 'productId', as: 'orders' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export {
  sequelize,
  User,
  Product,
  Category,
  Order,
  SuperSale,
  Review,
  SiteStat
};
