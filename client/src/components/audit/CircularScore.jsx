export default function CircularScore({ score, size = 86 }) {
  const isNA = score == null || score === 'NA';
  const value = isNA ? null : Math.max(0, Math.min(100, Number(score)));
  const color = isNA ? '#94a3b8' : value >= 90 ? '#16a34a' : value >= 70 ? '#f97316' : value >= 50 ? '#fb923c' : '#dc2626';
  const dash = isNA ? 0 : value * 2.64;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} aria-label={isNA ? 'Score not available' : `Score ${value} out of 100`}>
      <svg viewBox="0 0 100 100" className="-rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-slate-200" strokeWidth="9" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${dash} 264`} />
      </svg>
      <span className="absolute text-lg font-bold tabular-nums text-[#111827]">{isNA ? 'NA' : value}</span>
    </div>
  );
}
