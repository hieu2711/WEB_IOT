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

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});
const brokerUrl = 'mqtt://mqttserver.tk';
const brokerPort = 1883;
const brokerUsername = 'innovation';
const brokerPassword = 'Innovation_RgPQAZoA5N';
const topic = '/innovation/airmonitoring/WSNs';
const CLIENT_ID = 'innovation';
const CLEAN_SESSION = true;
const KEEP_ALIVE_INTERVAL = 60;

const client = mqtt.connect(brokerUrl, {
    port: brokerPort,
    username: brokerUsername,
    password: brokerPassword,
    clientId: CLIENT_ID,
    clean: CLEAN_SESSION,
    keepalive: KEEP_ALIVE_INTERVAL, // Thêm keep-alive
    reconnectPeriod: 1000, // Tự động kết nối lại sau 1 giây nếu mất kết nối
    connectTimeout: 30 * 1000, // Thời gian chờ kết nối là 30 giây
});

client.on('connect', () => {
    console.log('Connected to broker');
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Failed to subscribe:', err);
        } else {
            console.log(`Subscribed to ${topic}`);
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

    let dateCondition = '';
    if (year && month && day) {
        dateCondition = `YEAR(sensors_datetime) = "${year}" AND MONTH(sensors_datetime) = "${month}" AND DAY(sensors_datetime) = "${day}"`;
    } else if (year && month) {
        dateCondition = `YEAR(sensors_datetime) = "${year}" AND MONTH(sensors_datetime) = "${month}"`;
    } else {
        return res.status(400).json({ error: 'Thiếu tham số ngày/tháng/năm' });
    }

    const sql1 = `
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value), 0) AS average_1
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'humi_0001'
            AND ${dateCondition}
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s')
        ORDER BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') DESC
        LIMIT 12;
    `;

    const sql2 = `
        SELECT
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') AS date,
            ROUND(AVG(sensors_value * 100), 0) AS average_2
        FROM
            sensors
        WHERE
            LOWER(sensors_name) = 'power_0001'
            AND ${dateCondition}
        GROUP BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s')
        ORDER BY
            DATE_FORMAT(sensors_datetime, '%Y-%m-%d %H:%i:%s') DESC
        LIMIT 12;
    `;

    try {
        const [results1, results2] = await Promise.all([
            new Promise((resolve, reject) => db.query(sql1, (err, result) => err ? reject(err) : resolve(result))),
            new Promise((resolve, reject) => db.query(sql2, (err, result) => err ? reject(err) : resolve(result)))
        ]);

        // Kiểm tra xem kết quả trả về có dữ liệu không
        if (results1.length === 0 || results2.length === 0) {
            return res.json([]);
        }

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
    let day = req.query.day || null;

    let dateCondition = '';
    if (day) {
        // Nếu có nhập ngày, sử dụng ngày, tháng và năm
        dateCondition = `YEAR(sensors_datetime) = "${year}" AND MONTH(sensors_datetime) = "${month}" AND DAY(sensors_datetime) = "${day}"`;
    } else {
        // Nếu chỉ nhập tháng, sử dụng chỉ tháng và năm
        dateCondition = `YEAR(sensors_datetime) = "${year}" AND MONTH(sensors_datetime) = "${month}"`;
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

// Hàm để tính toán min, max và xu hướng (tăng/giảm) và mức an toàn
// Hàm để tính toán min, max và xu hướng (tăng/giảm) và mức an toàn
function analyzeAttribute(attributesTrend, safe, safeRanges) {
    let isIncreasing = true;
    let isDecreasing = true;
    let isSafe = false;
    let comment = "";

    if (attributesTrend.length === 0 && safe.length === 0) {
        return { trend: "empty", isSafe: false, comment: "no data" };
    }

    // Check the trend (increase, decrease, or no change)
    for (let i = 1; i < attributesTrend.length; i++) {
        const currentValue = attributesTrend[i];
        const previousValue = attributesTrend[i - 1];

        if (currentValue < previousValue) {
            isIncreasing = false;
        } else if (currentValue > previousValue) {
            isDecreasing = false;
        }
    }

    // Adjust trend based on no change scenario
    let trend;
    if (isIncreasing && isDecreasing) {
        trend = "Không thay đổi";
    } else if (isIncreasing) {
        trend = "Vừa tăng";
    } else if (isDecreasing) {
        trend = "Vừa giảm";
    } else {
        trend = "Không thay đổi";
    }

    // Find the appropriate safe state and advice from safeRanges
    const { stateVi, stateEn, adviceVi, adviceEn } = safeRanges.find(range => {
        return safe.every(value => !(value < range.min || value > range.max));
    }) || {};

    // Check safety and set comment and isSafe
    for (let i = 0; i < safe.length; i++) {
        const value = safe[i];
        for (const range of safeRanges) {
            if (value >= range.min && value <= range.max) {
                comment = range.comment;
                if (range.isSafe) {
                    isSafe = true;
                }
                break;
            }
        }
    }

    // Return the analyzed attribute with trend, safety information, advice, and value
    return { trend, isSafe, comment, stateVi, stateEn, adviceVi, adviceEn, value: attributesTrend[attributesTrend.length - 1] };
}


const runQuery = (query) => {
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

// Định tuyến để lấy dữ liệu từ MySQL và trả về phân tích các thuộc tính
app.get('/attributes', async (req, res) => {
    try {
        const query1 = `SELECT * FROM sensors WHERE sensors_name IN ('noise_0001', 'temp_0001', 'humi_0001', 'illuminance_0001', 'atmosphere_0001', 'CO2_0001', 'Nito_0002', 'Photpho_0002', 'Kali_0002') ORDER BY sensors_id DESC LIMIT 18;`;
        const query2 = `SELECT * FROM sensors WHERE sensors_name IN ('noise_0001', 'temp_0001', 'humi_0001', 'illuminance_0001', 'atmosphere_0001', 'CO2_0001', 'Nito_0002', 'Photpho_0002', 'Kali_0002') ORDER BY sensors_id DESC LIMIT 9;`;

        const results1 = await runQuery(query1);
        const results2 = await runQuery(query2);

        // Nhóm các giá trị theo thuộc tính

        const trends = {};
        results1.reverse().forEach(row => {
            if (!trends[row.sensors_name]) {
                trends[row.sensors_name] = [];
            }
            trends[row.sensors_name].push(row.sensors_value);
        });

        const safe = {};
        results2.forEach(row => {
            if (!safe[row.sensors_name]) {
                safe[row.sensors_name] = [];
            }
            safe[row.sensors_name].push(row.sensors_value);
        });

       

        const safeRanges = {
            noise_0001: [
                { 
                    min: 0, max: 20, 
                    stateVi: "Rất yên tĩnh", stateEn: "Very quiet", 
                    isSafe: true, 
                    adviceVi: "Thoải mái thư giãn.", adviceEn: "Relax comfortably."
                },
                { 
                    min: 20, max: 40, 
                    stateVi: "Yên tĩnh", stateEn: "Quiet", 
                    isSafe: true, 
                    adviceVi: "Tốt cho làm việc và học tập.", adviceEn: "Good for working and studying."
                },
                { 
                    min: 40, max: 60, 
                    stateVi: "Trung bình", stateEn: "Average", 
                    isSafe: true, 
                    adviceVi: "Phù hợp cho hoạt động hàng ngày.", adviceEn: "Suitable for daily activities."
                },
                { 
                    min: 60, max: 70, 
                    stateVi: "Khá ồn", stateEn: "Quite noisy", 
                    isSafe: false, 
                    adviceVi: "Cần hạn chế thời gian tiếp xúc.", adviceEn: "Limit exposure time."
                },
                { 
                    min: 70, max: 80, 
                    stateVi: "Rất ồn", stateEn: "Very noisy", 
                    isSafe: false, 
                    adviceVi: "Sử dụng bảo vệ thính giác khi cần thiết.", adviceEn: "Use hearing protection if necessary."
                },
                { 
                    min: 80, max: 90, 
                    stateVi: "Cực kỳ ồn", stateEn: "Extremely noisy", 
                    isSafe: false, 
                    adviceVi: "Cần hạn chế tiếp xúc và sử dụng bảo vệ thính giác.", adviceEn: "Limit exposure and use hearing protection."
                },
                { 
                    min: 90, max: 100, 
                    stateVi: "Gây khó chịu", stateEn: "Discomforting", 
                    isSafe: false, 
                    adviceVi: "Sử dụng bảo vệ thính giác và hạn chế tiếp xúc.", adviceEn: "Use hearing protection and limit exposure."
                },
                { 
                    min: 100, max: 120, 
                    stateVi: "Gây đau đớn", stateEn: "Painful", 
                    isSafe: false, 
                    adviceVi: "Cần ngay lập tức giảm thiểu tiếp xúc.", adviceEn: "Immediately minimize exposure."
                },
                { 
                    min: 120, max: Infinity, 
                    stateVi: "Gây tổn thương", stateEn: "Causing damage", 
                    isSafe: false, 
                    adviceVi: "Nguy hiểm cho thính giác và sức khỏe.", adviceEn: "Dangerous to hearing and health."
                }
            ],
            temp_0001: [
                { 
                    min: -Infinity, max: 10, 
                    stateVi: "Cực lạnh", stateEn: "Extremely cold", 
                    isSafe: false, 
                    adviceVi: "Mặc ấm và ở trong nhà.", adviceEn: "Dress warmly and stay indoors."
                },
                { 
                    min: 10, max: 25, 
                    stateVi: "Lạnh", stateEn: "Cold", 
                    isSafe: true, 
                    adviceVi: "Phù hợp cho hầu hết các hoạt động ngoài trời.", adviceEn: "Suitable for most outdoor activities."
                },
                { 
                    min: 25, max: 35, 
                    stateVi: "Mát mẻ", stateEn: "Cool", 
                    isSafe: true, 
                    adviceVi: "Thoải mái khi ra ngoài.", adviceEn: "Comfortable when going outside."
                },
                { 
                    min: 35, max: 45, 
                    stateVi: "Hơi nóng", stateEn: "Heat", 
                    isSafe: true, 
                    adviceVi: "Không dễ chịu và thoải mái.", adviceEn: "No comfortable and cozy."
                },
                { 
                    min: 45, max: 60, 
                    stateVi: "Nóng", stateEn: "Hot", 
                    isSafe: true, 
                    adviceVi: "Cần uống nhiều nước và tránh nắng gắt.", adviceEn: "Drink plenty of water and avoid intense sunlight."
                },
                { 
                    min: 60, max: 100, 
                    stateVi: "Rất nóng", stateEn: "Very hot", 
                    isSafe: false, 
                    adviceVi: "Cần giảm thiểu thời gian ra ngoài nếu có thể.", adviceEn: "Minimize outdoor exposure if possible."
                },
                { 
                    min: 100, max: Infinity, 
                    stateVi: "Nguy hiểm", stateEn: "Dangerous", 
                    isSafe: false, 
                    adviceVi: "Nguy hiểm cho sức khỏe, cần ngay lập tức giảm nhiệt độ cơ thể.", adviceEn: "Dangerous to health, immediately reduce body temperature."
                }
            ],
            humi_0001: [
                { 
                    min: 0, max: 30, 
                    stateVi: "Khô", stateEn: "Dry", 
                    isSafe: false, 
                    adviceVi: "Duy trì độ ẩm cho cơ thể và môi trường.", adviceEn: "Maintain moisture for body and environment."
                },
                { 
                    min: 30, max: 60, 
                    stateVi: "Thoải mái", stateEn: "Comfortable", 
                    isSafe: true, 
                    adviceVi: "Tốt cho sức khỏe.", adviceEn: "Good for health."
                },
                { 
                    min: 60, max: 80, 
                    stateVi: "Ẩm", stateEn: "Humid", 
                    isSafe: false, 
                    adviceVi: "Kiểm soát độ ẩm để tránh các vấn đề sức khỏe.", adviceEn: "Control humidity to avoid health issues."
                },
                { 
                    min: 80, max: 100, 
                    stateVi: "Rất ẩm", stateEn: "Very humid", 
                    isSafe: false, 
                    adviceVi: "Cần giảm độ ẩm ngay lập tức để bảo vệ sức khỏe.", adviceEn: "Immediately reduce humidity to protect health."
                }
            ],
            illuminance_0001: [
                { 
                    min: 0, max: 1, 
                    stateVi: "Tối hoàn toàn", stateEn: "Total darkness", 
                    isSafe: false, 
                    adviceVi: "Cần sử dụng đèn pin hoặc nguồn sáng khác nếu cần thiết.", 
                    adviceEn: "Use a flashlight or other light source if necessary."
                },
                { 
                    min: 1, max: 100, 
                    stateVi: "Ánh sáng yếu", stateEn: "Weak light", 
                    isSafe: true, 
                    adviceVi: "Phù hợp cho môi trường làm việc và sinh hoạt thường ngày.", 
                    adviceEn: "Suitable for daily activities and office work."
                },
                { 
                    min: 100, max: 20000, 
                    stateVi: "Ánh sáng trung bình", stateEn: "Average light", 
                    isSafe: true, 
                    adviceVi: "Thích hợp cho hầu hết các hoạt động trong nhà và ngoài trời ban ngày.", 
                    adviceEn: "Suitable for most indoor and daytime outdoor activities."
                },
                { 
                    min: 20000, max: 50000, 
                    stateVi: "Ánh sáng mạnh", stateEn: "Strong light", 
                    isSafe: false, 
                    adviceVi: "Cần hạn chế thời gian tiếp xúc trực tiếp với ánh sáng mạnh này.", 
                    adviceEn: "Limit direct exposure to this strong light."
                },
                { 
                    min: 50000, max: 100000, 
                    stateVi: "Ánh sáng cực mạnh", stateEn: "Very strong light", 
                    isSafe: false, 
                    adviceVi: "Nguy hiểm cho mắt, cần sử dụng kính bảo hộ khi tiếp xúc lâu dài.", 
                    adviceEn: "Dangerous for eyes, use protective eyewear for prolonged exposure."
                }
            ],
            atmosphere_0001: [
                { 
                    min: 0, max: 100, 
                    stateVi: "Áp suất thấp", stateEn: "Low pressure", 
                    isSafe: false, 
                    adviceVi: "Cảnh báo về thời tiết khắc nghiệt, cần đề phòng các vấn đề sức khỏe.", 
                    adviceEn: "Warning of severe weather, take precautions for health issues."
                },
                { 
                    min: 100, max: 102, 
                    stateVi: "Áp suất tiêu chuẩn", stateEn: "Standard pressure", 
                    isSafe: true, 
                    adviceVi: "Điều kiện thời tiết phù hợp, không cần đặc biệt lưu ý về áp suất khí quyển.", 
                    adviceEn: "Appropriate weather conditions, no special concerns about atmospheric pressure."
                },
                { 
                    min: 102, max: Infinity, 
                    stateVi: "Áp suất cao", stateEn: "High pressure", 
                    isSafe: false, 
                    adviceVi: "Cần cân nhắc giảm thời gian ngoài trời nếu cơ thể không thích ứng tốt với áp suất cao.", 
                    adviceEn: "Consider reducing outdoor activities if the body does not adapt well to high pressure."
                }
            ],
            CO2_0001: [
                { 
                    min: 0, max: 350, 
                    stateVi: "Rất lý tưởng", stateEn: "Very ideal", 
                    isSafe: true, 
                    adviceVi: "Môi trường khí CO2 tốt, không gây hại cho sức khỏe.", 
                    adviceEn: "Good CO2 environment, not harmful to health."
                },
                { 
                    min: 350, max: 400, 
                    stateVi: "Tốt", stateEn: "Good", 
                    isSafe: true, 
                    adviceVi: "Môi trường khí CO2 vẫn còn trong giới hạn chấp nhận được.", 
                    adviceEn: "CO2 environment still within acceptable limits."
                },
                { 
                    min: 400, max: 450, 
                    stateVi: "An toàn", stateEn: "Safe", 
                    isSafe: true, 
                    adviceVi: "Không gian khí CO2 ổn định, không gây ảnh hưởng đáng kể tới sức khỏe.", 
                    adviceEn: "Stable CO2 levels, not significantly affecting health."
                },
                { 
                    min: 450, max: 500, 
                    stateVi: "Tác động nhẹ", stateEn: "Mild impact", 
                    isSafe: false, 
                    adviceVi: "Cần hạn chế thời gian tiếp xúc nếu có thể để giảm thiểu tác động của khí CO2.", 
                    adviceEn: "Limit exposure time if possible to minimize the impact of CO2."
                },
                { 
                    min: 500, max: 1000, 
                    stateVi: "Khó chịu", stateEn: "Uncomfortable", 
                    isSafe: false, 
                    adviceVi: "Môi trường khí CO2 không thoải mái, cần cân nhắc hạn chế thời gian tiếp xúc.", 
                    adviceEn: "Uncomfortable CO2 environment, consider limiting exposure time."
                },
                { 
                    min: 1000, max: Infinity, 
                    stateVi: "Gây hại", stateEn: "Harmful", 
                    isSafe: false, 
                    adviceVi: "Môi trường khí CO2 gây hại, cần hạn chế thời gian tiếp xúc và cải thiện không gian.", 
                    adviceEn: "Harmful CO2 environment, limit exposure time and improve the environment."
                }
            ],
            Nito_0002: [
                { 
                    min: 0, max: 1, 
                    stateVi: "Lý tưởng", stateEn: "Ideal", 
                    isSafe: true, 
                    adviceVi: "Môi trường khí Nitơ tốt cho sức khỏe và sinh hoạt.", 
                    adviceEn: "Good Nitrogen environment for health and daily activities."
                },
                { 
                    min: 1, max: 10, 
                    stateVi: "Chấp nhận được", stateEn: "Acceptable", 
                    isSafe: true, 
                    adviceVi: "Môi trường khí Nitơ vẫn ở mức chấp nhận được.", 
                    adviceEn: "Nitrogen environment is still acceptable."
                },
                { 
                    min: 10, max: Infinity, 
                    stateVi: "Nguy hiểm", stateEn: "Dangerous", 
                    isSafe: false, 
                    adviceVi: "Cần hạn chế tiếp xúc với môi trường khí Nitơ này để tránh nguy cơ sức khỏe.", 
                    adviceEn: "Limit exposure to this Nitrogen environment to avoid health risks."
                }
            ],
            Photpho_0002: [
                { 
                    min: 0, max: 0.01, 
                    stateVi: "Rất lý tưởng", stateEn: "Very ideal", 
                    isSafe: true, 
                    adviceVi: "Nồng độ Photpho trong giới hạn lý tưởng cho môi trường.", 
                    adviceEn: "Phosphorus concentration within ideal limits for the environment."
                },
                { 
                    min: 0.01, max: 0.03, 
                    stateVi: "Thấp", stateEn: "Low", 
                    isSafe: true, 
                    adviceVi: "Nồng độ Photpho vẫn còn ở mức thấp và không gây ảnh hưởng đáng kể tới môi trường.", 
                    adviceEn: "Phosphorus concentration is still low and does not significantly affect the environment."
                },
                { 
                    min: 0.03, max: 0.1, 
                    stateVi: "Trung bình", stateEn: "Medium", 
                    isSafe: false, 
                    adviceVi: "Cần quan sát và điều chỉnh nồng độ Photpho để tránh tác động xấu tới môi trường.", 
                    adviceEn: "Monitor and adjust Phosphorus concentration to avoid adverse effects on the environment."
                },
                { 
                    min: 0.1, max: 0.2, 
                    stateVi: "Cao hơn bình thường", stateEn: "Higher than normal", 
                    isSafe: false, 
                    adviceVi: "Nồng độ Photpho cao hơn mức bình thường, cần giảm thiểu nguồn phóng xạ nếu có.", 
                    adviceEn: "Phosphorus concentration higher than normal, minimize sources if possible."
                },
                { 
                    min: 0.2, max: Infinity, 
                    stateVi: "Rất cao", stateEn: "Very high", 
                    isSafe: false, 
                    adviceVi: "Nồng độ Photpho rất cao, có thể gây hại lâu dài tới môi trường và sức khỏe con người.", 
                    adviceEn: "Very high Phosphorus concentration, may cause long-term harm to the environment and human health."
                }
            ],
            Kali_0002: [
                { 
                    min: 0, max: 5, 
                    stateVi: "Lý tưởng", stateEn: "Ideal", 
                    isSafe: true, 
                    adviceVi: "Nồng độ Kali trong giới hạn lý tưởng cho môi trường.", 
                    adviceEn: "Potassium concentration within ideal limits for the environment."
                },
                { 
                    min: 5, max: 10, 
                    stateVi: "Chấp nhận được", stateEn: "Acceptable", 
                    isSafe: true, 
                    adviceVi: "Nồng độ Kali vẫn ở mức chấp nhận được và không gây tác động xấu đáng kể tới môi trường.", 
                    adviceEn: "Potassium concentration is still acceptable and does not significantly affect the environment."
                },
                { 
                    min: 10, max: 20, 
                    stateVi: "Cao hơn mức bình thường", stateEn: "Higher than normal", 
                    isSafe: false, 
                    adviceVi: "Nồng độ Kali cao hơn mức bình thường, cần quản lý để tránh tác động xấu tới hệ sinh thái.", 
                    adviceEn: "Potassium concentration higher than normal, manage to avoid adverse effects on the ecosystem."
                },
                { 
                    min: 20, max: Infinity, 
                    stateVi: "Cao", stateEn: "High", 
                    isSafe: false, 
                    adviceVi: "Nồng độ Kali quá cao, có thể gây ảnh hưởng nghiêm trọng tới hệ sinh thái và sức khỏe con người.", 
                    adviceEn: "Potassium concentration too high, may cause serious impacts on ecosystems and human health."
                }
            ]
        };

        // Phân tích từng thuộc tính
        const analysis = Object.keys(trends).map(attribute => {
            const result = analyzeAttribute(trends[attribute], safe[attribute], safeRanges[attribute]);
            return { attribute, ...result };
        });

        res.json(analysis);
    } catch (err) {
        console.error('Error retrieving data from database:', err);
        res.status(500).send('Error retrieving data from database');
    }
});