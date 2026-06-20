export default function StatusBadge({ status }) {
  const classes = {
    pass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
    warn: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
    fail: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
    not_available: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    skipped: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  };
  const labels = { not_available: 'Not available', skipped: 'Skipped', warn: 'Warning', fail: 'Fail', pass: 'Pass', info: 'Info' };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status] || classes.info}`}>{labels[status] || status}</span>;
}
