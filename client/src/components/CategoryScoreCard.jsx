export default function CategoryScoreCard({ label, score }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-semibold">{score ?? 0}/100</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-2 rounded-full bg-nexus" style={{ width: `${Math.max(0, Math.min(100, score || 0))}%` }} />
      </div>
    </div>
  );
}
