const db = require('../config/db'); // Kết nối đến cơ sở dữ liệu MySQL

const Payment = {
    // Tạo một bản ghi thanh toán mới
    create: (payment, callback) => {
        const sql = `
            INSERT INTO payments (orderId, requestId, amount, orderInfo, payUrl, status)
            VALUES (?, ?, ?, ?, ?, 'pending') -- Trạng thái mặc định là 'pending'
        `;

        const values = [
            payment.orderId,     // Mã đơn hàng (tự tạo theo thời gian)
            payment.requestId,   // Mã request (tương tự orderId)
            payment.amount,      // Số tiền giao dịch
            payment.orderInfo,   // Mô tả đơn hàng
            payment.payUrl       // Đường dẫn thanh toán từ MoMo
        ];

        db.query(sql, values, callback); // Thực thi truy vấn và gọi lại callback khi xong
    },

    // Cập nhật trạng thái giao dịch (thành công hoặc thất bại)
    updateStatus: (orderId, status, callback) => {
        const sql = `
            UPDATE payments SET status = ?, updatedAt = NOW() WHERE orderId = ?
        `;

        db.query(sql, [status, orderId], callback); // Cập nhật theo orderId
    },

    // Lấy toàn bộ danh sách giao dịch (cho admin hoặc debug)
    getAll: (callback) => {
        db.query("SELECT * FROM payments ORDER BY id DESC", callback); // Sắp xếp mới nhất lên đầu
    },

    // Tìm đơn hàng bằng OrderId
    findByOrderId: (orderId, callback) => {
        const sql = "SELECT * FROM payments WHERE orderId = ?";
        db.query(sql, [orderId], (err, results) => {
            if (err) return callback(err, null);
            if (results.length === 0) return callback(null, null);
            return callback(null, results[0]);
        });
    },


};

module.exports = Payment; // Export object để sử dụng ở controller
