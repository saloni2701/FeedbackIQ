import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/feedback', label: 'Feedback' },
  { to: '/topics', label: 'Topics' },
  { to: '/issues', label: 'Issues' },
  { to: '/requests', label: 'Requests' },
  { to: '/trends', label: 'Trends' },
  { to: '/reports', label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="bg-nav">
        <div className="mx-auto flex min-h-[64px] max-w-[1280px] flex-wrap items-center gap-x-8 px-8">
          <span className="text-xl font-semibold text-white">FeedbackIQ</span>
          <nav aria-label="Primary" className="flex flex-1 flex-wrap">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3.5 py-5 text-[15px] ${isActive ? 'border-b-[3px] border-white pb-[17px] font-medium text-white' : 'text-[#d3dbee] hover:text-white'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-x-5">
            <ThemeToggle />
            <span className="hidden text-sm text-[#d3dbee] sm:inline" title={user?.email}>{user?.name}</span>
            <button
              type="button"
              onClick={logout}
              className="min-h-[44px] rounded-lg border border-[#6f7fa8] px-4 text-sm text-white hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
