import { Activity } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: 'admin@queuecure.local', password: 'Admin123!' });
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back');
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
      <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" onSubmit={handleSubmit}>
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-white">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Queue Cure 26</h1>
            <p className="text-sm text-slate-500">Receptionist sign in</p>
          </div>
        </div>
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="label">Email</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="block space-y-1">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">Default seed login: admin@queuecure.local / Admin123!</p>
      </form>
    </main>
  );
}
