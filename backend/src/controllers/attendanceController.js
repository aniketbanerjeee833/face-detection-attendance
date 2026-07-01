import db from "../config/db.js";
import asyncHandler from "../middleware/asyncHandler.js";

const markAttendance = asyncHandler(async (req, res) => {
  const { employee_id, confidence } = req.body;

  if (!employee_id) {
    return res.status(400).json({ message: "employee_id required" });
  }

  // Today's date (used only for checking duplicate attendance)
  const today = new Date().toISOString().split("T")[0];

  try {
    // Check if attendance already exists today
    const [existing] = await db.query(
      `
      SELECT id
      FROM attendance
      WHERE employee_id = ?
        AND DATE(marked_at) = ?
      `,
      [employee_id, today]
    );

    if (existing.length) {
      return res
        .status(409)
        .json({ message: "Attendance already marked for today" });
    }

    const status = "present";

    await db.execute(
      `
      INSERT INTO attendance
      (employee_id, status, confidence, marked_by)
      VALUES (?, ?, ?, ?)
      `,
      [
        employee_id,
        status,
        confidence || null,
        1,
      ]
    );

    const [emp] = await db.query(
      "SELECT name, department FROM employees WHERE id = ?",
      [employee_id]
    );

    res.status(201).json({
      message: "Attendance marked",
      employee: emp[0],
      status,
      confidence,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});
const getAttendance = asyncHandler(async (req, res) => {
  //const { date, employee_id } = req.query;
  const { date } = req.query;
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = "WHERE 1 = 1";
    const params = [];

    if (date) {
      whereClause += " AND DATE(a.marked_at) = ?";
      params.push(date);
    }

    // if (employee_id) {
    //   whereClause += " AND a.employee_id = ?";
    //   params.push(employee_id);
    // }

    // Total records
    const [countRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM attendance a
      ${whereClause}
      `,
      params
    );

    const total = countRows[0].total;

    // Attendance records
    const [attendance] = await db.query(
      `
      SELECT
        a.id,
        e.name,
        e.department,
        e.photo_url,
        DATE_FORMAT(a.marked_at, '%d %b %Y %h:%i:%s %p') AS marked_at,
        a.status,
        a.confidence
      FROM attendance a
      JOIN employees e
        ON a.employee_id = e.id
      ${whereClause}
      ORDER BY a.marked_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      attendance,
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
// const getAttendance = asyncHandler(async (req, res) => {
//   const { date, employee_id } = req.query;

//   try {
//     let query = `
//       SELECT
//         a.id,
//         e.name,
//         e.department,
//         e.photo_url,
//         DATE_FORMAT(a.marked_at, '%d %b %Y %h:%i:%s %p') AS marked_at,
//         a.status,
//         a.confidence
//       FROM attendance a
//       JOIN employees e
//         ON a.employee_id = e.id
//       WHERE 1 = 1
//     `;

//     const params = [];

//     if (date) {
//       query += " AND DATE(a.marked_at) = ?";
//       params.push(date);
//     }

//     if (employee_id) {
//       query += " AND a.employee_id = ?";
//       params.push(employee_id);
//     }

//     query += " ORDER BY a.marked_at DESC";

//     const [rows] = await db.query(query, params);

//     res.json({ attendance: rows });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });

// const getTodaySummary = asyncHandler(async (req, res) => {
//   const today = new Date().toISOString().split('T')[0];
//   try {
//     const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM employees');
//     const [[{ present }]] = await db.query(
//       "SELECT COUNT(*) as present FROM attendance WHERE date = ? AND status = 'present'", [today]
//     );
//     const [[{ late }]] = await db.query(
//       "SELECT COUNT(*) as late FROM attendance WHERE date = ? AND status = 'late'", [today]
//     );
//     res.json({ total, present, late, absent: total - present - late, date: today });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });
const getTodaySummary = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  try {
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM employees"
    );

    const [[{ present }]] = await db.query(
      `
      SELECT COUNT(*) AS present
      FROM attendance
      WHERE DATE(marked_at) = ?
        AND status = 'present'
      `,
      [today]
    );

    const [[{ late }]] = await db.query(
      `
      SELECT COUNT(*) AS late
      FROM attendance
      WHERE DATE(marked_at) = ?
        AND status = 'late'
      `,
      [today]
    );

    res.json({
      total,
      present,
      late,
      absent: total - present - late,
      date: today,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

export { markAttendance, getAttendance, getTodaySummary };