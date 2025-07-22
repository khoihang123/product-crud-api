const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Tạo thanh toán MoMo
router.post('/create', paymentController.createMoMoPayment);

// Xử lý callback từ MoMo (IPN)
router.post('/ipn', paymentController.momoCallback);

// Người dùng được redirect về sau khi thanh toán
router.get('/redirect', paymentController.handleRedirectUrl);

// Kiểm tra trạng thái đơn hàng
router.get('/status/:orderId', paymentController.getPaymentStatus);

module.exports = router;
