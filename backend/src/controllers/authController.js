import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
import crypto from 'crypto';

// const isProduction=false
// const login = asyncHandler(async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Username and password are required",
//     });
//   }

//   try {
//     // Find admin
//     const [rows] = await db.execute(
//       "SELECT * FROM admins WHERE username = ?",
//       [username]
//     );

//     if (!rows.length) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const admin = rows[0];

//     // Plain text password comparison
//     // Replace with bcrypt.compare() if passwords are hashed
//       const match = await bcrypt.compare(
//       password,
//       admin.password
//     );

//     if (!match) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid password",
//       })
//     }
//     // if (password !== admin.password) {
//     //   return res.status(401).json({
//     //     success: false,
//     //     message: "Invalid credentials",
//     //   });
//     // }

//     // Create random session id
//     const sessionId = crypto.randomBytes(32).toString("hex");

//     // Store session in database
//     await db.execute(
//       `
//       INSERT INTO admin_sessions
//       (session_id, admin_id, created_at, expires_at)
//       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))
//       `,
//       [sessionId, admin.id]
//     );

//     // Set HttpOnly cookie
//     res.cookie("admin_session_id", sessionId, {
//       httpOnly: true,
//       secure: isProduction,
//       sameSite: "Lax",
//       path: "/",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       admin: {
//         id: admin.id,
//         name: admin.name,
//         username: admin.username,
//       },
//     });
//   } catch (err) {
//     console.error(err);

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });
// // const login = asyncHandler(async (req, res) => {
// //   console.log(req.body);

// //   const { email, password } = req.body;

// //   if (!email || !password) {
// //     return res.status(400).json({
// //       message: "Email and password required",
// //     });
// //   }

// //   try {
// //     // Find admin by email
// //     const [rows] = await db.execute(
// //       "SELECT * FROM admins WHERE email = ?",
// //       [email]
// //     );

// //     if (!rows.length) {
// //       return res.status(401).json({
// //         message: "Invalid credentials",
// //       });
// //     }

// //     const admin = rows[0];

// //     // Plain text password comparison (Development only)
// //     if (password !== admin.password) {
// //       return res.status(401).json({
// //         message: "Invalid credentials",
// //       });
// //     }

// //     // Generate JWT
// //     const token = jwt.sign(
// //       {
// //         id: admin.id,
// //         name: admin.name,
// //         email: admin.email,
// //       },
// //       "aniketbanerjeehere",
// //       {
// //         expiresIn: "12h",
// //       }
// //     );

// //     return res.json({
// //       token,
// //       admin: {
// //         id: admin.id,
// //         name: admin.name,
// //         email: admin.email,
// //       },
// //     });
// //   } catch (err) {
// //     console.error(err);

// //     return res.status(500).json({
// //       message: "Server error",
// //       error: err.message,
// //     });
// //   }
// // });

// const logout = asyncHandler(async (req, res) => {
//   const sessionId = req.cookies.admin_session_id;

//   if (sessionId) {
//     await db.execute(
//       "DELETE FROM admin_sessions WHERE session_id = ?",
//       [sessionId]
//     );
//   }

//   res.clearCookie("admin_session_id", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "Lax",
//     path: "/",
//   });

//   res.json({
//     success: true,
//     message: "Logged out successfully",
//   });
// });
// // const getMe = asyncHandler(async (req, res) => {
// //   res.json({ admin: req.admin });
// // });
// const getMe = asyncHandler(async(req, res) => {
//   try {
//     const sessionId = req.cookies.admin_session_id;
//     if (!sessionId) {
//       return res.json({ authenticated: false, user: null });
//     }

//     const [rows] = await db.execute(
//       `SELECT us.admin_id, u.id, u.name,  u.username, u.role
//        FROM admin_sessions us
//        JOIN admins u ON us.admin_id = u.id
//        WHERE us.session_id = ? AND us.expires_at > NOW()`,
//       [sessionId]
//     );

//     if (rows.length === 0) {
//       return res.json({ authenticated: false, user: null });
//     }

//     return res.json({
//       authenticated: true,
//       success: true,
//       user: rows[0],
//     });
//   } catch (err) {
//     console.error("GetMe error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });
// export { login, getMe,logout };

// import bcrypt from 'bcrypt';
// import db from '../config/db.js';
// import asyncHandler from '../middleware/asyncHandler.js';
// import crypto from 'crypto';

const isProduction = false;

const cookieName = (role) =>
  role === 'superadmin' ? 'superadmin_session_id' : 'admin_session_id';

const loginCore = async (req, res, requiredRole) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const account = rows[0];
    console.log(`Login attempt for ${username} with role ${account.role}`);
    const match = await bcrypt.compare(password, account.password);
     if (!match || account.role !== requiredRole) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // if (!match)
    //   return res.status(401).json({ success: false, message: 'Invalid password' });
    // console.log(requiredRole, account.role);
    // if (account.role !== requiredRole)
    //   return res.status(403).json({
    //     success: false,
    //     message: `This account does not have access to the ${requiredRole} portal`,
    //   });

    const sessionId = crypto.randomBytes(32).toString('hex');
    await db.execute(
      `INSERT INTO admin_sessions (session_id, admin_id, created_at, expires_at)
       VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY))`,
      [sessionId, account.id]
    );

    // ✅ Role-specific cookie name
    res.cookie(cookieName(requiredRole), sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        id: account.id,
        name: account.name,
        username: account.username,
        role: account.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

const loginAdmin = asyncHandler((req, res) => loginCore(req, res, 'admin'));
const loginSuperAdmin = asyncHandler((req, res) => loginCore(req, res, 'superadmin'));

// ✅ Logout only clears the cookie for the role that is logging out
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

// ✅ getMe reads the correct cookie based on which portal calls it
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

  const [rows] = await db.execute(
    `SELECT us.admin_id, u.id, u.name, u.username, u.role
     FROM admin_sessions us
     JOIN admins u ON us.admin_id = u.id
     WHERE us.session_id = ? AND us.expires_at > NOW() AND u.role = 'admin'`,
    [sessionId]
  );
  if (!rows.length) return res.json({ authenticated: false, user: null });
  return res.json({ authenticated: true, success: true, user: rows[0] });
});

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

export { loginAdmin, loginSuperAdmin, getMeAdmin, getMeSuperAdmin, logoutAdmin, logoutSuperAdmin };

