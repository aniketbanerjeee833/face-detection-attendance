// components/EmployeeQuickSelect.jsx
import { useState, useMemo, useRef, useEffect } from 'react';

const maskAadhar = (aadhar) => `•••• •••• ${aadhar.slice(-4)}`;

export default function EmployeeQuickSelect({ employees, onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

//   const results = useMemo(() => {
//     const q = query.trim();
//     if (q.length < 2) return [];
//     return employees
//       .filter((e) =>
//         e.name?.toLowerCase().includes(q.toLowerCase()) ||
//         e.aadhar_number?.endsWith(q) ||
//         e.aadhar_number?.includes(q)
//       )
//       .slice(0, 6);
//   }, [query, employees]);

  // Close dropdown on outside click
  const results = useMemo(() => {
  const q = query.trim().toLowerCase();

  if (q.length < 2) return [];

  return employees
    .filter((e) => {
      const name = e.name?.toLowerCase() || "";

      // Remove spaces and non-digits
      const aadhar = (e.aadhar_number || "").replace(/\D/g, "");
      const search = q.replace(/\D/g, "");

      return (
        name.includes(q) ||
        aadhar.startsWith(search) || // First digits
        aadhar.endsWith(search) ||   // Last digits
        aadhar.includes(search)      // Any digits
      );
    })
    .slice(0, 6);
}, [query, employees]);
  
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (emp) => {
    onSelect(emp);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        // placeholder="Search by employee name or Aadhaar number..."
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
        autoFocus
      />

      {open && results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
          {results.map((emp) => (
            <button
              key={emp.id}
              onClick={() => handleSelect(emp)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-indigo-50"
            >
              {emp.photo_url ? (
                <img src={`http://localhost:5000${emp.photo_url}`} alt={emp.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200" />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400">
                  {emp.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-medium text-slate-900">{emp.name}</div>
                <div className="text-xs text-slate-400">{maskAadhar(emp.aadhar_number)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-400 shadow-lg ring-1 ring-slate-200">
          No matching employee found.
        </div>
      )}
    </div>
  );
}