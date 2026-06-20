import AuditCategoryCard from './AuditCategoryCard';

export default function AuditCategoryGrid({ categories = [] }) {
  function jump(id) {
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  return (
    <section>
      <h2 className="text-2xl font-bold">Audit Categories</h2>
      <p className="mt-1 text-slate-500">Click a category to jump to detailed results.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => <AuditCategoryCard key={category.id} category={category} onClick={() => jump(category.id)} />)}
      </div>
    </section>
  );
}
