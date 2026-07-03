import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/redux/api/authApi';
import { ShieldCheck, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username: form.username, password: form.password }).unwrap();
      toast.success('Login successful');
      window.location.href = '/scan';
    } catch (err) {
      setError(err?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <style>{`
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: "Segoe UI", sans-serif;
        }

        .l-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        /* ── LEFT ── */
        .l-left {
          width: 60%;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .l-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .l-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(27,15,94,.95),
            rgba(67,45,215,.75),
            rgba(123,108,255,.45),
            rgba(183,176,255,.2)
          );
        }
        .l-left-text {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 5;
          padding: 40px;
          text-align: center;
          color: #fff;
        }
        .l-left-text h1 {
          font-size: clamp(28px, 3.5vw, 52px);
          font-weight: 700;
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .l-left-text p {
          font-size: clamp(14px, 1.4vw, 20px);
          line-height: 1.8;
          opacity: .92;
          max-width: 480px;
        }

        /* ── RIGHT ── */
        .l-right {
          width: 40%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
        }
        .l-card {
          width: 100%;
          max-width: 360px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
        }

        /* LOGO */
        .l-logo {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #432dd7;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin: 0 auto 14px;
          flex-shrink: 0;
        }

        /* HEADINGS */
        .l-title {
          text-align: center;
          font-size: clamp(22px, 2.5vw, 30px);
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .l-sub {
          text-align: center;
          color: #64748b;
          font-size: 14px;
          margin-bottom: 20px;
        }

        /* ERROR */
        .l-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 13px;
          margin-bottom: 14px;
          text-align: center;
        }

        /* FIELDS */
        .l-field { margin-bottom: 14px; }
        .l-field label {
          display: block;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          letter-spacing: .05em;
        }
        .l-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .l-icon {
          position: absolute;
          left: 15px;
          color: #64748b;
          pointer-events: none;
          display: flex;
        }
        .l-input-wrap input {
          width: 100%;
          height: 50px;
          border: 1px solid #d6dbe4;
          border-radius: 12px;
          padding: 0 46px;
          font-size: 14px;
          outline: none;
          color: #1e293b;
          background: #fff;
          transition: border-color .2s, box-shadow .2s;
        }
        .l-input-wrap input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.12);
        }
        .l-eye {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          width: auto !important;
          height: auto !important;
          min-height: unset !important;
          border-radius: 4px;
          transition: color .2s;
        }
        .l-eye:hover {
          color: #432dd7;
          transform: none !important;
          box-shadow: none !important;
        }

        /* CHECKBOX */
        .l-check {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #555;
          cursor: pointer;
          margin-bottom: 18px;
          user-select: none;
        }
        .l-check input {
          accent-color: #432dd7;
          width: 14px;
          height: 14px;
          cursor: pointer;
        }

        /* BUTTON */
        .l-btn {
          width: 100%;
          height: 50px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          color: #fff;
          background: #432dd7;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform .2s, box-shadow .2s;
          letter-spacing: .04em;
        }
        .l-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(67,45,215,.4);
        }
        .l-btn:disabled { opacity: .65; cursor: not-allowed; }

        /* SPINNER */
        .l-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lspin .7s linear infinite;
        }
        @keyframes lspin { to { transform: rotate(360deg); } }

        /* FOOTER */
        .l-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          line-height: 1.8;
        }
        .l-footer span {
          color: #2563eb;
          font-weight: 700;
        }

        /* ── TABLET (768–992px) ── */
        @media (max-width: 992px) and (min-width: 601px) {
          .l-left { width: 50%; }
          .l-right { width: 50%; padding: 16px; }
          .l-card { max-width: 320px; }
        }

        /* ── MOBILE (≤600px) ── */
        /* ── MOBILE (≤600px) ── */
@media (max-width: 600px) {
  html, body, #root { overflow: auto; }

  .l-root {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
    overflow: auto;
  }

  .l-left {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    z-index: 0;
  }

  /* ✅ Branding text — compact at top */

.l-left-text {
  justify-content: flex-start;
  padding-top: 24px;
  padding-left: 20px;
  padding-right: 20px;
}

.l-left-text h1 {
  font-size: 24px;
  margin-bottom: 2px;   /* Less gap */
  line-height: 1.15;
}

.l-left-text p {
  font-size: 15px;      /* Bigger text */
  line-height: 1.6;
  max-width: 100%;
  margin-top: 0;
}

  /* ✅ Right panel — full height, center card, no bottom anchoring */
  .l-right {
    position: relative;
    z-index: 2;
    width: 100%;
    min-height: 100vh;
    background: transparent;
    display: flex;
    align-items: center;        /* ← was flex-end, now center */
    justify-content: center;
     padding: 90px 16px 24px;  /* ← top padding pushes card below branding text */
  }

  .l-card {
  margin-top: 30px;               /* ← was 40px, now 0 */
    background: rgba(255,255,255,.96);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 20px;
    padding: 30px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 20px 48px rgba(0,0,0,.28);
  }

  .l-logo  { width: 56px; height: 56px; margin-bottom: 10px; }
  .l-title { font-size: 21px; }
  .l-sub   { margin-bottom: 12px; font-size: 13px; }
  .l-field { margin-bottom: 10px; }
  .l-input-wrap input { height: 46px; font-size: 14px; }
  .l-check { margin-bottom: 14px; font-size: 13px; }
  .l-btn   { height: 46px; font-size: 14px; }
  .l-footer { margn-top: 16px ;font-size: 12px; }
}
      `}</style>

      <div className="l-root">

        {/* LEFT */}
        <div className="l-left">
          <img src="/images/bg.jpg" alt="" className="l-bg" />
          <div className="l-overlay" />
          <div className="l-left-text">
            <h1>Attendance Register</h1>
            <p>
              Manage attendance, monitor daily records, track working hours and
              maintain secure attendance from one centralized dashboard.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="l-right">
          <div className="l-card">

            <div className="l-logo">
              <ShieldCheck size={32} strokeWidth={1.8} />
            </div>

            <h2 className="l-title">Police Station</h2>
            <p className="l-sub">Sign in to continue</p>

            {error && <div className="l-error">{error}</div>}

            <form onSubmit={handleSubmit}>

              <div className="l-field">
                <label>USERNAME</label>
                <div className="l-input-wrap">
                  <span className="l-icon"><User size={15} /></span>
                  <input
                    type="text"
                    placeholder="Enter Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="l-field">
                <label>PASSWORD</label>
                <div className="l-input-wrap">
                  <span className="l-icon"><Lock size={15} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="l-eye"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <label className="l-check">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show Password
              </label>

              <button type="submit" className="l-btn" disabled={isLoginLoading}>
                {isLoginLoading
                  ? <span className="l-spinner" />
                  : <><LogIn size={16} /> LOGIN</>
                }
              </button>

            </form>

            <div className="l-footer">
              Designed &amp; Developed by <span>Techpromind</span><br />
              Support : +91 99036 34360
            </div>

          </div>
        </div>

      </div>
    </>
  );
}