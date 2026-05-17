import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SiteStat = sequelize.define('SiteStat', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  pageViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  uniqueVisitors: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

export default SiteStat;
