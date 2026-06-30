import db from "../config/db.js";

const markAttendance = async (req, res) => {
  const { employee_id, confidence } = req.body;
  if (!employee_id) return res.status(400).json({ message: 'employee_id required' });

  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];

  // Late if after 9:30 AM
  const hour = now.getHours();
  const min = now.getMinutes();
  const status = (hour > 9 || (hour === 9 && min > 30)) ? 'late' : 'present';

  try {
    // Check if already marked today
    const [existing] = await db.query(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );
    if (existing.length)
      return res.status(409).json({ message: 'Attendance already marked for today' });

    // await db.query(
    //   'INSERT INTO attendance (employee_id, date, time, status, confidence, marked_by) VALUES (?, ?, ?, ?, ?, ?)',
    //   [employee_id, date, time, status, confidence || null, req.admin.id]
    // );
    await db.query(
  `INSERT INTO attendance
  (employee_id, date, time, status, confidence, marked_by)
  VALUES (?, ?, ?, ?, ?, ?)`,
  [
    employee_id,
    date,
    time,
    status,
    confidence || null,
    1
  ]
);
    // Fetch employee name to return
    const [emp] = await db.query('SELECT name, department FROM employees WHERE id = ?', [employee_id]);
    res.status(201).json({
      message: 'Attendance marked',
      employee: emp[0],
      date, time, status, confidence,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAttendance = async (req, res) => {
  const { date, employee_id } = req.query;
  try {
    let query = `
      SELECT a.id, e.name, e.department, e.photo_url,
             a.date, a.time, a.status, a.confidence
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (date) { query += ' AND a.date = ?'; params.push(date); }
    if (employee_id) { query += ' AND a.employee_id = ?'; params.push(employee_id); }

    query += ' ORDER BY a.date DESC, a.time DESC';

    const [rows] = await db.query(query, params);
    res.json({ attendance: rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getTodaySummary = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM employees');
    const [[{ present }]] = await db.query(
      "SELECT COUNT(*) as present FROM attendance WHERE date = ? AND status = 'present'", [today]
    );
    const [[{ late }]] = await db.query(
      "SELECT COUNT(*) as late FROM attendance WHERE date = ? AND status = 'late'", [today]
    );
    res.json({ total, present, late, absent: total - present - late, date: today });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export { markAttendance, getAttendance, getTodaySummary };