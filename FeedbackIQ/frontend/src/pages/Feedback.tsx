import { useMemo, useState } from 'react';
import { getFeedback } from '../api/feedback';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader, Status, selectClass } from '../components/ui';
import type { Sentiment } from '../types';

const tone: Record<Sentiment, string> = { positive: 'text-pos', neutral: 'text-mut', negative: 'text-neg' };

export default function Feedback() {
  const state = useAsync(getFeedback);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Sentiment>('all');

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (state.data ?? []).filter(
      (f) => (filter === 'all' || f.sentiment === filter) && (!q || f.text.toLowerCase().includes(q) || f.aspect.toLowerCase().includes(q)),
    );
  }, [state.data, query, filter]);

  return (
    <>
      <PageHeader title="Customer feedback" subtitle="Read what people wrote, with the mood and area we detected." />
      <Card>
        <div className="mb-5 flex flex-wrap gap-3">
          <label className="flex flex-1 flex-col gap-1 text-[13px] text-mut" style={{ minWidth: 220 }}>
            Search comments
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Try “payment” or “support”" className={`${selectClass} w-full`} />
          </label>
          <label className="flex flex-col gap-1 text-[13px] text-mut">
            Mood
            <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | Sentiment)} className={selectClass}>
              <option value="all">All</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </label>
        </div>
        <Status state={state}>
          {() =>
            items.length === 0 ? (
              <p className="py-6 text-mut">No comments match. Clear the search or choose a different mood.</p>
            ) : (
              <ul className="m-0 list-none p-0">
                {items.map((f) => (
                  <li key={f.id} className="border-b border-soft py-4 last:border-0">
                    <p className="m-0 text-[16px]">{f.text}</p>
                    <p className="mt-1 text-sm text-mut">
                      <span className={`font-medium capitalize ${tone[f.sentiment]}`}>{f.sentiment}</span> · {f.aspect} · {f.source} · {f.date}
                    </p>
                  </li>
                ))}
              </ul>
            )
          }
        </Status>
      </Card>
    </>
  );
}
