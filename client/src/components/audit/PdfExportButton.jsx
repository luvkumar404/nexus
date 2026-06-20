import { FileDown } from 'lucide-react';
import { auditApi } from '../../api/auditApi';

export default function PdfExportButton({ auditId }) {
  return <a href={auditApi.pdfUrl(auditId)} className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#087f75] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#076b63]"><FileDown size={16} /> Export PDF</a>;
}
