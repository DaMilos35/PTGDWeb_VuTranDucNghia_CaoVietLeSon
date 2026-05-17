import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  },
  avatar: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  sales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  joined: {
    type: DataTypes.DATEONLY
  },
  bio: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  frozenBalance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  following: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('following');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('following', JSON.stringify(v)); }
  },
  followers: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('followers');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('followers', JSON.stringify(v)); }
  },
  cart: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('cart');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('cart', JSON.stringify(v)); }
  },
  watchlist: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('watchlist');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('watchlist', JSON.stringify(v)); }
  }
});

export default User;
