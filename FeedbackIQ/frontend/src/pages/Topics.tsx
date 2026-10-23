import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getTopics } from '../api/feedback';
import { useAsync } from '../hooks/useAsync';
import { chartColors, useTheme } from '../context/ThemeContext';
import { Card, PageHeader, Status } from '../components/ui';

export default function Topics() {
  const { theme } = useTheme();
  const c = chartColors[theme];
  const state = useAsync(getTopics);

  return (
    <>
      <PageHeader title="Topics" subtitle="The subjects customers bring up most often." />
      <Status state={state}>
        {(topics) => (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-5">
            <Card title="Most discussed" subtitle="Number of comments per topic">
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topics} layout="vertical" margin={{ left: 24, right: 12 }}>
                    <CartesianGrid stroke={c.grid} horizontal={false} />
                    <XAxis type="number" stroke={c.text} tick={{ fontSize: 13, fill: c.text }} />
                    <YAxis type="category" dataKey="name" width={150} stroke={c.text} tick={{ fontSize: 13, fill: c.text }} />
                    <Tooltip contentStyle={{ background: c.tip, border: `1px solid ${c.grid}`, borderRadius: 8 }} />
                    <Bar dataKey="count" name="Comments" fill={c.acc} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Words behind each topic" subtitle="Common words found in the comments">
              <ul className="m-0 list-none p-0">
                {topics.map((t) => (
                  <li key={t.name} className="border-b border-soft py-3 last:border-0">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-mut">{t.keywords.join(', ')}</div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </Status>
    </>
  );
}
