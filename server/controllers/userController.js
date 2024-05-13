const User = require('../models/User')
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const saltRounds = 10; 
const { Op } = require('sequelize');

const userController = {
    getAllUser: async (req, res) => {
        try {
            // Lấy danh sách người dùng chỉ với các trường cần thiết
            const users = await User.findAll({
                attributes: ['userid', 'username', 'name', 'email', 'roles'],
                where: { roles: 'User' }
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    updateUser: async (req, res) => {
        const userId = req.query.id;
        const { username, name, email, password, oldPassword, language } = req.body;
        try {
            const updateData = { username, name, email };
            const currentUser = await User.findOne({ where: { userid: userId } });
    
            if (!currentUser) {
                return res.status(404).json({ error: language === 'en' ? 'User not found!' : 'Người dùng không tồn tại!' });
            }
            // Kiểm tra username và email phải khác với các giá trị đã có trong db
            const existingUser = await User.findOne({
                where: { 
                    [Op.and]: [
                        { [Op.or]: [{ username }, { email }] }, // Kiểm tra username hoặc email
                        { userid: { [Op.ne]: userId } } // Trừ user hiện tại (đang cập nhật)
                    ]
                }
            });

              //kiểm tra mật khẩu mạnh
             // Kiểm tra xem mật khẩu có ít nhất 6 ký tự không
        if (password.length < 6) {
            return res.status(400).json({ error: language === 'en' ? 'Password must be at least 6 characters long!' : 'Mật khẩu phải có ít nhất 6 ký tự!' });
        }

        // Kiểm tra xem mật khẩu có ít nhất một số và một chữ cái không
        const containsNumber = /\d/.test(password);
        const containsLetter = /[a-zA-Z]/.test(password);
        if (!containsNumber || !containsLetter) {
            return res.status(400).json({ error: language === 'en' ? 'Passwords must contain both words and numbers!' : 'Mật khẩu phải chứa cả chữ và số!' });
        }

        // Kiểm tra xem username có chứa ít nhất một chữ cái không
        const containsLetterUser = /[a-zA-Z]/.test(username);
        if (!containsLetterUser) {
            return res.status(400).json({ error: language === 'en' ? 'The username must contain letters!' : 'Tên người dùng phải chứa chữ cái!' });
        }

        
            if (existingUser) {
                return res.status(400).json({ error: language === 'en' ? 'Username or email already exists!' : 'Tên người dùng hoặc email đã tồn tại!' });
            }
            if (oldPassword) {
                const isSameOldPassword = await bcrypt.compare(oldPassword, currentUser.password);
                if (!isSameOldPassword) {
                    return res.status(400).json({ error: language === 'en' ? 'Old password is incorrect!' : 'Mật khẩu cũ không chính xác!' });
                }
            }
            // Kiểm tra định dạng email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: language === 'en' ? 'Invalid email!' : 'Email không hợp lệ!' });
            }
    
            // Kiểm tra xem người dùng đã truyền mật khẩu mới vào hay không
            if (password) {
                // Kiểm tra xem mật khẩu mới có giống mật khẩu cũ không
                const isSamePassword = await bcrypt.compare(password, currentUser.password);
                if (isSamePassword) {
                    return res.status(400).json({ error: language === 'en' ? 'New password must be different from the old password!' : 'Mật khẩu mới phải khác với mật khẩu cũ!' });
                }
    
                // Nếu mật khẩu mới không giống mật khẩu cũ, băm mật khẩu mới
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                updateData.password = hashedPassword;
            }
            
            // Thực hiện cập nhật với dữ liệu đã được cập nhật
            await User.update(updateData, { where: { userid: userId } });
            
            res.json({ message: language === 'en' ? 'User updated successfully' : 'Cập nhật người dùng thành công' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    
    deleteUser: async (req, res) => {
        const userId = req.query.id;
        try {
            await User.destroy({ where: { userid: userId } });
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
}

module.exports = userController;