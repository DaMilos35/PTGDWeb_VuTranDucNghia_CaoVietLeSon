import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  buyerId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sellerId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commission: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending' // pending, paid, shipping, completed, cancelled
  },
  escrowStatus: {
    type: DataTypes.STRING,
    defaultValue: 'held_by_platform'
  },
  items: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('items');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('items', JSON.stringify(v)); }
  },
  history: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('history');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('history', JSON.stringify(v)); }
  },
  steps: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('steps');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('steps', JSON.stringify(v)); }
  },
  shipper: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('shipper');
      return v ? JSON.parse(v) : null;
    },
    set(v) { this.setDataValue('shipper', JSON.stringify(v)); }
  }
});

export default Order;
