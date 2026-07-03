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
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    // let whereClause = 'WHERE 1 = 1';
    // const params = [];

    // if (search) {
    //   whereClause += ' AND (name LIKE ? OR phone_number LIKE ? OR aadhar_number LIKE ? OR place_of_posting LIKE ?)';
    //   const term = `%${search}%`;
    //   params.push(term, term, term, term);
    // }
    let whereClause = 'WHERE admin_id = ?';
    const params = [req.adminId];

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
// const getEmployee = asyncHandler(async (req, res) => {
//   const [rows] = await db.query(
//     'SELECT id, name, phone_number, address,  place_of_posting, photo_url FROM employees WHERE id = ?',
//     [req.params.id]
//   );

//   if (!rows.length) throw new AppError('Employee not found', 404);

//   res.json({ employee: rows[0] });
// });
const getEmployee = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, name, phone_number, address, place_of_posting, photo_url FROM employees WHERE id = ? AND admin_id = ?',
    [req.params.id, req.adminId]
  );

  if (!rows.length) throw new AppError('Employee not found', 404);

  res.json({ employee: rows[0] });
});

// MySQL duplicate entry — errorHandler maps ER_DUP_ENTRY → 409 automatically

//OLD
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

//     if (!name)              throw new AppError('Name is required', 400);
//     if (!phone_number)      throw new AppError('Phone number is required', 400);
//     if (!address)           throw new AppError('Address is required', 400);
//     if (!aadhar_number)     throw new AppError('Aadhar number is required', 400);
//     if (!place_of_posting)  throw new AppError('Place of posting is required', 400);
//     if (!req.savedPhotoUrl) throw new AppError('Photo is required', 400);

//     if (!/^\d{10}$/.test(phone_number)) {
//       throw new AppError('Phone number must be exactly 10 digits', 400);
//     }
//     if (!/^\d{12}$/.test(aadhar_number)) {
//       throw new AppError('Aadhar number must be exactly 12 digits', 400);
//     }

//     if (!descriptor) {
//       throw new AppError('No face detected in the photo. Please upload a clearer photo.', 400);
//     }
//     let parsedDescriptor;
//     try {
//       parsedDescriptor = JSON.parse(descriptor);
//     } catch {
//       throw new AppError('Invalid face descriptor format', 400);
//     }
//     if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
//       throw new AppError('Face descriptor must be an array of 128 numbers', 400);
//     }

//     // ── Pre-check for existing phone/aadhar (clear, friendly error before hitting DB constraint) ──
//     const [dupRows] = await connection.execute(
//       `SELECT
//         (SELECT COUNT(*) FROM employees WHERE phone_number = ?)  AS phoneCount,
//         (SELECT COUNT(*) FROM employees WHERE aadhar_number = ?) AS aadharCount`,
//       [phone_number, aadhar_number]
//     );
//     const { phoneCount, aadharCount } = dupRows[0];

//     if (phoneCount > 0 && aadharCount > 0) {
//       throw new AppError('An employee with this phone number and Aadhar number already exists', 409);
//     }
//     if (phoneCount > 0) {
//       throw new AppError('An employee with this phone number already exists', 409);
//     }
//     if (aadharCount > 0) {
//       throw new AppError('An employee with this Aadhar number already exists', 409);
//     }

//     const [result] = await connection.execute(
//       `
//       INSERT INTO employees
//         (name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//       `,
//       [name, phone_number, address, aadhar_number, place_of_posting, req.savedPhotoUrl, JSON.stringify(parsedDescriptor)]
//     );

//     await connection.commit();

//     res.status(201).json({
//       message: 'Employee created successfully',
//       id: result.insertId,
//     });
//   } catch (err) {
//     await connection.rollback();

//     if (req.savedPhotoUrl) {
//       try {
//         await fs.unlink(resolveUploadPath(req.savedPhotoUrl));
//       } catch (unlinkErr) {
//         if (unlinkErr.code !== 'ENOENT') {
//           console.error('Failed to clean up uploaded image:', unlinkErr.message);
//         }
//       }
//     }

//     // Safety net: if the pre-check somehow missed a race condition, the DB constraint still catches it
//     if (err.code === 'ER_DUP_ENTRY') {
//       throw new AppError('An employee with this phone number or Aadhar number already exists', 409);
//     }

//     throw err;
//   } finally {
//     connection.release();
//   }
// });

//NEW
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
      descriptors, // NEW: JSON string of an array of descriptors, e.g. "[[..128 floats..], [..], ...]"
      descriptor,  // legacy single-descriptor fallback, still supported
    } = req.body;

    if (!name) throw new AppError('Name is required', 400);
    if (!phone_number) throw new AppError('Phone number is required', 400);
    if (!address) throw new AppError('Address is required', 400);
    if (!aadhar_number) throw new AppError('Aadhar number is required', 400);
    if (!place_of_posting) throw new AppError('Place of posting is required', 400);
    if (!req.savedPhotoUrl) throw new AppError('Photo is required', 400);

    if (!/^\d{10}$/.test(phone_number)) {
      throw new AppError('Phone number must be exactly 10 digits', 400);
    }
    if (!/^\d{12}$/.test(aadhar_number)) {
      throw new AppError('Aadhar number must be exactly 12 digits', 400);
    }

    // ── Parse descriptors: prefer the new multi-angle "descriptors" field,
    //    fall back to legacy single "descriptor" field wrapped in an array ──
    const rawDescriptors = descriptors || (descriptor ? `[${descriptor}]` : null);

    if (!rawDescriptors) {
      throw new AppError('No face detected. Please capture at least one clear, front-facing photo.', 400);
    }

    let parsedDescriptors;
    try {
      parsedDescriptors = JSON.parse(rawDescriptors);
    } catch {
      throw new AppError('Invalid face descriptor format', 400);
    }

    if (!Array.isArray(parsedDescriptors) || parsedDescriptors.length === 0) {
      throw new AppError('At least one face descriptor is required', 400);
    }
    if (parsedDescriptors.length > 10) {
      throw new AppError('Too many face descriptors (max 10)', 400);
    }
    for (const d of parsedDescriptors) {
      if (!Array.isArray(d) || d.length !== 128) {
        throw new AppError('Each face descriptor must contain exactly 128 values', 400);
      }
    }

    // ── Pre-check for existing phone/aadhar (clear, friendly error before hitting DB constraint) ──
    const [dupRows] = await connection.execute(
      `SELECT
        (SELECT COUNT(*) FROM employees WHERE phone_number = ?)  AS phoneCount,
        (SELECT COUNT(*) FROM employees WHERE aadhar_number = ?) AS aadharCount`,
      [phone_number, aadhar_number]
    );
//     const [dupRows] = await connection.execute(
//   `SELECT
//     (SELECT COUNT(*) FROM employees WHERE phone_number = ? AND admin_id = ?) AS phoneCount,
//     (SELECT COUNT(*) FROM employees WHERE aadhar_number = ? AND admin_id = ?) AS aadharCount`,
//   [phone_number, req.adminId, aadhar_number, req.adminId]
// );
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

    // const [result] = await connection.execute(
    //   `
    //   INSERT INTO employees
    //     (name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor)
    //   VALUES (?, ?, ?, ?, ?, ?, ?)
    //   `,
    //   [name, phone_number, address, aadhar_number, place_of_posting, req.savedPhotoUrl, JSON.stringify(parsedDescriptors)]
    // );
    const [result] = await connection.execute(
  `INSERT INTO employees
    (name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor, admin_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [name, phone_number, address, aadhar_number, place_of_posting, req.savedPhotoUrl, JSON.stringify(parsedDescriptors), req.adminId]
);

    await connection.commit();

    res.status(201).json({
      message: `Employee created successfully with ${parsedDescriptors.length} face reference(s)`,
      id: result.insertId,
      descriptorCount: parsedDescriptors.length,
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
      descriptors, // NEW: JSON string of an array of descriptors
      descriptor,  // legacy single-descriptor fallback
    } = req.body;

    // const [rows] = await connection.execute('SELECT * FROM employees WHERE id = ?', [id]);
    const [rows] = await connection.execute(
  'SELECT * FROM employees WHERE id = ? AND admin_id = ?',
  [id, req.adminId]
);
    if (!rows.length) throw new AppError('Employee not found', 404);
    const existing = rows[0];

    if (!name) throw new AppError('Name is required', 400);
    if (!phone_number) throw new AppError('Phone number is required', 400);
    if (!address) throw new AppError('Address is required', 400);
    if (!aadhar_number) throw new AppError('Aadhar number is required', 400);
    if (!place_of_posting) throw new AppError('Place of posting is required', 400);

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

    let photo_url = existing.photo_url;
    let face_descriptor = existing.face_descriptor;
    const oldPhotoUrl = existing.photo_url;

    if (req.savedPhotoUrl) {
      photo_url = req.savedPhotoUrl;

      const rawDescriptors = descriptors || (descriptor ? `[${descriptor}]` : null);
      if (!rawDescriptors) {
        throw new AppError('No face detected in the new photo(s).', 400);
      }

      let parsedDescriptors;
      try {
        parsedDescriptors = JSON.parse(rawDescriptors);
      } catch {
        throw new AppError('Invalid face descriptor format', 400);
      }

      if (!Array.isArray(parsedDescriptors) || parsedDescriptors.length === 0) {
        throw new AppError('At least one face descriptor is required', 400);
      }
      if (parsedDescriptors.length > 10) {
        throw new AppError('Too many face descriptors (max 10)', 400);
      }
      for (const d of parsedDescriptors) {
        if (!Array.isArray(d) || d.length !== 128) {
          throw new AppError('Each face descriptor must contain exactly 128 values', 400);
        }
      }

      face_descriptor = JSON.stringify(parsedDescriptors);
    }

    await connection.execute(
      `
      UPDATE employees
      SET name = ?, phone_number = ?, address = ?, aadhar_number = ?, place_of_posting = ?, photo_url = ?, face_descriptor = ?
      WHERE id = ? AND admin_id = ?
      `,
      [name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor, 
        id, req.adminId]
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


//OLD
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

//     const [rows] = await connection.execute('SELECT * FROM employees WHERE id = ?', [id]);
//     if (!rows.length) throw new AppError('Employee not found', 404);
//     const existing = rows[0];

//     if (!name)              throw new AppError('Name is required', 400);
//     if (!phone_number)      throw new AppError('Phone number is required', 400);
//     if (!address)           throw new AppError('Address is required', 400);
//     if (!aadhar_number)     throw new AppError('Aadhar number is required', 400);
//     if (!place_of_posting)  throw new AppError('Place of posting is required', 400);

//     if (!/^\d{10}$/.test(phone_number)) {
//       throw new AppError('Phone number must be exactly 10 digits', 400);
//     }
//     if (!/^\d{12}$/.test(aadhar_number)) {
//       throw new AppError('Aadhar number must be exactly 12 digits', 400);
//     }

//     // ── Pre-check for existing phone/aadhar, excluding this employee's own record ──
//     const [dupRows] = await connection.execute(
//       `SELECT
//         (SELECT COUNT(*) FROM employees WHERE phone_number = ? AND id != ?)  AS phoneCount,
//         (SELECT COUNT(*) FROM employees WHERE aadhar_number = ? AND id != ?) AS aadharCount`,
//       [phone_number, id, aadhar_number, id]
//     );
//     const { phoneCount, aadharCount } = dupRows[0];

//     if (phoneCount > 0 && aadharCount > 0) {
//       throw new AppError('Another employee with this phone number and Aadhar number already exists', 409);
//     }
//     if (phoneCount > 0) {
//       throw new AppError('Another employee with this phone number already exists', 409);
//     }
//     if (aadharCount > 0) {
//       throw new AppError('Another employee with this Aadhar number already exists', 409);
//     }

//     let photo_url        = existing.photo_url;
//     let face_descriptor  = existing.face_descriptor;
//     const oldPhotoUrl    = existing.photo_url;

//     if (req.savedPhotoUrl) {
//       photo_url = req.savedPhotoUrl;

//       if (!descriptor) {
//         throw new AppError('No face detected in the new photo.', 400);
//       }
//       let parsedDescriptor;
//       try {
//         parsedDescriptor = JSON.parse(descriptor);
//       } catch {
//         throw new AppError('Invalid face descriptor format', 400);
//       }
//       if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
//         throw new AppError('Face descriptor must contain 128 values', 400);
//       }
//       face_descriptor = JSON.stringify(parsedDescriptor);
//     }

//     await connection.execute(
//       `
//       UPDATE employees
//       SET name = ?, phone_number = ?, address = ?, aadhar_number = ?, place_of_posting = ?, photo_url = ?, face_descriptor = ?
//       WHERE id = ?
//       `,
//       [name, phone_number, address, aadhar_number, place_of_posting, photo_url, face_descriptor, id]
//     );

//     await connection.commit();

//     if (req.savedPhotoUrl && oldPhotoUrl && oldPhotoUrl !== photo_url) {
//       try {
//         await fs.unlink(resolveUploadPath(oldPhotoUrl));
//       } catch (err) {
//         if (err.code !== 'ENOENT') {
//           console.error('Failed to delete old image:', err.message);
//         }
//       }
//     }

//     res.json({ message: 'Employee updated successfully' });
//   } catch (err) {
//     await connection.rollback();

//     if (req.savedPhotoUrl) {
//       try {
//         await fs.unlink(resolveUploadPath(req.savedPhotoUrl));
//       } catch (unlinkErr) {
//         if (unlinkErr.code !== 'ENOENT') {
//           console.error('Failed to clean up uploaded image:', unlinkErr.message);
//         }
//       }
//     }

//     if (err.code === 'ER_DUP_ENTRY') {
//       throw new AppError('Another employee with this phone number or Aadhar number already exists', 409);
//     }

//     throw err;
//   } finally {
//     connection.release();
//   }
// });

const deleteEmployee = asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // const [rows] = await connection.execute(
    //   "SELECT photo_url FROM employees WHERE id = ?",
    //   [req.params.id]
    // );

    const [rows] = await connection.execute(
  "SELECT photo_url FROM employees WHERE id = ? AND admin_id = ?",
  [req.params.id, req.adminId]
);
    if (!rows.length) {
      throw new AppError("Employee not found", 404);
    }

    const photoUrl = rows[0].photo_url;

    // await connection.execute(
    //   "DELETE FROM employees WHERE id = ?",
    //   [req.params.id]
    // );
    await connection.execute(
  "DELETE FROM employees WHERE id = ? AND admin_id = ?",
  [req.params.id, req.adminId]
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


// GET all employees across all admins, optional ?admin_id= filter, no create/update/delete exposed
const getAllEmployeesSuperAdmin = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const adminIdFilter = req.query.admin_id ? Number(req.query.admin_id) : null;

  let whereClause = 'WHERE 1 = 1';
  const params = [];

  if (adminIdFilter) {
    whereClause += ' AND e.admin_id = ?';
    params.push(adminIdFilter);
  }

  if (search) {
    whereClause += ' AND (e.name LIKE ? OR e.phone_number LIKE ? OR e.aadhar_number LIKE ? OR e.place_of_posting LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM employees e ${whereClause}`,
    params
  );

  const [employees] = await db.query(
    `SELECT
      e.id, e.name, e.phone_number, e.address, e.aadhar_number,
      e.place_of_posting, e.photo_url, e.face_descriptor, e.created_at,
      e.admin_id, a.name AS admin_name
    FROM employees e
    JOIN admins a ON e.admin_id = a.id
    ${whereClause}
    ORDER BY e.id DESC
    LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    employees,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// Simple list of admins for the filter dropdown
const getAllAdmins = asyncHandler(async (req, res) => {
  const [admins] = await db.query(
    `SELECT id, name, username FROM admins WHERE role = 'admin' ORDER BY name ASC`
  );
  res.json({ admins });
});


export { getAllEmployees, getEmployee, createEmployee, saveFaceDescriptor, 
  deleteEmployee, updateEmployee, getAllEmployeesSuperAdmin, getAllAdmins };

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
