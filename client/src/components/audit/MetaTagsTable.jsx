function effectiveValue(key, metaTags, preview) {
  if (metaTags[key]) return metaTags[key];
  if (key === 'og:title' && preview.title && preview.title !== 'Not found') return preview.title;
  if (key === 'og:description' && preview.description && preview.description !== 'Not found') return preview.description;
  return 'Not found';
}

export default function MetaTagsTable({ metaTags = {}, preview = {} }) {
  const keys = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full text-left text-sm">
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {keys.map((key) => <tr key={key}><th className="w-44 bg-slate-50 px-3 py-2 font-medium dark:bg-slate-800">{key}</th><td className="break-all px-3 py-2 text-slate-600 dark:text-slate-300">{effectiveValue(key, metaTags, preview)}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
