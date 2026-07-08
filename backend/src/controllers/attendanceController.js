import db from "../config/db.js";
import asyncHandler from "../middleware/asyncHandler.js";
import ExcelJS from "exceljs";


//NEW
// const markAttendance = asyncHandler(async (req, res) => {
//   const { employee_id, confidence } = req.body;

//   if (!employee_id) {
//     return res.status(400).json({ message: "employee_id required" });
//   }

//   const today = new Date().toISOString().split("T")[0];

//   try {
//     const [empRows] = await db.query(
//       "SELECT name FROM employees WHERE id = ? AND admin_id = ?",
//       [employee_id, req.adminId]
//     );
//     if (!empRows.length) {
//       return res.status(404).json({ message: "Employee not found for this admin" });
//     }
//     const employee = empRows[0];

//     // ── Only look for an open session that started TODAY ──────────────
//     const [openRows] = await db.query(
//       `
//       SELECT id
//       FROM attendance
//       WHERE employee_id = ?
//         AND out_time IS NULL
//         AND DATE(in_time) = ?
//       ORDER BY in_time DESC
//       LIMIT 1
//       `,
//       [employee_id, today]
//     );

//     // ── No open session today → fresh check-IN ────────────────────────
//     if (!openRows.length) {
//       await db.execute(
//         `
//         INSERT INTO attendance
//         (employee_id, status, confidence, marked_by, in_time)
//         VALUES (?, ?, ?, ?, NOW())
//         `,
//         [employee_id, "present", confidence || null, req.adminId]
//       );

//       return res.status(201).json({
//         message: "Check-in marked",
//         type: "in",
//         employee,
//         status: "present",
//         confidence,
//       });
//     }

//     // ── Open session from today exists → close it (check-OUT) ─────────
//     await db.execute(
//       `UPDATE attendance SET out_time = NOW(), status = ? WHERE id = ?`,
//       ["checked-out", openRows[0].id]
//     );

//     return res.status(200).json({
//       message: "Check-out marked",
//       type: "out",
//       employee,
//       status: "checked-out",
//       confidence,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });


// const getAttendance = asyncHandler(async (req, res) => {
//   const { date, search } = req.query;
//   try {
//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 10);
//     const offset = (page - 1) * limit;

//     let whereClause = "WHERE e.admin_id = ?";
//     const params = [req.adminId];

//     if (date) {
//       whereClause += " AND DATE(a.in_time) = ?";
//       params.push(date);
//     }
//     if (search) {
//       whereClause += " AND e.name LIKE ?";
//       params.push(`%${search}%`);
//     }

//     // ── Count distinct EMPLOYEES matching filters (not sessions) ──────
//     const [countRows] = await db.query(
//       `SELECT COUNT(DISTINCT e.id) AS total
//        FROM attendance a
//        JOIN employees e ON a.employee_id = e.id
//        ${whereClause}`,
//       params
//     );
//     const total = countRows[0].total;

//     // ── Paginated list of employees, ordered by most recent activity ──
//     const [empRows] = await db.query(
//       `
//       SELECT e.id AS employee_id, e.name, e.photo_url, MAX(a.in_time) AS latest_in
//       FROM attendance a
//       JOIN employees e ON a.employee_id = e.id
//       ${whereClause}
//       GROUP BY e.id, e.name, e.photo_url
//       ORDER BY latest_in DESC
//       LIMIT ? OFFSET ?
//       `,
//       [...params, limit, offset]
//     );

//     if (!empRows.length) {
//       return res.json({
//         attendance: [],
//         pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//       });
//     }

//     const employeeIds = empRows.map((e) => e.employee_id);

//     // ── Fetch ALL matching sessions for exactly these employees ───────
//     let sessionWhere = "WHERE e.admin_id = ? AND a.employee_id IN (?)";
//     const sessionParams = [req.adminId, employeeIds];
//     if (date) {
//       sessionWhere += " AND DATE(a.in_time) = ?";
//       sessionParams.push(date);
//     }

//     const [sessions] = await db.query(
//       `
//       SELECT
//         a.id,
//         a.employee_id,
//         DATE_FORMAT(a.in_time,  '%d %b %Y %h:%i:%s %p') AS in_time,
//         DATE_FORMAT(a.out_time, '%d %b %Y %h:%i:%s %p') AS out_time,
//         a.status,
//         a.confidence
//       FROM attendance a
//       JOIN employees e ON a.employee_id = e.id
//       ${sessionWhere}
//       ORDER BY a.in_time ASC
//       `,
//       sessionParams
//     );

//     // ── Group sessions under their employee ────────────────────────────
//     const attendance = empRows.map((emp) => ({
//       employee_id: emp.employee_id,
//       name: emp.name,
//       photo_url: emp.photo_url,
//       sessions: sessions.filter((s) => s.employee_id === emp.employee_id),
//     }));

//     res.json({
//       attendance,
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
const markAttendance = asyncHandler(async (req, res) => {
  const { employee_id, confidence } = req.body;
  if (!employee_id) return res.status(400).json({ message: "employee_id required" });

  const today = new Date().toISOString().split("T")[0];

  try {
    const [empRows] = await db.query(
      "SELECT name FROM employees WHERE id = ? AND police_station_id = ?",
      [employee_id, req.policeStationId]
    );
    if (!empRows.length) {
      return res.status(404).json({ message: "Employee not found for this police station" });
    }
    const employee = empRows[0];

    const [existing] = await db.query(
      `SELECT id FROM attendance WHERE employee_id = ? AND DATE(marked_at) = ?`,
      [employee_id, today]
    );

    if (existing.length) {
      return res.status(409).json({ message: "Attendance already marked for today", type: "already-marked", employee });
    }

    await db.execute(
      `INSERT INTO attendance (employee_id, status, confidence, marked_by, marked_at)
       VALUES (?, 'present', ?, ?, NOW())`,
      [employee_id, confidence || null, req.adminId] // marked_by = which of the 3 admins actually did it — audit trail
    );

    return res.status(201).json({ message: "Attendance marked", type: "marked", employee, status: "present", confidence });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

const getAttendance = asyncHandler(async (req, res) => {
  const { date, search } = req.query;
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    let whereClause = "WHERE e.police_station_id = ?";
    const params = [req.policeStationId];
    if (date) { whereClause += " AND DATE(a.marked_at) = ?"; params.push(date); }
    if (search) { whereClause += " AND e.name LIKE ?"; params.push(`%${search}%`); }

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM attendance a JOIN employees e ON a.employee_id = e.id ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [attendance] = await db.query(
      `
      SELECT
        a.id, e.id AS employee_id, e.name, e.photo_url,
        ps.name AS police_station_name,
        DATE_FORMAT(a.marked_at, '%d %b %Y %h:%i:%s %p') AS marked_at,
        a.status, a.confidence, ad.name AS marked_by_admin_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN police_stations ps ON e.police_station_id = ps.id
      LEFT JOIN admins ad ON a.marked_by = ad.id
      ${whereClause}
      ORDER BY a.marked_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({ attendance, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// const getSummary = asyncHandler(async (req, res) => {
//   const date = req.query.date || new Date().toISOString().split("T")[0];
//   const adminIdFilter = req.query.admin_id ? Number(req.query.admin_id) : null;

//   try {
//     let empWhere = "WHERE 1 = 1";
//     const empParams = [];
//     if (adminIdFilter) {
//       empWhere += " AND admin_id = ?";
//       empParams.push(adminIdFilter);
//     }

//     const [[{ total }]] = await db.query(
//       `SELECT COUNT(*) AS total FROM employees ${empWhere}`,
//       empParams
//     );

//     let attWhere = "WHERE DATE(a.in_time) = ?";
//     const attParams = [date];
//     if (adminIdFilter) {
//       attWhere += " AND e.admin_id = ?";
//       attParams.push(adminIdFilter);
//     }

//     const [[{ present }]] = await db.query(
//       `SELECT COUNT(DISTINCT a.employee_id) AS present
//        FROM attendance a
//        JOIN employees e ON a.employee_id = e.id
//        ${attWhere}`,
//       attParams
//     );

//     let outWhere = "WHERE DATE(a.out_time) = ? AND a.out_time IS NOT NULL";
//     const outParams = [date];
//     if (adminIdFilter) {
//       outWhere += " AND e.admin_id = ?";
//       outParams.push(adminIdFilter);
//     }

//     const [[{ checkedOut }]] = await db.query(
//       `SELECT COUNT(DISTINCT a.employee_id) AS checkedOut
//        FROM attendance a
//        JOIN employees e ON a.employee_id = e.id
//        ${outWhere}`,
//       outParams
//     );

//     let breakdown = [];
//     if (!adminIdFilter) {
//       const [rows] = await db.query(
//         `
//         SELECT
//           ad.id AS admin_id,
//           ad.name AS admin_name,
//           COUNT(DISTINCT e.id) AS total,
//           COUNT(DISTINCT CASE WHEN DATE(a.in_time) = ? THEN a.employee_id END) AS present,
//           COUNT(DISTINCT CASE WHEN DATE(a.out_time) = ? AND a.out_time IS NOT NULL THEN a.employee_id END) AS checkedOut
//         FROM admins ad
//         LEFT JOIN employees e ON e.admin_id = ad.id
//         LEFT JOIN attendance a ON a.employee_id = e.id
//         WHERE ad.role = 'admin'
//         GROUP BY ad.id, ad.name
//         ORDER BY ad.name ASC
//         `,
//         [date, date]
//       );
//       breakdown = rows;
//     }

//     res.json({ total, present, checkedOut, date, breakdown });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });
const getSummary = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString().split("T")[0];
  const stationIdFilter = req.query.police_station_id ? Number(req.query.police_station_id) : null;

  try {
    let empWhere = "WHERE 1 = 1";
    const empParams = [];
    if (stationIdFilter) { empWhere += " AND police_station_id = ?"; empParams.push(stationIdFilter); }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM employees ${empWhere}`, empParams
    );

    let attWhere = "WHERE DATE(a.marked_at) = ?";
    const attParams = [date];
    if (stationIdFilter) { attWhere += " AND e.police_station_id = ?"; attParams.push(stationIdFilter); }

    const [[{ present }]] = await db.query(
      `SELECT COUNT(DISTINCT a.employee_id) AS present
       FROM attendance a JOIN employees e ON a.employee_id = e.id ${attWhere}`,
      attParams
    );

    let breakdown = [];
    if (!stationIdFilter) {
      const [rows] = await db.query(
        `
        SELECT
          ps.id AS police_station_id,
          ps.name AS police_station_name,
          COUNT(DISTINCT e.id) AS total,
          COUNT(DISTINCT CASE WHEN DATE(a.marked_at) = ? THEN a.employee_id END) AS present
        FROM police_stations ps
        LEFT JOIN employees e ON e.police_station_id = ps.id
        LEFT JOIN attendance a ON a.employee_id = e.id
        GROUP BY ps.id, ps.name
        ORDER BY ps.name ASC
        `,
        [date]
      );
      breakdown = rows.map((r) => ({ ...r, absent: r.total - r.present }));
    }

    res.json({ total, present, absent: total - present, date, breakdown });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
const getAttendanceSuperAdmin = asyncHandler(async (req, res) => {
  const { date, search } = req.query;
  const stationIdFilter = req.query.police_station_id ? Number(req.query.police_station_id) : null;

  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1 = 1";
    const params = [];
    if (stationIdFilter) { whereClause += " AND e.police_station_id = ?"; params.push(stationIdFilter); }
    if (date) { whereClause += " AND DATE(a.marked_at) = ?"; params.push(date); }
    if (search) { whereClause += " AND e.name LIKE ?"; params.push(`%${search}%`); }

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM attendance a JOIN employees e ON a.employee_id = e.id ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [attendance] = await db.query(
      `
      SELECT
        a.id, e.id AS employee_id, e.name, e.photo_url,
        ps.name AS police_station_name,
        DATE_FORMAT(a.marked_at, '%d %b %Y %h:%i:%s %p') AS marked_at,
        a.status, a.confidence, ad.name AS marked_by_admin_name
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN police_stations ps ON e.police_station_id = ps.id
      LEFT JOIN admins ad ON a.marked_by = ad.id
      ${whereClause}
      ORDER BY a.marked_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({ attendance, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// const getAttendanceSuperAdmin = asyncHandler(async (req, res) => {
//   const { date, search } = req.query;
//   const adminIdFilter = req.query.admin_id ? Number(req.query.admin_id) : null;

//   try {
//     const page = Number(req.query.page || 1);
//     const limit = Number(req.query.limit || 10);
//     const offset = (page - 1) * limit;

//     let whereClause = "WHERE 1 = 1";
//     const params = [];

//     if (adminIdFilter) {
//       whereClause += " AND e.admin_id = ?";
//       params.push(adminIdFilter);
//     }
//     if (date) {
//       whereClause += " AND DATE(a.in_time) = ?";
//       params.push(date);
//     }
//     if (search) {
//       whereClause += " AND e.name LIKE ?";
//       params.push(`%${search}%`);
//     }

//     const [countRows] = await db.query(
//       `SELECT COUNT(DISTINCT e.id) AS total
//        FROM attendance a
//        JOIN employees e ON a.employee_id = e.id
//        ${whereClause}`,
//       params
//     );
//     const total = countRows[0].total;

//     const [empRows] = await db.query(
//       `
//       SELECT
//         e.id AS employee_id, e.name, e.photo_url, e.admin_id,
//         ad.name AS admin_name,
//         MAX(a.in_time) AS latest_in
//       FROM attendance a
//       JOIN employees e ON a.employee_id = e.id
//       JOIN admins ad ON e.admin_id = ad.id
//       ${whereClause}
//       GROUP BY e.id, e.name, e.photo_url, e.admin_id, ad.name
//       ORDER BY latest_in DESC
//       LIMIT ? OFFSET ?
//       `,
//       [...params, limit, offset]
//     );

//     if (!empRows.length) {
//       return res.json({
//         attendance: [],
//         pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//       });
//     }

//     const employeeIds = empRows.map((e) => e.employee_id);

//     let sessionWhere = "WHERE a.employee_id IN (?)";
//     const sessionParams = [employeeIds];
//     if (date) {
//       sessionWhere += " AND DATE(a.in_time) = ?";
//       sessionParams.push(date);
//     }

//     const [sessions] = await db.query(
//       `
//       SELECT
//         a.id,
//         a.employee_id,
//         DATE_FORMAT(a.in_time,  '%d %b %Y %h:%i:%s %p') AS in_time,
//         DATE_FORMAT(a.out_time, '%d %b %Y %h:%i:%s %p') AS out_time,
//         a.status,
//         a.confidence
//       FROM attendance a
//       ${sessionWhere}
//       ORDER BY a.in_time ASC
//       `,
//       sessionParams
//     );

//     const attendance = empRows.map((emp) => ({
//       employee_id: emp.employee_id,
//       name: emp.name,
//       photo_url: emp.photo_url,
//       admin_id: emp.admin_id,
//       admin_name: emp.admin_name,
//       sessions: sessions.filter((s) => s.employee_id === emp.employee_id),
//     }));

//     res.json({
//       attendance,
//       pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });

const exportAttendanceSuperAdmin = asyncHandler(async (req, res) => {
  const { date, search } = req.query;
  const stationIdFilter = req.query.police_station_id ? Number(req.query.police_station_id) : null;

  try {
    let whereClause = "WHERE 1 = 1";
    const params = [];
    if (stationIdFilter) { whereClause += " AND e.police_station_id = ?"; params.push(stationIdFilter); }
    if (date) { whereClause += " AND DATE(a.marked_at) = ?"; params.push(date); }
    if (search) { whereClause += " AND e.name LIKE ?"; params.push(`%${search}%`); }

    const [rows] = await db.query(
      `
      SELECT
        e.name, e.phone_number, ps.name AS police_station_name,
        DATE_FORMAT(a.marked_at, '%d %b %Y %h:%i:%s %p') AS marked_at
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      JOIN police_stations ps ON e.police_station_id = ps.id
      ${whereClause}
      ORDER BY e.name ASC, a.marked_at ASC
      `,
      params
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone Number', key: 'phone_number', width: 18 },
      { header: 'Police Station', key: 'police_station_name', width: 25 },
      { header: 'Marked At', key: 'marked_at', width: 25 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };

    rows.forEach((row) => sheet.addRow(row));

    const filename = `attendance_report_${date || 'all'}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// const exportAttendanceSuperAdmin = asyncHandler(async (req, res) => {
//   const { date, search } = req.query;
//   const adminIdFilter = req.query.admin_id ? Number(req.query.admin_id) : null;

//   try {
//     let whereClause = "WHERE 1 = 1";
//     const params = [];

//     if (adminIdFilter) {
//       whereClause += " AND e.admin_id = ?";
//       params.push(adminIdFilter);
//     }
//     if (date) {
//       whereClause += " AND DATE(a.in_time) = ?";
//       params.push(date);
//     }
//     if (search) {
//       whereClause += " AND e.name LIKE ?";
//       params.push(`%${search}%`);
//     }

//     // exportAttendanceSuperAdmin — just change ORDER BY
// const [rows] = await db.query(
//   `
//   SELECT
//     e.id AS employee_id,
//     e.name,
//     e.phone_number,
//     e.place_of_posting,
//     ad.name AS admin_name,
//     DATE_FORMAT(a.in_time,  '%d %b %Y %h:%i:%s %p') AS in_time,
//     DATE_FORMAT(a.out_time, '%d %b %Y %h:%i:%s %p') AS out_time,
//     a.status
//   FROM attendance a
//   JOIN employees e ON a.employee_id = e.id
//   JOIN admins ad ON e.admin_id = ad.id
//   ${whereClause}
//   ORDER BY e.name ASC, a.in_time ASC
//   `,
//   params
// );

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Attendance Report');

//     sheet.columns = [
//       { header: 'Name', key: 'name', width: 25 },
//       { header: 'Phone Number', key: 'phone_number', width: 18 },
//       { header: 'Place of Posting', key: 'place_of_posting', width: 25 },
//       { header: 'Admin', key: 'admin_name', width: 20 },
//       { header: 'In Time', key: 'in_time', width: 25 },
//       { header: 'Out Time', key: 'out_time', width: 25 },
//       { header: 'Status', key: 'status', width: 15 },
//     ];

//     sheet.getRow(1).font = { bold: true };
//     sheet.getRow(1).fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'FFE0E7FF' },
//     };

//     rows.forEach((row) => {
//       sheet.addRow({
//         name: row.name,
//         phone_number: row.phone_number,
//         place_of_posting: row.place_of_posting,
//         admin_name: row.admin_name,
//         in_time: row.in_time,
//         out_time: row.out_time || 'Not checked out',
//         status: row.status === 'checked-out' ? 'Duty Over' : 'Duty In',
//       });
//     });

//     const filename = `attendance_report_all_admins_${date || 'all'}.xlsx`;

//     res.setHeader(
//       'Content-Type',
//       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//     );
//     res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });



export { markAttendance, getAttendance, getSummary, getAttendanceSuperAdmin, 
  exportAttendanceSuperAdmin };