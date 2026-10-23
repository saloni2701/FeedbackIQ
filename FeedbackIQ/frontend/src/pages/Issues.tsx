import { useState } from 'react';
import { getIssues } from '../api/feedback';
import { useAsync } from '../hooks/useAsync';
import { Card, IssuesTable, PageHeader, Status, selectClass } from '../components/ui';
import type { Severity } from '../types';

export default function Issues() {
  const state = useAsync(getIssues);
  const [severity, setSeverity] = useState<'all' | Severity>('all');

  return (
    <>
      <PageHeader title="Problems customers report" subtitle="Ranked by how often it is mentioned, how serious it is and how recent it is.">
        <label className="flex flex-col gap-1 text-[13px] text-mut">
          How serious
          <select value={severity} onChange={(e) => setSeverity(e.target.value as 'all' | Severity)} className={selectClass}>
            <option value="all">All</option>
            <option>Critical</option>
            <option>Major</option>
            <option>Moderate</option>
            <option>Minor</option>
          </select>
        </label>
      </PageHeader>
      <Card>
        <Status state={state}>
          {(issues) => {
            const rows = issues.filter((i) => severity === 'all' || i.severity === severity).sort((a, b) => b.priority - a.priority);
            return rows.length ? <IssuesTable issues={rows} /> : <p className="text-mut">No problems with this level of seriousness.</p>;
          }}
        </Status>
        <p className="mt-4 text-sm text-mut">The urgency score is generated automatically. Please review it with your team before acting.</p>
      </Card>
    </>
  );
}
