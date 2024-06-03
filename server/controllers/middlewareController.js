const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key';

const middlewareController = {
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.sendStatus(401);
    
        try {
            const payload = jwt.verify(token, secretKey);
            req.userId = payload.userId;
            
            // Kiểm tra thời gian hết hạn của token
            const tokenExpTime = payload.exp * 1000; // Chuyển đổi giây thành mili giây
            const currentTime = Date.now();
            if (currentTime > tokenExpTime) {
                // Token đã hết hạn, gửi phản hồi yêu cầu đăng xuất
                return res.status(401).json({ message: 'Token has expired. Please log in again.' });
            }
            
            // Token hợp lệ, tiếp tục xử lý yêu cầu
            next();
        } catch (error) {
            console.error('Lỗi khi xác thực token:', error);
            res.sendStatus(403);
        }
    },
    authenticateRole: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const authRole = req.headers['role'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null) return res.sendStatus(401);

        try {
            const payload = jwt.verify(token, secretKey);
            req.userId = payload.userId;
            
            // Kiểm tra thời gian hết hạn của token
            const tokenExpTime = payload.exp * 1000; // Chuyển đổi giây thành mili giây
            const currentTime = Date.now();
            if (currentTime > tokenExpTime) {
                // Token đã hết hạn, gửi phản hồi yêu cầu đăng xuất
                return res.status(401).json({ message: 'Token has expired. Please log in again.' });
            }

            if (authRole !== 'Admin') {
                return res.status(403).json({ message: 'You do not have the required role to access this resource.' });
            }

            // Token hợp lệ, tiếp tục xử lý yêu cầu
            next();
        } catch (error) {
            console.error('Lỗi khi xác thực token:', error);
            res.sendStatus(403);
        }
    }
};

module.exports = middlewareController;
