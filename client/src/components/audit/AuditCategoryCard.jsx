import { Activity } from 'lucide-react';
import CircularScore from './CircularScore';

export default function AuditCategoryCard({ category, onClick }) {
  const checked = category.applicableRules ?? category.scoreEligibleRules ?? 0;
  return (
    <button onClick={onClick} className="focus-ring flex min-h-56 w-full flex-col rounded-lg border border-[#dfe5ec] bg-white p-4 text-left transition-colors hover:border-[#cbd5e1] hover:bg-[#f8fafc]">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-md bg-[#e6f7f5] p-2 text-[#087f75]"><Activity size={20} /></div>
        <CircularScore score={category.score} size={76} />
      </div>
      <h3 className="mt-3 font-semibold leading-6 text-[#111827]">{category.name}</h3>
      <p className="mt-1 text-xs font-medium text-[#526176]">{category.status || 'Not Available'}</p>
      {category.score == null && category.scoreExplanation?.note && <p className="mt-2 text-xs text-slate-500">{category.scoreExplanation.note}</p>}
      <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-1 border-t border-[#dfe5ec] pt-3 text-xs text-[#526176]">
        <span><strong className="font-semibold text-[#dc3545]">{category.failed}</strong> fail</span>
        <span><strong className="font-semibold text-[#d97706]">{category.warnings}</strong> warn</span>
        <span><strong className="font-semibold text-[#16a05d]">{category.passed}</strong>/{checked} checked</span>
        <span><strong className="font-semibold">{category.notAvailable || 0}</strong> not available</span>
        <span><strong className="font-semibold">{category.skipped || 0}</strong> skipped</span>
      </div>
    </button>
  );
}
