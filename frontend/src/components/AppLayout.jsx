import { Activity, LogOut, Monitor, Moon, Stethoscope, Sun, Users } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const nav = [
  { to: '/dashboard', label: 'Reception', icon: Users },
  { to: '/doctor', label: 'Doctor', icon: Stethoscope },
  { to: '/waiting-room', label: 'Display', icon: Monitor }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-white">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-lg font-bold">Queue Cure 26</p>
            <p className="text-xs text-slate-500">{user?.clinic?.name}</p>
          </div>
        </div>
        <nav className="mt-8 space-y-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${
                  isActive
                    ? 'bg-blue-50 text-primary dark:bg-blue-950 dark:text-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Signed in as</p>
              <h1 className="font-semibold">{user?.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary px-3" onClick={toggleTheme} title="Toggle dark mode">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="btn-secondary px-3" onClick={handleLogout} title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {nav.map(({ to, label }) => (
              <NavLink key={to} to={to} className="btn-secondary whitespace-nowrap py-2">
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
