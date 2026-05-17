import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 5.0
  },
  comment: {
    type: DataTypes.TEXT
  },
  images: {
    type: DataTypes.TEXT,
    get() {
      const v = this.getDataValue('images');
      return v ? JSON.parse(v) : [];
    },
    set(v) { this.setDataValue('images', JSON.stringify(v)); }
  }
});

export default Review;
