const User = require('../models/User')
const { generateOTP, sendOTPByEmail } = require("../controllers/utils");
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';
const saltRounds = 10; 

const authController = {
    register_admin: async(req, res) => {
        const { username, password, name, email } = req.body;
    
        try {
            // Kiểm tra xem username đã tồn tại trong cơ sở dữ liệu chưa
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).send('Tên người dùng đã tồn tại');
            }
    
            // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).send('Địa chỉ email đã được sử dụng');
            }
    
            // Băm mật khẩu
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            // Thêm người dùng mới vào cơ sở dữ liệu
            const newUser = await User.create({ username, password: hashedPassword, name, email, roles: 'admin' });
            res.status(200).send('Đăng ký thành công');
        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            // Kiểm tra nếu lỗi là do email không hợp lệ
            if (error.name === 'SequelizeValidationError' && error.errors[0].validatorKey === 'isEmail') {
                return res.status(400).send('Địa chỉ email không hợp lệ, vui lòng thử lại');
            } else if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).send('Địa chỉ email đã được sử dụng');
            }
            res.sendStatus(500);
        }
    },

    register_user: async (req, res) => {
        const { username, password, name, email, language} = req.body;

        try {
            if(username === '' || password === '' || name === '' || email === '' ){
                return res.status(400).json({ message: language === 'en' ? 'The data is incomplete!' : 'Dữ liệu không đầy đủ!' });
            }
            // Kiểm tra xem username đã tồn tại trong cơ sở dữ liệu chưa
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: language === 'en' ? 'Username has existed!' : 'Tên người dùng đã tồn tại!' });
            }
            // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ message: language === 'en' ? 'Email already exists' : 'Email đã tồn tại' });
            }
            // Băm mật khẩu
            const hashedPassword = await bcrypt.hash('123456', saltRounds);
    
            // Thêm người dùng mới vào cơ sở dữ liệu
            const newUser = await User.create({ username, password: hashedPassword, name, email, roles: 'User' });
            return res.status(200).json({ message: language === 'en' ? 'Register Successfully' : 'Đăng ký thành công' });
        } catch (error) {
            if (error.name === 'SequelizeValidationError' && error.errors[0].validatorKey === 'isEmail') {
                return res.status(400).json({ message: language === 'en' ? 'Invalid email!' : 'Email không hợp lệ!' });
            }
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: language === 'en' ? 'The data is incomplete!' : 'Dữ liệu không đầy đủ!' });
            }
            // Bắt các lỗi khác và trả về thông báo lỗi phù hợp
            res.status(500).json({ message: language === 'en' ? 'An unexpected error occurred' : 'Đã xảy ra lỗi không mong muốn' });
        }
    },

    register_viewer: async (req, res) => {
        const { username, password, name, email, language } = req.body;
    
        try {
            if (username === '' || password === '' || name === '' || email === '') {
                return res.status(400).json({ message: language === 'en' ? 'The data is incomplete!' : 'Dữ liệu không đầy đủ!' });
            }
            // Kiểm tra xem username đã tồn tại trong cơ sở dữ liệu chưa
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: language === 'en' ? 'Username has existed!' : 'Tên người dùng đã tồn tại!' });
            }
            // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                return res.status(400).json({ message: language === 'en' ? 'Email already exists!' : 'Email đã tồn tại!' });
            }
            // Băm mật khẩu
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            // Thêm người dùng mới vào cơ sở dữ liệu
            const newUser = await User.create({ username, password: hashedPassword, name, email, roles: 'Viewer' });
            return res.status(200).json({ message: language === 'en' ? 'Register Successfully!' : 'Đăng ký thành công!' });
        } catch (error) {
            if (error.name === 'SequelizeValidationError' && error.errors[0].validatorKey === 'isEmail') {
                return res.status(400).json({ message: language === 'en' ? 'Invalid email!' : 'Email không hợp lệ!' });
            }
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: language === 'en' ? 'The data is incomplete!' : 'Dữ liệu không đầy đủ!' });
            }
            // Bắt các lỗi khác và trả về thông báo lỗi phù hợp
            return res.status(500).json({ message: language === 'en' ? 'The data is incomplete!' : 'Dữ liệu không đầy đủ!' });
        }
    },
    

    login: async (req, res) => {
        const { username, password, language } = req.body;
    
        try {
            if(username === '' || password === ''){
                return res.status(400).json({ message: language === 'en' ? 'The data is incomplete!' : 'Dữ liệu không đầy đủ!' });
            }
            // Tìm người dùng trong cơ sở dữ liệu
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return res.status(401).json({ message: language === 'en' ? 'Username does not exist!' : 'Tên người dùng không tồn tại!' });
            }
    
            // So sánh mật khẩu
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                let expiresIn = '1h';
                if (user.roles === 'Admin') {
                    expiresIn = '7d'; 
                }
    
                const token = jwt.sign({ userId: user.userid }, secretKey, { expiresIn });
    
                res.json({
                    token,
                    user: {
                        userid: user.userid,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        roles: user.roles,
                    }
                });
            } else {
                res.status(401).json({ message: language === 'en' ? 'Incorrect password!' : 'Mật khẩu không chính xác!' });
            }
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            res.sendStatus(500);
        }
    },
    
    loginemail: async (req, res) => {
        const { email, language } = req.body;
    
        try {
            // Kiểm tra email có tồn tại trong bảng người dùng không
            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({ message: language === 'en' ? 'Email does not exist!' : 'Email không tồn tại!' });
                return;
            }
            const otp = generateOTP();
            console.log(globalSecret);
            sendOTPByEmail(email, otp);
            res.json(otp); // Trả về cả OTP và secret
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            res.jsonStatus(500);
        }
    },
    verifyotp: async (req, res) => {
        const { email, otp, language } = req.body;
        try {
            // Kiểm tra email có tồn tại trong bảng người dùng không
            const user = await User.findOne({ where: { email } });
            if (!user) {
                res.status(404).json({ message: language === 'en' ? 'Email does not exist!' : 'Email không tồn tại!' });
                return;
            }
            const verified = speakeasy.totp.verify({
                secret: globalSecret,
                token: otp,
                window: 1,
                step: 60 
            });
            if (!verified) {
                res.status(400).json({ message: language === 'en' ? 'Invalid OTP!' : 'OTP không hợp lệ!' });
                return;
            }
            
    
            // Nếu xác thực thành công, tạo token và trả về cho người dùng
            let expiresIn = '1h';
            if (user.roles === 'Admin') {
                expiresIn = '7d'; 
            }

            const token = jwt.sign({ userId: user.userid }, secretKey, { expiresIn });

            res.json({
                token,
                user: {
                    userid: user.userid,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                }
            });
    
        } catch (error) {
            console.error('Lỗi khi đăng nhập:', error);
            res.status(400).json({ message: language === 'en' ? 'Invalid OTP!' : 'OTP không hợp lệ!' });

        }
    }
}

module.exports = authController;