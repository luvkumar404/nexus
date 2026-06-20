export default function HeadingStructure({ headings = {}, warnings = [] }) {
  const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const derivedWarnings = [...warnings];
  if (!headings.h1?.length) derivedWarnings.push('No H1 = fail');
  if ((headings.h1?.length || 0) > 1) derivedWarnings.push('More than one H1 = warn');
  return (
    <section className="rounded-lg border border-[#dfe5ec] bg-white p-4 sm:p-6">
      <h2 className="text-xl font-bold text-[#111827] sm:text-2xl">Heading Structure</h2>
      <p className="mt-1 text-sm text-[#526176]">The heading hierarchy found on this page.</p>
      {derivedWarnings.length > 0 && <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{[...new Set(derivedWarnings)].join(' ')}</div>}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((level) => <div key={level} className="min-w-0 rounded-lg border border-[#dfe5ec] p-4"><span className="rounded bg-[#087f75] px-2 py-1 text-xs font-bold uppercase text-white">{level}</span><p className="mt-2 text-sm text-[#526176]">{headings[level]?.length || 0} tags found</p><ol className="mt-3 list-decimal space-y-1 break-words pl-5 text-sm">{(headings[level] || []).map((item, index) => <li key={`${level}-${index}`}>{item}</li>)}</ol></div>)}
      </div>
    </section>
  );
}
