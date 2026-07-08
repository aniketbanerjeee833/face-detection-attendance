// export default function ResultOverlay({ result, onReset }) {
//   if (!result) return null;

//   const isSuccess = result.type === 'success';
//   return (
//     <div className={`result-overlay ${isSuccess ? 'result-overlay--success' : 'result-overlay--fail'}`}>
//       <div className="result-overlay__icon">{isSuccess ? '✅' : '❌'}</div>
//       <h2 className="result-overlay__title">
//         {isSuccess ? `Welcome, ${result.employee?.name}!` : 'No Match Found'}
//       </h2>
//       {isSuccess && (
//         <>
//           <p className="result-overlay__dept">{result.employee?.department}</p>
//           <p className="result-overlay__confidence">
//             Match confidence: <strong>{result.confidence}%</strong>
//           </p>
//           <p className={`result-overlay__status result-overlay__status--${result.status}`}>
//             {result.status === 'late' ? '🕐 Marked Late' : '✔ Attendance Marked'}
//           </p>
//         </>
//       )}
//       {!isSuccess && (
//         <p className="result-overlay__msg">Face not recognised. Please try again.</p>
//       )}
//       <button className="btn btn--outline" onClick={onReset}>
//         Scan Again
//       </button>
//     </div>
//   );
// }


// export default function ResultOverlay({ result, onReset }) {
//   const navigate = useNavigate();

//   if (!result) return null;

//   const isSuccess = result.type === 'success';
//   // scanType: 'in' | 'out' | 'done'  (set by ScanAttendance based on backend response)
//   const { scanType } = result;

//   // Auto-redirect to logs after any successful outcome (check-in, check-out, or already-done)
//   useEffect(() => {
//     if (!isSuccess) return; // only redirect on success, not on failed match

//     const timer = setTimeout(() => {
//       navigate('/logs');
//     }, 1800); // small delay so the person sees the confirmation before redirect

//     return () => clearTimeout(timer);
//   }, [isSuccess, navigate]);

//   const messages = {
//     in:   { title: `Welcome, ${result.employee?.name}!`, badge: '✔ Check-in Recorded',  badgeClass: 'bg-success-50 text-success-600' },
//     out:  { title: `Goodbye, ${result.employee?.name}!`, badge: '👋 Check-out Recorded', badgeClass: 'bg-success-50 text-success-600' },
//     done: { title: `${result.employee?.name}`,           badge: 'ℹ️ Attendance already completed today', badgeClass: 'bg-yellow-50 text-yellow-700' },
//   };

//   const msg = messages[scanType] || messages.in;

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ type: 'spring', stiffness: 280, damping: 24 }}
//       className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-3xl bg-white p-10 text-center shadow-soft"
//     >
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
//         className={`grid h-16 w-16 place-items-center rounded-full text-3xl ${
//           isSuccess ? 'bg-success-50' : 'bg-red-50'
//         }`}
//       >
//         {isSuccess ? (scanType === 'out' ? '👋' : '✅') : '❌'}
//       </motion.div>

//       <h2 className="mt-2 text-xl font-bold text-slate-900">
//         {isSuccess ? msg.title : 'No Match Found'}
//       </h2>

//       {isSuccess && (
//         <>
//           <span className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${msg.badgeClass}`}>
//             {msg.badge}
//           </span>
//           <p className="mt-3 text-xs text-slate-400">Redirecting to Attendance Log…</p>
//         </>
//       )}

//       {/* {!isSuccess && (
//         <p className="text-sm text-slate-500">Face not recognised. Please try again.</p>
//       )} */}
//       {!isSuccess && (
//   <>
//     <p className="text-sm text-slate-500">
//       {result.scanType === 'not_found'
//         ? result.message
//         : (result.message || 'Face not recognised. Please try again.')}
//     </p>
//     {result.scanType !== 'not_found' && (
//       <Button variant="outline" className="mt-5 cursor-pointer" onClick={onReset}>
//         Scan Again
//       </Button>
//     )}
//     {result.scanType === 'not_found' && (
//       <Button variant="outline" className="mt-5 cursor-pointer" onClick={() => navigate(result.returnTo || '/logs')}>
//         Back to Attendance Log
//       </Button>
//     )}
//   </>
// )}

//       {!isSuccess && (
//         <Button
//           variant="outline"
//           className="mt-5 cursor-pointer"
//           onClick={onReset}
//         >
//           Scan Again
//         </Button>
//       )}

//       {/* Manual fallback in case someone doesn't want to wait for the auto-redirect */}
//       {isSuccess && (
//         <Button
//           variant="outline"
//           className="mt-5 cursor-pointer"
//           onClick={() => navigate('/logs')}
//         >
//           View Attendance Log Now
//         </Button>
//       )}
//     </motion.div>
//   );
// }
// export default function ResultOverlay({ result, onReset }) {
//   if (!result) return null;

//   const isSuccess = result.type === 'success';
//   return (
//     <div className={`result-overlay ${isSuccess ? 'result-overlay--success' : 'result-overlay--fail'}`}>
//       <div className="result-overlay__icon">{isSuccess ? '✅' : '❌'}</div>
//       <h2 className="result-overlay__title">
//         {isSuccess ? `Welcome, ${result.employee?.name}!` : 'No Match Found'}
//       </h2>
//       {isSuccess && (
//         <>
//           <p className="result-overlay__dept">{result.employee?.department}</p>
//           <p className="result-overlay__confidence">
//             Match confidence: <strong>{result.confidence}%</strong>
//           </p>
//           <p className={`result-overlay__status result-overlay__status--${result.status}`}>
//             {result.status === 'late' ? '🕐 Marked Late' : '✔ Attendance Marked'}
//           </p>
//         </>
//       )}
//       {!isSuccess && (
//         <p className="result-overlay__msg">Face not recognised. Please try again.</p>
//       )}
//       <button className="btn btn--outline" onClick={onReset}>
//         Scan Again
//       </button>
//     </div>
//   );
// }

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function ResultOverlay({ result, onReset }) {
  const navigate = useNavigate();

  if (!result) return null;
    if (result.type === 'already-marked') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-3xl bg-white p-10 text-center shadow-soft"
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-green-50 text-3xl">
          ✅
        </div>
        <h2 className="mt-2 text-xl font-bold text-slate-900">{result.employee?.name}</h2>
        <span className="mt-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
          Already  present today
        </span>
        {/* <Button variant="outline" className="mt-5 cursor-pointer" onClick={onReset}>
          Scan Next Person
        </Button> */}
      </motion.div>
    );
  }

  const isSuccess = result.type === 'success';
  // const alreadyMarked = result.alreadyMarked || false;
  // scanType: 'in' | 'out' | 'done'  (set by ScanAttendance based on backend response)
  const { scanType } = result;

  // Auto-redirect to logs after any successful outcome (check-in, check-out, or already-done)
  useEffect(() => {
    if (!isSuccess) return; // only redirect on success, not on failed match

    const timer = setTimeout(() => {
      navigate('/logs');
    }, 1800); // small delay so the person sees the confirmation before redirect

    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  const messages = {
    in:   { title: `Welcome, ${result.employee?.name}!`, badge: '✔ Check-in Recorded',  badgeClass: 'bg-success-50 text-success-600' },
    out:  { title: `Goodbye, ${result.employee?.name}!`, badge: '👋 Check-out Recorded', badgeClass: 'bg-success-50 text-success-600' },
    done: { title: `${result.employee?.name}`,           badge: 'ℹ️ Attendance already completed today', badgeClass: 'bg-yellow-50 text-yellow-700' },
  };

  const msg = messages[scanType] || messages.in;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-3xl bg-white p-10 text-center shadow-soft"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
        className={`grid h-16 w-16 place-items-center rounded-full text-3xl ${
          isSuccess ? 'bg-success-50' : 'bg-red-50'
        }`}
      >
        {isSuccess ? (scanType === 'out' ? '👋' : '✅') : '❌'}
      </motion.div>

      <h2 className="mt-2 text-xl font-bold text-slate-900">
        {isSuccess ? msg.title : 'No Match Found'}
      </h2>

      {isSuccess && (
        <>
          <span className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${msg.badgeClass}`}>
            {msg.badge}
          </span>
          <p className="mt-3 text-xs text-slate-400">Redirecting to Attendance Log…</p>
        </>
      )}

      {!isSuccess && (
        <p className="text-sm text-slate-500">Face not recognised. Please try again.</p>
      )}

      {!isSuccess && (
        <Button
          variant="outline"
          className="mt-5 cursor-pointer"
          onClick={onReset}
        >
          Scan Again
        </Button>
      )}

      {/* Manual fallback in case someone doesn't want to wait for the auto-redirect */}
      {isSuccess && (
        <Button
          variant="outline"
          className="mt-5 cursor-pointer"
          onClick={() => navigate('/logs')}
        >
          View Attendance Log Now
        </Button>
      )}
    </motion.div>
  );
}

// export default function ResultOverlay({ result, onReset }) {
//   const navigate = useNavigate()
//   if (!result) return null;
//   const isSuccess = result.type === 'success';


//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ type: 'spring', stiffness: 280, damping: 24 }}
//       className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-3xl bg-white p-10 text-center shadow-soft"
//     >
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
//         className={`grid h-16 w-16 place-items-center rounded-full text-3xl ${isSuccess ? 'bg-success-50' : 'bg-red-50'
//           }`}
//       >
//         {isSuccess ? '✅' : '❌'}
//       </motion.div>

//       <h2 className="mt-2 text-xl font-bold text-slate-900">
//         {isSuccess ? `Welcome, ${result.employee?.name}!` : 'No Match Found'}
//       </h2>

//       {isSuccess && (
//         <>
//           <p className="text-sm text-slate-500">{result.employee?.department}</p>
//           {/* <p className="text-sm text-slate-500">
//             Match confidence: <strong className="text-slate-900">{result.confidence}%</strong>
//           </p> */}
//           {/* <span
//             className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${
//               result.status === 'late'
//                 ? 'bg-warning-50 text-warning-600'
//                 : 'bg-success-50 text-success-600'
//             }`}
//           >
//             {result.status === 'late' ? '🕐 Marked Late' : '✔ Attendance Marked'}
//           </span> */}
//           <span
//             className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${result.alreadyMarked
//                 ? "bg-yellow-50 text-yellow-700"
//                 : result.status === "late"
//                   ? "bg-warning-50 text-warning-600"
//                   : "bg-success-50 text-success-600"
//               }`}
//           >
//             {result.alreadyMarked
//               ? "ℹ️ Attendance already marked today"
//               : result.status === "late"
//                 ? "🕐 Marked Late"
//                 : "✔ Attendance Marked"}
//           </span>
//         </>
//       )}

//       {!isSuccess && (
//         <p className="text-sm text-slate-500">Face not recognised. Please try again.</p>
//       )}

//       {/* <Button variant="outline" className="mt-5" onClick={onReset}>
//         Scan Again
//       </Button> */}
//   {(!isSuccess || !result.alreadyMarked) && (
//   <Button
//     variant="outline"
//     className="mt-5 cursor-pointer"
//     onClick={onReset}
//   >
//     Scan Again
//   </Button>
// )}
//       <Button variant="outline" className="mt-5 cursor-pointer" onClick={() => navigate('/logs')}>
//         View Attendance Log
//       </Button>
//     </motion.div>
//   );
// }
