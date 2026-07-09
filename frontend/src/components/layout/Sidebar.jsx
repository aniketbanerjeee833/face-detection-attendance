// import { NavLink, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout } from '../../store/slices/authSlice';

// const navItems = [
//   { to: '/dashboard', icon: '📊', label: 'Dashboard' },
//   { to: '/scan',      icon: '📷', label: 'Scan Attendance' },
//   { to: '/employees', icon: '👥', label: 'Employees' },
//   { to: '/logs',      icon: '📋', label: 'Attendance Log' },
// ];

// export default function Sidebar({ isOpen, onClose }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { admin } = useSelector((s) => s.auth);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/login');
//   };

//   return (
//     <>
//       {/* Overlay for mobile */}
//       {isOpen && (
//         <div
//           className="sidebar-overlay"
//           onClick={onClose}
//         />
//       )}

//       <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
//         {/* Logo */}
//         <div className="sidebar__logo">
//           <span className="sidebar__logo-icon">👁</span>
//           <span className="sidebar__logo-text">FaceAttend</span>
//         </div>

//         {/* Admin info */}
//         <div className="sidebar__admin">
//           <div className="sidebar__avatar">{admin?.name?.[0]?.toUpperCase()}</div>
//           <div>
//             <div className="sidebar__admin-name">{admin?.name}</div>
//             <div className="sidebar__admin-role">Administrator</div>
//           </div>
//         </div>

//         {/* Nav */}
//         <nav className="sidebar__nav">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               className={({ isActive }) =>
//                 `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
//               }
//               onClick={onClose}
//             >
//               <span className="sidebar__link-icon">{item.icon}</span>
//               <span>{item.label}</span>
//             </NavLink>
//           ))}
//         </nav>

//         {/* Logout */}
//         <button className="sidebar__logout" onClick={handleLogout}>
//           🚪 Logout
//         </button>
//       </aside>
//     </>
//   );
// }
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useLogoutMutation } from '@/redux/api/authApi';
import {
  LayoutDashboard,
  Camera,
  Users,
  ClipboardList,
  LogOut,
  Phone,
  Clock,
} from "lucide-react";
import { clearAdmin } from '@/redux/slices/authSlice';

// const navItems = [
//   { to: '/dashboard', icon: '📊', label: 'Dashboard' },
//   { to: '/scan', icon: '📷', label: 'Scan Attendance' },
//   { to: '/employees', icon: '👥', label: 'Employees' },
//   { to: '/logs', icon: '📋', label: 'Attendance Log' },
// ];
const navItems = [
  // {
  //   to: "/dashboard",
  //   icon: LayoutDashboard,
  //   label: "Dashboard",
  // },
  
  {
    to: "/scan",
    icon: Camera,
    label: "Scan Attendance",
  },
  // {
  //   to: "/employees",
  //   icon: Users,
  //   label: "Employees",
  // },
  
  {
    to: "/logs",
    icon: ClipboardList,
    label: "Attendance Log",
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((s) => s.auth);
  const [logoutUser, { isLoading: isLogoutLoading }] = useLogoutMutation();
  console.log("Sidebar admin:", admin);
  // const handleLogout = () => {
  //   //dispatch(logout());
  //   navigate('/login');
  // };
  const handleLogout = async () => {


    try {
      const response = await logoutUser().unwrap();
      console.log("Logout Response:", response);
      if (response?.success) {
        console.log(response?.message);
        // ✅ Clear Redux user slice completely
        // dispatch(setLoggedIn(false));
        // dispatch(setUserId(null));
        //  dispatch(setUser(null));
        //  dispatch(setUserRole(null));
        toast.success(response?.message || 'Logout successful');
               dispatch(clearAdmin()); // 👈 explicit cleanup
        window.location.href = "/login"; // hard redirect clears memory
      }
    } catch (err) {
      console.error('Logout error:', err);
      toast.error(err?.data?.message || 'Logout failed');
    }
    // console.error('Server responded with:', error.response.data);
    //     }
  }

  const content = (
    <div className="flex h-full flex-col overflow-hidden">
      {/* // <div className="flex h-full flex-col"> */}
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        {/* <span className="grid h-4 w-9 place-items-center rounded-xl
         bg-indigo-600 text-white shadow-soft">
          👁
        </span> */}
        <span className="font-display text-md font-extrabold  whitespace-nowrap tracking-tight text-slate-900">
          ATTENDANCE REGISTER
        </span>
      </div>

      {/* Admin info */}
      {/* <div className="mx-4 mb-6 flex items-center gap-3 rounded-2xl bg-indigo-50 px-3.5 py-3">
        <div className="grid h-10 w-10 place-items-center rounded-full 
        bg-indigo-100 font-semibold text-indigo-700">
          {admin?.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {admin?.name?.toUpperCase() || 'Admin'}</div>
         
        </div>
           <div className="truncate text-xs text-black-500">
        👮 {admin?.${police_station_name} || "Police Station"}
      </div>
      </div> */}
      <div className="mx-4 mb-6 rounded-2xl bg-indigo-50 px-3.5 py-3">
  <div className="flex items-center gap-3">
    <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
      {admin?.name?.[0]?.toUpperCase() || "A"}
    </div>

    <div className="min-w-0 flex-1">
      {/* Row 1 */}
      <div className="truncate text-sm font-semibold text-slate-900">
        {admin?.name?.toUpperCase() || "ADMIN"}
      </div>

      {/* Row 2 */}
      <div className="truncate text-xs text-slate-700 mt-1">
        <span className="font-medium text-slate-700">
          {admin?.police_station_name || "N/A"}
        </span>
      </div>
    </div>
  </div>
</div>

      {/* Nav */}
      <nav
        className="flex-1 space-y-1 px-3
    overflow-y-auto
    scrollbar-thin
    scrollbar-thumb-slate-300
    scrollbar-track-transparent"
      >
        {/* <nav className="flex-1 space-y-1 px-3"> */}
        {navItems.map((item) => (
          // <NavLink
          //   key={item.to}
          //   to={item.to}
          //   onClick={onClose}
          //   className={({ isActive }) =>
          //     `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
          //       isActive ? 'text-indigo-700' : 'text-slate-500 hover:bg-indigo-50 hover:text-slate-700'
          //     }`
          //   }
          // >
          //   {({ isActive }) => (
          //     <>
          //       {isActive && (
          //         <motion.span
          //           layoutId="sidebar-active"
          //           className="absolute inset-0 rounded-xl bg-indigo-50"
          //           transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          //         />
          //       )}
          //       <span className="relative z-10">{item.icon}</span>
          //       <span className="relative z-10">{item.label}</span>
          //     </>
          //   )}
          // </NavLink>
          //const Icon = item.icon;
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive
                ? "text-indigo-700"
                : "text-slate-500 hover:bg-indigo-50 hover:text-slate-700"
              }`
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;

              return (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-indigo-50"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}

                  <Icon
                    size={18}
                    className={`relative z-10 ${isActive ? "text-indigo-700" : "text-slate-500"
                      }`}
                  />

                  <span className="relative z-10">
                    {item.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

           <div className="mx-3 mb-3 rounded-xl bg-indigo-50 px-4 py-3 ring-1 ring-indigo-100">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-400">
          Technical Support
        </p>

        <div className="space-y-2">
          <a
            href="tel:9903634360"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-indigo-600"
          >
            <Phone size={14} className="shrink-0 text-indigo-400" />
            <span>9903634360</span>
          </a>

          <a
            href="tel:9831166989"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-indigo-600"
          >
            <Phone size={14} className="shrink-0 text-indigo-400" />
            <span>9831166989</span>
          </a>

          <div className="mt-2 border-t border-indigo-100 pt-2">
            <p className="mb-1 text-xs text-slate-600">
              Emergency
            </p>

            <a
              href="tel:9831166989"
              className="flex items-center gap-2 text-sm font-semibold text-red-600 transition-colors hover:text-red-700"
            >
              <Phone size={14} className="shrink-0 text-red-400" />
              <span>9831166989</span>
            </a>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-3 pb-5">
        {/* <button
          onClick={handleLogout}
           disabled={isLogoutLoading}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
         {isLogoutLoading ? (
            <span className="relative z-10">Logging out...</span>
          ) : (
            <>
              
              <span className="relative z-10">Logout</span>
              </>)}
        </button> */}
        <button
          onClick={handleLogout}
          disabled={isLogoutLoading}
          className="flex w-full 
          items-center gap-3 rounded-xl px-3.5 py-2.5 
          text-sm font-medium text-slate-500 cursor-pointer
          transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
        >
          {isLogoutLoading ? (
            "Logging out..."
          ) : (
            <>
              <LogOut size={18} />
              <span>Logout</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-indigo-100/80 bg-white lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-indigo-950/10 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}