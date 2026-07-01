// import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import asyncHandler from '../middleware/asyncHandler.js';
// const login = async (req, res) => {
//     console.log(req.body);
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ message: 'Email and password required' });

//   try {
//     const [rows] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
//     if (!rows.length)
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const admin = rows[0];
//     const match = await bcrypt.compare(password, admin.password);
//     if (!match)
//       return res.status(401).json({ message: 'Invalid credentials' });

//     const token = jwt.sign(
//       { id: admin.id, email: admin.email, name: admin.name },
//       process.env.JWT_SECRET,
//       { expiresIn: '12h' }
//     );

//     res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email } });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };
const login = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password required",
    });
  }

  try {
    // Find admin by email
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const admin = rows[0];

    // Plain text password comparison (Development only)
    if (password !== admin.password) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      "aniketbanerjeehere",
      {
        expiresIn: "12h",
      }
    );

    return res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});
const getMe = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});

export { login, getMe };