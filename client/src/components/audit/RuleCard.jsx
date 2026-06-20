import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';

export default function RuleCard({ rule }) {
  const border = { pass: 'border-l-emerald-500', warn: 'border-l-amber-500', fail: 'border-l-rose-500', info: 'border-l-blue-500', not_available: 'border-l-slate-400', skipped: 'border-l-slate-400' }[rule.status] || 'border-l-slate-400';
  const showSeverity = !['not_available', 'skipped', 'info'].includes(rule.status);
  return (
    <article className={`min-w-0 rounded-lg border border-l-4 border-[#dfe5ec] bg-white p-4 ${border}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div><h4 className="font-semibold">{rule.ruleName}</h4><p className="text-xs text-slate-500">{rule.ruleId}</p></div>
        <div className="flex flex-wrap gap-2"><StatusBadge status={rule.status} />{showSeverity && <SeverityBadge severity={rule.severity} />}</div>
      </div>
      <p className="mt-3 break-words text-sm leading-6 text-[#111827]">{rule.message}</p>
      <p className="mt-2 break-words text-sm leading-6 text-[#526176]">{rule.recommendation}</p>
      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
        <span>Impact: {rule.impact}</span><span>Difficulty: {rule.difficulty}</span><span>Source: {rule.source}</span><span>Confidence: {rule.confidence || 'high'}</span>
      </div>
      <details className="mt-3 text-xs"><summary className="focus-ring w-fit cursor-pointer rounded text-[#526176]">Evidence/value</summary><pre className="mt-2 max-w-full overflow-auto rounded border border-[#dfe5ec] bg-[#f8fafc] p-3 text-[#111827]">{JSON.stringify(rule.evidence || {}, null, 2)}</pre></details>
      {rule.developerDetails && <details className="mt-3 text-xs"><summary className="focus-ring w-fit cursor-pointer rounded text-[#526176]">Developer details</summary><pre className="mt-2 max-w-full overflow-auto rounded border border-[#dfe5ec] bg-[#f8fafc] p-3 text-[#111827]">{JSON.stringify(rule.developerDetails, null, 2)}</pre></details>}
      <p className="mt-2 break-all text-xs text-slate-400">{rule.affectedUrl}</p>
    </article>
  );
}
