import { Activity, ChevronLeft, ChevronRight, Gauge, LayoutDashboard, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import CircularScore from './CircularScore';

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url || 'Not available';
  }
}

function scoreTone(score) {
  if (score == null || score === 'NA') return 'bg-slate-500';
  if (Number(score) >= 90) return 'bg-emerald-500';
  if (Number(score) >= 70) return 'bg-blue-500';
  if (Number(score) >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}

export default function AuditDashboardSidebar({
  report,
  categories,
  selectedId,
  onSelect,
  collapsed,
  onToggleCollapsed,
  drawerOpen,
  onCloseDrawer
}) {
  return (
    <>
      {drawerOpen && <button type="button" className="fixed inset-0 z-40 bg-slate-600/25 lg:hidden" onClick={onCloseDrawer} aria-label="Close audit navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[300px] border-r border-[#dfe5ec] bg-white text-[#111827] transition-[width,transform] duration-200 lg:translate-x-0 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:w-20' : 'lg:w-[300px]'}`}>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className={`flex h-16 items-center border-b border-[#dfe5ec] ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
            <Link to="/" className="focus-ring flex min-w-0 items-center gap-3 rounded-md" title={collapsed ? 'Nexus SEO Auditor' : undefined}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-nexus text-white"><Gauge size={20} /></span>
              {!collapsed && <span className="truncate font-semibold">Nexus SEO Auditor</span>}
            </Link>
            <button type="button" onClick={onCloseDrawer} className="focus-ring rounded-md p-2 text-[#526176] hover:bg-[#f8fafc] hover:text-[#111827] lg:hidden" aria-label="Close audit navigation"><X size={18} /></button>
          </div>

          <div className={`border-b border-[#dfe5ec] ${collapsed ? 'px-2 py-4' : 'p-4'}`}>
            {collapsed ? (
              <div className="flex justify-center" title={`${getDomain(report.url)} — Grade ${report.grade || 'NA'}`}><CircularScore score={report.overallScore} size={52} /></div>
            ) : (
              <div>
                <p className="truncate text-sm font-medium text-[#111827]" title={getDomain(report.url)}>{getDomain(report.url)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <CircularScore score={report.overallScore} size={72} />
                  <div>
                    <p className="text-lg font-bold">Grade {report.grade || 'NA'}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs capitalize text-[#526176]"><span className="h-2 w-2 rounded-full bg-[#16a05d]" />{report.status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="audit-sidebar-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Audit report sections">
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label="Overview"
              active={selectedId === 'overview'}
              collapsed={collapsed}
              onClick={() => onSelect('overview')}
            />
            <div className="my-3 border-t border-[#dfe5ec]" />
            {categories.map((category) => (
              <SidebarItem
                key={category.id}
                icon={<Activity size={18} />}
                label={category.name}
                score={category.score}
                indicator={scoreTone(category.score)}
                active={selectedId === String(category.id)}
                collapsed={collapsed}
                onClick={() => onSelect(String(category.id))}
              />
            ))}
          </nav>

          <button type="button" onClick={onToggleCollapsed} className="focus-ring hidden h-12 items-center justify-center border-t border-[#dfe5ec] text-[#526176] hover:bg-[#f8fafc] hover:text-[#111827] lg:flex" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span className="ml-2 text-sm">Collapse sidebar</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ icon, label, score, indicator, active, collapsed, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? `${label}${score !== undefined ? ` — Score ${score == null ? 'NA' : score}` : ''}` : undefined}
      aria-current={active ? 'page' : undefined}
      className={`focus-ring mb-1 flex min-h-11 w-full items-center rounded-md border-l-2 text-sm transition-colors ${collapsed ? 'justify-center px-2' : 'gap-3 px-3'} ${active ? 'border-[#087f75] bg-[#e6f7f5] font-medium text-[#087f75]' : 'border-transparent text-[#526176] hover:bg-[#f8fafc] hover:text-[#111827]'}`}
    >
      <span className="relative shrink-0">{icon}{indicator && <span className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ring-2 ring-white ${indicator}`} />}</span>
      {!collapsed && <><span className="min-w-0 flex-1 text-left leading-5">{label}</span>{score !== undefined && <span className="tabular-nums text-xs font-semibold text-[#526176]">{score == null ? 'NA' : score}</span>}</>}
    </button>
  );
}
