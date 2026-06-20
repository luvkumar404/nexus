import { Activity } from 'lucide-react';
import CircularScore from './CircularScore';

export default function AuditCategoryCard({ category, onClick }) {
  const checked = category.applicableRules ?? category.scoreEligibleRules ?? 0;
  return (
    <button onClick={onClick} className="focus-ring rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-md bg-cyan-50 p-2 text-nexus dark:bg-slate-800"><Activity size={20} /></div>
        <CircularScore score={category.score} size={68} />
      </div>
      <h3 className="mt-3 font-semibold">{category.name}</h3>
      <p className="mt-1 text-xs text-slate-500">{category.status || 'Not Available'}</p>
      {category.score == null && category.scoreExplanation?.note && <p className="mt-2 text-xs text-slate-500">{category.scoreExplanation.note}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span>{category.failed} fail</span>
        <span>{category.warnings} warn</span>
        <span>{category.passed}/{checked} checked</span>
        {(category.notAvailable || 0) > 0 && <span>{category.notAvailable} not available</span>}
        {(category.skipped || 0) > 0 && <span>{category.skipped} skipped</span>}
      </div>
    </button>
  );
}
