import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import crypto from 'crypto';



const isProduction = false;

// const cookieName = (role) =>
//   role === 'superadmin' ? 'superadmin_session_id' : 'admin_session_id';
const cookieName = (role) => {
  if (role === 'superadmin') return 'superadmin_session_id';
  //if (role === 'operator') return 'operator_session_id';
  return 'admin_session_id';
};
//OLD
// const loginCore = async (req, res, requiredRole) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     return res.status(400).json({ success: false, message: 'Username and password are required' });
//   }

//   try {
//     const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
//     if (!rows.length)
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });

//     const account = rows[0];
//     console.log(`Login attempt for ${username} with role ${account.role}`);
//     const match = await bcrypt.compare(password, account.password);
//      if (!match || account.role !== requiredRole) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
//     // if (!match)
//     //   return res.status(401).json({ success: false, message: 'Invalid password' });
//     // console.log(requiredRole, account.role);
//     // if (account.role !== requiredRole)
//     //   return res.status(403).json({
//     //     success: false,
//     //     message: `This account does not have access to the ${requiredRole} portal`,
//     //   });

//     const sessionId = crypto.randomBytes(32).toString('hex');
//     await db.execute(
//       `INSERT INTO admin_sessions (session_id, admin_id, created_at, expires_at)
//        VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))`,
//       [sessionId, account.id]
//     );

//     // ✅ Role-specific cookie name
//     res.cookie(cookieName(requiredRole), sessionId, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: 'Lax',
//       path: '/',
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Login successful',
//       admin: {
//         id: account.id,
//         name: account.name,
//         username: account.username,
//         role: account.role,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };
// authController.js — loginCore updated
const loginCore = async (req, res, requiredRole) => {
  const { username, password, police_station_id } = req.body;

  try {
    let rows;

    if (requiredRole === "superadmin") {
      // Superadmin login - no police station check
      [rows] = await db.execute(
        "SELECT * FROM admins WHERE username = ?",
        [username]
      );
    } else {
      // Admin login - police station required
      if (!police_station_id) {
        return res.status(400).json({
          success: false,
          message: "Police station is required",
        });
      }

      [rows] = await db.execute(
        "SELECT * FROM admins WHERE username = ? AND police_station_id = ?",
        [username, police_station_id]
      );
    }

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const account = rows[0];

    const match = await bcrypt.compare(password, account.password);

    if (!match || account.role !== requiredRole) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");

    await db.execute(
      `INSERT INTO admin_sessions (session_id, admin_id, created_at, expires_at)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))`,
      [sessionId, account.id]
    );

    res.cookie(cookieName(requiredRole), sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        id: account.id,
        name: account.name,
        username: account.username,
        role: account.role,
        police_station_id: account.police_station_id,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
const loginCoreOperator = async (req, res, requiredRole) => {
  const { username, password, police_station_id } = req.body;

  try {
    let rows;

    
      // Admin login - police station required
      if (!police_station_id) {
        return res.status(400).json({
          success: false,
          message: "Police station is required",
        });
      }

      [rows] = await db.execute(
        "SELECT * FROM admins WHERE username = ? AND police_station_id = ?",
        [username, police_station_id]
      );
    

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const account = rows[0];

    const match = await bcrypt.compare(password, account.password);

    if (!match || account.role !== requiredRole) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");

    await db.execute(
      `INSERT INTO admin_sessions (session_id, admin_id, created_at, expires_at)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))`,
      [sessionId, account.id]
    );

    res.cookie("operator_session_id", sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        id: account.id,
        name: account.name,
        username: account.username,
        role: account.role,
        police_station_id: account.police_station_id,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
const loginAdmin = asyncHandler((req, res) => loginCore(req, res, 'admin'));
const loginSuperAdmin = asyncHandler((req, res) => loginCore(req, res, 'superadmin'));
const loginOperator = asyncHandler((req, res) => loginCoreOperator(req, res, 'admin'));

//  Logout only clears the cookie for the role that is logging out
const logoutAdmin = asyncHandler(async (req, res) => {
  const sessionId = req.cookies.admin_session_id;
  if (sessionId) {
    await db.execute('DELETE FROM admin_sessions WHERE session_id = ?', [sessionId]);
  }
  res.clearCookie('admin_session_id', {
    httpOnly: true, secure: isProduction, sameSite: 'Lax', path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

const logoutSuperAdmin = asyncHandler(async (req, res) => {
  const sessionId = req.cookies.superadmin_session_id;
  if (sessionId) {
    await db.execute('DELETE FROM admin_sessions WHERE session_id = ?', [sessionId]);
  }
  res.clearCookie('superadmin_session_id', {
    httpOnly: true, secure: isProduction, sameSite: 'Lax', path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});
const logoutOperator = asyncHandler(async (req, res) => {
  const sessionId = req.cookies.operator_session_id;
  if (sessionId) {
    await db.execute('DELETE FROM admin_sessions WHERE session_id = ?', [sessionId]);
  }
  res.clearCookie('operator_session_id', {
    httpOnly: true, secure: isProduction, sameSite: 'Lax', path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

//  getMe reads the correct cookie based on which portal calls it
// const getMe = asyncHandler(async (req, res) => {
//   // Try both cookies — whichever is present wins
//   const sessionId =
//     req.cookies.superadmin_session_id || req.cookies.admin_session_id;

//   if (!sessionId) return res.json({ authenticated: false, user: null });

//   try {
//     const [rows] = await db.execute(
//       `SELECT us.admin_id, u.id, u.name, u.username, u.role
//        FROM admin_sessions us
//        JOIN admins u ON us.admin_id = u.id
//        WHERE us.session_id = ? AND us.expires_at > NOW()`,
//       [sessionId]
//     );

//     if (!rows.length) return res.json({ authenticated: false, user: null });

//     return res.json({ authenticated: true, success: true, user: rows[0] });
//   } catch (err) {
//     console.error('GetMe error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// });
// authController.js

const getMeAdmin = asyncHandler(async (req, res) => {
  const sessionId = req.cookies.admin_session_id;
  if (!sessionId) return res.json({ authenticated: false, user: null });

  // const [rows] = await db.execute(
  //   `SELECT us.admin_id, u.id, u.name, u.username, u.role, u.police_station_id
  //    FROM admin_sessions us
  //    JOIN admins u ON us.admin_id = u.id
  //    WHERE us.session_id = ? AND us.expires_at > NOW() AND u.role = 'admin'`,
  //   [sessionId]
  // );
    const [rows] = await db.execute(
    `SELECT
        us.admin_id,
        u.id,
        u.name,
        u.username,
        u.role,
        u.police_station_id,
        ps.name AS police_station_name
     FROM admin_sessions us
     JOIN admins u
       ON us.admin_id = u.id
     LEFT JOIN police_stations ps
       ON u.police_station_id = ps.id
     WHERE us.session_id = ?
       AND us.expires_at > NOW()
       AND u.role = 'admin'`,
    [sessionId]
  );
  if (!rows.length) return res.json({ authenticated: false, user: null });
  return res.json({ authenticated: true, success: true, user: rows[0] });
});
// const getMeAdmin = asyncHandler(async (req, res) => {
//   const sessionId = req.cookies.admin_session_id;
//   if (!sessionId) return res.json({ authenticated: false, user: null });

//   const [rows] = await db.execute(
//     `SELECT us.admin_id, u.id, u.name, u.username, u.role
//      FROM admin_sessions us
//      JOIN admins u ON us.admin_id = u.id
//      WHERE us.session_id = ? AND us.expires_at > NOW() AND u.role = 'admin'`,
//     [sessionId]
//   );
//   if (!rows.length) return res.json({ authenticated: false, user: null });
//   return res.json({ authenticated: true, success: true, user: rows[0] });
// });

const getMeSuperAdmin = asyncHandler(async (req, res) => {
  const sessionId = req.cookies.superadmin_session_id;
  if (!sessionId) return res.json({ authenticated: false, user: null });

  const [rows] = await db.execute(
    `SELECT us.admin_id, u.id, u.name, u.username, u.role
     FROM admin_sessions us
     JOIN admins u ON us.admin_id = u.id
     WHERE us.session_id = ? AND us.expires_at > NOW() AND u.role = 'superadmin'`,
    [sessionId]
  );
  if (!rows.length) return res.json({ authenticated: false, user: null });
  return res.json({ authenticated: true, success: true, user: rows[0] });
});

const getMeOperator = asyncHandler(async (req, res) => {
  const sessionId = req.cookies.operator_session_id;
  if (!sessionId) return res.json({ authenticated: false, user: null });

  const [rows] = await db.execute(
    `SELECT
        us.admin_id,
        u.id,
        u.name,
        u.username,
        u.role,
        u.police_station_id,
        ps.name AS police_station_name
     FROM admin_sessions us
     JOIN admins u
       ON us.admin_id = u.id
     LEFT JOIN police_stations ps
       ON u.police_station_id = ps.id
     WHERE us.session_id = ?
       AND us.expires_at > NOW()
       AND u.role = 'admin'`,
    [sessionId]
  );
  if (!rows.length) return res.json({ authenticated: false, user: null });
  return res.json({ authenticated: true, success: true, user: rows[0] });
});

export { loginAdmin, loginSuperAdmin, getMeAdmin, getMeSuperAdmin, logoutAdmin, logoutSuperAdmin,
 loginOperator, getMeOperator,logoutOperator
 };

