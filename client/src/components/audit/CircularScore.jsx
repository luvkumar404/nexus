export default function CircularScore({ score, size = 86 }) {
  const isNA = score == null || score === 'NA';
  const value = isNA ? null : Math.max(0, Math.min(100, Number(score)));
  const color = isNA ? '#94a3b8' : value >= 90 ? '#16a34a' : value >= 70 ? '#f97316' : value >= 50 ? '#fb923c' : '#dc2626';
  const dash = isNA ? 0 : value * 2.64;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="10" />
        <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} 264`} />
      </svg>
      <span className="absolute text-lg font-bold">{isNA ? 'NA' : value}</span>
    </div>
  );
}
