// import { useState } from 'react';
// import { Outlet, Navigate, useLocation } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import Sidebar from './Sidebar';
// import Header from './Header';

// const pageTitles = {
//   '/dashboard': 'Dashboard',
//   '/scan': 'Scan Attendance',
//   '/employees': 'Employees',
//   '/logs': 'Attendance Log',
// };

// export default function ProtectedLayout() {
//     const loggedIn = localStorage.getItem("loggedIn") === "true";

// //   const { isAuthenticated } = useSelector((s) => s.auth);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();

// if (!loggedIn) {
//   return <Navigate to="/login" replace />;
// }
//   //if (!isAuthenticated) return <Navigate to="/login" replace />;

//   const title = pageTitles[location.pathname] || 'FaceAttend';

//   return (
//     <div className="app-layout">
//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//       <div className="main-content">
//         <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
//         <main className="page-content">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// import { useState } from 'react';
// import { Outlet, Navigate, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import Sidebar from './Sidebar';
// import Header from './Header';

// const pageTitles = {
//   '/dashboard': 'Dashboard',
//   '/scan': 'Scan Attendance',
//   '/employees': 'Employees',
//   '/logs': 'Attendance Log',
// };

// export default function ProtectedLayout() {
//   const loggedIn = localStorage.getItem('loggedIn') === 'true';
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const location = useLocation();

//   if (!loggedIn) {
//     return <Navigate to="/login" replace />;
//   }

//   const title = pageTitles[location.pathname] || 'FaceAttend';

//   return (
//     <div className="flex h-screen overflow-hidden bg-indigo-50">
//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//       <div className="flex min-w-0 flex-1 flex-col">
//         <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
//         <main className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 lg:px-8">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={location.pathname}
//               initial={{ opacity: 0, y: 8 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -8 }}
//               transition={{ duration: 0.2 }}
//             >
//               <Outlet />
//             </motion.div>
//           </AnimatePresence>
//         </main>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/scan": "Scan Attendance",
  "/employees": "Employees",
  "/logs": "Attendance Log",
};

export default function ProtectedLayout({ user, loading }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // if (loading) {
  //   return <div className="flex h-screen items-center justify-center">Loading...</div>;
  // }

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  const title = pageTitles[location.pathname] || "FaceAttend";

  return (
    <div className="flex h-screen overflow-hidden bg-indigo-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin px-5 py-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}