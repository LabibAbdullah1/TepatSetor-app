import ConfirmModal from '@/Components/ConfirmModal';
import PdfPreviewModal from '@/Components/PdfPreviewModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Copy,
    Check,
    DollarSign,
    Edit2,
    Eye,
    FileClock,
    FileText,
    Layers,
    Plus,
    Share2,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface DepositDetail {
    id: number;
    deposit_id: number;
    denomination: number;
    quantity: number;
    subtotal: number;
}

interface DepositCategoryItem {
    id: number;
    deposit_id: number;
    category_name: string;
    amount: number;
}

interface Signer {
    name: string;
    title: string;
}

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
}

interface Deposit {
    id: number;
    uuid: string;
    deposit_date: string;
    notes: string | null;
    signers?: Signer[] | null;
    grand_total: number;
    status: 'draft' | 'completed';
    proof_image_path: string | null;
    bank_account?: BankAccount | null;
    categories?: DepositCategoryItem[];
    created_at: string;
    details: DepositDetail[];
}

interface DashboardProps {
    deposits: Deposit[];
}

export default function Dashboard({ deposits }: DashboardProps) {
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
    const [copiedUuid, setCopiedUuid] = useState<string | null>(null);

    // Format currency to IDR
    const formatIDR = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format Date to ID locale
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Metrics calculations
    const totalDeposited = deposits
        .filter((d) => d.status === 'completed')
        .reduce((sum, d) => sum + d.grand_total, 0);

    const completedCount = deposits.filter(
        (d) => d.status === 'completed',
    ).length;
    const draftCount = deposits.filter((d) => d.status === 'draft').length;

    // Helper for WhatsApp Share URL
    const getWhatsAppUrl = (deposit: Deposit) => {
        const dateStr = formatDate(deposit.deposit_date);
        const totalStr = formatIDR(deposit.grand_total);
        const statusText = deposit.status === 'completed' ? 'Selesai' : 'Draf';
        
        let text = `*LAPORAN SETORAN KAS*\nTanggal: ${dateStr}\nTotal Setoran: ${totalStr}\nStatus: ${statusText}\n`;
        if (deposit.bank_account) {
            text += `Tujuan: ${deposit.bank_account.bank_name} - ${deposit.bank_account.account_number}\n`;
        }
        if (deposit.categories && deposit.categories.length > 0) {
            text += `\n*Rincian Kategori:*\n`;
            deposit.categories.forEach((cat) => {
                text += `- ${cat.category_name}: ${formatIDR(cat.amount)}\n`;
            });
        }
        return `https://wa.me/?text=${encodeURIComponent(text)}`;
    };

    // Quick Copy Text to Clipboard
    const handleCopyRecap = (deposit: Deposit) => {
        const dateStr = formatDate(deposit.deposit_date);
        const totalStr = formatIDR(deposit.grand_total);
        const statusText = deposit.status === 'completed' ? 'Selesai' : 'Draf';
        
        let text = `*LAPORAN SETORAN KAS*\nTanggal: ${dateStr}\nTotal Setoran: ${totalStr}\nStatus: ${statusText}\n`;
        if (deposit.bank_account) {
            text += `Tujuan: ${deposit.bank_account.bank_name} - ${deposit.bank_account.account_number} (a.n. ${deposit.bank_account.account_holder_name})\n`;
        }
        if (deposit.categories && deposit.categories.length > 0) {
            text += `\n*Rincian Peruntukan Kategori:*\n`;
            deposit.categories.forEach((cat) => {
                text += `• ${cat.category_name}: ${formatIDR(cat.amount)}\n`;
            });
        }
        if (deposit.notes) {
            text += `\nCatatan: ${deposit.notes}`;
        }

        navigator.clipboard.writeText(text);
        setCopiedUuid(deposit.uuid);
        setTimeout(() => setCopiedUuid(null), 2500);
    };

    // Delete modal state and handlers
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = () => {
        if (!confirmDeleteId) return;
        setIsDeleting(true);
        router.delete(route('deposit.destroy', confirmDeleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setConfirmDeleteId(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Sistem Pelaporan Setoran Kas
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Kelola rincian pecahan uang kas, penanda tangan, dan cetak PDF laporan setoran.
                        </p>
                    </div>
                    <Link
                        href={route('deposit.create')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Input Setoran Baru
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard Setoran" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 px-3 sm:px-6 lg:px-8">
                    {/* Compact Metrics Grid */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Total Money Card */}
                        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Total Uang Disetor (Selesai)
                                    </p>
                                    <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {formatIDR(totalDeposited)}
                                    </h3>
                                </div>
                                <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-2 flex items-center text-[11px] text-muted-foreground">
                                <span className="mr-1 inline-flex items-center font-bold text-emerald-500">
                                    {completedCount}
                                </span>
                                setoran terverifikasi
                            </div>
                        </div>

                        {/* Completed Status Card */}
                        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Setoran Selesai (Completed)
                                    </p>
                                    <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {completedCount}
                                    </h3>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-500">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-2 text-[11px] text-muted-foreground">
                                File PDF & slip bank siap dicetak
                            </div>
                        </div>

                        {/* Draft Status Card */}
                        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                        Setoran Draf (Draft)
                                    </p>
                                    <h3 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {draftCount}
                                    </h3>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                                    <FileClock className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="mt-2 text-[11px] text-muted-foreground">
                                Menunggu konfirmasi & bukti lampiran
                            </div>
                        </div>
                    </div>

                    {/* Deposit Listing Table */}
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm dark:border-zinc-800">
                        <div className="flex items-center justify-between border-b px-4 py-3 dark:border-zinc-800">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                Riwayat Setoran Kas
                            </h3>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                {deposits.length} Data
                            </span>
                        </div>

                        {deposits.length === 0 ? (
                            <div className="p-10 text-center">
                                <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50" />
                                <h4 className="mb-1 text-base font-medium text-gray-900 dark:text-gray-100">
                                    Belum Ada Setoran Kas
                                </h4>
                                <p className="mx-auto mb-4 max-w-sm text-xs text-muted-foreground">
                                    Anda belum memasukkan data setoran. Klik tombol di bawah untuk menginput setoran baru.
                                </p>
                                <Link
                                    href={route('deposit.create')}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Input Setoran Baru
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b bg-zinc-50/70 font-bold uppercase tracking-wider text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900/50">
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Total Setor</th>
                                            <th className="px-4 py-3">Rincian / Rekening</th>
                                            <th className="px-4 py-3">Penanda Tangan</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Lampiran</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
                                        {deposits.map((deposit) => {
                                            const activeSignersCount = deposit.signers ? deposit.signers.filter(s => s.name || s.title).length : 0;
                                            const categoryCount = deposit.categories ? deposit.categories.length : 0;

                                            return (
                                                <tr
                                                    key={deposit.id}
                                                    className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                                                >
                                                    {/* Date */}
                                                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {formatDate(deposit.deposit_date)}
                                                        </div>
                                                    </td>

                                                    {/* Grand Total */}
                                                    <td className="whitespace-nowrap px-4 py-3 font-black text-gray-950 dark:text-white">
                                                        {formatIDR(deposit.grand_total)}
                                                    </td>

                                                    {/* Rekening & Category Badges */}
                                                    <td className="px-4 py-3">
                                                        <div className="space-y-1">
                                                            {deposit.bank_account ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                                        {deposit.bank_account.bank_name}
                                                                    </span>
                                                                    <span className="font-mono text-[10px] text-muted-foreground">
                                                                        {deposit.bank_account.account_number}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] italic text-muted-foreground">
                                                                    Kas Tunai
                                                                </span>
                                                            )}

                                                            {categoryCount > 0 && (
                                                                <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                                                    <Layers className="h-3 w-3" />
                                                                    {categoryCount} Kategori Rincian
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Signers count badge */}
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        {activeSignersCount > 0 ? (
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                                                                <Users className="h-3 w-3" />
                                                                {activeSignersCount} Orang
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] italic text-muted-foreground">
                                                                Standard
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        {deposit.status === 'completed' ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                                Selesai
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                                                Draf
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Proof Attachment */}
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        {deposit.proof_image_path ? (
                                                            <a
                                                                href={route('deposit.proof', deposit.uuid)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                Lihat Slip
                                                            </a>
                                                        ) : (
                                                            <span className="text-[10px] italic text-muted-foreground">
                                                                Belum ada
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {/* Copy Recap */}
                                                            <button
                                                                onClick={() => handleCopyRecap(deposit)}
                                                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                                                title="Salin Rekap Setoran"
                                                            >
                                                                {copiedUuid === deposit.uuid ? (
                                                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                                ) : (
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>

                                                            {/* Share WA */}
                                                            <a
                                                                href={getWhatsAppUrl(deposit)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
                                                                title="Bagi via WhatsApp"
                                                            >
                                                                <Share2 className="h-3.5 w-3.5" />
                                                            </a>

                                                            {/* PDF Live Preview Modal Button */}
                                                            <button
                                                                onClick={() => setPreviewPdfUrl(route('deposit.pdf', deposit.uuid))}
                                                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                                                                title="Pratinjau / Cetak PDF"
                                                            >
                                                                <FileText className="h-3.5 w-3.5" />
                                                            </button>

                                                            {/* Edit */}
                                                            <Link
                                                                href={route('deposit.edit', deposit.uuid)}
                                                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                                                                title="Edit Setoran"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </Link>

                                                            {/* Delete */}
                                                            <button
                                                                onClick={() => setConfirmDeleteId(deposit.uuid)}
                                                                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-destructive dark:hover:bg-zinc-800"
                                                                title="Hapus Setoran"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* PDF Live Preview Modal */}
                    <PdfPreviewModal
                        show={previewPdfUrl !== null}
                        pdfUrl={previewPdfUrl}
                        onClose={() => setPreviewPdfUrl(null)}
                    />

                    {/* Delete Confirmation Modal */}
                    <ConfirmModal
                        show={confirmDeleteId !== null}
                        title="Hapus Laporan Setoran"
                        message="Apakah Anda yakin ingin menghapus laporan setoran kas ini? Seluruh rincian pecahan uang dan kategori setoran akan dihapus secara permanen."
                        onConfirm={handleConfirmDelete}
                        onClose={() => setConfirmDeleteId(null)}
                        processing={isDeleting}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
