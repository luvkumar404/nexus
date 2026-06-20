import { Gauge, Menu, Moon, RefreshCw, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { formatDate } from '../../utils/formatDate';
import PdfExportButton from './PdfExportButton';

export default function ReportHeader({ report, auditId, sectionTitle, onOpenNavigation }) {
  const [dark, setDark] = useState(localStorage.getItem('nexus_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('nexus_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe5ec] bg-white text-[#111827]">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button type="button" onClick={onOpenNavigation} className="focus-ring mt-0.5 rounded-md border border-[#cbd5e1] p-2 hover:bg-[#f8fafc] lg:hidden" aria-label="Open audit navigation"><Menu size={18} /></button>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-[#087f75]">SEO Audit Report</p>
            <h1 className="break-words text-xl font-bold text-[#111827] sm:text-2xl">{sectionTitle}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#526176]">
              <span className="max-w-full break-all">{report.url}</span>
              <span>{formatDate(report.createdAt)}</span>
              <span className="inline-flex items-center gap-1.5 capitalize"><span className="h-2 w-2 rounded-full bg-emerald-500" />{report.status}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-11 lg:pl-0">
          <PdfExportButton auditId={auditId} />
          <Link to="/" className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-sm font-semibold transition hover:bg-[#f8fafc]"><RefreshCw size={16} /> Re-run audit</Link>
          <Link to="/dashboard" className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3 py-2 text-sm font-semibold transition hover:bg-[#f8fafc]"><Gauge size={16} /> Dashboard</Link>
          <button type="button" onClick={() => setDark((value) => !value)} className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-[#cbd5e1] bg-white transition hover:bg-[#f8fafc]" aria-label="Toggle theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
      <div className="border-t border-[#dfe5ec] px-4 py-2 text-xs text-[#526176] sm:px-6">
        <span className="break-all">Final URL: {report.finalUrl || 'Not available'}</span>
      </div>
    </header>
  );
}
