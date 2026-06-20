export default function SeverityBadge({ severity }) {
  if (!severity || severity === 'info') return null;
  const classes = {
    critical: 'bg-rose-100 text-rose-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-slate-100 text-slate-700'
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes[severity] || classes.low}`}>{severity}</span>;
}
