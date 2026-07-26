const supabase = require('../config/db');

const adminOnly = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ success: false, message: 'Profile not found' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = adminOnly;