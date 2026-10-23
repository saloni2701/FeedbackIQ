import { NavLink, Outlet } from 'react-router-dom';
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
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
