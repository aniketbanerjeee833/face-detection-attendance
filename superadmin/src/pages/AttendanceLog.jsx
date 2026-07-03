

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useGetAttendanceQuery } from '../redux/api/attendanceApi';
// import Badge from '../components/ui/Badge';
// import Spinner from '../components/ui/Spinner';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import Button from '@/components/ui/Button';
// import { useNavigate } from 'react-router-dom';
// export default function AttendanceLog() {
//   const [filterDate, setFilterDate] = useState(
//     new Date().toISOString().split('T')[0]
//   );
//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(10);
// const navigate = useNavigate();
//   // RTK Query re-fetches automatically whenever filterDate changes
//   // and caches each date's result separately
//   const { data, isLoading, isFetching } = useGetAttendanceQuery({ date: filterDate, page, limit: perPage });

//   const logs = data?.attendance ?? [];
//   const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
//   const totalPages = pagination.totalPages || 1;
//   console.log(logs)
//   const handleCheckOutClick = (log) => {
//     navigate('/scan', {
//       state: {
//         checkoutMode: true,
//         employeeId: log.employee_id,
//         employeeName: log.name,
//         returnTo: '/logs',
//       },
//     });
//   };
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
//         <label className="text-sm font-medium text-slate-500">Filter by date</label>
//         <input
//           type="date"
//           value={filterDate}
//           onChange={(e) => setFilterDate(e.target.value)}
//           className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
//         />
//         <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
//           {isFetching ? 'Loading...' : `${logs.length} records`}
//         </span>
//       </div>

//       {isLoading ? (
//         <Spinner text="Loading logs..." />
//       ) : logs.length === 0 ? (
//         <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-16 text-center shadow-soft ring-1 ring-slate-100">
//           <span className="text-3xl">📋</span>
//           <p className="text-sm text-slate-400">No attendance records for this date.</p>
//         </div>
//       ) : (
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100"
//         >
//           <div className="overflow-x-auto">
//                <table className="w-full text-left text-sm">
//               <thead>
//                 <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
//                   <th className="px-6 py-3 font-medium">Sl No</th>
//                   <th className="px-6 py-3 font-medium">Employee</th>
//                   <th className="px-6 py-3 font-medium">In Time</th>
//                   <th className="px-6 py-3 font-medium">Out Time</th>
//                   <th className="px-6 py-3 font-medium">Status</th>
//                   <th className="px-6 py-3 font-medium">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {logs?.map((log, i) => (
//                   <tr key={log.id} className="hover:bg-blue-50/40">
//                     <td className="px-6 py-3 text-slate-400">{(page - 1) * perPage + i + 1}</td>
//                     <td className="px-6 py-3 font-semibold text-slate-900">{log.name}</td>
//                     <td className="px-6 py-3 text-slate-500">{log.in_time}</td>
//                     <td className="px-6 py-3 text-slate-500">
//                       {log.out_time ?? <span className="text-amber-500 text-xs font-medium">Not checked out</span>}
//                     </td>
//                     <td className="px-6 py-3">
//                       <Badge status={log.status==="checked-out" ? "checked-out" : log.status} />
//                       {/* <Badge status={log.status} /> */}
//                       </td>
//                     <td className="px-6 py-3">
//                       {!log.out_time && (
//                         <Button
//                           size="sm"
//                           variant="checkOut"
//                           className='cursor-pointer'
//                           onClick={() => handleCheckOutClick(log)}
//                         >
//                           Check Out
//                         </Button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           {logs?.length > 0 && (
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
//               <div className="flex items-center gap-2 text-sm text-gray-500">
//                 <span>Rows per page</span>
//                 <Select
//                   value={String(perPage)}
//                   onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}
//                 >
//                   <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     {[10, 20, 50].map((n) => (
//                       <SelectItem key={n} value={String(n)}>{n}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <span className="text-sm text-gray-500">
//                 Page {page} of {totalPages} · {pagination.total ?? 0} total
//               </span>

//               <div className="flex items-center gap-1">
//                 <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1} className="h-8 px-2">«</Button>
//                 <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3">‹</Button>

//                 {Array.from({ length: totalPages }, (_, i) => i + 1)
//                   .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
//                   .reduce((acc, p, i, arr) => {
//                     if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
//                     acc.push(p);
//                     return acc;
//                   }, [])
//                   .map((p, i) =>
//                     p === '...' ? (
//                       <span key={`d${i}`} className="px-1 text-gray-400 text-sm">…</span>
//                     ) : (
//                       <Button
//                         key={p}
//                         variant={page === p ? 'default' : 'outline'}
//                         size="sm"
//                         onClick={() => setPage(p)}
//                         className={`h-8 w-8 p-0 text-sm ${page === p ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
//                       >
//                         {p}
//                       </Button>
//                     )
//                   )}

//                 <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-3">›</Button>
//                 <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages} className="h-8 px-2">»</Button>
//               </div>
//             </div>
//           )}
//         </motion.div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useGetAttendanceQuery, useGetAttendanceSuperAdminQuery } from '../redux/api/attendanceApi';
import { useGetAdminsListQuery } from '../redux/api/employeeApi';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Button from '@/components/ui/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';


export default function AttendanceLog() {
  const formatDisplayDate = (isoDate) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
  const navigate = useNavigate();
 
  const [searchParams, setSearchParams] = useSearchParams();

  const { admin } = useSelector((s) => s.auth);
  const isSuperAdmin = admin?.role === 'superadmin';

  // Derive everything from the URL so filters/pagination survive refresh & back/forward nav
  const page = Number(searchParams.get('page') || 1);
  const perPage = Number(searchParams.get('limit') || 10);
  const search = searchParams.get('search') || '';
  const filterDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const adminIdFilter = searchParams.get('admin_id') || '';

  const updateParams = (values) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (value === '' || value == null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  };

  // Make sure page, limit, and date always exist in the URL on first load
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;

    if (!params.has('page')) { params.set('page', '1'); changed = true; }
    if (!params.has('limit')) { params.set('limit', '10'); changed = true; }
    if (!params.has('date')) { params.set('date', new Date().toISOString().split('T')[0]); changed = true; }

    if (changed) setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local input state so typing doesn't hammer the URL/API on every keystroke
  const [searchInput, setSearchInput] = useState(search);

  // Debounce: update the URL (and therefore trigger the query) 400ms after typing stops
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim() !== search) {
        updateParams({ search: searchInput.trim(), page: 1 });
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleDateChange = (e) => {
    updateParams({ date: e.target.value, page: 1 });
  };

  // ── Admin-scoped query (own employees only) ──────────────────────────
  const { data: adminData, isLoading: adminLoading, isFetching: adminFetching } =
    useGetAttendanceQuery(
      { date: filterDate, page, limit: perPage, search },
      { skip: isSuperAdmin }
    );

  // ── Superadmin query (all admins, optional admin_id filter) ─────────
  const { data: superData, isLoading: superLoading, isFetching: superFetching } =
    useGetAttendanceSuperAdminQuery(
      { date: filterDate, page, limit: perPage, search, admin_id: adminIdFilter },
      { skip: !isSuperAdmin }
    );

  const { data: adminsListData } = useGetAdminsListQuery(undefined, { skip: !isSuperAdmin });
  const adminsList = adminsListData?.admins ?? [];

  const data = isSuperAdmin ? superData : adminData;
  const isLoading = isSuperAdmin ? superLoading : adminLoading;
  const isFetching = isSuperAdmin ? superFetching : adminFetching;

  const logs = data?.attendance ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="space-y-6">
        <div>
        <h2 className="text-lg font-bold text-slate-900">Attendance Log</h2>
        <p className="text-xs text-indigo-500">{formatDisplayDate(filterDate)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
        <label className="text-sm font-medium text-slate-500">Filter by date</label>
        <input
          type="date"
          value={filterDate}
          
          onChange={handleDateChange}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />

        {isSuperAdmin && (
          <Select
            value={adminIdFilter || 'all'}
            onValueChange={(v) => updateParams({ admin_id: v === 'all' ? '' : v, page: 1 })}
          >
            <SelectTrigger className="h-10 w-48 text-sm"><SelectValue placeholder="Filter by admin" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Admins</SelectItem>
              {adminsList.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          {isFetching ? 'Loading...' : `${logs.length} records`}
        </span>
      </div>

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
                  {isSuperAdmin && <th className="px-6 py-3 font-medium">Admin</th>}
                  <th className="px-6 py-3 font-medium">In Time</th>
                  <th className="px-6 py-3 font-medium">Out Time</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs?.map((log, i) => (
                  <tr key={log.id} className="hover:bg-blue-50/40">
                    <td className="px-6 py-3 text-slate-400">{(page - 1) * perPage + i + 1}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900">{log.name}</td>
                    {isSuperAdmin && (
                      <td className="px-6 py-3 text-slate-500">{log.admin_name}</td>
                    )}
                    <td className="px-6 py-3 text-slate-500">{log.in_time}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {log.out_time ?? <span className="text-amber-500 text-xs font-medium">Not checked out</span>}
                    </td>
                    <td className="px-6 py-3">
                      <Badge status={log.status === "checked-out" ? "Duty Over" : "Duty In"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {logs?.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
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
                      <span key={`d${i}`} className="px-1 text-gray-400 text-sm">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateParams({ page: p })}
                        className={`h-8 w-8 p-0 text-sm ${page === p ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
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