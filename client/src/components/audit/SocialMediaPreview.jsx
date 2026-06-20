import MetaTagsTable from './MetaTagsTable';
import SocialPreviewCard from './SocialPreviewCard';

export default function SocialMediaPreview({ social = {} }) {
  return (
    <section className="rounded-lg border border-[#dfe5ec] bg-white p-4 sm:p-6">
      <h2 className="text-xl font-bold text-[#111827] sm:text-2xl">Social Media Preview</h2>
      <p className="mt-1 text-sm text-[#526176]">How your website appears when shared on social media and search engines.</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <MetaTagsTable metaTags={social.metaTags} preview={social.preview} />
        <SocialPreviewCard preview={social.preview} />
      </div>
    </section>
  );
}
