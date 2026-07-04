// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Provider } from 'react-redux';

// import ProtectedLayout from './components/layout/ProtectedLayout';
// import Login from './pages/Login';

// import Employees from './pages/Employees';
// import ScanAttendance from './pages/ScanAttendance';
// import AttendanceLog from './pages/AttendanceLog';
// import './index.css';
// import Dashboard from './pages/Dashboard';

// export default function App() {
//   return (
    
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route element={<ProtectedLayout />}>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/scan" element={<ScanAttendance />} />
//             <Route path="/employees" element={<Employees />} />
//             <Route path="/logs" element={<AttendanceLog />} />
//           </Route>
//           {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
//         </Routes>
//       </BrowserRouter>
   
//   );
// }


import { Routes, Route, Navigate, Outlet, BrowserRouter } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
// import Layout from "./components/Layout/Layout";

// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import Spinner from "./components/ui/Spinner";


// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { Provider } from 'react-redux';

 import ProtectedLayout from './components/layout/ProtectedLayout';
 import Login from './pages/Login';

import Employees from './pages/Employees';

import AttendanceLog from './pages/AttendanceLog';
import './index.css';
import Dashboard from './pages/Dashboard'
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearAdmin, setAdmin } from "./redux/slices/authSlice";

// const Login = lazy(() => import("./pages/User/Login/Login"));
// const UploadPage = lazy(() => import("./pages/UploadPage"));
// const Records = lazy(() => import("./pages/Records"));
// const Dashboard = lazy(() => import("./pages/Dashboard"));



// import all your components...
// (SliderImage, TagText, etc.)

// 🔐 Protected Route
const ProtectedRoute = ({ user, loading }) => {
  if (loading) return <div className="text-center">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// 🔓 Public Route
const PublicRoute = ({ user, loading }) => {
  if (loading) return <div className="text-center">Loading...</div>;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// 🔁 Fallback
const RoleAwareFallback = ({ user }) => {
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default function RouterWrapper() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
const dispatch = useDispatch();
  // ✅ Call backend to check session
  useEffect(() => {
    fetch("http://localhost:5000/api/auth/superadmin/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user || null);
         if (data.user) {
          dispatch(setAdmin(data.user)); // 👈 sync Redux so Sidebar can read admin.name
        } else {
          dispatch(clearAdmin());
        }
      })
      .catch(() => {
        setUser(null);
        dispatch(clearAdmin());
      })
      .finally(() => setLoading(false));
  }, []);

  return (
     <BrowserRouter>
     <>
  <Suspense fallback={<Spinner size="lg" text="Loading ..." />}>
      <Routes>

        {/* 🔐 Public Route */}
        {/* <Route element={<PublicRoute user={user} loading={loading} />}>
          <Route path="/login" element={<Login />} />
        </Route> */}
         {/* 🔐 Public Route */}
        <Route element={<PublicRoute user={user} loading={loading} />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* 🔒 Protected Routes */}
        {/* <Route element={<ProtectedRoute user={user} loading={loading} />}> */}
                     <Route element={<ProtectedRoute user={user} loading={loading}  />}>
                     <Route element={<ProtectedLayout />}>
           <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/employees" element={<Employees />} />
            <Route path="/logs" element={<AttendanceLog />} />
          </Route>
        </Route>

        {/* 🔁 Fallback */}
        <Route path="*" element={<RoleAwareFallback user={user} />} />

      </Routes>
      </Suspense>
        <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "#1e293b",
          color: "#fff",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
 
      </>
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    
    </BrowserRouter>
  );
}