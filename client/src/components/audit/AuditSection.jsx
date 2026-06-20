import CircularScore from './CircularScore';
import RuleCard from './RuleCard';
import { formatAuditStatus } from '../../utils/formatAuditStatus';

export default function AuditSection({ category }) {
  const checked = category.applicableRules ?? category.scoreEligibleRules ?? 0;
  return (
    <section id={`category-${category.id}`} className="scroll-mt-24 rounded-lg border border-[#dfe5ec] bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4"><CircularScore score={category.score} /><div className="min-w-0"><h3 className="text-xl font-bold text-[#111827] sm:text-2xl">{category.name}</h3><p className="mt-1 text-sm text-[#526176]">{category.totalRules} rules | {formatAuditStatus(category.score)} | {checked} checked</p><p className="mt-1 text-xs font-medium text-[#526176]">Status: {category.status || formatAuditStatus(category.score)}</p></div></div>
        <div className="flex flex-wrap gap-2 text-xs"><span className="rounded bg-emerald-100 px-2 py-1 text-emerald-700">{category.passed} passed</span><span className="rounded bg-amber-100 px-2 py-1 text-amber-700">{category.warnings} warning</span><span className="rounded bg-rose-100 px-2 py-1 text-rose-700">{category.failed} failed</span><span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{category.notAvailable} not available</span><span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{category.skipped || 0} skipped</span></div>
      </div>
      {category.description && <p className="mt-4 text-sm leading-6 text-[#526176]">{category.description}</p>}
      {category.scoreExplanation && <div className="mt-4 rounded-md border border-[#dfe5ec] bg-[#f8fafc] p-3 text-sm text-[#526176]">{category.scoreExplanation.note} {category.scoreExplanation.scoringFormula}.</div>}
      <div className="mt-5 grid gap-3">{(category.rules || []).map((rule) => <RuleCard key={rule.ruleId} rule={rule} />)}</div>
    </section>
  );
}
