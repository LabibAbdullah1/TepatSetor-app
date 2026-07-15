import ConfirmModal from '@/Components/ConfirmModal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    DollarSign,
    Edit2,
    Eye,
    FileClock,
    FileText,
    Plus,
    Share2,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface DepositDetail {
    id: number;
    deposit_id: number;
    denomination: number;
    quantity: number;
    subtotal: number;
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
    grand_total: number;
    status: 'draft' | 'completed';
    proof_image_path: string | null;
    bank_account?: BankAccount | null;
    created_at: string;
    details: DepositDetail[];
}

interface DashboardProps {
    deposits: Deposit[];
}

export default function Dashboard({ deposits }: DashboardProps) {
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
        const message = `Berikut laporan setoran kas tanggal ${dateStr} dengan total ${totalStr}. Status: ${statusText}.`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
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
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Sistem Pelaporan Setoran Kas
                    </h2>
                    <Link
                        href={route('deposit.create')}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Input Setoran Baru
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard Setoran" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Total Money Card */}
                        <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Total Uang Disetor
                                    </p>
                                    <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {formatIDR(totalDeposited)}
                                    </h3>
                                </div>
                                <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-500">
                                    <DollarSign className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                <span className="mr-1 inline-flex items-center font-semibold text-emerald-500">
                                    {completedCount}
                                </span>
                                setoran dengan status selesai
                            </div>
                        </div>

                        {/* Completed Status Card */}
                        <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Setoran Selesai (Completed)
                                    </p>
                                    <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {completedCount}
                                    </h3>
                                </div>
                                <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                Bukti setoran slip bank terverifikasi aman
                            </div>
                        </div>

                        {/* Draft Status Card */}
                        <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Setoran Draf (Draft)
                                    </p>
                                    <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                                        {draftCount}
                                    </h3>
                                </div>
                                <div className="rounded-lg bg-amber-500/10 p-3 text-amber-500">
                                    <FileClock className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-muted-foreground">
                                Butuh bukti slip setoran untuk diselesaikan
                            </div>
                        </div>
                    </div>

                    {/* Deposit Listing */}
                    <div className="overflow-hidden rounded-xl border bg-card shadow-sm dark:border-zinc-800">
                        <div className="flex items-center justify-between border-b p-6 dark:border-zinc-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Riwayat Setoran Kas
                            </h3>
                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                {deposits.length} Data ditemukan
                            </span>
                        </div>

                        {deposits.length === 0 ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
                                <h4 className="mb-1 text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Belum Ada Setoran Kas
                                </h4>
                                <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
                                    Anda belum memasukkan data setoran. Silakan
                                    klik tombol di bawah untuk menginput setoran
                                    baru.
                                </p>
                                <Link
                                    href={route('deposit.create')}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                                >
                                    <Plus className="h-4 w-4" />
                                    Input Setoran Baru
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900/50">
                                            <th className="px-6 py-4">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-4">
                                                Total Setoran
                                            </th>
                                            <th className="px-6 py-4">
                                                Rekening Tujuan
                                            </th>
                                            <th className="px-6 py-4">
                                                Status
                                            </th>
                                            <th className="px-6 py-4">
                                                Catatan
                                            </th>
                                            <th className="px-6 py-4">
                                                Lampiran
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                                        {deposits.map((deposit) => (
                                            <tr
                                                key={deposit.id}
                                                className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {formatDate(
                                                            deposit.deposit_date,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 font-bold text-gray-950 dark:text-white">
                                                    {formatIDR(
                                                        deposit.grand_total,
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {deposit.bank_account ? (
                                                        <div className="space-y-0.5">
                                                            <div className="inline-block rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                                {
                                                                    deposit
                                                                        .bank_account
                                                                        .bank_name
                                                                }
                                                            </div>
                                                            <div className="font-mono text-xs text-muted-foreground">
                                                                {
                                                                    deposit
                                                                        .bank_account
                                                                        .account_number
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-405 text-xs italic dark:text-zinc-500">
                                                            Belum dipilih
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {deposit.status ===
                                                    'completed' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                            Selesai
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                                                            Draf
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="max-w-xs truncate px-6 py-4 text-muted-foreground">
                                                    {deposit.notes || '-'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {deposit.proof_image_path ? (
                                                        <a
                                                            href={route(
                                                                'deposit.proof',
                                                                deposit.uuid,
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Lihat Slip
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs italic text-muted-foreground">
                                                            Tidak ada
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Share WA */}
                                                        <a
                                                            href={getWhatsAppUrl(
                                                                deposit,
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
                                                            title="Bagikan ke WhatsApp"
                                                        >
                                                            <Share2 className="h-4 w-4" />
                                                        </a>

                                                        {/* PDF Export */}
                                                        <a
                                                            href={route(
                                                                'deposit.pdf',
                                                                deposit.uuid,
                                                            )}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                                                            title="Unduh PDF"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </a>

                                                        {/* Edit */}
                                                        <Link
                                                            href={route(
                                                                'deposit.edit',
                                                                deposit.uuid,
                                                            )}
                                                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-primary dark:hover:bg-zinc-800"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Link>

                                                        {/* Delete */}
                                                        <button
                                                            onClick={() =>
                                                                setConfirmDeleteId(
                                                                    deposit.uuid,
                                                                )
                                                            }
                                                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-destructive dark:hover:bg-zinc-800"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <ConfirmModal
                        show={confirmDeleteId !== null}
                        title="Hapus Laporan Setoran"
                        message="Apakah Anda yakin ingin menghapus laporan setoran kas ini? Seluruh rincian pecahan uang kas yang diinputkan akan dihapus secara permanen dari database."
                        onConfirm={handleConfirmDelete}
                        onClose={() => setConfirmDeleteId(null)}
                        processing={isDeleting}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
