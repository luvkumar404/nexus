import AuditCategoryCard from './AuditCategoryCard';

export default function AuditCategoryGrid({ categories = [], onSelect }) {
  function jump(id) {
    if (onSelect) {
      onSelect(String(id));
      return;
    }
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return (
    <section aria-labelledby="audit-categories-title">
      <h2 id="audit-categories-title" className="text-xl font-bold text-[#111827] sm:text-2xl">Audit Categories</h2>
      <p className="mt-1 text-sm text-[#526176]">Click a category to jump to detailed results.</p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 min-[1400px]:grid-cols-4">
        {categories.map((category) => <AuditCategoryCard key={category.id} category={category} onClick={() => jump(category.id)} />)}
      </div>
    </section>
  );
}
