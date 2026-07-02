import db from '../config/db.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Safely resolve a stored photo_url (e.g. "/uploads/abc.jpg") to an absolute path,
// using only the filename — prevents any path traversal from a malformed value.
const resolveUploadPath = (photo_url) => {
  if (!photo_url) return null;
  const filename = path.basename(photo_url); // strips any directory components
  return path.join(UPLOAD_DIR, filename);
};
const getAllEmployees = asyncHandler(async (req, res) => {
  try {
    const page   = Number(req.query.page || 1);
    const limit  = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    let whereClause = 'WHERE 1 = 1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR phone_number LIKE ? OR aadhar_number LIKE ? OR place_of_posting LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM employees ${whereClause}`,
      params
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
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
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
    'SELECT id, name, phone_number, address,  place_of_posting, photo_url FROM employees WHERE id = ?',
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
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      name,
      phone_number,
      address,
      aadhar_number,
      place_of_posting,
      descriptor,
    } = req.body;

    if (!name)              throw new AppError('Name is required', 400);
    if (!phone_number)      throw new AppError('Phone number is required', 400);
    if (!address)           throw new AppError('Address is required', 400);
    if (!aadhar_number)     throw new AppError('Aadhar number is required', 400);
    if (!place_of_posting)  throw new AppError('Place of posting is required', 400);
    if (!req.savedPhotoUrl) throw new AppError('Photo is required', 400);

    if (!/^\d{10}$/.test(phone_number)) {
      throw new AppError('Phone number must be exactly 10 digits', 400);
    }
    if (!/^\d{12}$/.test(aadhar_number)) {
      throw new AppError('Aadhar number must be exactly 12 digits', 400);
    }

    if (!descriptor) {
      throw new AppError('No face detected in the photo. Please upload a clearer photo.', 400);
    }
    let parsedDescriptor;
    try {
      parsedDescriptor = JSON.parse(descriptor);
    } catch {
      throw new AppError('Invalid face descriptor format', 400);
    }
    if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
      throw new AppError('Face descriptor must be an array of 128 numbers', 400);
    }

    // ── Pre-check for existing phone/aadhar (clear, friendly error before hitting DB constraint) ──
    const [dupRows] = await connection.execute(
      `SELECT
        (SELECT COUNT(*) FROM employees WHERE phone_number = ?)  AS phoneCount,
        (SELECT COUNT(*) FROM employees WHERE aadhar_number = ?) AS aadharCount`,
      [phone_number, aadhar_number]
    );
    const { phoneCount, aadharCount } = dupRows[0];

    if (phoneCount > 0 && aadharCount > 0) {
      throw new AppError('An employee with this phone number and Aadhar number already exists', 409);
    }
    if (phoneCount > 0) {
      throw new AppError('An employee with this phone number already exists', 409);
    }
    if (aadharCount > 0) {
      throw new AppError('An employee with this Aadhar number already exists', 409);
    }

    const [result] = await connection.execute(
      `
      INSERT INTO employees
        (name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [name, phone_number, address, aadhar_number, place_of_posting, req.savedPhotoUrl, JSON.stringify(parsedDescriptor)]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Employee created successfully',
      id: result.insertId,
    });
  } catch (err) {
    await connection.rollback();

    if (req.savedPhotoUrl) {
      try {
        await fs.unlink(resolveUploadPath(req.savedPhotoUrl));
      } catch (unlinkErr) {
        if (unlinkErr.code !== 'ENOENT') {
          console.error('Failed to clean up uploaded image:', unlinkErr.message);
        }
      }
    }

    // Safety net: if the pre-check somehow missed a race condition, the DB constraint still catches it
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('An employee with this phone number or Aadhar number already exists', 409);
    }

    throw err;
  } finally {
    connection.release();
  }
});
// const createEmployee = asyncHandler(async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     const {
//       name,
//       phone_number,
//       address,
//       aadhar_number,
//       place_of_posting,
//       descriptor,
//     } = req.body;

//     if (!name) throw new AppError("Name is required", 400);
//     if (!phone_number)
//       throw new AppError("Phone number is required", 400);
//     if (!address)
//       throw new AppError("Address is required", 400);
//     if (!aadhar_number)
//       throw new AppError("Aadhar number is required", 400);
//     if (!place_of_posting)
//       throw new AppError("Place of posting is required", 400);

//     if (!req.savedPhotoUrl) {
//       throw new AppError("Photo is required", 400);
//     }

//     if (!/^\d{10}$/.test(phone_number)) {
//       throw new AppError(
//         "Phone number must be exactly 10 digits",
//         400
//       );
//     }

//     if (!/^\d{12}$/.test(aadhar_number)) {
//       throw new AppError(
//         "Aadhar number must be exactly 12 digits",
//         400
//       );
//     }

//     if (!descriptor) {
//       throw new AppError(
//         "No face detected in the photo. Please upload a clearer photo.",
//         400
//       );
//     }

//     let parsedDescriptor;

//     try {
//       parsedDescriptor = JSON.parse(descriptor);
//     } catch {
//       throw new AppError("Invalid face descriptor format", 400);
//     }

//     if (
//       !Array.isArray(parsedDescriptor) ||
//       parsedDescriptor.length !== 128
//     ) {
//       throw new AppError(
//         "Face descriptor must be an array of 128 numbers",
//         400
//       );
//     }

//     const [result] = await connection.execute(
//       `
//       INSERT INTO employees
//       (
//         name,
//         phone_number,
//         address,
//         aadhar_number,
//         place_of_posting,
//         photo_url,
//         face_descriptor
//       )
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//       `,
//       [
//         name,
//         phone_number,
//         address,
//         aadhar_number,
//         place_of_posting,
//         req.savedPhotoUrl,
//         JSON.stringify(parsedDescriptor),
//       ]
//     );

//     await connection.commit();

//     res.status(201).json({
//       message: "Employee created successfully",
//       id: result.insertId,
//     });
//   } catch (err) {
//     await connection.rollback();

//     // Delete compressed image if DB insert failed
//     if (req.savedPhotoUrl) {
//       try {
//         await fs.unlink(resolveUploadPath(req.savedPhotoUrl));
//       } catch (unlinkErr) {
//         if (unlinkErr.code !== "ENOENT") {
//           console.error(
//             "Failed to clean up uploaded image:",
//             unlinkErr.message
//           );
//         }
//       }
//     }

//     throw err;
//   } finally {
//     connection.release();
//   }
// });



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




// const updateEmployee = asyncHandler(async (req, res) => {
//   const connection = await db.getConnection();

//   try {
//     await connection.beginTransaction();

//     const { id } = req.params;

//     const {
//       name,
//       phone_number,
//       address,
//       aadhar_number,
//       place_of_posting,
//       descriptor,
//     } = req.body;

//     const [rows] = await connection.execute(
//       "SELECT * FROM employees WHERE id = ?",
//       [id]
//     );

//     if (!rows.length) {
//       throw new AppError("Employee not found", 404);
//     }

//     const existing = rows[0];

//     // Validation
//     if (!name) throw new AppError("Name is required", 400);
//     if (!phone_number)
//       throw new AppError("Phone number is required", 400);
//     if (!address)
//       throw new AppError("Address is required", 400);
//     if (!aadhar_number)
//       throw new AppError("Aadhar number is required", 400);
//     if (!place_of_posting)
//       throw new AppError("Place of posting is required", 400);

//     if (!/^\d{10}$/.test(phone_number)) {
//       throw new AppError(
//         "Phone number must be exactly 10 digits",
//         400
//       );
//     }

//     if (!/^\d{12}$/.test(aadhar_number)) {
//       throw new AppError(
//         "Aadhar number must be exactly 12 digits",
//         400
//       );
//     }

//     let photo_url = existing.photo_url;
//     let face_descriptor = existing.face_descriptor;

//     const oldPhotoUrl = existing.photo_url;

//     // New image uploaded
//     if (req.savedPhotoUrl) {
//       photo_url = req.savedPhotoUrl;

//       if (!descriptor) {
//         throw new AppError(
//           "No face detected in the new photo.",
//           400
//         );
//       }

//       let parsedDescriptor;

//       try {
//         parsedDescriptor = JSON.parse(descriptor);
//       } catch {
//         throw new AppError(
//           "Invalid face descriptor format",
//           400
//         );
//       }

//       if (
//         !Array.isArray(parsedDescriptor) ||
//         parsedDescriptor.length !== 128
//       ) {
//         throw new AppError(
//           "Face descriptor must contain 128 values",
//           400
//         );
//       }

//       face_descriptor = JSON.stringify(parsedDescriptor);
//     }

//     await connection.execute(
//       `
//       UPDATE employees
//       SET
//         name = ?,
//         phone_number = ?,
//         address = ?,
//         aadhar_number = ?,
//         place_of_posting = ?,
//         photo_url = ?,
//         face_descriptor = ?
//       WHERE id = ?
//       `,
//       [
//         name,
//         phone_number,
//         address,
//         aadhar_number,
//         place_of_posting,
//         photo_url,
//         face_descriptor,
//         id,
//       ]
//     );

//     await connection.commit();

//     // Delete previous image after successful commit
//     if (
//       req.savedPhotoUrl &&
//       oldPhotoUrl &&
//       oldPhotoUrl !== photo_url
//     ) {
//       try {
//         await fs.unlink(resolveUploadPath(oldPhotoUrl));
//       } catch (err) {
//         if (err.code !== "ENOENT") {
//           console.error(
//             "Failed to delete old image:",
//             err.message
//           );
//         }
//       }
//     }

//     res.json({
//       message: "Employee updated successfully",
//     });
//   } catch (err) {
//     await connection.rollback();

//     // Delete newly compressed image if transaction failed
//     if (req.savedPhotoUrl) {
//       try {
//         await fs.unlink(resolveUploadPath(req.savedPhotoUrl));
//       } catch (unlinkErr) {
//         if (unlinkErr.code !== "ENOENT") {
//           console.error(
//             "Failed to clean up uploaded image:",
//             unlinkErr.message
//           );
//         }
//       }
//     }

//     throw err;
//   } finally {
//     connection.release();
//   }
// });
const updateEmployee = asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      name,
      phone_number,
      address,
      aadhar_number,
      place_of_posting,
      descriptor,
    } = req.body;

    const [rows] = await connection.execute('SELECT * FROM employees WHERE id = ?', [id]);
    if (!rows.length) throw new AppError('Employee not found', 404);
    const existing = rows[0];

    if (!name)              throw new AppError('Name is required', 400);
    if (!phone_number)      throw new AppError('Phone number is required', 400);
    if (!address)           throw new AppError('Address is required', 400);
    if (!aadhar_number)     throw new AppError('Aadhar number is required', 400);
    if (!place_of_posting)  throw new AppError('Place of posting is required', 400);

    if (!/^\d{10}$/.test(phone_number)) {
      throw new AppError('Phone number must be exactly 10 digits', 400);
    }
    if (!/^\d{12}$/.test(aadhar_number)) {
      throw new AppError('Aadhar number must be exactly 12 digits', 400);
    }

    // ── Pre-check for existing phone/aadhar, excluding this employee's own record ──
    const [dupRows] = await connection.execute(
      `SELECT
        (SELECT COUNT(*) FROM employees WHERE phone_number = ? AND id != ?)  AS phoneCount,
        (SELECT COUNT(*) FROM employees WHERE aadhar_number = ? AND id != ?) AS aadharCount`,
      [phone_number, id, aadhar_number, id]
    );
    const { phoneCount, aadharCount } = dupRows[0];

    if (phoneCount > 0 && aadharCount > 0) {
      throw new AppError('Another employee with this phone number and Aadhar number already exists', 409);
    }
    if (phoneCount > 0) {
      throw new AppError('Another employee with this phone number already exists', 409);
    }
    if (aadharCount > 0) {
      throw new AppError('Another employee with this Aadhar number already exists', 409);
    }

    let photo_url        = existing.photo_url;
    let face_descriptor  = existing.face_descriptor;
    const oldPhotoUrl    = existing.photo_url;

    if (req.savedPhotoUrl) {
      photo_url = req.savedPhotoUrl;

      if (!descriptor) {
        throw new AppError('No face detected in the new photo.', 400);
      }
      let parsedDescriptor;
      try {
        parsedDescriptor = JSON.parse(descriptor);
      } catch {
        throw new AppError('Invalid face descriptor format', 400);
      }
      if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
        throw new AppError('Face descriptor must contain 128 values', 400);
      }
      face_descriptor = JSON.stringify(parsedDescriptor);
    }

    await connection.execute(
      `
      UPDATE employees
      SET name = ?, phone_number = ?, address = ?, aadhar_number = ?, place_of_posting = ?, photo_url = ?, face_descriptor = ?
      WHERE id = ?
      `,
      [name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor, id]
    );

    await connection.commit();

    if (req.savedPhotoUrl && oldPhotoUrl && oldPhotoUrl !== photo_url) {
      try {
        await fs.unlink(resolveUploadPath(oldPhotoUrl));
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error('Failed to delete old image:', err.message);
        }
      }
    }

    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    await connection.rollback();

    if (req.savedPhotoUrl) {
      try {
        await fs.unlink(resolveUploadPath(req.savedPhotoUrl));
      } catch (unlinkErr) {
        if (unlinkErr.code !== 'ENOENT') {
          console.error('Failed to clean up uploaded image:', unlinkErr.message);
        }
      }
    }

    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError('Another employee with this phone number or Aadhar number already exists', 409);
    }

    throw err;
  } finally {
    connection.release();
  }
});
// const deleteEmployee = asyncHandler(async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT photo_url FROM employees WHERE id = ?', [req.params.id]);
//     if (!rows.length) return res.status(404).json({ message: 'Employee not found' });

//     if (rows[0].photo_url) {
//       const filePath = path.join(__dirname, '../../', rows[0].photo_url);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }

//     await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
//     res.json({ message: 'Employee deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

const deleteEmployee = asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT photo_url FROM employees WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      throw new AppError("Employee not found", 404);
    }

    const photoUrl = rows[0].photo_url;

    await connection.execute(
      "DELETE FROM employees WHERE id = ?",
      [req.params.id]
    );

    await connection.commit();

    // Delete image after successful DB commit
    if (photoUrl) {
      const imagePath = resolveUploadPath(photoUrl);

      if (imagePath) {
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          // Ignore if file is already missing
          if (err.code !== "ENOENT") {
            console.error(
              "Failed to delete employee photo:",
              imagePath,
              err.message
            );
          }
        }
      }
    }

    res.json({
      message: "Employee deleted successfully",
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
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


export { getAllEmployees, getEmployee, createEmployee, saveFaceDescriptor, deleteEmployee, updateEmployee };