const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

const Station = sequelize.define('Station', {
    stations_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    stations_name: {
        type: DataTypes.STRING
    }
}, {
  timestamps: false, // Tắt tự động tạo cột createdAt và updatedAt
  tableName: 'stations' // Đặt tên bảng nếu cần
});

(async () => {
    try {
      await Station.sync({ force: false });
      console.log('User table created successfully.');
    } catch (error) {
      console.error('Error creating user table:', error);
    }
  })();

  module.exports = Station;