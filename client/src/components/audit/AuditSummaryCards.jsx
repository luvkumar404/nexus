export default function AuditSummaryCards({ summary = {} }) {
  return (
    <div className="grid gap-3 sm:grid-cols-6">
      {[
        ['Total Rules', summary.totalRules],
        ['Applicable', summary.applicableRules],
        ['Passed', summary.passed],
        ['Warnings', summary.warnings],
        ['Failed', summary.failed],
        ['Not Available', summary.notAvailable]
      ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold">{value || 0}</p></div>)}
    </div>
  );
}
