require('dotenv').config();
const express = require('express');
const cors = require('cors');

const errorHandler = require('./src/middleware/errorHandler');

// Routes
const authRoutes = require('./src/routes/v1/auth.routes');
const productRoutes = require('./src/routes/v1/product.routes');
const orderRoutes = require('./src/routes/v1/order.routes');
const paymentRoutes = require('./src/routes/v1/payment.routes');
const adminRoutes = require('./src/routes/v1/admin.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'QuickCart API running' });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);

// Centralized error handler (always last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});