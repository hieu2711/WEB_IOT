const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

const User = sequelize.define('User', {
    userid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    roles: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false, // Tắt tự động tạo cột createdAt và updatedAt
    tableName: 'Users' // Đặt tên bảng nếu cần
});

(async () => {
    try {
      await User.sync({ force: false });
      console.log('User table created successfully.');
    } catch (error) {
      console.error('Error creating user table:', error);
    }
  })();

  module.exports = User;