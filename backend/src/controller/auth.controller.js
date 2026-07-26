const supabase = require('../config/db');
const { registerSchema, loginSchema } = require('../validation/auth.validation');

// Register
const register = async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { full_name, email, password } = parsed.data;

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    // Create profile row
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, full_name, role: 'customer' });

    if (profileError) {
      return res.status(400).json({ success: false, message: profileError.message });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: data.user.id, email: data.user.email, full_name },
    });
  } catch (err) {
    next(err);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { email, password } = parsed.data;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    // Get profile (role info)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', data.user.id)
      .single();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name,
        role: profile?.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };