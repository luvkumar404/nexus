import CircularScore from './CircularScore';

export default function AuditOverviewSummary({ report }) {
  const metrics = [
    ['Passed', report.summary?.passed, 'text-[#16a05d]'],
    ['Warnings', report.summary?.warnings, 'text-[#d97706]'],
    ['Failed', report.summary?.failed, 'text-[#dc3545]'],
    ['Not available', report.summary?.notAvailable, 'text-[#526176]'],
    ['Skipped', report.summary?.skipped, 'text-[#526176]']
  ];

  return (
    <section className="rounded-lg border border-[#dfe5ec] bg-white p-4 sm:p-6" aria-labelledby="audit-summary-title">
      <div className="grid gap-6 xl:grid-cols-[minmax(260px,.75fr)_minmax(0,2fr)] xl:items-center">
        <div className="flex items-center gap-4">
          <CircularScore score={report.overallScore} size={112} />
          <div>
            <p id="audit-summary-title" className="text-xs font-semibold uppercase text-[#718096]">Overall score</p>
            <p className="mt-1 text-2xl font-bold text-[#111827]">Grade {report.grade || 'NA'}</p>
            <p className="mt-1 text-sm text-[#526176]">{report.summary?.applicableRules || 0}/{report.summary?.totalRules || 0} checks scored</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          {metrics.map(([label, value, tone]) => <div key={label} className="rounded-md border border-[#dfe5ec] bg-[#f8fafc] p-3"><p className="text-xs text-[#718096]">{label}</p><p className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{value ?? 0}</p></div>)}
        </div>
      </div>
    </section>
  );
}
