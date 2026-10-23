import { getIssues, getRequests, getSummary } from '../api/feedback';
import { useAsync } from '../hooks/useAsync';
import { Card, PageHeader, Status } from '../components/ui';

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const btn = 'inline-flex min-h-[44px] items-center rounded-lg border border-acc px-5 text-[15px] font-medium text-acc hover:bg-soft';

export default function Reports() {
  const state = useAsync(() => Promise.all([getIssues(), getRequests(), getSummary()]));
  return (
    <>
      <PageHeader title="Reports" subtitle="Download the results to share with your team." />
      <Status state={state}>
        {([issues, requests, summary]) => (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
            <Card title="Problems" subtitle="All problems with mentions, seriousness and urgency score.">
              <button type="button" className={btn} onClick={() => downloadCsv('problems.csv', [['Problem', 'Area', 'Mentions', 'Severity', 'Trend', 'Urgency score'], ...issues.map((i) => [i.title, i.aspect, i.mentions, i.severity, i.recency, i.priority])])}>
                Download problems (CSV)
              </button>
            </Card>
            <Card title="Customer ideas" subtitle="Requested features and how many people asked.">
              <button type="button" className={btn} onClick={() => downloadCsv('ideas.csv', [['Idea', 'Theme', 'Requests'], ...requests.map((r) => [r.title, r.theme, r.count])])}>
                Download ideas (CSV)
              </button>
            </Card>
            <Card title="Summary and next steps" subtitle="The plain-language summary and AI suggestions.">
              <button type="button" className={btn} onClick={() => downloadCsv('summary.csv', [['Type', 'Text'], ['Summary', summary.headline], ...summary.recommendations.map((r) => ['Next step', r])])}>
                Download summary (CSV)
              </button>
            </Card>
          </div>
        )}
      </Status>
    </>
  );
}
