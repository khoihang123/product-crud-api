const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

const productRoutes = require('./routes/product.routes');
const userRoutes = require('./routes/user.routes');
const paymentRoutes = require('./routes/payment.routes');

// Middleware
app.use(express.json());

// Route
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
