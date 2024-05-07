require('dotenv').config();
const Station = require("../models/Station");
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});


const Sensor = sequelize.define('Sensor', {
    sensors_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stations_id: {
        type: DataTypes.STRING
    },
    sensors_name: {
        type: DataTypes.STRING
    },
    sensors_value: {
        type: DataTypes.FLOAT
    },
    sensors_datetime: {
        type: DataTypes.DATE
    },
    sensors_flag: {
        type: DataTypes.BOOLEAN
    }
}, {
    timestamps: false, // Tắt tự động tạo cột createdAt và updatedAt
    tableName: 'Sensors' // Đặt tên bảng nếu cần
});

(async () => {
    try {
      await Sensor.sync({ force: false });
      console.log('User table created successfully.');
    } catch (error) {
      console.error('Error creating user table:', error);
    }
  })();

  module.exports = Sensor;