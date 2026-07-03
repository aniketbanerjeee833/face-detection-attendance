import { useSelector } from 'react-redux';
import {
  useGetEmployeesQuery,
  useGetEmployeesSuperAdminQuery,
  useGetAdminsListQuery,
} from '../redux/api/employeeApi';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Spinner from '../components/ui/Spinner';
import Button from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
  from "@/components/ui/select";
export default function Employees() {
  const { admin } = useSelector((s) => s.auth);
  console.log('admin in Employees.jsx:', admin);
  const isSuperAdmin = admin?.role === 'superadmin';

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const perPage = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const adminIdFilter = searchParams.get("admin_id") || "";
  const [searchInput, setSearchInput] = useState(search);
  // ...updateParams unchanged...
  const updateParams = (values) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value == null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };
  useEffect(() => {
    const t = setTimeout(() => {
      updateParams({ search: searchInput.trim(), page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);
  const { data: adminOwnData, isLoading: adminLoading, isFetching: adminFetching } =
    useGetEmployeesQuery({ page, limit: perPage, search }, { skip: isSuperAdmin });

  const { data: superData, isLoading: superLoading, isFetching: superFetching } =
    useGetEmployeesSuperAdminQuery(
      { page, limit: perPage, search, admin_id: adminIdFilter },
      { skip: !isSuperAdmin }
    );

  const { data: adminsListData } = useGetAdminsListQuery(undefined, { skip: !isSuperAdmin });
  const adminsList = adminsListData?.admins ?? [];
  const selectedAdmin = adminsList.find(
    (a) => String(a.id) === adminIdFilter
  );
  const data = isSuperAdmin ? superData : adminOwnData;
  const isLoading = isSuperAdmin ? superLoading : adminLoading;
  const isFetching = isSuperAdmin ? superFetching : adminFetching;

  const employees = data?.employees ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;

  if (isLoading) return <Spinner size="lg" text="Loading employees..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* <h2 className="text-lg font-bold text-slate-900">
          {isSuperAdmin ? 'All Employees (All Admins)' : 'Employees'}
        </h2> */}
        <h2 className="text-lg font-bold text-slate-900">
          {isSuperAdmin
            ? `All Employees (${selectedAdmin ? selectedAdmin.name : "All Admins"})`
            : "Employees"}
        </h2>

        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Select
              value={adminIdFilter || 'all'}
              onValueChange={(v) => updateParams({ admin_id: v === 'all' ? '' : v, page: 1 })}
            >
              <SelectTrigger className="h-9 w-48 text-sm"><SelectValue placeholder="Filter by admin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Admins</SelectItem>
                {adminsList.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search ..."
            className="w-64 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          {/* Add-employee button only for regular admins — superadmin is read-only */}
          {/* {!isSuperAdmin && (
            <Button onClick={openCreateForm}>+ Add Employee</Button>
          )} */}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Sl No</th>
                <th className="px-6 py-3 font-medium">Photo</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Place of Posting</th>
                {isSuperAdmin && <th className="px-6 py-3 font-medium">Admin</th>}
                <th className="px-6 py-3 font-medium">Face</th>
                {!isSuperAdmin && <th className="px-6 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-blue-50/40">
                  <td className="px-6 py-3 text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                  <td className="px-6 py-3">
                    {emp.photo_url ? (
                      <img src={`http://localhost:5000${emp.photo_url}`} alt={emp.name}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400">
                        {emp.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900">{emp.name}</td>
                  <td className="px-6 py-3 text-slate-500">{emp.phone_number}</td>
                  <td className="px-6 py-3 text-slate-500">{emp.place_of_posting}</td>
                  {isSuperAdmin && (
                    <td className="px-6 py-3 text-slate-500">{emp.admin_name}</td>
                  )}
                  <td className="px-6 py-3">
                    {emp.face_descriptor
                      ? <span className="text-xs font-semibold text-green-600">✓ Registered</span>
                      : <span className="text-xs font-semibold text-red-500">✗ Not Registered</span>}
                  </td>
                  {!isSuperAdmin && (
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="primary" onClick={() => openEditForm(emp)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>Delete</Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 7 : 7} className="px-6 py-10 text-center text-sm text-slate-400">
                    {search ? `No employees found matching "${search}".` : 'No employees found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* pagination block unchanged, using `pagination`/`totalPages` as before */}
        {employees.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Rows per page</span>
              <Select value={String(perPage)}
                onValueChange={(v) => {
                  updateParams({ limit: Number(v), page: 1 });
                }}>
                <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <span className="text-sm text-gray-500">
              {isFetching ? 'Loading...' : `Page ${page} of ${totalPages} · ${pagination.total ?? 0} total`}
            </span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() =>
                updateParams({ page: 1 })} disabled={page === 1} className="h-8 px-2">«</Button>
              <Button variant="outline" size="sm" onClick={() =>
                updateParams({ page: Math.max(1, page - 1) })}
                disabled={page === 1} className="h-8 px-3">‹</Button>
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
              <Button variant="outline" size="sm" onClick={() =>
                updateParams({ page: Math.min(totalPages, page + 1) })}
                disabled={page === totalPages} className="h-8 px-3">›</Button>
              <Button variant="outline" size="sm" onClick={() => updateParams({ page: totalPages })} disabled={page === totalPages} className="h-8 px-2">»</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}