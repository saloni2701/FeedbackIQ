import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getIssues, getTrends } from '../api/feedback';
import { useAsync } from '../hooks/useAsync';
import { chartColors, useTheme } from '../context/ThemeContext';
import { Card, PageHeader, PriorityBadge, Status } from '../components/ui';

export default function Trends() {
  const { theme } = useTheme();
  const c = chartColors[theme];
  const state = useAsync(() => Promise.all([getTrends(), getIssues()]));

  return (
    <>
      <PageHeader title="Trends" subtitle="See how feedback changes week by week and spot new problems early." />
      <Status state={state}>
        {([trends, issues]) => (
          <>
            <Card title="Mood by week" subtitle="Share of comments that are positive, neutral or negative">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke={c.grid} vertical={false} />
                    <XAxis dataKey="week" stroke={c.text} tick={{ fontSize: 13, fill: c.text }} />
                    <YAxis stroke={c.text} tick={{ fontSize: 13, fill: c.text }} unit="%" domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: c.tip, border: `1px solid ${c.grid}`, borderRadius: 8 }} />
                    <Legend />
                    <Area stackId="1" type="monotone" dataKey="positive" name="Positive" stroke={c.pos} fill={c.pos} fillOpacity={0.85} />
                    <Area stackId="1" type="monotone" dataKey="neutral" name="Neutral" stroke={c.neu} fill={c.neu} fillOpacity={0.85} />
                    <Area stackId="1" type="monotone" dataKey="negative" name="Negative" stroke={c.neg} fill={c.neg} fillOpacity={0.85} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="New and growing problems" subtitle="Problems whose mentions are rising">
              <ul className="m-0 list-none p-0">
                {issues.filter((i) => i.recency === 'Rising').map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-soft py-3 last:border-0">
                    <span>{i.title} <span className="text-mut">({i.mentions} mentions)</span></span>
                    <PriorityBadge score={i.priority} />
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </Status>
    </>
  );
}
