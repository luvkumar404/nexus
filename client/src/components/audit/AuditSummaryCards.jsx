export default function AuditSummaryCards({ summary = {} }) {
  return (
    <section aria-label="Audit rule summary" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {[
        ['Total Rules', summary.totalRules],
        ['Applicable', summary.applicableRules],
        ['Passed', summary.passed],
        ['Warnings', summary.warnings],
        ['Failed', summary.failed],
        ['Not Available', summary.notAvailable]
      ].map(([label, value]) => <div key={label} className="flex min-h-28 flex-col justify-center rounded-lg border border-[#dfe5ec] bg-white p-4 transition-colors hover:border-[#cbd5e1]"><p className="text-xs font-medium uppercase text-[#718096]">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums text-[#111827]">{value || 0}</p></div>)}
    </section>
  );
}
