function effectiveValue(key, metaTags, preview) {
  if (metaTags[key]) return metaTags[key];
  if (key === 'og:title' && preview.title && preview.title !== 'Not found') return preview.title;
  if (key === 'og:description' && preview.description && preview.description !== 'Not found') return preview.description;
  return 'Not found';
}

export default function MetaTagsTable({ metaTags = {}, preview = {} }) {
  const keys = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'];
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border border-[#dfe5ec]">
      <table className="min-w-[640px] w-full text-left text-sm">
        <tbody className="divide-y divide-[#dfe5ec]">
          {keys.map((key) => <tr key={key}><th className="w-44 bg-[#f8fafc] px-3 py-2 font-medium">{key}</th><td className="break-all px-3 py-2 text-[#526176]">{effectiveValue(key, metaTags, preview)}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
