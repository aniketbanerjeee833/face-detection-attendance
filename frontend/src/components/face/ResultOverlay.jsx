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

import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
export default function ResultOverlay({ result, onReset }) {
  const navigate = useNavigate()
  if (!result) return null;
  const isSuccess = result.type === 'success';


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
        className={`grid h-16 w-16 place-items-center rounded-full text-3xl ${isSuccess ? 'bg-success-50' : 'bg-red-50'
          }`}
      >
        {isSuccess ? '✅' : '❌'}
      </motion.div>

      <h2 className="mt-2 text-xl font-bold text-slate-900">
        {isSuccess ? `Welcome, ${result.employee?.name}!` : 'No Match Found'}
      </h2>

      {isSuccess && (
        <>
          <p className="text-sm text-slate-500">{result.employee?.department}</p>
          {/* <p className="text-sm text-slate-500">
            Match confidence: <strong className="text-slate-900">{result.confidence}%</strong>
          </p> */}
          {/* <span
            className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${
              result.status === 'late'
                ? 'bg-warning-50 text-warning-600'
                : 'bg-success-50 text-success-600'
            }`}
          >
            {result.status === 'late' ? '🕐 Marked Late' : '✔ Attendance Marked'}
          </span> */}
          <span
            className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${result.alreadyMarked
                ? "bg-yellow-50 text-yellow-700"
                : result.status === "late"
                  ? "bg-warning-50 text-warning-600"
                  : "bg-success-50 text-success-600"
              }`}
          >
            {result.alreadyMarked
              ? "ℹ️ Attendance already marked today"
              : result.status === "late"
                ? "🕐 Marked Late"
                : "✔ Attendance Marked"}
          </span>
        </>
      )}

      {!isSuccess && (
        <p className="text-sm text-slate-500">Face not recognised. Please try again.</p>
      )}

      {/* <Button variant="outline" className="mt-5" onClick={onReset}>
        Scan Again
      </Button> */}
      {isSuccess && !result.alreadyMarked && (
  <Button variant="outline" className="mt-5 cursor-pointer" onClick={onReset}>
    Scan Again
  </Button>
)}
      <Button variant="outline" className="mt-5 cursor-pointer" onClick={() => navigate('/logs')}>
        View Attendance Log
      </Button>
    </motion.div>
  );
}