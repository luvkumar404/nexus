export default function SocialPreviewCard({ preview = {} }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#dfe5ec] bg-white">
      {preview.image ? <img src={preview.image} alt="" className="h-44 w-full object-cover" /> : <div className="grid h-44 place-items-center bg-[#f8fafc] text-sm text-[#718096]">Image not found</div>}
      <div className="p-4">
        <p className="text-xs uppercase text-slate-500">{preview.domain || 'Not found'}</p>
        <h3 className="mt-1 font-semibold">{preview.title || 'Not found'}</h3>
        <p className="mt-2 text-sm text-[#526176]">{preview.description || 'Not found'}</p>
      </div>
    </div>
  );
}
