import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auditApi } from '../api/auditApi';
import { useAuditProgress } from '../hooks/useAuditProgress';
import AuditProgress from '../components/AuditProgress';
import ReportHeader from '../components/audit/ReportHeader';
import AuditOverviewSummary from '../components/audit/AuditOverviewSummary';
import AuditSummaryCards from '../components/audit/AuditSummaryCards';
import AuditCategoryGrid from '../components/audit/AuditCategoryGrid';
import HeadingStructure from '../components/audit/HeadingStructure';
import SocialMediaPreview from '../components/audit/SocialMediaPreview';
import AuditSection from '../components/audit/AuditSection';
import AuditSkeleton from '../components/audit/AuditSkeleton';
import ScoreImprovementPlan from '../components/audit/ScoreImprovementPlan';
import AuditDashboardSidebar from '../components/audit/AuditDashboardSidebar';

export default function AuditReport() {
  const { auditId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = useAuditProgress(auditId);
  const [report, setReport] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    auditApi.get(auditId)
      .then((res) => setReport(res.data))
      .catch(() => toast.error('Audit not found'));
  }, [auditId, status?.status]);

  if (!report) return <AuditSkeleton />;
  if (report.status !== 'completed') {
    const progressStatus = { ...report, ...status };

    return (
      <main id="main-content" className="audit-dashboard min-h-screen bg-[#f6f8fb] px-4 py-12 text-[#111827] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl"><AuditProgress status={progressStatus} /></div>
      </main>
    );
  }

  const categories = report.categories || [];
  const requestedView = searchParams.get('view') || 'overview';
  const selectedCategory = categories.find((category) => String(category.id) === requestedView);
  const selectedId = selectedCategory ? String(selectedCategory.id) : 'overview';
  const sectionTitle = selectedCategory?.name || 'Overview';

  function selectSection(id) {
    setSearchParams({ view: id });
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateToRule(categoryId, ruleId) {
    setSearchParams({ view: categoryId, rule: ruleId });
    window.setTimeout(() => document.getElementById(`audit-rule-${ruleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  return (
    <div className="audit-dashboard min-h-screen bg-[#f6f8fb] text-[#111827]">
      <AuditDashboardSidebar
        report={report}
        categories={categories}
        selectedId={selectedId}
        onSelect={selectSection}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
      />
      <div className={`min-w-0 transition-[padding] duration-200 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[300px]'}`}>
        <ReportHeader report={report} auditId={auditId} sectionTitle={sectionTitle} onOpenNavigation={() => { setSidebarCollapsed(false); setDrawerOpen(true); }} />
        <main id="main-content" className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6">
          {selectedCategory ? (
            <AuditSection category={selectedCategory} />
          ) : (
            <div className="space-y-6">
              <AuditOverviewSummary report={report} />
              <AuditSummaryCards summary={report.summary} />
              <AuditCategoryGrid categories={categories} onSelect={selectSection} />
              <ScoreImprovementPlan plan={report.scoreImprovementPlan || []} onNavigate={navigateToRule} />
              <HeadingStructure headings={report.headingStructure || {}} warnings={report.audit?.crawl?.headingWarnings || []} />
              <SocialMediaPreview social={report.socialPreview || {}} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
