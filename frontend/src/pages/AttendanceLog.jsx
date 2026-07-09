import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGetAttendanceQuery } from '../redux/api/attendanceApi';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Button from '@/components/ui/Button';
import { useSearchParams } from 'react-router-dom';

export default function AttendanceLog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || 1);
  const perPage = Number(searchParams.get('limit') || 10);
  const search = searchParams.get('search') || '';
  const filterDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const updateParams = (values) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value === '' || value == null) params.delete(key);
      else params.set(key, value);
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let changed = false;
    if (!params.has('page')) { params.set('page', '1'); changed = true; }
    if (!params.has('limit')) { params.set('limit', '10'); changed = true; }
    if (!params.has('date')) { params.set('date', new Date().toISOString().split('T')[0]); changed = true; }
    if (changed) setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim() !== search) updateParams({ search: searchInput.trim(), page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleDateChange = (e) => updateParams({ date: e.target.value, page: 1 });

  const { data, isLoading, isFetching } = useGetAttendanceQuery({
    date: filterDate, page, limit: perPage, search,
  });

  const logs = data?.attendance ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-slate-100">
        <label className="text-sm font-medium text-slate-500">Filter by date</label>
        <input
          type="date"
          value={filterDate}
          onChange={handleDateChange}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search ..."
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 font-medium">Sl No</th>
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Police Station</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  {/* <th className="px-6 py-3 font-medium">Marked By</th> */}
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-blue-50/40">
                    <td className="px-6 py-3 text-slate-400">{(page - 1) * perPage + i + 1}</td>
                    <td className="px-6 py-3 font-semibold text-slate-900">{log.name}</td>
                    <td className="px-6 py-3 text-slate-500">{log.police_station_name}</td>
                    <td className="px-6 py-3 text-slate-500">{log.marked_at}</td>
                    {/* <td className="px-6 py-3 text-slate-500">{log.marked_by_admin_name}</td> */}
                    <td className="px-6 py-3"><Badge status="Present" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Rows per page</span>
                <Select value={String(perPage)} onValueChange={(v) => updateParams({ limit: v, page: 1 })}>
                  <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
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
                  .map((p, i) => p === '...' ? (
                    <span key={`d${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <Button key={p} variant={page === p ? 'default' : 'outline'} size="sm"
                      onClick={() => updateParams({ page: p })}
                      className={`h-8 w-8 p-0 text-sm ${page === p ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}>
                      {p}
                    </Button>
                  ))}
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