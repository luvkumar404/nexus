import { badgeColor } from '../utils/scoreColor';

export default function IssueTable({ issues = [] }) {
  if (!issues.length) return <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No issues found for this view.</div>;
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">Severity</th><th className="px-4 py-3">Issue</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Recommendation</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {issues.map((issue) => (
              <tr key={issue._id}>
                <td className="px-4 py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${badgeColor(issue.severity)}`}>{issue.severity}</span></td>
                <td className="max-w-md px-4 py-3"><p className="font-medium">{issue.title}</p><p className="truncate text-xs text-slate-500">{issue.affectedUrl}</p></td>
                <td className="px-4 py-3 capitalize">{issue.category}</td>
                <td className="max-w-lg px-4 py-3 text-slate-600 dark:text-slate-300">{issue.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
