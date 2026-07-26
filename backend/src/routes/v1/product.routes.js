const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  toggleProductStatus,
  getAllProductsAdmin,
} = require('../../controller/product.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/adminOnly');

// Public routes
router.get('/', getProducts);
router.get('/categories/all', getCategories);
router.post('/categories', authMiddleware, adminOnly, createCategory);
router.get('/:id', getProductById);
router.get('/admin/all', authMiddleware, adminOnly, getAllProductsAdmin);

// Admin-only routes
router.post('/', authMiddleware, adminOnly, createProduct);
router.put('/:id', authMiddleware, adminOnly, updateProduct);
router.delete('/:id', authMiddleware, adminOnly, deleteProduct);
router.patch('/admin/:id/toggle-status', authMiddleware, adminOnly, toggleProductStatus);

module.exports = router;