export default function AuditSkeleton() {
  return <div className="mx-auto max-w-[1100px] space-y-4 px-4 py-8"><div className="h-44 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />)}</div></div>;
}
