import MetaTagsTable from './MetaTagsTable';
import SocialPreviewCard from './SocialPreviewCard';

export default function SocialMediaPreview({ social = {} }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-2xl font-bold">Social Media Preview</h2>
      <p className="mt-1 text-slate-500">How your website appears when shared on social media and search engines.</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <MetaTagsTable metaTags={social.metaTags} preview={social.preview} />
        <SocialPreviewCard preview={social.preview} />
      </div>
    </section>
  );
}
