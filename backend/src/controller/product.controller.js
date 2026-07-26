const supabase = require('../config/db');
const { createProductSchema, updateProductSchema } = require('../validation/product.validation');

// GET /products - list all, with optional search & category filter
const getProducts = async (req, res, next) => {
  try {
    const { search, category_id } = req.query;

    let query = supabase.from('products').select('*, categories(name)');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(200).json({ success: true, products: data });
  } catch (err) {
    next(err);
  }
};

// GET /products/:id - single product detail
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ success: false, message: 'Product not found' });

    res.status(200).json({ success: true, product: data });
  } catch (err) {
    next(err);
  }
};

// POST /products - admin only
const createProduct = async (req, res, next) => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { data, error } = await supabase
      .from('products')
      .insert(parsed.data)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(201).json({ success: true, product: data });
  } catch (err) {
    next(err);
  }
};

// PUT /products/:id - admin only
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { data, error } = await supabase
      .from('products')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.status(200).json({ success: true, product: data });
  } catch (err) {
    next(err);
  }
};

// DELETE /products/:id - admin only
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .update({ is_active: true })   // hard delete ki jagah
      .eq('id', id);

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json({ success: true, message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json({ success: true, categories: data });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Category name required' });
    }
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(201).json({ success: true, category: data });
  } catch (err) {
    next(err);
  }
};


// PATCH /products/admin/:id/toggle-status
const toggleProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // pehle current status uthao
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) return res.status(404).json({ success: false, message: 'Product not found' });

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: !existing.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json({ success: true, product: data });
  } catch (err) {
    next(err);
  }
};

const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ success: false, message: error.message });
    res.status(200).json({ success: true, products: data });
  } catch (err) {
    next(err);
  }
};



module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  toggleProductStatus ,
  getAllProductsAdmin ,
};