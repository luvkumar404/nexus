import { Target } from 'lucide-react';

export default function ScoreImprovementPlan({ plan = [] }) {
  if (!plan.length) return null;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-cyan-50 p-2 text-nexus dark:bg-slate-800"><Target size={20} /></span>
        <div>
          <h2 className="text-2xl font-bold">Score Improvement Plan</h2>
          <p className="text-sm text-slate-500">Prioritized fixes generated from actual warning and failure rules.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {plan.map((item) => (
          <article key={item.categoryId} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.categoryName}</h3>
                <p className="text-sm text-slate-500">Current {item.currentScore ?? 'NA'} | Target {item.targetScore ?? 'NA'}</p>
              </div>
              <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">{item.expectedScoreImpact}</span>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {item.topFixes.map((fix) => (
                <li key={fix.ruleId} className="rounded bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="font-medium">{fix.title}</p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{fix.recommendation}</p>
                  <p className="mt-1 text-xs text-slate-500">Impact: {fix.impact} | Difficulty: {fix.difficulty}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
