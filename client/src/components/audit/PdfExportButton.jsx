import { useState } from 'react';
import { FileDown, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { auditApi } from '../../api/auditApi';

export default function PdfExportButton({ auditId }) {
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    if (!auditId || downloading) return;

    setDownloading(true);
    try {
      const response = await auditApi.downloadPdf(auditId);
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/pdf')) throw new Error('The server did not return a PDF');

      const disposition = response.headers['content-disposition'] || '';
      const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] || `nexus-seo-audit-${auditId}.pdf`;
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Unable to download PDF');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={downloadPdf}
      disabled={downloading || !auditId}
      className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#087f75] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#076b63] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {downloading ? <LoaderCircle className="animate-spin" size={16} /> : <FileDown size={16} />}
      {downloading ? 'Preparing PDF...' : 'Export PDF'}
    </button>
  );
}
