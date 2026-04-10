// RegisterPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { Spinner } from '../components/common/index';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((s) => s.auth);

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters'); return; }
    setError('');
    await dispatch(register({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-alt">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-primary font-bold mb-2">Create account</h1>
            <p className="text-muted text-sm">Join ShopLux and start shopping</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',    type: 'text',     Icon: MdPerson, placeholder: 'Your full name' },
              { key: 'email',   type: 'email',    Icon: MdEmail,  placeholder: 'you@example.com' },
            ].map(({ key, type, Icon, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-primary/70 block mb-1.5 capitalize">{key}</label>
                <div className="relative">
                  <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type={type}
                    required
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="input pl-10"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-primary/70 block mb-1.5">Password</label>
              <div className="relative">
                <MdLock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="input pl-10 pr-10"
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">
                  {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-primary/70 block mb-1.5">Confirm Password</label>
              <div className="relative">
                <MdLock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  required value={form.confirm}
                  onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                  className="input pl-10"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-accent w-full py-3.5 mt-2">
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
