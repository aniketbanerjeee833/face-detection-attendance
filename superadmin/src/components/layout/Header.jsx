// export default function Header({ onMenuClick, title }) {
//   const today = new Date().toLocaleDateString('en-IN', {
//     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//   });

//   return (
//     <header className="header">
//       <button className="header__menu-btn" onClick={onMenuClick}>☰</button>
//       <div>
//         <h1 className="header__title">{title}</h1>
//         <p className="header__date">{today}</p>
//       </div>
//     </header>
//   );
// }
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
const formatDisplayDate = (isoDate) => {
  // isoDate is yyyy-mm-dd; parse manually to avoid timezone shift issues
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
export default function Header({ onMenuClick, title }) {
  const location = useLocation();
   const dashboardDate = useSelector((s) => s.ui.dashboardDate);

  // const today = new Date().toLocaleDateString("en-IN", {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // });

  

  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";

  const hideDate = location.pathname === "/employees" || location.pathname === "/logs";
const displayDate = isDashboard
    ? formatDisplayDate(dashboardDate)
    : new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-indigo-100/80 bg-white/90 px-5 py-4 backdrop-blur-md lg:px-8">
      <button
        className="grid h-9 w-9 place-items-center rounded-lg text-indigo-500 hover:bg-indigo-50 lg:hidden"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <motion.div
        key={title}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h1 className="text-lg font-bold text-indigo-900 lg:text-xl">
          {title}
        </h1>

        {/* {!hideDate && (
          <p className="text-xs text-indigo-500">{today}</p>
        )} */}
         {!hideDate && (
          <p className="text-xs text-indigo-500">{displayDate}</p>
        )}
      </motion.div>
    </header>
  );
}