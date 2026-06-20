import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import PdfExportButton from './PdfExportButton';
import CircularScore from './CircularScore';

export default function ReportHeader({ report, auditId }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase text-nexus">Nexus SEO Auditor</p>
          <h1 className="mt-1 text-3xl font-bold">SEO Audit Report</h1>
          <p className="mt-2 break-all text-sm text-slate-500">{report.url}</p>
          <p className="break-all text-sm text-slate-500">Final URL: {report.finalUrl || 'Not available'}</p>
          <p className="text-sm text-slate-500">Audit date: {formatDate(report.createdAt)}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <CircularScore score={report.overallScore} size={104} />
          <div><p className="text-2xl font-bold">Grade {report.grade || 'NA'}</p><p className="text-sm text-slate-500">{report.summary?.applicableRules || 0}/{report.summary?.totalRules || 0} checks scored</p></div>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        <Metric label="Passed" value={report.summary?.passed} />
        <Metric label="Warnings" value={report.summary?.warnings} />
        <Metric label="Failed" value={report.summary?.failed} />
        <Metric label="Not available" value={report.summary?.notAvailable} />
        <Metric label="Skipped" value={report.summary?.skipped} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2"><PdfExportButton auditId={auditId} /><Link to="/" className="focus-ring inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700"><RefreshCw size={16} /> Re-run audit</Link></div>
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold">{value ?? 0}</p></div>;
}
