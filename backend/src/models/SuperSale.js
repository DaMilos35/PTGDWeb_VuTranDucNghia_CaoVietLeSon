import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SuperSale = sequelize.define('SuperSale', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sellerId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  salePrice: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  originalPrice: {
    type: DataTypes.INTEGER
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  sold: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  endTime: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending' // pending, approved, rejected
  }
});

export default SuperSale;
