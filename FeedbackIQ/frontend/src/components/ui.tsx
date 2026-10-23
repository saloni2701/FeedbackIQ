import type { ReactNode } from 'react';
import type { AsyncState } from '../hooks/useAsync';
import type { Issue } from '../types';

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1.5 text-base text-mut">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, subtitle, action, children, className = '' }: {
  title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-xl border border-line bg-card p-6 ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          {title && <h2 className="m-0 text-[19px] font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {subtitle && <p className="mb-[18px] mt-1 text-sm text-mut">{subtitle}</p>}
      {!subtitle && title && <div className="mb-4" />}
      {children}
    </section>
  );
}

export function StatCard({ label, value, note, noteClass = 'text-mut' }: { label: string; value: string; note: string; noteClass?: string }) {
  return (
    <div className="rounded-xl border border-line bg-card p-6">
      <span className="text-sm text-mut">{label}</span>
      <b className="my-1 block text-[34px] font-semibold leading-tight">{value}</b>
      <span className={`text-sm ${noteClass}`}>{note}</span>
    </div>
  );
}

export function SentimentBar({ positive, neutral, negative, label }: { positive: number; neutral: number; negative: number; label: string }) {
  return (
    <div
      role="img"
      aria-label={`${label}: ${positive} percent positive, ${neutral} neutral, ${negative} negative`}
      className="flex h-[18px] overflow-hidden rounded"
    >
      <span className="bg-pos" style={{ width: `${positive}%` }} />
      <span className="bg-neu" style={{ width: `${neutral}%` }} />
      <span className="bg-neg" style={{ width: `${negative}%` }} />
    </div>
  );
}

export function PriorityBadge({ score }: { score: number }) {
  const [label, cls] = score >= 75 ? ['High', 'text-neg'] : score >= 40 ? ['Medium', 'text-warn'] : ['Low', 'text-mut'];
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border border-current px-2.5 py-0.5 text-[13px] font-medium ${cls}`}>
      {label} · {score}
    </span>
  );
}

export function IssuesTable({ issues }: { issues: Issue[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-[15px]">
        <thead>
          <tr className="text-sm text-mut">
            {['Problem', 'Area', 'Mentions', 'How serious', 'Trend', 'Urgency'].map((h) => (
              <th key={h} scope="col" className="border-b border-line px-2.5 py-2.5 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issues.map((i) => (
            <tr key={i.id} className="border-b border-soft last:border-0">
              <td className="px-2.5 py-3.5">{i.title}</td>
              <td className="px-2.5 py-3.5">{i.aspect}</td>
              <td className="px-2.5 py-3.5">{i.mentions}</td>
              <td className="px-2.5 py-3.5">{i.severity}</td>
              <td className="px-2.5 py-3.5">{i.recency}</td>
              <td className="px-2.5 py-3.5"><PriorityBadge score={i.priority} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Shows a loader or error message, or renders children once data has loaded. */
export function Status<T>({ state, children }: { state: AsyncState<T>; children: (data: T) => ReactNode }) {
  if (state.loading) return <p role="status" className="py-10 text-center text-mut">Loading…</p>;
  if (state.error || !state.data) {
    return <p role="alert" className="rounded-xl border border-neg p-6 text-neg">{state.error ?? 'No data available.'}</p>;
  }
  return <>{children(state.data)}</>;
}

export const selectClass =
  'h-[46px] rounded-lg border border-line bg-card px-3 text-[15px] text-ink';
