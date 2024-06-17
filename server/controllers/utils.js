const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const moment = require('moment');
const Sensors = require('../models/Sensor');
require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});
// Thông tin tài khoản email để gửi mã OTP
const emailConfig = {
    service: 'Gmail',
    auth: {
        user: process.env.DB_MAIL,
        pass: process.env.DB_PASSWORDMAIL
    }
};

const transporter = nodemailer.createTransport(emailConfig);

// Tạo mã OTP

// Hàm cập nhật cộng thêm 7 giờ vào 22 dòng có id lớn nhất
async function updateTop22Ids() {
    try {
        // Lấy 22 id lớn nhất
        const rows = await Sensors.findAll({
            attributes: ['sensors_id'], // Đổi lại thành 'sensors_id' nếu đúng với tên cột trong cơ sở dữ liệu
            order: [['sensors_id', 'DESC']], // Đổi lại thành 'sensors_id' nếu đúng với tên cột trong cơ sở dữ liệu
            limit: 22
        });

        // Thu thập ids từ mảng các đối tượng Sequelize
        const ids = rows.map(row => row.dataValues.sensors_id); // Đổi lại thành 'sensors_id' nếu đúng với tên cột trong cơ sở dữ liệu

        if (ids.length > 0) {
            // Cập nhật các hàng có id trong danh sách
            await Sensors.update({
                sensors_datetime: sequelize.literal('DATE_ADD(sensors_datetime, INTERVAL 7 HOUR)')
            }, {
                where: {
                    sensors_id: ids // Đổi lại thành 'sensors_id' nếu đúng với tên cột trong cơ sở dữ liệu
                }
            });
            console.log('Cập nhật thành công!');
        } else {
            console.log('Không tìm thấy dữ liệu để cập nhật.');
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
    }
}

const generateOTP = () => {
    const secret = speakeasy.generateSecret({ length: 20 }); // Tạo khóa bí mật mới
    globalSecret = secret.base32;
    let otp = speakeasy.totp({
        secret: globalSecret,
        step: 60,
        digits: 6 
    });

    // Kiểm tra xem mã OTP có bắt đầu bằng số 0 không
    while (otp.startsWith('0')) {
        secret = speakeasy.generateSecret({ length: 20 });
        globalSecret = secret.base32;
        otp = speakeasy.totp({
            secret: globalSecret,
            step: 60,
            digits: 6 
        });
    }

    setTimeout(() => {
        console.log('OTP đã hết hạn.');
        globalSecret = null;
    }, 60 * 1 * 1000); // 5 phút tính bằng mili giây
    return otp;
};



// Gửi email chứa mã OTP
const sendOTPByEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.DB_MAIL,
        to: email,
        subject: 'Your One Time Password (OTP)',
        text: `Your OTP is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

async function checkAndSaveData(jsonData) {
    try {
        // Lấy dữ liệu cảm biến đã lưu trữ trước đó
        const storedSensorData = await getStoredSensorData(jsonData.station_id, jsonData.sensors.map(sensor => sensor.id));
        // Kiểm tra xem dữ liệu mới có giống dữ liệu đã lưu không
        let newDataDifferent = false;

        // So sánh dữ liệu mới với dữ liệu đã lưu trữ
        jsonData.sensors.forEach(sensor => {
            const storedDataForSensor = storedSensorData.find(data => data.sensors_name === sensor.id && data.stations_id === jsonData.station_id);
            if (!storedDataForSensor || storedDataForSensor.sensors_value != sensor.value) {
                newDataDifferent = true;
            }
        });

        if (newDataDifferent) {
            return true;
        } else {
            // Nếu không có cảm biến nào khác biệt, không lưu trữ và trả về false
            return false;
        }
    } catch (error) {
        console.error('Error checking and saving data:', error);
        return false;
    }
}


async function getStoredSensorData(stationsId, sensorsNames, limit = 22) {
    try {
        const results = await Sensors.findAll({
            where: {
                stations_id: stationsId,
                sensors_name: sensorsNames,
            },
            attributes: ['stations_id', 'sensors_name', 'sensors_value', 'sensors_id'],
            order: [['sensors_id', 'DESC']],
            limit: limit,
        });
        const reversedResults = results.reverse();
        return reversedResults;
    } catch (error) {
        throw error;
    }
}



async function saveDataToDatabase(jsonData, check) {
    const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');

    try {
        const promises = jsonData.sensors.map(sensor => {
            return Sensors.create({
                stations_id: jsonData.station_id,
                sensors_name: sensor.id,
                sensors_value: sensor.value,
                sensors_datetime: currentDateTime,
                sensors_flag: check,
            });
        });

        await Promise.all(promises);
        console.log('Inserted sensor data successfully');
    } catch (error) {
        console.error('Error inserting sensor data:', error.message);
    }
}

module.exports = { generateOTP, sendOTPByEmail , checkAndSaveData, saveDataToDatabase, updateTop22Ids};