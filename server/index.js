const express = require('express');
const cors = require('cors'); 
const mysql = require('mysql2');
const { DateTime } = require('luxon');
const moment1 = require('moment-timezone');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const mqtt = require('mqtt');
const app = express();
const port = 1104;
const saltRounds = 10;
const secretKey = 'your_secret_key';
let sseClients = [];
let lastData = null;
let newData = null;
const { Sequelize, DataTypes } = require('sequelize');
const Sensor = require("../server/models/Sensor");
const authRoute = require("../server/routes/auth");
const userRoute = require("../server/routes/user");
require('dotenv').config();
const { checkAndSaveData, saveDataToDatabase } = require("../server/controllers/utils");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});
const brokerUrl = 'http://mqttserver.tk';
const brokerPort = 1883;
const brokerUsername = 'innovation';
const brokerPassword = 'Innovation_RgPQAZoA5N';
const topic = '/innovation/airmonitoring/WSNs';
const CLIENT_ID = 'innovation';
const CLEAN_SESSION = true;

const client = mqtt.connect(brokerUrl, {
    host: brokerUrl,
    port: brokerPort,
    username: brokerUsername,
    password: brokerPassword,
    clientId: CLIENT_ID,
    clean: CLEAN_SESSION,
});

client.on('connect', function () {
    console.log('Connected to MQTT broker');
    client.subscribe(topic, function (err) {
        if (!err) {
            console.log('Subscribed to', topic);
        }
    });
});

client.on('message', async (topic, receivedMessage) => {
    const messageString = receivedMessage.toString();

    try {
        const jsonStringWithDoubleQuotes = messageString.replace(/'/g, '"');
        const messageJSON = JSON.parse(jsonStringWithDoubleQuotes);
        console.log(`Received JSON message on topic ${topic}:`, messageJSON);
        // Xử lý thông điệp JSON ở đây
        const check = await checkAndSaveData(messageJSON); // Chờ hàm này hoàn thành trước khi tiếp tục
        console.log(check)
        await saveDataToDatabase(messageJSON, check); // Chờ hàm này hoàn thành trước khi tiếp tục
    } catch (error) {
        console.error('Lỗi khi phân tích JSON:', error);
        // Xử lý lỗi ở đây
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

function sendSSEData(data) {
    sseClients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

sequelize.sync()
    .then(() => {
        console.log('Mô hình đã được đồng bộ hóa với cơ sở dữ liệu');
    })
    .catch(err => {
        console.error('Không thể đồng bộ hóa mô hình với cơ sở dữ liệu:', err);
    }
);

const db = mysql.createConnection({
    host: process.env.DB_HOST, // Thay đổi thành địa chỉ MySQL của bạn
    user: process.env.DB_USER, // Thay đổi thành tên người dùng MySQL của bạn
    password: process.env.DB_PASSWORD, // Thay đổi thành mật khẩu MySQL của bạn
      database: process.env.DB_NAME // Thay đổi thành tên cơ sở dữ liệu MySQL của bạn
  }
);
  
// Kết nối đến cơ sở dữ liệu
db.connect(err => {
    if (err) {
      console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
    } else {
      console.log('Kết nối đến cơ sở dữ liệu thành công');
    }
  }
);    

app.get('/api/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    sseClients.push({ req, res });

    // Gửi dữ liệu gần nhất ngay khi máy khách kết nối
    if (lastData) {
        res.write(`data: ${JSON.stringify(lastData)}\n\n`);
    }

    // Xử lý khi máy khách ngắt kết nối
    req.on('close', () => {
        sseClients = sseClients.filter(client => client.res !== res);
    });
});

function sendSSEDataToClients(data) {
    // Send SSE data to all connected clients
    sseClients.forEach(client => {
        client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}
setInterval(() => {
    const newData = fetchDataFromDatabase();
    if (newData) {
        sendSSEDataToClients(newData);
    }
}, 5000);

function fetchDataFromDatabase() {
    const sql = 'SELECT * FROM sensors';

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
        } else {
            // So sánh dữ liệu mới với dữ liệu cũ để kiểm tra xem có sự thay đổi
            if (JSON.stringify(result) !== JSON.stringify(newData)) {
                newData = result;
                sendSSEDataToClients(newData);
                // Gửi dữ liệu qua SSE nếu có sự thay đổi
                // Gọi lại API từ phía frontend để lấy dữ liệu mới
                // Thêm mã ở đây để gọi lại API từ frontend
            }
        }
    });
}

// Định nghĩa các tuyến (routes) cho API ở đây

app.listen(port, () => {
  console.log(`API đang chạy trên cổng ${port}`);
});

//ROUTE LOGIN
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);

// Lấy tất cả dữ liệu từ một bảng
app.get('/api/data', (req, res) => {
    const sql = 'SELECT * FROM stations'; // Thay đổi thành tên bảng của bạn

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        } else {
            res.json(result);
        }
    });
});


//api get station 1
app.get('/api/air_0001', (req, res) => {
    const sql = `SELECT stations_id, sensors_name, sensors_value, sensors_datetime
               FROM sensors
               WHERE sensors_datetime = (SELECT MAX(sensors_datetime) FROM sensors)`;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        } else {
            const resultWithVietnamTime = result.map(record => {
                record.sensors_datetime = moment1(record.sensors_datetime).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DDTHH:mm:ss.SSS');
                return record;
            });

            res.json(resultWithVietnamTime);
        }
    });
});

// thống kê nhiệt độ 
http://localhost:1104/api/solar-air/bieudonhietdo?year=2024&month=3
app.get('/api/solar-air/bieudonhietdo', (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const sql = `
    SELECT * FROM (
        SELECT
          DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
          ROUND(AVG(sensors_value), 0) AS average_temperature
        FROM
          sensors
        WHERE
          LOWER(sensors_name) = "temp_0001"
          AND MONTH(sensors_datetime) = "${month}"
          AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
          DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
          sensors_datetime DESC
        LIMIT 8
    ) AS subquery
    ORDER BY
      date ASC;    
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        } else {
            const data = result.map(row => ({
                date: row.date,
                temperature: row.average_temperature.toString(),
            }));

            res.json(data);
        }
    });
});

// thống kê năng lượng
http://localhost:1104/api/solar-air/bieudonangluong?year=2024&month=3
app.get('/api/solar-air/bieudonangluong', (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const sql = `
    SELECT * FROM (
        SELECT
          DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
          ROUND(AVG(sensors_value * 100), 0) AS average_temperature
        FROM
          sensors
        WHERE
          LOWER(sensors_name) = "power_0001"
          AND MONTH(sensors_datetime) = "${month}"
          AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
          DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
          sensors_datetime DESC
        LIMIT 8
    ) AS subquery
    ORDER BY
      date ASC;    
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        } else {
            const data = result.map(row => ({
                date: row.date,
                power: row.average_temperature.toString(),
            }));

            res.json(data);
        }
    });
});

// thống kê năng lượng và độ ẩm TOP 10
http://localhost:1104/api/solar-air/bieudotiengonvadoamTop10?year=2024&month=3
app.get('/api/solar-air/bieudotiengonvadoamTop10', async (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const sql1 = `
    SELECT *
    FROM (
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value), 0) AS average_1
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'noise_0001'
            AND MONTH(sensors_datetime) = "${month}"
            AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
            sensors_datetime DESC
        LIMIT 10
    ) AS subquery
    ORDER BY
        date ASC;    
`;

const sql2 = `
    SELECT *
    FROM (
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value), 0) AS average_2
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'humi_0001'
            AND MONTH(sensors_datetime) = "${month}"
            AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
            sensors_datetime DESC
        LIMIT 10
    ) AS subquery
    ORDER BY
        date ASC;    
`;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const combinedResults = results1.map((tempRow, index) => ({
            date: tempRow.date,
            noise: tempRow.average_1.toString(),
            humi: results2[index] ? results2[index].average_2.toString() : 'N/A'
        }));

        res.json(combinedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});

// thống kê độ ẩm và tiếng ồn
http://localhost:1104/api/solar-air/bieudotiengonvadoam?year=2024&month=3
app.get('/api/solar-air/bieudotiengonvadoam', async (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const sql1 = `
    SELECT *
    FROM (
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value), 0) AS average_1
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'humi_0001'
            AND MONTH(sensors_datetime) = "${month}"
            AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
            sensors_datetime DESC
        LIMIT 7
    ) AS subquery
    ORDER BY
        date ASC;    
`;

const sql2 = `
    SELECT *
    FROM (
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value), 0) AS average_2
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'noise_0001'
            AND MONTH(sensors_datetime) = "${month}"
            AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
            sensors_datetime DESC
        LIMIT 7
    ) AS subquery
    ORDER BY
        date ASC;    
`;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const combinedResults = results1.map((tempRow, index) => ({
            date: tempRow.date,
            humi: tempRow.average_1.toString(),
            noise: results2[index] ? results2[index].average_2.toString() : 'N/A'
        }));

        res.json(combinedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});

// THỐNG KÊ
http://localhost:1104/api/solar-air/bieudonangluongvadoam?year=2024&month=3&day=29
app.get('/api/solar-air/bieudonangluongvadoamTK', async (req, res) => {
    let year = req.query.year || new Date().getFullYear();
    let month = req.query.month || new Date().getMonth() + 1;
    let day = req.query.day || new Date().getDate();

    let dateCondition;
    if (day) {
        dateCondition = `DAY(sensors_datetime) = "${day}"`;
    } else {
        dateCondition = `MONTH(sensors_datetime) = "${month}"`;
    }

    const sql1 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value), 0) AS average_1
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'humi_0001'
                AND ${dateCondition}
                AND YEAR(sensors_datetime) = "${year}"
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 12
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    const sql2 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value * 100), 0) AS average_2
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'power_0001'
                AND ${dateCondition}
                AND YEAR(sensors_datetime) = "${year}"
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 12
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const combinedResults = results1.map((tempRow, index) => ({
            date: tempRow.date,
            humi: tempRow.average_1.toString(),
            power: results2[index] ? results2[index].average_2.toString() : 'N/A'
        }));

        res.json(combinedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});

//Thoogs kê theo khoảng ngày mà người dùng nhập vào 
app.get('/api/solar-air/bieudonangluongvadoamTKChiTiet', async (req, res) => {
    let startDateTime = req.query.startDateTime || `${new Date().getFullYear()}-01-01 00:00:00`;
    let endDateTime = req.query.endDateTime || `${new Date().getFullYear()}-12-31 23:59:59`;

    startDateTime = new Date(startDateTime).toISOString().slice(0, 19).replace('T', ' ');
    endDateTime = new Date(new Date(endDateTime).getTime() + 86400000 - 1000).toISOString().slice(0, 19).replace('T', ' ');

    const dateCondition = `sensors_datetime BETWEEN "${startDateTime}" AND "${endDateTime}"`;

    const sql1 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value), 0) AS average_1
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'humi_0001'
                AND ${dateCondition}
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 12
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    const sql2 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value * 100), 0) AS average_2
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'power_0001'
                AND ${dateCondition}
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 12
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const combinedResults = results1.map((tempRow, index) => ({
            date: tempRow.date,
            humi: tempRow.average_1.toString(),
            power: results2[index] ? results2[index].average_2.toString() : 'N/A'
        }));

        res.json(combinedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});


// thống kê độ ẩm và năng lượng theo tháng
http://localhost:1104/api/solar-air/bieudonangluongvadoamTKThangTKThang?year=2024&month=3
app.get('/api/solar-air/bieudonangluongvadoamTKThang', async (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const sql1 = `
    SELECT *
    FROM (
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value * 100), 0) AS average_1
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'power_0001'
            AND MONTH(sensors_datetime) = "${month}"
            AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
            sensors_datetime DESC
        LIMIT 12
    ) AS subquery
    ORDER BY
        date ASC;    
`;

const sql2 = `
    SELECT *
    FROM (
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value), 0) AS average_2
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'humi_0001'
            AND MONTH(sensors_datetime) = "${month}"
            AND YEAR(sensors_datetime) = "${year}"
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
            sensors_datetime DESC
        LIMIT 12
    ) AS subquery
    ORDER BY
        date ASC;    
`;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const combinedResults = results1.map((tempRow, index) => ({
            date: tempRow.date,
            power: tempRow.average_1.toString(),
            humi: results2[index] ? results2[index].average_2.toString() : 'N/A'
        }));

        res.json(combinedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});

//Thống kê tiếng ồn và không khí theo tháng và ngày 
app.get('/api/solar-air/bieudotiengonvakhongkhiTop10', async (req, res) => {
    let year = req.query.year || new Date().getFullYear();
    let month = req.query.month || new Date().getMonth() + 1;
    let day = req.query.day || null; // Khởi tạo day là null

    let dateCondition;
    if (day) {
        dateCondition = `DAY(sensors_datetime) = "${day}"`;
    } else {
        dateCondition = `MONTH(sensors_datetime) = "${month}"`;
    }

    const sql1 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value), 0) AS average_1
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'noise_0001'
                AND ${dateCondition}
                AND YEAR(sensors_datetime) = "${year}"
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 10
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    const sql2 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value), 0) AS average_2
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'atmosphere_0001'
                AND ${dateCondition}
                AND YEAR(sensors_datetime) = "${year}"
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 10
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const combinedResults = results1.map((tempRow, index) => ({
            date: tempRow.date,
            noise: tempRow.average_1.toString(),
            atmosphere: results2[index] ? results2[index].average_2.toString() : 'N/A'
        }));

        res.json(combinedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});


//Thoogs kê theo khoảng ngày mà người dùng nhập vào thống kê tiếng ồn và không khí 
app.get('/api/solar-air/bieudotiengonvakhongkhiTKChiTiet', async (req, res) => {
    let startDateTime = req.query.startDateTime || `${new Date().getFullYear()}-01-01 00:00:00`;
    let endDateTime = req.query.endDateTime || `${new Date().getFullYear()}-12-31 23:59:59`;

    startDateTime = new Date(startDateTime).toISOString().slice(0, 19).replace('T', ' ');
    endDateTime = new Date(new Date(endDateTime).getTime() + 86400000 - 1000).toISOString().slice(0, 19).replace('T', ' ');

    const dateCondition = `sensors_datetime BETWEEN "${startDateTime}" AND "${endDateTime}"`;

    const sql1 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value), 0) AS average_1
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'noise_0001'
                AND ${dateCondition}
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 12
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    const sql2 = `
        SELECT *
        FROM (
            SELECT
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
                ROUND(AVG(sensors_value), 0) AS average_2
            FROM
                sensors
            WHERE
                LOWER(sensors_name) = 'atmosphere_0001'
                AND ${dateCondition}
            GROUP BY
                DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
            ORDER BY
                sensors_datetime DESC
            LIMIT 12
        ) AS subquery
        ORDER BY
            date ASC;    
    `;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        const combinedResults = results1.map((tempRow, index) => ({
            date: tempRow.date,
            noise: tempRow.average_1.toString(),
            atmosphere: results2[index] ? results2[index].average_2.toString() : 'N/A'
        }));

        res.json(combinedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});

//thống kê nhiệt độ của ngày và tháng
app.get('/api/solar-air/bieudonhietdoTK', (req, res) => {
    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const day = req.query.day; // Lấy ngày từ query params

    let condition = ""; // Điều kiện thêm vào truy vấn SQL

    if (day) {
        condition = `AND DAY(sensors_datetime) = "${day}"`;
    }

    const sql = `
    SELECT * FROM (
        SELECT
          DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
          ROUND(AVG(sensors_value), 0) AS average_temperature
        FROM
          sensors
        WHERE
          LOWER(sensors_name) = "temp_0001"
          AND MONTH(sensors_datetime) = "${month}"
          AND YEAR(sensors_datetime) = "${year}"
          ${condition}
        GROUP BY
          DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
          sensors_datetime DESC
        LIMIT 8
    ) AS subquery
    ORDER BY
      date ASC;    
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        } else {
            const data = result.map(row => ({
                date: row.date,
                temperature: row.average_temperature.toString(),
            }));

            res.json(data);
        }
    });
});
//thống kê nhiệt độ theo khoảng thời gian
app.get('/api/solar-air/bieudonhietdoTKChiTiet', async (req, res) => {
    let startDateTime = req.query.startDateTime || `${new Date().getFullYear()}-01-01 00:00:00`;
    let endDateTime = req.query.endDateTime || `${new Date().getFullYear()}-12-31 23:59:59`;

    startDateTime = new Date(startDateTime).toISOString().slice(0, 19).replace('T', ' ');
    endDateTime = new Date(new Date(endDateTime).getTime() + 86400000 - 1000).toISOString().slice(0, 19).replace('T', ' ');

    const dateCondition = `sensors_datetime BETWEEN "${startDateTime}" AND "${endDateTime}"`;

    const sql = `
    SELECT * FROM(
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value), 0) AS average_noise
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'temp_0001'
            AND ${dateCondition}
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s'), sensors_datetime
        ORDER BY
            sensors_datetime DESC
        LIMIT 8
        ) as subquery
        ORDER BY
        date ASC;    
    `;

    try {
        const results = await new Promise((resolve, reject) => {
            db.query(sql, (err, result) => err ? reject(err) : resolve(result));
        });

        const formattedResults = results.map(row => ({
            date: row.date,
            temperature: row.average_noise.toString(),
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error('Lỗi truy vấn cơ sở dữ liệu:', error);
        res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
    }
});

// Hàm để lấy đơn vị tương ứng
function getUnit(sensorName) {
    const unitMap = {
        'vol_0001': '(V)',
        'vol_0002': '(V)',
        'power_0001': '(kW)',
        'temp_0001': '(°C)',
        'temp_0002': '(°C)',
        'humi_0001': '(%)',
        'humi_0002': '(%)',
        'illuminance_0001': '(lx)',
        'atmosphere_0001': '(kPa)',
        'noise_0001': '(dB)',
        'pm10_0001': '(µg/m³)',
        'pm2.5_0001': '(µg/m³)',
        'CO_0001': '(µg/m³)',
        'SO2_0001': '(µg/m³)',
        'NO2_0001': '(µg/m³)',
        'O3_0001': '(µg/m³)',
        'CO2_0001': '(ppm)',
        'ph_0002': '',
        'EC_0002': '(µS/cm)',
        'Nito_0002': '(mg/L)',
        'Photpho_0002': '(mg/L)',
        'Kali_0002': '(mg/L)'
    };

    return unitMap[sensorName] || 'Không xác định';
}
//Bảng thống kê theo ngày và tháng 
app.get('/api/solar-air/thongkeminmax', (req, res) => {
    const unitMap = { // Di chuyển unitMap vào đây để đảm bảo nó được định nghĩa trước khi sử dụng
        'vol_0001': '(V)',
        'vol_0002': '(V)',
        'power_0001': '(kW)',
        'temp_0001': '(°C)',
        'temp_0002': '(°C)',
        'humi_0001': '(%)',
        'humi_0002': '(%)',
        'illuminance_0001': '(lx)',
        'atmosphere_0001': '(kPa)',
        'noise_0001': '(dB)',
        'pm10_0001': '(µg/m³)',
        'pm2.5_0001': '(µg/m³)',
        'CO_0001': '(µg/m³)',
        'SO2_0001': '(µg/m³)',
        'NO2_0001': '(µg/m³)',
        'O3_0001': '(µg/m³)',
        'CO2_0001': '(ppm)',
        'ph_0002': 'pH',
        'EC_0002': '(µS/cm)',
        'Nito_0002': '(mg/L)',
        'Photpho_0002': '(mg/L)',
        'Kali_0002': '(mg/L)'
    };

    const year = req.query.year || new Date().getFullYear();
    const month = req.query.month || new Date().getMonth() + 1;
    const day = req.query.day; // Lấy ngày từ query params

    let condition = ""; // Điều kiện thêm vào truy vấn SQL

    if (day) {
        condition = `AND DAY(sensors_datetime) = "${day}"`;
    }

    let orderBy = "";
    if (day) {
        orderBy = "ORDER BY sensors_value DESC"; // Lấy 22 giá trị lớn nhất
    } else {
        orderBy = "ORDER BY sensors_value ASC"; // Lấy 22 giá trị nhỏ nhất
    }

    const columnsQuery = [
        'vol_0001', 'vol_0002', 'power_0001', 'temp_0001', 'humi_0001',
        'illuminance_0001', 'atmosphere_0001', 'noise_0001', 'pm10_0001',
        'CO_0001', 'CO2_0001', 'SO2_0001', 'NO2_0001',
        'O3_0001', 'temp_0002', 'humi_0002', 'ph_0002', 'EC_0002',
        'Nito_0002', 'Photpho_0002', 'Kali_0002'
    ].map(col => {
        return `MIN(IF(sensors_name = '${col}', sensors_value, NULL)) AS min_${col}, MAX(IF(sensors_name = '${col}', sensors_value, NULL)) AS max_${col}, '${unitMap[col]}' AS unit_${col}`;
    }).join(', ');

    const sql = `
    SELECT ${columnsQuery}
    FROM
      sensors
    WHERE
      MONTH(sensors_datetime) = "${month}"
      AND YEAR(sensors_datetime) = "${year}"
      ${condition}
    ${orderBy}
    LIMIT 22;
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        } else {
            res.json(result);
        }
    });
});


//Bảng thống kê thao khoảng thời gian 
app.get('/api/solar-air/thongkeminmaxChiTiet', (req, res) => {
    const startDateTime = req.query.startDateTime || `${new Date().getFullYear()}-01-01 00:00:00`;
    let endDateTime = req.query.endDateTime || `${new Date().getFullYear()}-12-31 23:59:59`;

    // Kiểm tra nếu ngày kết thúc đã được nhập, thì thêm thời gian cuối ngày
    if (req.query.endDateTime) {
        const endDay = new Date(endDateTime);
        endDay.setHours(23, 59, 59, 0); // Đặt thời gian cuối ngày
        endDateTime = endDay.toISOString().slice(0, 19).replace('T', ' ');
    }

    const columnsQuery = [
        'vol_0001', 'vol_0002', 'power_0001', 'temp_0001', 'humi_0001',
        'illuminance_0001', 'atmosphere_0001', 'noise_0001', 'pm10_0001',
        'CO_0001', 'CO2_0001', 'SO2_0001', 'NO2_0001',
        'O3_0001', 'temp_0002', 'humi_0002', 'ph_0002', 'EC_0002',
        'Nito_0002', 'Photpho_0002', 'Kali_0002'
    ].map(col => {
        return `MAX(IF(sensors_name = '${col}', sensors_value, NULL)) AS max_${col}, MIN(IF(sensors_name = '${col}', sensors_value, NULL)) AS min_${col}, '${getUnit(col)}' AS unit_${col}`;
    }).join(', ');

    const sql = `
    SELECT ${columnsQuery}
    FROM sensors
    WHERE sensors_datetime BETWEEN '${startDateTime}' AND '${endDateTime}'
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn cơ sở dữ liệu:', err);
            res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu' });
        } else {
            res.json(result);
        }
    });
});

function getSensorsDataByDay(day, month, year, callback) {
    // Tính ngày bắt đầu và kết thúc của ngày
    const startDate = `${year}-${month}-${day} 00:00:00`;
    const endDate = `${year}-${month}-${day} 23:59:59`;

    // Truy vấn cơ sở dữ liệu để lấy dữ liệu cảm biến trong ngày đã chỉ định
    const sql = `SELECT * FROM sensors WHERE sensors_datetime >= '${startDate}' AND sensors_datetime <= '${endDate}'`;
    db.query(sql, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        if (result.length === 0) {
            return callback(null, null);
        }

        // Biến để kiểm tra xem có sensors_flag là false không
        let hasFalseFlag = false;

        // Kiểm tra từng dòng kết quả
        result.forEach(row => {
            // Nếu sensors_flag là false, đánh dấu hasFalseFlag là true và dừng vòng lặp
            if (!hasFalseFlag && !row.sensors_flag) {
                hasFalseFlag = true;
            }
        });

        // Trả về kết quả đã xử lý
        return callback(null, { day: `${year}-${month}-${day}`, hasFalseFlag });
    });
}

// Hàm lấy dữ liệu cảm biến theo tháng và xử lý từng ngày
// Hàm lấy dữ liệu cảm biến theo tháng và xử lý từng ngày
function getSensorsDataByMonth(month, year, callback) {
    // Tính số ngày trong tháng
    const daysInMonth = new Date(year, month, 0).getDate();

    // Mảng để lưu kết quả của từng ngày trong tháng
    const monthData = [];

    // Biến đếm số ngày đã hoàn thành xử lý
    let processedDays = 0;

    // Lặp qua từng ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
        getSensorsDataByDay(day, month, year, (err, dayResult) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
    
            if (dayResult !== null) {
                monthData.push(dayResult);
            }

            // Tăng biến đếm số ngày đã hoàn thành
            processedDays++;

            // Nếu đã xử lý xong tất cả các ngày, gọi callback với kết quả của tháng
            if (processedDays === daysInMonth) {
                return callback(null, { monthData });
            }
        });
    }
}


// Định nghĩa route API để lấy và in kết quả của tháng ra
app.get('/api/print_month_result', (req, res) => {
    try {
        // Lấy tham số truy vấn từ URL (vd: /api/print_month_result?month=4&year=2024)
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);

        // Gọi hàm lấy dữ liệu cảm biến theo tháng
        getSensorsDataByMonth(month, year, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Lỗi server' });
            }

            // Trả về kết quả của tháng
            res.json(result);
        });
    } catch (err) {
        // Xử lý lỗi nếu có
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
});