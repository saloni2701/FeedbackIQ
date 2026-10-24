import type { ReactNode } from 'react';
import ThemeToggle from './ThemeToggle';

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-nav">
        <div className="mx-auto flex min-h-[64px] max-w-[1280px] items-center justify-between px-8">
          <span className="text-xl font-semibold text-white">FeedbackIQ</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-[460px] px-6 py-12">
        <div className="rounded-xl border border-line bg-card p-8">
          <h1 className="m-0 text-2xl font-semibold">{title}</h1>
          <p className="mb-6 mt-1.5 text-mut">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
