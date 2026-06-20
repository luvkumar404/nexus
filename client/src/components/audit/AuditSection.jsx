import CircularScore from './CircularScore';
import RuleCard from './RuleCard';
import { formatAuditStatus } from '../../utils/formatAuditStatus';

export default function AuditSection({ category }) {
  const checked = category.applicableRules ?? category.scoreEligibleRules ?? 0;
  return (
    <section id={`category-${category.id}`} className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4"><CircularScore score={category.score} /><div><h3 className="text-2xl font-bold">{category.name}</h3><p className="text-sm text-slate-500">{category.totalRules} rules | {formatAuditStatus(category.score)} | {checked} checked</p></div></div>
        <div className="flex flex-wrap gap-2 text-xs"><span className="rounded bg-emerald-100 px-2 py-1 text-emerald-700">{category.passed} passed</span><span className="rounded bg-amber-100 px-2 py-1 text-amber-700">{category.warnings} warning</span><span className="rounded bg-rose-100 px-2 py-1 text-rose-700">{category.failed} failed</span><span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{category.notAvailable} not available</span>{(category.skipped || 0) > 0 && <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{category.skipped} skipped</span>}</div>
      </div>
      {category.scoreExplanation && <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{category.scoreExplanation.note} {category.scoreExplanation.scoringFormula}.</div>}
      <div className="mt-5 grid gap-3">{(category.rules || []).map((rule) => <RuleCard key={rule.ruleId} rule={rule} />)}</div>
    </section>
  );
}
