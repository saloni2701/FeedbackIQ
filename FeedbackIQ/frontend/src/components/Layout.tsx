import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/feedback', label: 'Feedback' },
  { to: '/upload', label: 'Upload' },
  { to: '/topics', label: 'Topics' },
  { to: '/issues', label: 'Issues' },
  { to: '/requests', label: 'Requests' },
  { to: '/trends', label: 'Trends' },
  { to: '/reports', label: 'Reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const initial = user?.name?.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen">
      <header className="bg-nav">
        <div className="mx-auto flex min-h-[64px] max-w-[1440px] flex-wrap items-center gap-x-6 px-8 lg:flex-nowrap">
          <Link to="/" aria-label="FeedbackIQ home" className="shrink-0 py-3">
            <Logo />
          </Link>
          <nav aria-label="Primary" className="flex min-w-0 flex-1 overflow-x-auto">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `shrink-0 whitespace-nowrap px-3 py-5 text-[15px] ${
                    isActive ? 'border-b-[3px] border-white pb-[17px] font-medium text-white' : 'text-[#d3dbee] hover:text-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-x-4">
            <ThemeToggle />
            <span
              role="img"
              aria-label={`Signed in as ${user?.name ?? 'user'}`}
              title={user ? `${user.name} (${user.email})` : undefined}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-semibold text-white"
            >
              {initial}
            </span>
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
      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}