import { FileDown } from 'lucide-react';
import { auditApi } from '../../api/auditApi';

export default function PdfExportButton({ auditId }) {
  return <a href={auditApi.pdfUrl(auditId)} className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-ink"><FileDown size={16} /> Export PDF</a>;
}
