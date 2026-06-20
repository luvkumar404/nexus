export default function StatusBadge({ status }) {
  const classes = {
    pass: 'bg-emerald-100 text-emerald-700',
    warn: 'bg-amber-100 text-amber-700',
    fail: 'bg-rose-100 text-rose-700',
    info: 'bg-blue-100 text-blue-700',
    not_available: 'bg-slate-100 text-slate-700',
    skipped: 'bg-slate-100 text-slate-700'
  };
  const labels = { not_available: 'Not available', skipped: 'Skipped', warn: 'Warning', fail: 'Fail', pass: 'Pass', info: 'Info' };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status] || classes.info}`}>{labels[status] || status}</span>;
}
