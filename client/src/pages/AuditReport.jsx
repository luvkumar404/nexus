import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { auditApi } from '../api/auditApi';
import { useAuditProgress } from '../hooks/useAuditProgress';
import AuditProgress from '../components/AuditProgress';
import ReportHeader from '../components/audit/ReportHeader';
import AuditSummaryCards from '../components/audit/AuditSummaryCards';
import AuditCategoryGrid from '../components/audit/AuditCategoryGrid';
import HeadingStructure from '../components/audit/HeadingStructure';
import SocialMediaPreview from '../components/audit/SocialMediaPreview';
import AuditSection from '../components/audit/AuditSection';
import AuditSkeleton from '../components/audit/AuditSkeleton';
import ScoreImprovementPlan from '../components/audit/ScoreImprovementPlan';

export default function AuditReport() {
  const { auditId } = useParams();
  const status = useAuditProgress(auditId);
  const [report, setReport] = useState(null);

  useEffect(() => {
    auditApi.get(auditId)
      .then((res) => setReport(res.data))
      .catch(() => toast.error('Audit not found'));
  }, [auditId, status?.status]);

  if (!report) return <AuditSkeleton />;
  if (report.status !== 'completed') {
    const progressStatus = { ...report, ...status };

    return (
      <main className="mx-auto max-w-[1100px] px-4 py-12">
        <AuditProgress status={progressStatus} />
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden bg-white dark:bg-slate-950">
      <div className="pointer-events-none fixed inset-y-0 left-0 w-32 bg-[linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] bg-[size:24px_24px] opacity-45 dark:opacity-10" />
      <div className="pointer-events-none fixed inset-y-0 right-0 w-32 bg-[linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] bg-[size:24px_24px] opacity-45 dark:opacity-10" />
      <div className="relative mx-auto max-w-[1100px] space-y-8 px-4 py-8">
        <ReportHeader report={report} auditId={auditId} />
        <AuditSummaryCards summary={report.summary} />
        <AuditCategoryGrid categories={report.categories || []} />
        <ScoreImprovementPlan plan={report.scoreImprovementPlan || []} />
        <HeadingStructure headings={report.headingStructure || {}} warnings={report.audit?.crawl?.headingWarnings || []} />
        <SocialMediaPreview social={report.socialPreview || {}} />
        <div className="space-y-6">
          {(report.categories || []).map((category) => <AuditSection key={category.id} category={category} />)}
        </div>
      </div>
    </main>
  );
}
