import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'c1'
  },
  sellerId: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'u1'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'available'
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  sold: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  condition: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  format: {
    type: DataTypes.STRING
  },
  bids: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentBid: {
    type: DataTypes.INTEGER
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  watchers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shipping: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  endDate: {
    type: DataTypes.DATE
  },
  images: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('images');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  specs: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('specs');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('specs', JSON.stringify(value));
    }
  },
  tags: {
    type: DataTypes.TEXT,
    get() {
      const rawValue = this.getDataValue('tags');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value));
    }
  }
});

export default Product;
