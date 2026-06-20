export default function SeverityBadge({ severity }) {
  if (!severity || severity === 'info') return null;
  const classes = {
    critical: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-100',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-100',
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes[severity] || classes.low}`}>{severity}</span>;
}
