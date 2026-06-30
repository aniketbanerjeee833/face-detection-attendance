// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { setCredentials } from '../store/slices/authSlice';
// import api from '../api/axiosInstance';

// export default function Login() {
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { isAuthenticated } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/dashboard', { replace: true });
//     }
//   }, [isAuthenticated, navigate]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');

//     if (
//   form.email === "aniketbanerjee8334845906@gmail.com" &&
//   form.password === "admin@123"
// ) {
//   localStorage.setItem("loggedIn", "true");
//   navigate("/dashboard", { replace: true });
// } else {
//   setError("Invalid email or password");
// }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-card">
//         <div className="login-card__logo">👁</div>
//         <h1 className="login-card__title">FaceAttend</h1>
//         <p className="login-card__subtitle">Admin Portal</p>

//         {error && <div className="alert alert--error">{error}</div>}

//         <form onSubmit={handleSubmit} className="login-form">
//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               placeholder="admin@company.com"
//               required
//             />
//           </div>
//           <div className="form-group">
//             <label>Password</label>
//             <input
//               type="password"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               placeholder="••••••••"
//               required
//             />
//           </div>
//           <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { setCredentials } from '../store/slices/authSlice';
import Button from '../components/ui/Button';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (
      form.email === 'aniketbanerjee8334845906@gmail.com' &&
      form.password === 'admin@123'
    ) {
      localStorage.setItem('loggedIn', 'true');
      navigate('/dashboard', { replace: true });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-indigo-50 px-4">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-100 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/60 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-soft"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-2xl text-white shadow-soft">
            👁
          </span>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-slate-900">FaceAttend</h1>
          <p className="text-sm text-slate-400">Admin Portal</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@company.com"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <Button type="submit" full disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}