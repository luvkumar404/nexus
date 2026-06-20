export default function AuditProgress({ status }) {
  const progress = status?.progress || 0;
  const hasFailed = status?.status === 'failed';
  const errorMessage = status?.error || 'The audit could not be completed.';

  return (
    <div className={`rounded-lg border bg-white p-5 dark:bg-slate-900 ${hasFailed ? 'border-rose-200 dark:border-rose-900/60' : 'border-slate-200 dark:border-slate-800'}`}>
      <div className="flex items-center justify-between text-sm">
        <span>{hasFailed ? 'Audit failed' : status?.currentStep || 'Preparing audit'}</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-3 rounded-full transition-all ${hasFailed ? 'bg-rose-500' : 'bg-nexus'}`} style={{ width: `${progress}%` }} />
      </div>
      {hasFailed && (
        <div className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
