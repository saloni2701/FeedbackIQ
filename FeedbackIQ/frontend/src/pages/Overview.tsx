import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAspects, getIssues, getRequests, getSummary, getTrends } from '../api/feedback';
import { useAsync } from '../hooks/useAsync';
import { chartColors, useTheme } from '../context/ThemeContext';
import { Card, IssuesTable, PageHeader, SentimentBar, StatCard, Status } from '../components/ui';

export default function Overview() {
  const { theme } = useTheme();
  const c = chartColors[theme];
  const state = useAsync(() => Promise.all([getSummary(), getTrends(), getAspects(), getIssues(), getRequests()]));

  return (
    <>
      <PageHeader title="What customers are saying" subtitle="A plain summary of recent feedback and what to fix first." />
      <Status state={state}>
        {([summary, trends, aspects, issues, requests]) => (
          <>
            <section className="rounded-xl border border-line bg-soft p-6">
              <h2 className="m-0 text-[19px] font-semibold">Summary</h2>
              <p className="mt-1.5 text-[17px]">{summary.headline}</p>
            </section>

            <section aria-label="Key numbers" className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-5">
              <StatCard label="Comments reviewed" value={summary.total.toLocaleString()} note={`Up ${summary.totalChange}% from before`} />
              <StatCard
                label="Overall mood"
                value={summary.netSentiment > 0.15 ? 'Mostly positive' : summary.netSentiment < -0.15 ? 'Mostly negative' : 'Mixed'}
                note={`Score ${summary.netSentiment > 0 ? '+' : ''}${summary.netSentiment} (scale −1 to +1)`}
              />
              <StatCard label="Problems to fix" value={String(summary.openIssues)} note={`${summary.highPriority} need attention soon`} noteClass="text-neg" />
              <StatCard label="Ideas from customers" value={String(summary.requests)} note={`Grouped into ${summary.requestThemes} themes`} />
            </section>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-5">
              <Card title="How customers feel over time" subtitle="Percent of comments each week">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                      <CartesianGrid stroke={c.grid} vertical={false} />
                      <XAxis dataKey="week" stroke={c.text} tick={{ fontSize: 13, fill: c.text }} />
                      <YAxis stroke={c.text} tick={{ fontSize: 13, fill: c.text }} unit="%" />
                      <Tooltip contentStyle={{ background: c.tip, border: `1px solid ${c.grid}`, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="positive" name="Positive" stroke={c.pos} strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="negative" name="Negative" stroke={c.neg} strokeWidth={3} strokeDasharray="7 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap gap-6 text-[15px]">
                  <span><b className="text-pos">——</b> Positive</span>
                  <span><b className="text-neg">- - -</b> Negative</span>
                </div>
              </Card>

              <Card title="What they talk about" subtitle="Green is positive, gray is neutral, red is negative">
                <div className="flex flex-col gap-[18px]">
                  {aspects.map((a) => (
                    <div key={a.aspect}>
                      <div className="mb-1.5 flex justify-between gap-3 text-[15px]">
                        <span>{a.aspect}</span>
                        <span className="text-mut">{a.positive}% / {a.neutral}% / {a.negative}%</span>
                      </div>
                      <SentimentBar label={a.aspect} positive={a.positive} neutral={a.neutral} negative={a.negative} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card
              title="Fix these first"
              subtitle="Ranked by how often it is mentioned, how serious it is and how recent it is."
              action={<Link to="/issues" className="text-[15px] text-acc hover:underline">See all problems</Link>}
            >
              <IssuesTable issues={[...issues].sort((a, b) => b.priority - a.priority).slice(0, 4)} />
            </Card>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-5">
              <Card title="What customers are asking for" subtitle="Most requested ideas" action={<Link to="/requests" className="text-[15px] text-acc hover:underline">See all</Link>}>
                {requests.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex justify-between border-b border-soft py-2.5 last:border-0">
                    <span>{r.title}</span>
                    <b>{r.count} requests</b>
                  </div>
                ))}
              </Card>
              <Card title="Suggested next steps" subtitle="Generated by AI. Please review before acting.">
                <ol className="m-0 flex list-decimal flex-col gap-2.5 pl-[22px]">
                  {summary.recommendations.map((r) => <li key={r}>{r}</li>)}
                </ol>
              </Card>
            </div>
          </>
        )}
      </Status>
    </>
  );
}
