import { Target } from 'lucide-react';

export default function ScoreImprovementPlan({ plan = [], onNavigate }) {
  if (!plan.length) return null;
  return (
    <section className="rounded-lg border border-[#dfe5ec] bg-white p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-[#e6f7f5] p-2 text-[#087f75]"><Target size={20} /></span>
        <div>
          <h2 className="text-xl font-bold text-[#111827] sm:text-2xl">Score Improvement Plan</h2>
          <p className="text-sm text-[#526176]">Prioritized fixes generated from actual warning and failure rules.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {plan.map((item) => (
          <article key={item.categoryId} className="rounded-lg border border-[#dfe5ec] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.categoryName}</h3>
                <p className="mt-1 text-sm text-[#526176]">Current {item.currentScore ?? 'NA'}{item.targetScore != null ? ` | Calculated potential ${item.targetScore}` : ''}</p>
                <p className="mt-1 text-xs capitalize text-[#718096]">Difficulty: {item.difficulty}</p>
              </div>
              {item.expectedScoreImpact && <span title={item.scoreImpactExplanation} className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{item.expectedScoreImpact}</span>}
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {item.topFixes.map((fix) => (
                <li key={fix.ruleId} className="rounded-md border border-[#dfe5ec] bg-[#f8fafc] p-3">
                  <div className="flex items-start justify-between gap-3"><p className="font-medium">{fix.title}</p><button type="button" onClick={() => onNavigate?.(item.categoryId, fix.ruleId)} className="focus-ring shrink-0 rounded text-xs font-semibold text-[#087f75] hover:underline">View rule</button></div>
                  <p className="mt-1 break-words leading-6 text-[#526176]">{fix.recommendation}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">Status: {fix.status} | Priority: {fix.priority || 'medium'} | Impact: {fix.impact} | Difficulty: {fix.difficulty}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
