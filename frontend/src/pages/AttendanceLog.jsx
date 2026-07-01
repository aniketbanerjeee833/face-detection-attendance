
// import { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import api from '../api/axiosInstance';
// import Badge from '../components/ui/Badge';
// import Spinner from '../components/ui/Spinner';

// export default function AttendanceLog() {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

//   const fetchLogs = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get(`/attendance?date=${filterDate}`);
//       setLogs(data.attendance);
//     } catch (err) {
//       console.error('Failed to fetch logs:', err);
//       setLogs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchLogs(); }, [filterDate]);

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
//         <label className="text-sm font-medium text-slate-500">Filter by date</label>
//         <input
//           type="date"
//           value={filterDate}
//           onChange={(e) => setFilterDate(e.target.value)}
//           className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
//         />
//         <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
//           {logs.length} records
//         </span>
//       </div>

//       {loading ? (
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
//             <table className="w-full text-left text-sm">
//               <thead>
//                 <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
//                   <th className="px-6 py-3 font-medium">#</th>
//                   <th className="px-6 py-3 font-medium">Employee</th>
//                   <th className="px-6 py-3 font-medium">Department</th>
//                   <th className="px-6 py-3 font-medium">Date</th>
//                   <th className="px-6 py-3 font-medium">Time</th>
//                   <th className="px-6 py-3 font-medium">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {logs.map((log, i) => (
//                   <tr key={log.id} className="hover:bg-indigo-50/60">
//                     <td className="px-6 py-3 text-slate-400">{i + 1}</td>
//                     <td className="px-6 py-3 font-semibold text-slate-900">{log.name}</td>
//                     <td className="px-6 py-3 text-slate-500">{log.department || '—'}</td>
//                     <td className="px-6 py-3 text-slate-500">{log.date}</td>
//                     <td className="px-6 py-3 text-slate-500">{log.time}</td>
//                     <td className="px-6 py-3"><Badge status={log.status} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </motion.div>
//       )}
//     </div>
//   );
// }

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetAttendanceQuery } from '../redux/api/attendanceApi';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function AttendanceLog() {
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // RTK Query re-fetches automatically whenever filterDate changes
  // and caches each date's result separately
  const { data, isLoading, isFetching } = useGetAttendanceQuery({ date: filterDate });

  const logs = data?.attendance ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
        <label className="text-sm font-medium text-slate-500">Filter by date</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
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
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Department</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-blue-50/40">
                    <td className="px-6 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900">{log.name}</td>
                    <td className="px-6 py-3 text-slate-500">{log.department || '—'}</td>
                    <td className="px-6 py-3 text-slate-500">{log.date}</td>
                    <td className="px-6 py-3 text-slate-500">{log.time}</td>
                    <td className="px-6 py-3"><Badge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}