// // import { useState, useEffect } from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { useNavigate } from 'react-router-dom';
// // import { setCredentials } from '../store/slices/authSlice';
// // import api from '../api/axiosInstance';

// // export default function Login() {
// //   const [form, setForm] = useState({ email: '', password: '' });
// //   const [error, setError] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const { isAuthenticated } = useSelector((state) => state.auth);

// //   useEffect(() => {
// //     if (isAuthenticated) {
// //       navigate('/dashboard', { replace: true });
// //     }
// //   }, [isAuthenticated, navigate]);

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     setError('');

// //     if (
// //   form.email === "aniketbanerjee8334845906@gmail.com" &&
// //   form.password === "admin@123"
// // ) {
// //   localStorage.setItem("loggedIn", "true");
// //   navigate("/dashboard", { replace: true });
// // } else {
// //   setError("Invalid email or password");
// // }
// //   };

// //   return (
// //     <div className="login-page">
// //       <div className="login-card">
// //         <div className="login-card__logo">👁</div>
// //         <h1 className="login-card__title">FaceAttend</h1>
// //         <p className="login-card__subtitle">Admin Portal</p>

// //         {error && <div className="alert alert--error">{error}</div>}

// //         <form onSubmit={handleSubmit} className="login-form">
// //           <div className="form-group">
// //             <label>Email</label>
// //             <input
// //               type="email"
// //               value={form.email}
// //               onChange={(e) => setForm({ ...form, email: e.target.value })}
// //               placeholder="admin@company.com"
// //               required
// //             />
// //           </div>
// //           <div className="form-group">
// //             <label>Password</label>
// //             <input
// //               type="password"
// //               value={form.password}
// //               onChange={(e) => setForm({ ...form, password: e.target.value })}
// //               placeholder="••••••••"
// //               required
// //             />
// //           </div>
// //           <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
// //             {loading ? 'Signing in...' : 'Sign In'}
// //           </button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // }
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// // import { setCredentials } from '../store/slices/authSlice';
// import Button from '../components/ui/Button';
// import toast from 'react-hot-toast';
// import { useLoginMutation } from '@/redux/api/authApi';
// import { Eye, EyeOff } from 'lucide-react';
// export default function Login() {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const [login, { isLoading: isLoginLoading }] =
//     useLoginMutation();
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, navigate]);

//   // const handleSubmit = (e) => {
//   //   e.preventDefault();
//   //   setError('');

//   //   if (
//   //     form.email === 'aniketbanerjee8334845906@gmail.com' &&
//   //     form.password === 'admin@123'
//   //   ) {
//   //     localStorage.setItem('loggedIn', 'true');
//   //     navigate('/dashboard', { replace: true });
//   //   } else {
//   //     setError('Invalid email or password');
//   //   }
//   // };
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError("");

//   try {
//     await login({
//       username: form.username,
//       password: form.password,
//     }).unwrap();
//     toast.success("Login succesfull");
//     window.location.href = "/dashboard";
//   } catch (err) {
//     setError(err?.data?.message || "Login failed");
//   }
// };
//   return (
//     <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-indigo-50 px-4">
//       {/* Ambient background */}
//       <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
//       <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/60 blur-3xl" />

//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4, ease: 'easeOut' }}
//         className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-soft"
//       >
//         <div className="mb-6 flex flex-col items-center text-center">
//           <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-soft">
//             👁
//           </span>
//           <h1 className="mt-4 font-display text-2xl font-extrabold text-slate-900">
//             ATTENDANCE REGISTER
//           </h1>
//           <p className="text-sm text-slate-400">Admin Portal</p>
//         </div>

//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: -6 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
//           >
//             {error}
//           </motion.div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="mb-1.5 block text-xs font-semibold text-slate-500">Username</label>
//             <input
//               type="text"
//               value={form.username}
//               onChange={(e) => setForm({ ...form, username: e.target.value })}
//               placeholder="admin"
//               required
//               className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
//             />
//           </div>
//           {/* <div>
//             <label className="mb-1.5 block text-xs font-semibold text-slate-500">Password</label>
//             <input
//               type="password"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               placeholder="••••••••"
//               required
//               className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
//             />
//           </div> */}
//           <div>
//   <label className="mb-1.5 block text-xs font-semibold text-slate-500">Password</label>
//   <div className="relative">
//     <input
//       type={showPassword ? 'text' : 'password'}
//       value={form.password}
//       onChange={(e) => setForm({ ...form, password: e.target.value })}
//       placeholder="••••••••"
//       required
//       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
//     />
//     <button
//       type="button"
//       onClick={() => setShowPassword((v) => !v)}
//       tabIndex={-1}
//       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//     >
//       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//     </button>
//   </div>
// </div>
//           <Button type="submit" full disabled={isLoginLoading}>
//             {isLoginLoading ? 'Signing in...' : 'Sign In'}
//           </Button>
//         </form>
//       </motion.div>
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import { useLoginMutation } from '@/redux/api/authApi';
// import { ShieldCheck, User, Lock } from 'lucide-react';

// export default function Login() {
//   const [form, setForm] = useState({ username: '', password: '' });
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useSelector((state) => state.auth);

//   const [login, { isLoading: isLoginLoading }] = useLoginMutation();

//   // Prevent page scroll while on the login screen — only this page needs it,
//   // so lock on mount and restore whatever the body had before on unmount.
//   useEffect(() => {
//     const prevOverflow = document.body.style.overflow;
//     const prevHeight = document.body.style.height;
//     document.body.style.overflow = 'hidden';
//     document.body.style.height = '100%';
//     document.documentElement.style.overflow = 'hidden';
//     document.documentElement.style.height = '100%';

//     return () => {
//       document.body.style.overflow = prevOverflow;
//       document.body.style.height = prevHeight;
//       document.documentElement.style.overflow = '';
//       document.documentElement.style.height = '';
//     };
//   }, []);

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       await login({
//         username: form.username,
//         password: form.password,
//       }).unwrap();
//       toast.success('Login succesfull');
//       window.location.href = '/scan';
//     } catch (err) {
//       setError(err?.data?.message || 'Login failed');
//     }
//   };

//   return (
//     <>
//       <style>{`
//         .la-container * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//           font-family: "Segoe UI", sans-serif;
//         }

//         .la-body {
//           background: #edf2f7;
//           overflow: hidden;
//           height: 100vh;
//           width: 100%;
//         }

//         .la-container {
//           display: flex;
//           min-height: 100vh;
//         }

//         /*=========================
//         LEFT PANEL
//         =========================*/

//         .la-left {
//           width: 60%;
//           position: relative;
//           overflow: hidden;
//         }

//         .la-left img {
//           width: 100%;
//           height: 100vh;
//           object-fit: cover;
//         }

//         .la-overlay {
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(135deg,
//               rgba(27, 15, 94, 0.95),
//               rgba(67, 45, 215, 0.75),
//               rgba(123, 108, 255, 0.45),
//               rgba(183, 176, 255, 0.20));
//         }

//         .la-left-content {
//           position: absolute;
//           left: 50%;
//           top: 50%;
//           transform: translate(-50%, -50%);
//           color: #fff;
//           text-align: center;
//           width: 80%;
//           z-index: 5;
//         }

//         .la-left-content h1 {
//           font-size: 52px;
//           margin-bottom: 18px;
//           font-weight: 700;
//         }

//         .la-left-content p {
//           font-size: 20px;
//           line-height: 1.8;
//           opacity: .95;
//         }

//         /*=========================
//         RIGHT PANEL
//         =========================*/

//         .la-right {
//           width: 40%;
//           background: #ffffff;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           padding: 40px 60px;
//           max-height: 100vh;
//           overflow-y: auto;
//         }

//         .la-login-box {
//           width: 100%;
//           max-width: 380px;
//         }

//         .la-logo {
//           width: 64px;
//           height: 64px;
//           border-radius: 50%;
//           background: #432dd7;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           margin: auto;
//           color: #fff;
//           font-size: 28px;
//           margin-bottom: 14px;
//         }

//         .la-login-box h2 {
//           text-align: center;
//           font-size: 26px;
//           margin-bottom: 6px;
//           color: #1e293b;
//         }

//         .la-subtitle {
//           text-align: center;
//           color: #64748b;
//           margin-bottom: 22px;
//           font-size: 14px;
//         }

//         /*=========================
//         ERROR ALERT
//         =========================*/

//         .la-alert-error {
//           background: #fef2f2;
//           color: #dc2626;
//           border-radius: 12px;
//           padding: 12px 16px;
//           font-size: 14px;
//           margin-bottom: 16px;
//           text-align: center;
//         }

//         /*=========================
//         INPUT
//         =========================*/

//         .la-input-group {
//           margin-bottom: 14px;
//         }

//         .la-input-group label {
//           display: block;
//           margin-bottom: 6px;
//           font-size: 13px;
//           font-weight: 600;
//           color: #475569;
//         }

//         .la-input {
//           position: relative;
//         }

//         .la-input svg {
//           position: absolute;
//           left: 18px;
//           top: 50%;
//           transform: translateY(-50%);
//           color: #64748b;
//           pointer-events: none;
//         }

//         .la-input input {
//           width: 100%;
//           height: 46px;
//           border: 1px solid #d6dbe4;
//           border-radius: 12px;
//           padding-left: 50px;
//           font-size: 15px;
//           outline: none;
//           transition: .3s;
//         }

//         .la-input input:focus {
//           border-color: #2563eb;
//           box-shadow: 0 0 0 3px rgba(37, 99, 235, .15);
//         }

//         /*=========================
//         OPTION
//         =========================*/

//         .la-option {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 13px;
//           margin-bottom: 16px;
//           color: #555;
//         }

//         .la-option label {
//           cursor: pointer;
//         }

//         /*=========================
//         BUTTON
//         =========================*/

//         .la-container button[type="submit"] {
//           width: 100%;
//           height: 48px;
//           border: none;
//           border-radius: 14px;
//           font-size: 15px;
//           font-weight: 700;
//           cursor: pointer;
//           color: #fff;
//           background: #432dd7;
//           transition: .3s;
//         }

//         .la-container button[type="submit"]:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 12px 25px #432dd7;
//         }

//         .la-container button[type="submit"]:disabled {
//           opacity: .7;
//           cursor: not-allowed;
//           transform: none;
//           box-shadow: none;
//         }

//         /*=========================
//         FOOTER
//         =========================*/

//         .la-footer {
//           margin-top: 20px;
//           text-align: center;
//           font-size: 12px;
//           color: #64748b;
//           line-height: 1.6;
//         }

//         .la-footer span {
//           color: #2563eb;
//           font-weight: 700;
//         }

//         /*=========================
//         SHORT VIEWPORT SAFETY (laptops, ~700px tall or less)
//         =========================*/
//         @media (max-height: 700px) {
//           .la-logo {
//             width: 52px;
//             height: 52px;
//             font-size: 22px;
//             margin-bottom: 10px;
//           }

//           .la-login-box h2 {
//             font-size: 22px;
//           }

//           .la-subtitle {
//             margin-bottom: 16px;
//           }

//           .la-input-group {
//             margin-bottom: 10px;
//           }

//           .la-input input {
//             height: 42px;
//           }

//           .la-container button[type="submit"] {
//             height: 44px;
//           }

//           .la-footer {
//             margin-top: 12px;
//             font-size: 11px;
//           }
//         }

//         /*=========================
//         RESPONSIVE
//         =========================*/
//         @media (max-width:992px) {

//           .la-container {
//             position: relative;
//             display: block;
//           }

//           .la-left {
//             position: fixed;
//             inset: 0;
//             width: 100%;
//             height: 100vh;
//             display: block;
//             z-index: 0;
//           }

//           .la-left img {
//             width: 100%;
//             height: 100%;
//             object-fit: cover;
//           }

//           .la-overlay {
//             position: absolute;
//             inset: 0;
//             background: linear-gradient(135deg,
//                 rgba(27, 15, 94, 0.95),
//                 rgba(67, 45, 215, 0.75),
//                 rgba(123, 108, 255, 0.45),
//                 rgba(183, 176, 255, 0.20));
//           }

//           .la-left-content {
//             display: block;
//             position: absolute;
//             top: 50px;
//             left: 20px;
//             transform: none;
//             width: 90%;
//             text-align: center;
//             z-index: 5;
//           }

//           .la-left-content h1 {
//             font-size: 24px;
//             margin-bottom: 10px;
//           }

//           .la-left-content p {
//             font-size: 14px;
//             line-height: 1.5;
//           }

//           .la-right {
//             position: relative;
//             z-index: 2;
//             width: 100%;
//             min-height: 100vh;
//             max-height: none;
//             background: transparent;
//             padding: 30px 20px;
//             display: flex;
//             margin-top: 50px;
//             justify-content: center;
//             align-items: center;
//           }

//           .la-login-box {
//             background: rgba(255, 255, 255, .95);
//             backdrop-filter: blur(10px);
//             border-radius: 20px;
//             padding: 30px;
//             width: 100%;
//             max-width: 380px;
//             box-shadow: 0 20px 40px rgba(0, 0, 0, .25);
//           }

//           .la-body {
//             overflow: auto;
//           }
//         }
//       `}</style>

//       <div className="la-body">
//         <div className="la-container">

//           <div className="la-left">
//             <img src="/images/bg.jpg" alt="Attendance background" />
//             <div className="la-overlay"></div>
//             <div className="la-left-content">
//               <h1>Attendance Register</h1>
//               <p>
//                 Manage attendance, monitor daily records,
//                 track working hours and maintain secure attendance
//                 from one centralized dashboard.
//               </p>
//             </div>
//           </div>

//           <div className="la-right">
//             <div className="la-login-box">

//               <div className="la-logo">
//                 <ShieldCheck size={34} />
//               </div>

//               <h2>Police Station</h2>
//               <p className="la-subtitle">Sign in to continue</p>

//               {error && <div className="la-alert-error">{error}</div>}

//               <form onSubmit={handleSubmit}>

//                 <div className="la-input-group">
//                   <label>USERNAME</label>
//                   <div className="la-input">
//                     <User size={18} />
//                     <input
//                       type="text"
//                       placeholder="Enter Username"
//                       value={form.username}
//                       onChange={(e) => setForm({ ...form, username: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="la-input-group">
//                   <label>PASSWORD</label>
//                   <div className="la-input">
//                     <Lock size={18} />
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       placeholder="Enter Password"
//                       value={form.password}
//                       onChange={(e) => setForm({ ...form, password: e.target.value })}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="la-option">
//                   <label>
//                     <input
//                       type="checkbox"
//                       checked={showPassword}
//                       onChange={(e) => setShowPassword(e.target.checked)}
//                     />
//                     {' '}Show Password
//                   </label>
//                 </div>

//                 <button type="submit" disabled={isLoginLoading}>
//                   {isLoginLoading ? 'SIGNING IN...' : 'LOGIN'}
//                 </button>

//               </form>

//               <div className="la-footer">
//                 Designed &amp; Developed by
//                 <br />
//                 <span>Techromind</span>
//                 <br />
//                 Support : +91 99036 34360
//               </div>

//             </div>
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/redux/api/authApi';
import { ShieldCheck, User, Lock } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  // Prevent page scroll while on the login screen — only this page needs it,
  // so lock on mount and restore whatever the body had before on unmount.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHeight = document.body.style.height;
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.height = prevHeight;
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login({
        username: form.username,
        password: form.password,
      }).unwrap();
      toast.success('Login succesfull');
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <style>{`
        .la-container * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Segoe UI", sans-serif;
        }

        .la-body {
          background: #edf2f7;
          overflow: hidden;
          height: 100vh;
          height: 100dvh;
          width: 100%;
        }

        .la-container {
          display: flex;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }

        /*=========================
        LEFT PANEL
        =========================*/

        .la-left {
          width: 60%;
          position: relative;
          overflow: hidden;
        }

        .la-left img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .la-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,
              rgba(27, 15, 94, 0.95),
              rgba(67, 45, 215, 0.75),
              rgba(123, 108, 255, 0.45),
              rgba(183, 176, 255, 0.20));
        }

        .la-left-content {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: #fff;
          text-align: center;
          width: 80%;
          z-index: 5;
        }

        .la-left-content h1 {
          font-size: 52px;
          margin-bottom: 18px;
          font-weight: 700;
        }

        .la-left-content p {
          font-size: 20px;
          line-height: 1.8;
          opacity: .95;
        }

        /*=========================
        RIGHT PANEL
        =========================*/

        .la-right {
          width: 40%;
          background: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px 60px;
          height: 100%;
          overflow: hidden;
        }

        .la-login-box {
          width: 100%;
          max-width: 380px;
        }

        .la-logo {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #432dd7;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: auto;
          color: #fff;
          font-size: 24px;
          margin-bottom: 10px;
        }

        .la-login-box h2 {
          text-align: center;
          font-size: 24px;
          margin-bottom: 4px;
          color: #1e293b;
        }

        .la-subtitle {
          text-align: center;
          color: #64748b;
          margin-bottom: 18px;
          font-size: 13px;
        }

        /*=========================
        ERROR ALERT
        =========================*/

        .la-alert-error {
          background: #fef2f2;
          color: #dc2626;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 14px;
          text-align: center;
        }

        /*=========================
        INPUT
        =========================*/

        .la-input-group {
          margin-bottom: 12px;
        }

        .la-input-group label {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .la-input {
          position: relative;
        }

        .la-input svg {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        .la-input input {
          width: 100%;
          height: 42px;
          border: 1px solid #d6dbe4;
          border-radius: 12px;
          padding-left: 46px;
          font-size: 14px;
          outline: none;
          transition: .3s;
        }

        .la-input input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, .15);
        }

        /*=========================
        OPTION
        =========================*/

        .la-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          margin-bottom: 14px;
          color: #555;
        }

        .la-option label {
          cursor: pointer;
        }

        /*=========================
        BUTTON
        =========================*/

        .la-container button[type="submit"] {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          color: #fff;
          background: #432dd7;
          transition: .3s;
        }

        .la-container button[type="submit"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px #432dd7;
        }

        .la-container button[type="submit"]:disabled {
          opacity: .7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /*=========================
        FOOTER (fixed, bottom-right, mandatory)
        =========================*/

        .la-credit {
          position: fixed;
          bottom: 12px;
          right: 16px;
          z-index: 20;
          text-align: right;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(6px);
          padding: 6px 12px;
          border-radius: 10px;
        }

        .la-credit span {
          color: #2563eb;
          font-weight: 700;
        }

        /*=========================
        RESPONSIVE (mobile) — everything must still fit with NO scroll
        =========================*/
        @media (max-width:992px) {

          .la-container {
            position: relative;
            display: block;
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
          }

          .la-left {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
            z-index: 0;
          }

          .la-left img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .la-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg,
                rgba(27, 15, 94, 0.95),
                rgba(67, 45, 215, 0.75),
                rgba(123, 108, 255, 0.45),
                rgba(183, 176, 255, 0.20));
          }

          .la-left-content {
            display: block;
            position: absolute;
            top: 24px;
            left: 20px;
            transform: none;
            width: 90%;
            text-align: center;
            z-index: 5;
          }

          .la-left-content h1 {
            font-size: 20px;
            margin-bottom: 6px;
          }

          .la-left-content p {
            font-size: 12px;
            line-height: 1.4;
          }

          .la-right {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            background: transparent;
            padding: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }

          .la-login-box {
            background: rgba(255, 255, 255, .95);
            backdrop-filter: blur(10px);
            border-radius: 18px;
            padding: 18px 20px;
            width: 100%;
            max-width: 340px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, .25);
            max-height: calc(100dvh - 100px);
            overflow: hidden;
          }

          .la-logo {
            width: 44px;
            height: 44px;
            font-size: 18px;
            margin-bottom: 6px;
          }

          .la-login-box h2 {
            font-size: 19px;
          }

          .la-subtitle {
            margin-bottom: 12px;
            font-size: 12px;
          }

          .la-input-group {
            margin-bottom: 9px;
          }

          .la-input input {
            height: 38px;
            font-size: 13px;
          }

          .la-option {
            margin-bottom: 10px;
          }

          .la-container button[type="submit"] {
            height: 40px;
          }

          .la-credit {
            bottom: 8px;
            right: 8px;
            font-size: 10px;
            padding: 5px 9px;
          }
        }

        /*=========================
        SHORT VIEWPORT SAFETY (laptops / landscape phones, ~700px tall or less)
        =========================*/
        @media (max-height: 700px) {
          .la-logo {
            width: 44px;
            height: 44px;
            font-size: 18px;
            margin-bottom: 6px;
          }

          .la-login-box h2 {
            font-size: 19px;
          }

          .la-subtitle {
            margin-bottom: 12px;
          }

          .la-input-group {
            margin-bottom: 8px;
          }

          .la-input input {
            height: 38px;
          }

          .la-container button[type="submit"] {
            height: 40px;
          }
        }
      `}</style>

      <div className="la-body">
        <div className="la-container">

          <div className="la-left">
            <img src="/images/bg.jpg" alt="Attendance background" />
            <div className="la-overlay"></div>
            <div className="la-left-content">
              <h1>Attendance Register</h1>
              <p>
                Manage attendance, monitor daily records,
                track working hours and maintain secure attendance
                from one centralized dashboard.
              </p>
            </div>
          </div>

          <div className="la-right">
            <div className="la-login-box">

              <div className="la-logo">
                <ShieldCheck size={34} />
              </div>

              <h2>Police Station</h2>
              <p className="la-subtitle">Sign in to continue</p>

              {error && <div className="la-alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>

                <div className="la-input-group">
                  <label>USERNAME</label>
                  <div className="la-input">
                    <User size={18} />
                    <input
                      type="text"
                      placeholder="Enter Username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="la-input-group">
                  <label>PASSWORD</label>
                  <div className="la-input">
                    <Lock size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="la-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    {' '}Show Password
                  </label>
                </div>

                <button type="submit" disabled={isLoginLoading}>
                  {isLoginLoading ? 'SIGNING IN...' : 'LOGIN'}
                </button>

              </form>

            </div>
          </div>

        </div>

        <div className="la-credit">
          Designed &amp; Developed by <span>Techromind</span>
          <br />
          Support : +91 99036 34360
        </div>
      </div>
    </>
  );
}