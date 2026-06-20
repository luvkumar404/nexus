import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { scoreColor } from '../utils/scoreColor';

export default function SeoScoreCard({ score = 0 }) {
  const data = [{ value: score, fill: score >= 85 ? '#059669' : score >= 65 ? '#d97706' : '#e11d48' }];
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500">Overall SEO Score</p>
      <div className="relative h-52">
        <ResponsiveContainer>
          <RadialBarChart innerRadius="72%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#e5e7eb' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center">
          <span className={`text-5xl font-bold ${scoreColor(score)}`}>{score}</span>
        </div>
      </div>
    </section>
  );
}
