import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useGetTodaySummaryQuery } from '../redux/api/attendanceApi';

import Spinner from '../components/ui/Spinner';

import { setDashboardDate } from '@/redux/slices/uiSlice';
import { useGetPoliceStationsQuery } from '@/redux/api/policeStationApi';

const STAT_STYLES = {
  blue: { bg: 'bg-blue-50', ring: 'ring-blue-100' },
  green: { bg: 'bg-green-50', ring: 'ring-green-100' },
  yellow: { bg: 'bg-amber-50', ring: 'ring-amber-100' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin } = useSelector((s) => s.auth);
  const isSuperAdmin = admin?.role === 'superadmin';

  // const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const date = useSelector((s) => s.ui.dashboardDate); // 👈 read from slice now
  //const [adminIdFilter, setAdminIdFilter] = useState('');

  // const { data: summaryData, isLoading: summaryLoading } = useGetTodaySummaryQuery({
  //   date,
  //   admin_id: adminIdFilter,
  // });
  const [policeStationId, setPoliceStationId] = useState("");
  const { data: summaryData, isLoading: summaryLoading } =
    useGetTodaySummaryQuery({
      date,
      police_station_id: policeStationId,
    });


  const { data: stationsData } = useGetPoliceStationsQuery(); // 👈 new
  const policeStations = stationsData?.stations ?? [];
  // const { data: adminsListData } = useGetAdminsListQuery(undefined, { skip: !isSuperAdmin });
  // const adminsList = adminsListData?.admins ?? [];

  if (summaryLoading) return <Spinner size="lg" text="Loading dashboard..." />;

  const summary = summaryData;
  const breakdown = summary?.breakdown ?? [];

  // const stats = [
  //   { label: "Total Employees", value: summary?.total, icon: "👥", cls: "blue", path: "/employees" },
  //   { label: "Duty In", value: summary?.present, icon: "✅", cls: "green", path: "/logs" },
  //   { label: "Duty Over", value: summary?.checkedOut, icon: "🚪", cls: "yellow", path: "/logs" },
  // ];
const stats = [
  {
    label: "Total Employees",
    value: summary?.total ?? 0,
    icon: "👥",
    cls: "blue",
    path: "/employees",
  },
  {
    label: "Present",
    value: summary?.present ?? 0,
    icon: "✅",
    cls: "green",
    path: "/logs",
  },
  {
    label: "Absent",
    value: summary?.absent ?? 0,
    icon: "❌",
    cls: "yellow",
    path: "/logs",
  },
];
 return (
  <div className="space-y-6">
    {/* Filters */}
    {isSuperAdmin && (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
        <label className="text-sm font-medium text-slate-500">
          Date
        </label>

        <input
          type="date"
          value={date}
          onChange={(e) => dispatch(setDashboardDate(e.target.value))}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
      </div>
    )}

    {summary?.noData ? (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-10 shadow-soft ring-1 ring-slate-100 text-center"
      >
        <div className="text-6xl mb-4">📅</div>

        <h2 className="text-2xl font-semibold text-slate-800">
          No Attendance Found
        </h2>

        <p className="mt-3 text-slate-500">
          There are no attendance records available for{" "}
          <span className="font-semibold">{date}</span>.
        </p>
      </motion.div>
    ) : (
      <>
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

        {/* Police Station Breakdown */}
        {isSuperAdmin &&
          !policeStationId &&
          breakdown.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-100"
            >
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                {date}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="pb-3 font-medium">
                        Police Station
                      </th>
                      <th className="pb-3 font-medium">
                        Total Employees
                      </th>
                      <th className="pb-3 font-medium">
                        Present
                      </th>
                      <th className="pb-3 font-medium">
                        Absent
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {breakdown.map((row) => (
                      <tr
                        key={row.police_station_id}
                        className="cursor-pointer hover:bg-blue-50/40"
                        onClick={() =>
                          navigate(
                            `/employees?police_station_id=${row.police_station_id}`
                          )
                        }
                      >
                        <td className="py-3 font-medium text-slate-900">
                          {row.police_station_name}
                        </td>

                        <td className="py-3 text-slate-500">
                          {row.total}
                        </td>

                        <td className="py-3 text-green-600 font-medium">
                          {row.present}
                        </td>

                        <td className="py-3 text-red-600 font-medium">
                          {row.absent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
      </>
    )}
  </div>
);
}

// {isSuperAdmin && !policeStationId && breakdown.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-100"
//         >
//           <h2 className="mb-4 text-base font-semibold text-slate-900">{date}</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead>
//                 <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
//                   <th className="pb-3 font-medium">Police Station</th>
//                   <th className="pb-3 font-medium">Total Employees</th>
//                   <th className="pb-3 font-medium">Present</th>
//                   <th className="pb-3 font-medium">Absent</th>
//                   {/* <th className="pb-3 font-medium">Duty In</th>
//                   <th className="pb-3 font-medium">Duty Over</th> */}
//                   {/* <th className="pb-3 font-medium">Absent</th> */}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-50">
//                 {breakdown.map((row) => (
//                   <tr
//                     key={row.police_station_id}
//                     className="cursor-pointer hover:bg-blue-50/40"
//                     // onClick={() => navigate(`/employees?admin_id=${row.admin_id}`)}
//                     onClick={() => navigate(`/employees?police_station_id=${row.police_station_id}`)}
//                   >
//                     <td className="py-3 font-medium text-slate-900">{row.police_station_name}</td>
//                     <td className="py-3 text-slate-500">{row.total}</td>
//                     <td className="py-3 text-slate-500">{row.present}</td>
//                     <td className="py-3 text-slate-500">{row.absent}</td>
//                     {/* <td className="py-3 text-slate-500">{row.present}</td>
//                     <td className="py-3 text-slate-500">{row.checkedOut}</td> */}
//                     {/* <td className="py-3 text-slate-500">{row.absent}</td> */}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </motion.div>
//       )}