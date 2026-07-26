const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../../controller/order.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/adminOnly');

router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getMyOrders);
router.get('/admin/all', authMiddleware, adminOnly, getAllOrders);
router.put('/admin/:id/status', authMiddleware, adminOnly, updateOrderStatus);
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;