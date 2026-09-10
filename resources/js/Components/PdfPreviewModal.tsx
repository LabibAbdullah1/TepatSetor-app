import { Download, ExternalLink, X } from 'lucide-react';

interface PdfPreviewModalProps {
    show: boolean;
    pdfUrl: string | null;
    title?: string;
    onClose: () => void;
}

export default function PdfPreviewModal({
    show,
    pdfUrl,
    title = 'Pratinjau Laporan Setoran PDF',
    onClose,
}: PdfPreviewModalProps) {
    if (!show || !pdfUrl) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
            <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-card shadow-2xl dark:border-zinc-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b px-6 py-4 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Buka di Tab Baru
                        </a>
                        <a
                            href={pdfUrl}
                            download
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Unduh PDF
                        </a>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* PDF Viewer Frame */}
                <div className="relative flex-1 bg-zinc-900">
                    <iframe
                        src={pdfUrl}
                        className="h-full w-full border-0"
                        title="PDF Preview"
                    />
                </div>
            </div>
        </div>
    );
}
