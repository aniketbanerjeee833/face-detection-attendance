import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getAllEmployees = asyncHandler(async (req, res) => {
  try {
    const page   = Number(req.query.page || 1);
    const limit  = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM employees"
    );

    const [employees] = await db.query(
      `SELECT
        id,
        name,
        phone_number,
        address,
        aadhar_number,
        place_of_posting,
        photo_url,
        face_descriptor,
        created_at
      FROM employees
      ORDER BY id DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

const getEmployee = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, name, phone_number, address, aadhar_number, place_of_posting, photo_url FROM employees WHERE id = ?',
    [req.params.id]
  );

  if (!rows.length) throw new AppError('Employee not found', 404);

  res.json({ employee: rows[0] });
});

// MySQL duplicate entry — errorHandler maps ER_DUP_ENTRY → 409 automatically
// const createEmployee = asyncHandler(async (req, res) => {
//   const { name, phone_number, address, aadhar_number, place_of_posting } = req.body;

//   if (!name)              throw new AppError('Name is required', 400);
//   if (!phone_number)      throw new AppError('Phone number is required', 400);
//   if (!address)           throw new AppError('Address is required', 400);
//   if (!aadhar_number)     throw new AppError('Aadhar number is required', 400);
//   if (!place_of_posting)  throw new AppError('Place of posting is required', 400);
//   if (!req.file)          throw new AppError('Photo is required', 400);

//   // basic format checks
//   if (!/^\d{10}$/.test(phone_number)) {
//     throw new AppError('Phone number must be exactly 10 digits', 400);
//   }
//   if (!/^\d{12}$/.test(aadhar_number)) {
//     throw new AppError('Aadhar number must be exactly 12 digits', 400);
//   }

//   const photo_url = `/uploads/${req.file.filename}`;

//   const [result] = await db.query(
//     `INSERT INTO employees
//       (name, phone_number, address, aadhar_number, place_of_posting, photo_url)
//      VALUES (?, ?, ?, ?, ?, ?)`,
//     [name, phone_number, address, aadhar_number, place_of_posting, photo_url]
//   );

//   res.status(201).json({ message: 'Employee created', id: result.insertId });
// });
const createEmployee = asyncHandler(async (req, res) => {
  const { name, phone_number, address, aadhar_number, place_of_posting, descriptor } = req.body;

  if (!name)              throw new AppError('Name is required', 400);
  if (!phone_number)      throw new AppError('Phone number is required', 400);
  if (!address)           throw new AppError('Address is required', 400);
  if (!aadhar_number)     throw new AppError('Aadhar number is required', 400);
  if (!place_of_posting)  throw new AppError('Place of posting is required', 400);
  if (!req.file)          throw new AppError('Photo is required', 400);

  if (!/^\d{10}$/.test(phone_number)) {
    throw new AppError('Phone number must be exactly 10 digits', 400);
  }
  if (!/^\d{12}$/.test(aadhar_number)) {
    throw new AppError('Aadhar number must be exactly 12 digits', 400);
  }

  // descriptor arrives as a JSON string inside FormData — parse + validate it
  let parsedDescriptor = null;
  if (descriptor) {
    try {
      parsedDescriptor = JSON.parse(descriptor);
    } catch {
      throw new AppError('Invalid face descriptor format', 400);
    }
    if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
      throw new AppError('Face descriptor must be an array of 128 numbers', 400);
    }
  } else {
    // enforce face registration at creation time — no "add without face" path
    throw new AppError('No face detected in the photo. Please upload a clearer photo.', 400);
  }

  const photo_url = `/uploads/${req.file.filename}`;

  const [result] = await db.query(
    `INSERT INTO employees
      (name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, phone_number, address, aadhar_number, place_of_posting, photo_url, JSON.stringify(parsedDescriptor)]
  );

  res.status(201).json({ message: 'Employee created', id: result.insertId });
});



const saveFaceDescriptor = asyncHandler(async (req, res) => {
  const { descriptor } = req.body; // array of 128 numbers
  if (!descriptor || !Array.isArray(descriptor))
    return res.status(400).json({ message: 'Descriptor array required' });

  try {
    await db.query('UPDATE employees SET face_descriptor = ? WHERE id = ?', [
      JSON.stringify(descriptor),
      req.params.id,
    ]);
    res.json({ message: 'Face descriptor saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

const deleteEmployee = asyncHandler(async (req, res) => {
  try {
    const [rows] = await db.query('SELECT photo_url FROM employees WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Employee not found' });

    if (rows[0].photo_url) {
      const filePath = path.join(__dirname, '../../', rows[0].photo_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// const getAllEmployees = asyncHandler(async (req, res) => {
// //   try {
// //     const [rows] = await db.query(
// //       'SELECT id, name, department, email, photo_url, face_descriptor, created_at FROM employees ORDER BY created_at DESC'
// //     );
// //     res.json({ employees: rows });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// try {
//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 10);
//     const offset = (page - 1) * limit;

//     const [[{ total }]] = await db.query(
//       "SELECT COUNT(*) AS total FROM employees"
//     );

//     const [employees] = await db.query(
//       `SELECT
//         id,
//         name,
//         department,
        
//         photo_url,
//         face_descriptor,
//         created_at
//       FROM employees
//       ORDER BY id DESC
//       LIMIT ? OFFSET ?`,
//       [limit, offset]
//     );

//     res.json({
//       employees,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });
// const getEmployee = asyncHandler(async (req, res) => {
//   const [rows] = await db.query(
//     'SELECT id, name, department,  photo_url FROM employees WHERE id = ?',
//     [req.params.id]
//   );
 
//   if (!rows.length) throw new AppError('Employee not found', 404);
 
//   res.json({ employee: rows[0] });
// });
 
// // MySQL duplicate entry — errorHandler maps ER_DUP_ENTRY → 409 automatically
// const createEmployee = asyncHandler(async (req, res) => {
//   const { name, department, email } = req.body;
//   if (!name) throw new AppError('Name is required', 400);
 
//   const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
 
//   const [result] = await db.query(
//     'INSERT INTO employees (name, department, photo_url) VALUES (?,  ?, ?)',
//     [name, department || null,  photo_url]
//   );
 
//   res.status(201).json({ message: 'Employee created', id: result.insertId });
// });



// Save face descriptor (Float32Array as JSON array) after frontend processes the image


export { getAllEmployees, getEmployee, createEmployee, saveFaceDescriptor, deleteEmployee };