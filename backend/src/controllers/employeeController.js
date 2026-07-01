import db from '../config/db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import asyncHandler from '../middleware/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAllEmployees = asyncHandler(async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       'SELECT id, name, department, email, photo_url, face_descriptor, created_at FROM employees ORDER BY created_at DESC'
//     );
//     res.json({ employees: rows });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM employees"
    );

    const [employees] = await db.query(
      `SELECT
        id,
        name,
        department,
        
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
    'SELECT id, name, department,  photo_url FROM employees WHERE id = ?',
    [req.params.id]
  );
 
  if (!rows.length) throw new AppError('Employee not found', 404);
 
  res.json({ employee: rows[0] });
});
 
// MySQL duplicate entry — errorHandler maps ER_DUP_ENTRY → 409 automatically
const createEmployee = asyncHandler(async (req, res) => {
  const { name, department, email } = req.body;
  if (!name) throw new AppError('Name is required', 400);
 
  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
 
  const [result] = await db.query(
    'INSERT INTO employees (name, department, photo_url) VALUES (?,  ?, ?)',
    [name, department || null,  photo_url]
  );
 
  res.status(201).json({ message: 'Employee created', id: result.insertId });
});
// const getEmployee = async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       'SELECT id, name, department, email, photo_url, face_descriptor FROM employees WHERE id = ?',
//       [req.params.id]
//     );
//     if (!rows.length) return res.status(404).json({ message: 'Employee not found' });
//     res.json({ employee: rows[0] });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// const createEmployee = async (req, res) => {
//   const { name, department, email } = req.body;
//   const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

//   if (!name) return res.status(400).json({ message: 'Name is required' });

//   try {
//     const [result] = await db.query(
//       'INSERT INTO employees (name, department, email, photo_url) VALUES (?, ?, ?, ?)',
//       [name, department || null, email || null, photo_url]
//     );
//     res.status(201).json({ message: 'Employee created', id: result.insertId });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// Save face descriptor (Float32Array as JSON array) after frontend processes the image
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

export { getAllEmployees, getEmployee, createEmployee, saveFaceDescriptor, deleteEmployee };