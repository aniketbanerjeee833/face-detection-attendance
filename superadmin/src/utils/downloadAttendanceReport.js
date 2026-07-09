// utils/downloadAttendanceReport.js
export const downloadAttendanceReport = async ({
  isSuperAdmin,
  date,
  search,
  policeStationId,
  adminId
}) => {
  const base = "http://localhost:5000/api/attendance";
  const path = isSuperAdmin ? "/export/superadmin" : "/export";

  const params = new URLSearchParams();

  if (date) params.set("date", date);
  if (search) params.set("search", search);

  // Send police station filter for superadmin
  if (isSuperAdmin && policeStationId) {
    params.set("police_station_id", policeStationId);
  }
   if (isSuperAdmin && adminId) params.set('admin_id', adminId); // ← new

  const res = await fetch(`${base}${path}?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to download report");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_report_${date || "all"}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
};