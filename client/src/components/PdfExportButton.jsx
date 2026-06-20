import { FileDown } from 'lucide-react';
import { auditApi } from '../api/auditApi';

export default function PdfExportButton({ auditId, disabled }) {
  return (
    <a href={disabled ? undefined : auditApi.pdfUrl(auditId)} className={`focus-ring inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${disabled ? 'pointer-events-none bg-slate-200 text-slate-500' : 'bg-ink text-white dark:bg-white dark:text-ink'}`}>
      <FileDown size={16} /> Export PDF
    </a>
  );
}
