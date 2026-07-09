import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useGetAttendanceQuery, useGetAttendanceSuperAdminQuery } from '../redux/api/attendanceApi';

import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'react-router-dom';
import { downloadAttendanceReport } from '@/utils/downloadAttendanceReport';
import { FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useGetPoliceStationsQuery } from '@/redux/api/policeStationApi';
import { useGetAdminsListQuery } from '@/redux/api/employeeApi';

const formatDisplayDate = (isoDate) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
};

export default function AttendanceLog() {
  const { admin } = useSelector((s) => s.auth);
  const isSuperAdmin = admin?.role === 'superadmin';

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page') || 1);
  const perPage = Number(searchParams.get('limit') || 10);
  const search = searchParams.get('search') || '';
  const filterDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const stationFilter = searchParams.get('police_station_id') || '';
  const adminFilter = searchParams.get('admin_id') || ''; // ← new
  const updateParams = (values) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value === '' || value == null) params.delete(key);
      else params.set(key, String(value));
    });
    setSearchParams(params);
  };

  // Seed default params on first load
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;
    if (!params.has('page')) { params.set('page', '1'); changed = true; }
    if (!params.has('limit')) { params.set('limit', '10'); changed = true; }
    if (!params.has('date')) { params.set('date', new Date().toISOString().split('T')[0]); changed = true; }
    if (changed) setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search input
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim() !== search)
        updateParams({ search: searchInput.trim(), page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: adminData, isLoading: adminLoading, isFetching: adminFetching } =
    useGetAttendanceQuery(
      { date: filterDate, page, limit: perPage, search },
      { skip: isSuperAdmin }
    );

  const { data: superData, isLoading: superLoading, isFetching: superFetching } =
    useGetAttendanceSuperAdminQuery(
      {
        date: filterDate, page, limit: perPage, search, police_station_id: stationFilter,
        admin_id: adminFilter
      },
      { skip: !isSuperAdmin }
    );
  const { data: adminsData } = useGetAdminsListQuery(undefined, { skip: !isSuperAdmin }); // ← new
  //const adminsList = adminsData?.admins ?? [];
  const allAdminsList = adminsData?.admins ?? [];
  const adminsList = stationFilter
    ? allAdminsList.filter((a) => String(a.police_station_id) === String(stationFilter))
    : allAdminsList;

  // const { data: stationsData } = useGetPoliceStationsQuery(undefined, { skip: !isSuperAdmin });
  // const stationsList = stationsData?.police_stations ?? [];
  const { data: stationsData } = useGetPoliceStationsQuery(); // 👈 new
  const stationsList = stationsData?.stations ?? [];
  const data = isSuperAdmin ? superData : adminData;
  const isLoading = isSuperAdmin ? superLoading : adminLoading;
  const isFetching = isSuperAdmin ? superFetching : adminFetching;

  const logs = data?.attendance ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;

  // ── Export ────────────────────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(false);
  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAttendanceReport({
        isSuperAdmin,
        date: filterDate,
        search,
        policeStationId: stationFilter,
        adminId: adminFilter
      });
    } catch {
      toast.error('Failed to download report, please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Attendance Log</h2>
        <p className="text-xs text-indigo-500">{formatDisplayDate(filterDate)}</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
        <label className="text-sm font-medium text-slate-500">Date</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => updateParams({ date: e.target.value, page: 1 })}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />


        <Select
          value={stationFilter || 'all'}
          onValueChange={(v) => updateParams({
            police_station_id: v === 'all' ? '' : v,
            admin_id: '',  // ← reset admin when station changes
            page: 1
          })}
        >
          <SelectTrigger className="h-10 w-52 text-sm">
            <SelectValue placeholder="Filter by police station" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Police Stations</SelectItem>
            {stationsList.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>






        {/* <Select
    value={adminFilter || 'all'}
    onValueChange={(v) => updateParams({ admin_id: v === 'all' ? '' : v, page: 1 })}
  >
    <SelectTrigger className="h-10 w-52 text-sm">
      <SelectValue placeholder="Filter by admin" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Admins</SelectItem>
      {adminsList.map((a) => (
        <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
      ))}
    </SelectContent>
  </Select> */}
        <Select
          value={adminFilter || 'all'}
          onValueChange={(v) => updateParams({ admin_id: v === 'all' ? '' : v, page: 1 })}
        >
          <SelectTrigger className="h-10 w-52 text-sm">
            <SelectValue placeholder="Filter by admin" />
          </SelectTrigger>
          {/* <SelectContent>
            <SelectItem value="all">All Admins</SelectItem>

           
            {stationFilter ? (
              // Station selected — just show filtered admins, no grouping needed
              adminsList.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>
                  {a.name}
                </SelectItem>
              ))
            ) : (
              // No station selected — group admins by station
              stationsList.map((station) => {
                const stationAdmins = allAdminsList.filter(
                  (a) => String(a.police_station_id) === String(station.id)
                );
                if (!stationAdmins.length) return null;
                return (
                  <div key={station.id}>
                    {/* Station group label 
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {station.name}
                    </div>
                    {stationAdmins.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </div>
                );
              })
            )}
          </SelectContent> */}
                  <SelectContent>
            <SelectItem value="all">All Admins</SelectItem>
          
            {adminsList.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                <div className="flex w-full items-center justify-between gap-6">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-xs text-slate-500">
                    {a.police_station_name}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name..."
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />

        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {isFetching ? 'Loading...' : `${pagination.total ?? 0} records`}
          </span>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download as Excel"
            className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet size={14} className="text-green-600" />
            {downloading ? 'Preparing...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Spinner text="Loading logs..." />
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-16 text-center shadow-soft ring-1 ring-slate-100">
          <span className="text-3xl">📋</span>
          <p className="text-sm text-slate-400">No attendance records for this date.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 font-medium">Sl No</th>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Police Station</th>
                  <th className="px-6 py-3 font-medium">Admin</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  {/* {isSuperAdmin && <th className="px-6 py-3 font-medium">Marked By</th>} */}
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-blue-50/40">
                    <td className="px-6 py-3 text-slate-400">{(page - 1) * perPage + i + 1}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900">{log.name}</td>
                    <td className="px-6 py-3 text-slate-500">{log.police_station_name}</td>
                    <td className="px-6 py-3 text-slate-500">{log.added_by_admin_name ?? '—'}</td>
                    <td className="px-6 py-3 text-slate-500">{log.marked_at}</td>
                    {/* {isSuperAdmin && (
                      <td className="px-6 py-3 text-slate-500">{log.marked_by_admin_name ?? '—'}</td>
                    )} */}
                    <td className="px-6 py-3">
                      <Badge status="Present" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Rows per page</span>
                <Select
                  value={String(perPage)}
                  onValueChange={(v) => updateParams({ limit: v, page: 1 })}
                >
                  <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <span className="text-sm text-gray-500">
                Page {page} of {totalPages} · {pagination.total ?? 0} total
              </span>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => updateParams({ page: 1 })} disabled={page === 1} className="h-8 px-2">«</Button>
                <Button variant="outline" size="sm" onClick={() => updateParams({ page: Math.max(1, page - 1) })} disabled={page === 1} className="h-8 px-3">‹</Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`d${i}`} className="px-1 text-sm text-gray-400">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateParams({ page: p })}
                        className={`h-8 w-8 p-0 text-sm ${page === p ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}`}
                      >
                        {p}
                      </Button>
                    )
                  )}

                <Button variant="outline" size="sm" onClick={() => updateParams({ page: Math.min(totalPages, page + 1) })} disabled={page === totalPages} className="h-8 px-3">›</Button>
                <Button variant="outline" size="sm" onClick={() => updateParams({ page: totalPages })} disabled={page === totalPages} className="h-8 px-2">»</Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}