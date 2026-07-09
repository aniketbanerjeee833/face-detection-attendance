

import { motion } from 'framer-motion';
import { useGetTodaySummaryQuery, useGetAttendanceQuery } from '../redux/api/attendanceApi';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

const STAT_STYLES = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-500/15' },
  green:  { bg: 'bg-green-50',  text: 'text-green-600',  ring: 'ring-green-500/15' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-500/15' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    ring: 'ring-red-500/15' },
};

export default function Dashboard() {
  // RTK Query — automatic caching, no useEffect/useState needed
  const { data: summaryData, isLoading: summaryLoading } = useGetTodaySummaryQuery();
  //const { data: logsData,    isLoading: logsLoading    } = useGetAttendanceQuery({});
  const navigate = useNavigate();
  //if (summaryLoading || logsLoading) return <Spinner size="lg" text="Loading dashboard..." />;
 if (summaryLoading) return <Spinner size="lg" text="Loading dashboard..." />;
  const summary    = summaryData;
  //const recentLogs = logsData?.attendance?.slice(0, 5) ?? [];

  // const stats = [
  //   { label: 'Total Employees', value: summary?.total,   icon: '👥', cls: 'blue'   },
  //   { label: 'Present Today',   value: summary?.present, icon: '✅', cls: 'green'  },
  //   { label: 'Late Today',      value: summary?.late,    icon: '🕐', cls: 'yellow' },
  //   // { label: 'Absent Today',    value: summary?.absent,  icon: '❌', cls: 'red'    },
  // ];
  const stats = [
  {
    label: "Total Employees",
    value: summary?.total,
    icon: "👥",
    cls: "blue",
    path: "/employees",
  },
  {
    label: "Present Today",
    value: summary?.present,
    icon: "✅",
    cls: "green",
    path: "/logs",
  },
  {
    label: "Checked Out",
    value: summary?.checkedOut,
    icon: "🚪",
    cls: "yellow",
    path: "/logs",
  },
]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* {stats.map((s, i) => {
          const style = STAT_STYLES[s.cls];
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100"
            >
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl text-lg ring-1 ${style.bg} ${style.ring}`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.value ?? 0}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </motion.div>
          );
        })} */}
        {stats.map((s, i) => {
  const style = STAT_STYLES[s.cls];

  return (
    <motion.div
      key={s.label}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      onClick={() => navigate(s.path)}
      className="cursor-pointer rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-xl text-lg ring-1 ${style.bg} ${style.ring}`}
      >
        {s.icon}
      </div>

      <div className="text-2xl font-bold text-slate-900">
        {s.value ?? 0}
      </div>

      <div className="text-xs text-slate-400">
        {s.label}
      </div>
    </motion.div>
  );
})}
      </div>

      {/* Recent logs */}
      {/* <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
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
                  <tr key={log.id} className="hover:bg-blue-50/40">
                    <td className="py-3 font-medium text-slate-900">{log.name}</td>
                    <td className="py-3 text-slate-500">{log.department || '—'}</td>
                    <td className="py-3 text-slate-500">{log.time}</td>
                    <td className="py-3"><Badge status={log.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div> */}
    </div>
  );
}