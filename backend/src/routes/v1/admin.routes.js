const express = require('express');
const router = express.Router();
const supabase = require('../../config/db');
const authMiddleware = require('../../middleware/auth.middleware');
const adminOnly = require('../../middleware/adminOnly');

router.get('/analytics', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('status', 'paid');

    if (orderError) return res.status(400).json({ success: false, message: orderError.message });

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = orders.length;

    const { data: itemsRaw, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity, products(name)');

    if (itemsError) return res.status(400).json({ success: false, message: itemsError.message });

    const productSales = {};
    for (const item of itemsRaw) {
      const key = item.product_id;
      if (!productSales[key]) productSales[key] = { name: item.products?.name || 'Unknown', totalSold: 0 };
      productSales[key].totalSold += item.quantity;
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    res.status(200).json({ success: true, analytics: { totalSales, totalOrders, topProducts } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;