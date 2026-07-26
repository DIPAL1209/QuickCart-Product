const supabase = require('../config/db');
const { createOrderSchema, updateStatusSchema } = require('../validation/order.validation');

// POST /orders - customer creates order from cart
const createOrder = async (req, res, next) => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }
    const { items } = parsed.data;

    const productIds = items.map((i) => i.product_id);
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, price, stock, name')
      .in('id', productIds);

    if (productError) return res.status(400).json({ success: false, message: productError.message });

    let total = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) return res.status(400).json({ success: false, message: `Product not found` });
      if (product.stock < item.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      total += product.price * item.quantity;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: req.user.id, total_amount: total, status: 'pending' })
      .select()
      .single();

    if (orderError) return res.status(400).json({ success: false, message: orderError.message });

    const orderItemsData = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price,
      };
    });

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
    if (itemsError) return res.status(400).json({ success: false, message: itemsError.message });

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.product_id);
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /orders - user's own order history
const getMyOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
    .eq('is_active', true)  
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json({ success: true, orders: data });
  } catch (err) {
    next(err);
  }
};

// GET /orders/:id - single order (owner only)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url))')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, order: data });
  } catch (err) {
    next(err);
  }
};

// GET /orders/admin/all - admin: all orders
const getAllOrders = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name)), profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json({ success: true, orders: data });
  } catch (err) {
    next(err);
  }
};

// PUT /orders/admin/:id/status - admin: update status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, errors: parsed.error.errors });

    const { data, error } = await supabase
      .from('orders')
      .update({ status: parsed.data.status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json({ success: true, order: data });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };