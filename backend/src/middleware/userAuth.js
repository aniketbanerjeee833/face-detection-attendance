

import db from '../config/db.js';

const userAuth = async (req, res, next) => {
  try {
    // ✅ Check both cookies — whichever is present
    const sessionId =
      req.cookies.superadmin_session_id || req.cookies.admin_session_id;

    if (!sessionId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [results] = await db.query(
      `SELECT 
        us.admin_id,
        u.name, 
        u.username, 
        u.role
       FROM admin_sessions us
       JOIN admins u ON us.admin_id = u.id
       WHERE us.session_id = ? 
         AND us.expires_at > NOW()`,
      [sessionId]
    );

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    req.user = {
      User_Id: results[0].admin_id,
      name: results[0].name,
      username: results[0].username,
      role: results[0].role,
    };

    next();
  } catch (err) {
    console.error('Session validation error:', err);
    next(err);
  }
};

export default userAuth;