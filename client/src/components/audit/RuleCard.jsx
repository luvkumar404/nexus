import StatusBadge from './StatusBadge';
import SeverityBadge from './SeverityBadge';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

function DisplayValue({ value }) {
  if (value == null || value === '') return <span className="italic text-slate-500">Not detected</span>;
  return <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded border border-[#dfe5ec] bg-[#f8fafc] p-3 text-xs text-[#111827]">{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</pre>;
}

function SolutionDetails({ solution }) {
  const [copied, setCopied] = useState(false);
  async function copyCode() {
    if (!solution.codeExample) return;
    await navigator.clipboard.writeText(solution.codeExample);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="mt-4 space-y-4 border-t border-[#dfe5ec] pt-4 text-sm">
      <div><h5 className="font-semibold">1. Problem</h5><p className="mt-1 leading-6 text-[#526176]">{solution.explanation}</p></div>
      <div><h5 className="font-semibold">2. Why it matters</h5><p className="mt-1 leading-6 text-[#526176]">{solution.impact}</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div><h5 className="font-semibold">3. Detected value</h5><DisplayValue value={solution.detectedValue} /></div>
        <div><h5 className="font-semibold">4. Expected value</h5><p className="mt-1 leading-6 text-[#526176]">{solution.expectedValue}</p></div>
      </div>
      <div><h5 className="font-semibold">5. Affected items</h5>{solution.affectedItems?.length ? <ul className="mt-2 space-y-1">{solution.affectedItems.map((item, index) => <li key={`${item}-${index}`} className="break-all rounded bg-[#f8fafc] px-3 py-2 font-mono text-xs">{item}</li>)}</ul> : <p className="mt-1 italic text-slate-500">No exact affected item was available.</p>}</div>
      <div><h5 className="font-semibold">6. Step-by-step solution</h5><p className="mt-1 leading-6 text-[#526176]">{solution.solution}</p><ol className="mt-2 list-decimal space-y-2 pl-5 text-[#526176]">{solution.steps?.map((step, index) => <li key={index}>{step}</li>)}</ol></div>
      {solution.codeExample && <div><div className="flex items-center justify-between gap-3"><h5 className="font-semibold">7. Code example</h5><button type="button" onClick={copyCode} className="focus-ring inline-flex items-center gap-1 rounded border border-[#dfe5ec] px-2 py-1 text-xs font-medium text-[#526176]">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button></div><pre className="mt-2 max-w-full overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-3 text-xs text-slate-100"><code>{solution.codeExample}</code></pre></div>}
      <div><h5 className="font-semibold">8. Verification</h5><p className="mt-1 leading-6 text-[#526176]">{solution.verification}</p></div>
      <div className="flex flex-wrap gap-2"><span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">Priority: {solution.priority}</span><span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold">Estimated effort: {solution.estimatedEffort}</span></div>
      {solution.automatedCheckDisclaimer && <p className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">{solution.automatedCheckDisclaimer}</p>}
    </div>
  );
}

export default function RuleCard({ rule }) {
  const border = { pass: 'border-l-emerald-500', warn: 'border-l-amber-500', fail: 'border-l-rose-500', info: 'border-l-blue-500', not_available: 'border-l-slate-400', skipped: 'border-l-slate-400' }[rule.status] || 'border-l-slate-400';
  const showSeverity = !['not_available', 'skipped', 'info'].includes(rule.status);
  return (
    <article id={`audit-rule-${rule.ruleId}`} className={`scroll-mt-24 min-w-0 rounded-lg border border-l-4 border-[#dfe5ec] bg-white p-4 ${border}`}>
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
      {['fail', 'warn'].includes(rule.status) && rule.solution && <details className="group mt-4"><summary className="focus-ring w-fit cursor-pointer list-none rounded-md bg-[#087f75] px-3 py-2 text-sm font-semibold text-white marker:hidden">View Solution</summary><SolutionDetails solution={rule.solution} /></details>}
    </article>
  );
}
