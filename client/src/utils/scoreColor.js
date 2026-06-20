export function scoreColor(score = 0) {
  if (score == null || score === 'NA') return 'text-slate-500';
  if (score >= 85) return 'text-emerald-600';
  if (score >= 65) return 'text-amber-600';
  return 'text-rose-600';
}

export function badgeColor(severity) {
  return {
    critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  }[severity] || 'bg-slate-100 text-slate-700';
}
