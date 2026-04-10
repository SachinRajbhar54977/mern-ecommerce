// LoginPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { Spinner } from '../components/common/index';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export function LoginPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, loading } = useSelector((s) => s.auth);
  const from = location.state?.from?.pathname || '/';

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login(form));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-alt">
      <div className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-primary font-bold mb-2">Welcome back</h1>
            <p className="text-muted text-sm">Sign in to your ShopLux account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-primary/70 block mb-1.5">Email address</label>
              <div className="relative">
                <MdEmail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-primary/70">Password</label>
                <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <MdLock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                >
                  {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-accent w-full py-3.5 mt-2">
              {loading ? <Spinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
