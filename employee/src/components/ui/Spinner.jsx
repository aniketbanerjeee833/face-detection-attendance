// export default function Spinner({ size = 'md', text = '' }) {
//   const sizes = { sm: 20, md: 36, lg: 56 };
//   const px = sizes[size] || 36;
//   return (
//     <div className="spinner-wrap">
//       <div className="spinner" style={{ width: px, height: px }} />
//       {text && <p className="spinner-text">{text}</p>}
//     </div>
//   );
// }
import { motion } from 'framer-motion';

export default function Spinner({ size = 'md', text = '' }) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] || 36;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <motion.div
        style={{ width: px, height: px }}
        className="rounded-full border-[3px] border-indigo-100 border-t-indigo-600"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
}