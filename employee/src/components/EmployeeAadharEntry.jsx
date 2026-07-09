// components/EmployeeAadharEntry.jsx
import { useState } from 'react';
import Button from './ui/Button';

export default function EmployeeAadharEntry({ onSubmit, loading, error }) {
  const [aadhar, setAadhar] = useState('');

  const handleDigit = (d) => {
    if (aadhar.length < 12) setAadhar(aadhar + d);
  };
  const handleClear = () => setAadhar('');
  const handleBackspace = () => setAadhar(aadhar.slice(0, -1));

  // Format as XXXX XXXX XXXX for readability while typing
  const formatted = aadhar.replace(/(\d{4})(?=\d)/g, '$1 ');

  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-soft">
      <h3 className="text-sm font-semibold text-slate-900">Enter Aadhar number to check in</h3>

      <div className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-bold tracking-wide text-slate-900">
        {formatted || <span className="text-slate-300">•••• •••• ••••</span>}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <button key={n} onClick={() => handleDigit(String(n))}
            className="h-12 w-12 rounded-xl bg-slate-100 text-lg font-semibold text-slate-700 hover:bg-slate-200">
            {n}
          </button>
        ))}
        <button onClick={handleClear} className="h-12 w-12 rounded-xl bg-slate-100 text-xs font-semibold text-slate-500 hover:bg-slate-200">Clear</button>
        <button onClick={() => handleDigit('0')} className="h-12 w-12 rounded-xl bg-slate-100 text-lg font-semibold text-slate-700 hover:bg-slate-200">0</button>
        <button onClick={handleBackspace} className="h-12 w-12 rounded-xl bg-slate-100 text-lg font-semibold text-slate-500 hover:bg-slate-200">⌫</button>
      </div>

      <Button size="lg" full disabled={aadhar.length !== 12 || loading} onClick={() => onSubmit(aadhar)}>
        {loading ? 'Checking...' : 'Continue'}
      </Button>
    </div>
  );
}