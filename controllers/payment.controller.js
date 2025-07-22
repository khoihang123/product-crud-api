const crypto = require('crypto');
const axios = require('axios');
const Payment = require('../models/payment.model');

// 1. Tạo yêu cầu thanh toán MoMo
exports.createMoMoPayment = async (req, res) => {
    try {
        const { amount, extraData } = req.body;

        const orderId = Date.now().toString();
        const requestId = Date.now().toString();

        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const requestType = process.env.MOMO_REQUEST_TYPE;
        const partnerName = process.env.MOMO_PARTNER_NAME || "Test";
        const storeId = process.env.MOMO_STORE_ID || "MomoTestStore";
        const lang = process.env.MOMO_LANG || "vi";
        const orderInfo = "Payment via MoMo";
        const autoCapture = true;
        const orderGroupId = "";

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode,
            partnerName,
            storeId,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang,
            requestType,
            autoCapture,
            extraData,
            orderGroupId,
            signature
        };

        const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        const result = response.data;
        console.log("✅ MoMo response:", result);

        if (result.resultCode === 0) {
            // Ghi vào DB
            Payment.create({
                orderId,
                requestId,
                amount: parseInt(amount),
                orderInfo,
                payUrl: result.payUrl,
                status: "pending"
            }, (err, dbResult) => {
                if (err) {
                    console.error("❌ Lỗi ghi DB:", err);
                    return res.status(500).json({ error: "Failed to save payment to DB" });
                }

                return res.json({ payUrl: result.payUrl });
            });
        } else {
            return res.status(400).json({
                error: "MoMo returned error.",
                momoResponse: result
            });
        }
    } catch (err) {
        console.error("❌ Lỗi createMoMoPayment:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// 2. Xử lý IPN (callback từ MoMo khi giao dịch thành công)
exports.momoCallback = async (req, res) => {
    try {
        const {
            orderId,
            requestId,
            resultCode,
            message,
            amount,
            transId
        } = req.body;

        // Cập nhật trạng thái giao dịch trong DB
        Payment.updateStatus(orderId, {
            status: resultCode === 0 ? "success" : "failed",
            momoTransId: transId || null,
            message: message || ""
        }, (err, result) => {
            if (err) {
                console.error("❌ Lỗi cập nhật DB:", err);
                return res.status(500).send("FAIL");
            }

            return res.status(200).send("OK");
        });
    } catch (err) {
        console.error("❌ Lỗi momoCallback:", err);
        return res.status(500).send("FAIL");
    }
};

// 3. Xử lý khi người dùng quay lại từ MoMo sau khi thanh toán
exports.handleRedirectUrl = (req, res) => {
    const { orderId, resultCode, message } = req.query;

    if (!orderId || !resultCode) {
        return res.status(400).send("Thiếu thông tin trong kết quả thanh toán.");
    }

    if (resultCode === '0') {
        res.send(`✅ Thanh toán thành công! Đơn hàng: ${orderId}`);
    } else {
        res.send(`❌ Thất bại! Mã lỗi: ${resultCode} - ${message}`);
    }
};

// 4. API kiểm tra trạng thái đơn hàng
exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        Payment.findByOrderId(orderId, (err, payment) => {
            if (err || !payment) {
                return res.status(404).json({ error: "Không tìm thấy giao dịch" });
            }

            return res.json({
                status: payment.status,
                orderId: payment.orderId,
                amount: payment.amount,
                payUrl: payment.payUrl
            });
        });
    } catch (err) {
        console.error("❌ Lỗi getPaymentStatus:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
