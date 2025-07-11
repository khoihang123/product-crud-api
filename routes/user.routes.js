const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Đăng ký
router.post('/register', userController.register);

// Đăng nhập
router.post('/login', userController.login);

module.exports = router;
