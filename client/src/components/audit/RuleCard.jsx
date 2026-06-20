import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';

export default function RuleCard({ rule }) {
  const border = { pass: 'border-l-emerald-500', warn: 'border-l-amber-500', fail: 'border-l-rose-500', info: 'border-l-blue-500', not_available: 'border-l-slate-400', skipped: 'border-l-slate-400' }[rule.status] || 'border-l-slate-400';
  const showSeverity = !['not_available', 'skipped', 'info'].includes(rule.status);
  return (
    <article className={`rounded-lg border border-l-4 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${border}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div><h4 className="font-semibold">{rule.ruleName}</h4><p className="text-xs text-slate-500">{rule.ruleId}</p></div>
        <div className="flex flex-wrap gap-2"><StatusBadge status={rule.status} />{showSeverity && <SeverityBadge severity={rule.severity} />}</div>
      </div>
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{rule.message}</p>
      <p className="mt-2 text-sm text-slate-500">{rule.recommendation}</p>
      <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
        <span>Impact: {rule.impact}</span><span>Difficulty: {rule.difficulty}</span><span>Source: {rule.source}</span><span>Confidence: {rule.confidence || 'high'}</span>
      </div>
      <details className="mt-3 text-xs"><summary className="cursor-pointer text-slate-500">Evidence/value</summary><pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 dark:bg-slate-900">{JSON.stringify(rule.evidence || {}, null, 2)}</pre></details>
      {rule.developerDetails && <details className="mt-3 text-xs"><summary className="cursor-pointer text-slate-500">Developer details</summary><pre className="mt-2 overflow-auto rounded bg-slate-50 p-3 dark:bg-slate-900">{JSON.stringify(rule.developerDetails, null, 2)}</pre></details>}
      <p className="mt-2 break-all text-xs text-slate-400">{rule.affectedUrl}</p>
    </article>
  );
}
