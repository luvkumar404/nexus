export default function AuditSkeleton() {
  return <main id="main-content" className="audit-dashboard min-h-screen bg-[#f6f8fb] px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-[1536px] space-y-4"><div className="h-44 animate-pulse rounded-lg border border-[#dfe5ec] bg-white" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-lg border border-[#dfe5ec] bg-white" />)}</div></div></main>;
}
