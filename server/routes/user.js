const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const middlewareController = require('../controllers/middlewareController');

router.get('/', middlewareController.authenticateToken, userController.getAllUser);
router.put('/', userController.updateUser);
router.delete('/',middlewareController.authenticateRole, userController.deleteUser);

module.exports = router;