import { getRequests } from '../api/feedback';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader, Status } from '../components/ui';

export default function Requests() {
  const state = useAsync(getRequests);
  return (
    <>
      <PageHeader title="Ideas from customers" subtitle="Features people ask for, grouped by theme." />
      <Card>
        <Status state={state}>
          {(items) => {
            const max = Math.max(...items.map((i) => i.count));
            return (
              <ul className="m-0 flex list-none flex-col gap-5 p-0">
                {[...items].sort((a, b) => b.count - a.count).map((r) => (
                  <li key={r.id}>
                    <div className="mb-1.5 flex justify-between gap-3">
                      <span className="font-medium">{r.title} <span className="font-normal text-mut">({r.theme})</span></span>
                      <span>{r.count} requests</span>
                    </div>
                    <div className="h-3 rounded bg-soft" role="img" aria-label={`${r.count} requests`}>
                      <div className="h-3 rounded bg-acc" style={{ width: `${(r.count / max) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            );
          }}
        </Status>
      </Card>
    </>
  );
}
