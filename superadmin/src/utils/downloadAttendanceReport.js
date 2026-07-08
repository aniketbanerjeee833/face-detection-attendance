// utils/downloadAttendanceReport.js
export const downloadAttendanceReport = async ({ isSuperAdmin, date, search, adminId }) => {
  const base = 'http://localhost:5000/api/attendance'; // adjust to your actual API base
  const path = isSuperAdmin ? '/export/superadmin' : '/export';

  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (search) params.set('search', search);
  if (isSuperAdmin && adminId) params.set('admin_id', adminId);

  const res = await fetch(`${base}${path}?${params.toString()}`, {
    method: 'GET',
    credentials: 'include', // send the session cookie
  });

  if (!res.ok) {
    throw new Error('Failed to download report');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_report_${date || 'all'}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};