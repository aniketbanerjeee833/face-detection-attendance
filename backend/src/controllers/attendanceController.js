import db from "../config/db.js";
import asyncHandler from "../middleware/asyncHandler.js";

// const markAttendance = asyncHandler(async (req, res) => {
//   const { employee_id, confidence } = req.body;

//   if (!employee_id) {
//     return res.status(400).json({ message: "employee_id required" });
//   }

//   // Today's date (used only for checking duplicate attendance)
//   const today = new Date().toISOString().split("T")[0];

//   try {
//     // Check if attendance already exists today
//     const [existing] = await db.query(
//       `
//       SELECT id
//       FROM attendance
//       WHERE employee_id = ?
//         AND DATE(marked_at) = ?
//       `,
//       [employee_id, today]
//     );

//     if (existing.length) {
//       return res
//         .status(409)
//         .json({ message: "Attendance already marked for today" });
//     }

//     const status = "present";

//     await db.execute(
//       `
//       INSERT INTO attendance
//       (employee_id, status, confidence, marked_by)
//       VALUES (?, ?, ?, ?)
//       `,
//       [
//         employee_id,
//         status,
//         confidence || null,
//         1,
//       ]
//     );

//     const [emp] = await db.query(
//       "SELECT name, department FROM employees WHERE id = ?",
//       [employee_id]
//     );

//     res.status(201).json({
//       message: "Attendance marked",
//       employee: emp[0],
//       status,
//       confidence,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });
const markAttendance = asyncHandler(async (req, res) => {
  const { employee_id, confidence } = req.body;

  if (!employee_id) {
    return res.status(400).json({ message: "employee_id required" });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    // Check if there's already a record for this employee today
    const [existing] = await db.query(
      `
      SELECT id, in_time, out_time
      FROM attendance
      WHERE employee_id = ?
        AND DATE(in_time) = ?
      `,
      [employee_id, today]
    );

    // const [empRows] = await db.query(
    //   "SELECT name FROM employees WHERE id = ?",
    //   [employee_id]
    // );
    // const employee = empRows[0];
    const [empRows] = await db.query(
  "SELECT name FROM employees WHERE id = ? AND admin_id = ?",
  [employee_id, req.adminId]
);
if (!empRows.length) {
  return res.status(404).json({ message: "Employee not found for this admin" });
}
const employee = empRows[0];

    // ── No record yet today → mark IN ─────────────────────────────
    if (!existing.length) {
      await db.execute(
        `INSERT INTO attendance
        (employee_id, status, confidence, marked_by, in_time)
        VALUES (?, ?, ?, ?, NOW())
        `,
        [employee_id, "present", confidence || null, req.adminId]
      );
      // await db.execute(
      //   `
      //   INSERT INTO attendance
      //   (employee_id, status, confidence, marked_by, in_time)
      //   VALUES (?, ?, ?, ?, NOW())
      //   `,
      //   [employee_id, "present", confidence || null, 1]
      // );

      return res.status(201).json({
        message: "Check-in marked",
        type: "in",
        employee,
        status: "present",
        confidence,
      });
    }

    const record = existing[0];

    // ── Record exists, but no out_time yet → mark OUT ─────────────
    if (!record.out_time) {
      await db.execute(
        `UPDATE attendance SET out_time = NOW(),status=? WHERE id = ?`,
        ["checked-out", record.id]
      );

      return res.status(200).json({
        message: "Check-out marked",
        type: "out",
        employee,
        status: "checked-out",
        confidence,
      });
    }

    // ── Both in_time and out_time already recorded → done for today
    return res.status(409).json({
      message: "Attendance already completed for today (in & out both marked)",
      type: "done",
      employee,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

//earlier version of getAttendance without search functionality
// const getAttendance = asyncHandler(async (req, res) => {
//   const { date } = req.query;

//   try {
//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 10);
//     const offset = (page - 1) * limit;

//     let whereClause = "WHERE 1 = 1";
//     const params = [];
//     if (date) {
//       whereClause += " AND DATE(a.in_time) = ?";
//       params.push(date);
//     }

//     const [countRows] = await db.query(
//       `SELECT COUNT(*) AS total FROM attendance a ${whereClause}`,
//       params
//     );
//     const total = countRows[0].total;

//     // const [attendance] = await db.query(
//     //   `
//     //   SELECT
//     //     a.id,
//     //     e.name,
//     //     e.photo_url,
//     //     DATE_FORMAT(a.in_time,  '%d %b %Y %h:%i:%s %p') AS in_time,
//     //     DATE_FORMAT(a.out_time, '%d %b %Y %h:%i:%s %p') AS out_time,
//     //     a.status,
//     //     a.confidence
//     //   FROM attendance a
//     //   JOIN employees e
//     //     ON a.employee_id = e.id
//     //   ${whereClause}
//     //   ORDER BY a.in_time DESC
//     //   LIMIT ? OFFSET ?
//     //   `,
//     //   [...params, limit, offset]
//     // );
// const [attendance] = await db.query(
//   `
//   SELECT
//     a.id,
//     e.id AS employee_id,
//     e.name,
//     e.photo_url,
//     DATE_FORMAT(a.in_time,  '%d %b %Y %h:%i:%s %p') AS in_time,
//     DATE_FORMAT(a.out_time, '%d %b %Y %h:%i:%s %p') AS out_time,
//     a.status,
//     a.confidence
//   FROM attendance a
//   JOIN employees e
//     ON a.employee_id = e.id
//   ${whereClause}
//   ORDER BY a.in_time DESC
//   LIMIT ? OFFSET ?
//   `,
//   [...params, limit, offset]
// );
//     res.json({
//       attendance,
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
const getAttendance = asyncHandler(async (req, res) => {
  const { date, search } = req.query;

  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    // let whereClause = "WHERE 1 = 1";
    // const params = [];

    // if (date) {
    //   whereClause += " AND DATE(a.in_time) = ?";
    //   params.push(date);
    // }

    // if (search) {
    //   whereClause += " AND e.name LIKE ?";
    //   params.push(`%${search}%`);
    // }
 let whereClause = "WHERE e.admin_id = ?";
const params = [req.adminId];

if (date) {
  whereClause += " AND DATE(a.in_time) = ?";
  params.push(date);
}
if (search) {
  whereClause += " AND e.name LIKE ?";
  params.push(`%${search}%`);
}

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [attendance] = await db.query(
      `
      SELECT
        a.id,
        e.id AS employee_id,
        e.name,
        e.photo_url,
        DATE_FORMAT(a.in_time,  '%d %b %Y %h:%i:%s %p') AS in_time,
        DATE_FORMAT(a.out_time, '%d %b %Y %h:%i:%s %p') AS out_time,
        a.status,
        a.confidence
      FROM attendance a
      JOIN employees e
        ON a.employee_id = e.id
      ${whereClause}
      ORDER BY a.in_time DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      attendance,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// const getTodaySummary = asyncHandler(async (req, res) => {
//   const today = new Date().toISOString().split("T")[0];

//   try {
//     const [[{ total }]] = await db.execute(
//       "SELECT COUNT(*) AS total FROM employees"
//     );

//     const [[{ present }]] = await db.execute(
//       `
//       SELECT COUNT(*) AS present
//       FROM attendance
//       WHERE DATE(in_time) = ?
//       `,
//       [today]
//     );

//     const [[{ checkedOut }]] = await db.execute(
//       `
//       SELECT COUNT(*) AS checkedOut
//       FROM attendance
//       WHERE DATE(out_time) = ?
//         AND out_time IS NOT NULL
//       `,
//       [today]
//     );

//     res.json({
//       total,
//       present,
//       checkedOut,
//       absent: total - present,
//       date: today,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });
const getSummary = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const adminIdFilter = req.query.admin_id ? Number(req.query.admin_id) : null;

  try {
    // ── Overall totals (optionally scoped to one admin) ─────────────
    let empWhere = "WHERE 1 = 1";
    const empParams = [];
    if (adminIdFilter) {
      empWhere += " AND admin_id = ?";
      empParams.push(adminIdFilter);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM employees ${empWhere}`,
      empParams
    );

    let attWhere = "WHERE DATE(a.in_time) = ?";
    const attParams = [date];
    if (adminIdFilter) {
      attWhere += " AND e.admin_id = ?";
      attParams.push(adminIdFilter);
    }

    const [[{ present }]] = await db.query(
      `SELECT COUNT(*) AS present
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       ${attWhere}`,
      attParams
    );

    let outWhere = "WHERE DATE(a.out_time) = ? AND a.out_time IS NOT NULL";
    const outParams = [date];
    if (adminIdFilter) {
      outWhere += " AND e.admin_id = ?";
      outParams.push(adminIdFilter);
    }

    const [[{ checkedOut }]] = await db.query(
      `SELECT COUNT(*) AS checkedOut
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       ${outWhere}`,
      outParams
    );

    // ── Per-admin breakdown (only meaningful when not already filtered to one admin) ──
    let breakdown = [];
    if (!adminIdFilter) {
      const [rows] = await db.query(
        `
        SELECT
          ad.id AS admin_id,
          ad.name AS admin_name,
          COUNT(DISTINCT e.id) AS total,
          COUNT(DISTINCT CASE WHEN DATE(a.in_time) = ? THEN a.employee_id END) AS present,
          COUNT(DISTINCT CASE WHEN DATE(a.out_time) = ? AND a.out_time IS NOT NULL THEN a.employee_id END) AS checkedOut
        FROM admins ad
        LEFT JOIN employees e ON e.admin_id = ad.id
        LEFT JOIN attendance a ON a.employee_id = e.id
        WHERE ad.role = 'admin'
        GROUP BY ad.id, ad.name
        ORDER BY ad.name ASC
        `,
        [date, date]
      );
      breakdown = rows.map((r) => ({
        ...r
      }));
    }

    res.json({
      total,
      present,
      checkedOut,
     
      date,
      breakdown, // empty array when filtered to a single admin
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


const getAttendanceSuperAdmin = asyncHandler(async (req, res) => {
  const { date, search } = req.query;
  const adminIdFilter = req.query.admin_id ? Number(req.query.admin_id) : null;

  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1 = 1";
    const params = [];

    if (adminIdFilter) {
      whereClause += " AND e.admin_id = ?";
      params.push(adminIdFilter);
    }
    if (date) {
      whereClause += " AND DATE(a.in_time) = ?";
      params.push(date);
    }
    if (search) {
      whereClause += " AND e.name LIKE ?";
      params.push(`%${search}%`);
    }

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [attendance] = await db.query(
      `
      SELECT
        a.id,
        e.id AS employee_id,
        e.name,
        e.photo_url,
        e.admin_id,
        ad.name AS admin_name,
        DATE_FORMAT(a.in_time,  '%d %b %Y %h:%i:%s %p') AS in_time,
        DATE_FORMAT(a.out_time, '%d %b %Y %h:%i:%s %p') AS out_time,
        a.status,
        a.confidence
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN admins ad ON e.admin_id = ad.id
      ${whereClause}
      ORDER BY a.in_time DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      attendance,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// const getTodaySummary = asyncHandler(async (req, res) => {
//   const today = new Date().toISOString().split("T")[0];

//   try {
//     const [[{ total }]] = await db.query(
//       "SELECT COUNT(*) AS total FROM employees"
//     );

//     const [[{ present }]] = await db.query(
//       `
//       SELECT COUNT(*) AS present
//       FROM attendance
//       WHERE DATE(in_time) = ?
//         AND status = 'present'
//       `,
//       [today]
//     );

//     const [[{ late }]] = await db.query(
//       `
//       SELECT COUNT(*) AS late
//       FROM attendance
//       WHERE DATE(marked_at) = ?
//         AND status = 'late'
//       `,
//       [today]
//     );

//     res.json({
//       total,
//       present,
//       late,
//       absent: total - present - late,
//       date: today,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });
export { markAttendance, getAttendance, getSummary, getAttendanceSuperAdmin };