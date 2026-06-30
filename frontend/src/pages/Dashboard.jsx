// import { useState, useEffect } from 'react';
// import api from '../api/axiosInstance';
// import Spinner from '../components/ui/Spinner';

// export default function Dashboard() {
//   const [summary, setSummary] = useState(null);
//   const [recentLogs, setRecentLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [s, l] = await Promise.all([
//           api.get('/attendance/summary/today'),
//           api.get('/attendance?'),
//         ]);
//         setSummary(s.data);
//         setRecentLogs(l.data.attendance.slice(0, 5));
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) return <Spinner size="lg" text="Loading dashboard..." />;

//   return (
//     <div className="dashboard">
//       {/* Summary Cards */}
//       <div className="stats-grid">
//         {[
//           { label: 'Total Employees', value: summary?.total, icon: '👥', cls: 'stat--blue' },
//           { label: 'Present Today',   value: summary?.present, icon: '✅', cls: 'stat--green' },
//           { label: 'Late Today',      value: summary?.late, icon: '🕐', cls: 'stat--yellow' },
//           { label: 'Absent Today',    value: summary?.absent, icon: '❌', cls: 'stat--red' },
//         ].map((s) => (
//           <div key={s.label} className={`stat-card ${s.cls}`}>
//             <div className="stat-card__icon">{s.icon}</div>
//             <div className="stat-card__value">{s.value ?? 0}</div>
//             <div className="stat-card__label">{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* Recent Activity */}
//       <div className="card">
//         <h2 className="card__title">Recent Attendance</h2>
//         {recentLogs.length === 0 ? (
//           <p className="empty-text">No attendance records yet today.</p>
//         ) : (
//           <table className="table">
//             <thead>
//               <tr>
//                 <th>Employee</th>
//                 <th>Department</th>
//                 <th>Time</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {recentLogs.map((log) => (
//                 <tr key={log.id}>
//                   <td>{log.name}</td>
//                   <td>{log.department || '—'}</td>
//                   <td>{log.time}</td>
//                   <td>
//                     <span className={`badge badge--${log.status}`}>
//                       {log.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';

const STAT_STYLES = {
  blue: { ring: 'ring-indigo-500/15', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  green: { ring: 'ring-success-500/15', bg: 'bg-success-50', text: 'text-success-600' },
  yellow: { ring: 'ring-warning-500/15', bg: 'bg-warning-50', text: 'text-warning-600' },
  red: { ring: 'ring-red-500/15', bg: 'bg-red-50', text: 'text-red-600' },
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, l] = await Promise.all([
          api.get('/attendance/summary/today'),
          api.get('/attendance?'),
        ]);
        setSummary(s.data);
        setRecentLogs(l.data.attendance.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner size="lg" text="Loading dashboard..." />;

  const stats = [
    { label: 'Total Employees', value: summary?.total, icon: '👥', cls: 'blue' },
    { label: 'Present Today', value: summary?.present, icon: '✅', cls: 'green' },
    { label: 'Late Today', value: summary?.late, icon: '🕐', cls: 'yellow' },
    { label: 'Absent Today', value: summary?.absent, icon: '❌', cls: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const style = STAT_STYLES[s.cls];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100"
            >
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl text-lg ${style.bg} ${style.ring} ring-1`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.value ?? 0}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-100"
      >
        <h2 className="mb-4 text-base font-semibold text-slate-900">Recent Attendance</h2>
        {recentLogs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No attendance records yet today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-indigo-50/60">
                    <td className="py-3 font-medium text-slate-900">{log.name}</td>
                    <td className="py-3 text-slate-500">{log.department || '—'}</td>
                    <td className="py-3 text-slate-500">{log.time}</td>
                    <td className="py-3">
                      <Badge status={log.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}