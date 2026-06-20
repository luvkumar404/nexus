export default function PageAuditTable({ pages = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-4 py-3">URL</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Words</th><th className="px-4 py-3">Links</th><th className="px-4 py-3">Images</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pages.map((page) => (
              <tr key={page._id}>
                <td className="max-w-xs truncate px-4 py-3">{page.url}</td>
                <td className="px-4 py-3">{page.statusCode || 'n/a'}</td>
                <td className="max-w-sm truncate px-4 py-3">{page.title || 'Missing'}</td>
                <td className="px-4 py-3">{page.wordCount || 0}</td>
                <td className="px-4 py-3">{(page.internalLinks?.length || 0) + (page.externalLinks?.length || 0)}</td>
                <td className="px-4 py-3">{page.images?.total || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
