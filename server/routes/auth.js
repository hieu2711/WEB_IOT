const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register_admin', authController.register_admin);
router.post('/register_users', authController.register_user);
router.post('/register_viewer', authController.register_viewer);
router.post('/login', authController.login);
router.post('/loginemail', authController.loginemail);
router.post('/verifyotp', authController.verifyotp);

module.exports = router;