export default function SpeedMetrics({ performance }) {
  if (!performance?.available) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">{performance?.reason || 'Page speed data is not available.'}</div>;
  }
  const metrics = performance.metrics || {};
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Object.entries(metrics).map(([key, metric]) => (
        <div key={key} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-500">{key.replace(/[A-Z]/g, ' $&')}</p>
          <p className="mt-1 text-lg font-semibold">{String(metric.value)}</p>
        </div>
      ))}
    </div>
  );
}
