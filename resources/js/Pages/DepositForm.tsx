import CustomSelect from '@/Components/CustomSelect';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    CreditCard,
    FileEdit,
    FileText,
    Image as ImageIcon,
    Save,
    Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DepositDetail {
    id: number;
    deposit_id: number;
    denomination: number;
    quantity: number;
    subtotal: number;
}

interface Deposit {
    id: number;
    uuid: string;
    deposit_date: string;
    notes: string | null;
    grand_total: number;
    status: 'draft' | 'completed';
    proof_image_path: string | null;
    bank_account_id: number | null;
    created_at: string;
    details: DepositDetail[];
}

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
}

interface DepositFormProps {
    deposit: Deposit | null;
    bankAccounts?: BankAccount[];
}

// Available Rupiah denominations
const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000];

// Visual colors for Rupiah notes
const DENOM_COLORS: Record<
    number,
    { bg: string; border: string; text: string; labelBg: string }
> = {
    100000: {
        bg: 'bg-red-50 dark:bg-red-950/20',
        border: 'border-red-200 dark:border-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        labelBg: 'bg-red-500',
    },
    50000: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        labelBg: 'bg-blue-500',
    },
    20000: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        labelBg: 'bg-emerald-500',
    },
    10000: {
        bg: 'bg-purple-50 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        labelBg: 'bg-purple-500',
    },
    5000: {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        border: 'border-amber-200 dark:border-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        labelBg: 'bg-amber-500',
    },
    2000: {
        bg: 'bg-zinc-100 dark:bg-zinc-900/40',
        border: 'border-zinc-300 dark:border-zinc-800',
        text: 'text-zinc-700 dark:text-zinc-400',
        labelBg: 'bg-zinc-600',
    },
    1000: {
        bg: 'bg-teal-50 dark:bg-teal-950/20',
        border: 'border-teal-200 dark:border-teal-900/30',
        text: 'text-teal-700 dark:text-teal-400',
        labelBg: 'bg-teal-600',
    },
};

export default function DepositForm({
    deposit,
    bankAccounts = [],
}: DepositFormProps) {
    const isEdit = !!deposit;

    // Initialize state mapping denominations
    const initialDetails = DENOMINATIONS.map((denom) => {
        const existing = deposit?.details?.find(
            (d) => d.denomination === denom,
        );
        return {
            denomination: denom,
            quantity: existing ? existing.quantity : 0,
        };
    });

    const { data, setData, post, processing, errors } = useForm({
        deposit_date: deposit?.deposit_date
            ? new Date(deposit.deposit_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        notes: deposit?.notes || '',
        status: deposit?.status || 'draft',
        proof_image: null as File | null,
        bank_account_id: deposit?.bank_account_id
            ? String(deposit.bank_account_id)
            : '',
        details: initialDetails,
        // Method spoofing for update, since PHP does not parse files natively on PUT/PATCH
        _method: isEdit ? 'POST' : undefined,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [grandTotal, setGrandTotal] = useState(0);
    const [shouldSubmit, setShouldSubmit] = useState(false);

    // Calculate real-time grand total
    useEffect(() => {
        const total = data.details.reduce((sum, item) => {
            return sum + item.quantity * item.denomination;
        }, 0);
        setGrandTotal(total);
    }, [data.details]);

    // Handle form post after state has been successfully updated
    useEffect(() => {
        if (shouldSubmit) {
            setShouldSubmit(false);
            const url = isEdit
                ? route('deposit.update', deposit!.uuid)
                : route('deposit.store');
            post(url, {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    }, [shouldSubmit, deposit, isEdit, post]);

    // Handle quantity changes reactively
    const handleQtyChange = (denomination: number, val: string) => {
        const qty = val === '' ? 0 : Math.max(0, parseInt(val, 10));

        const updatedDetails = data.details.map((item) => {
            if (item.denomination === denomination) {
                return { ...item, quantity: qty };
            }
            return item;
        });

        setData('details', updatedDetails);
    };

    // Handle file input changes with previews
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('proof_image', file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (file.type.startsWith('image/')) {
                    setImagePreview(reader.result as string);
                } else {
                    setImagePreview(null); // Clear image preview for PDF files
                }
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    // Format currency to IDR helper
    const formatIDR = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Submit handler
    const handleSubmit = (status: 'draft' | 'completed') => {
        setData('status', status);
        setShouldSubmit(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('dashboard')}
                        className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        {isEdit
                            ? 'Edit Laporan Setoran'
                            : 'Input Setoran Kas Baru'}
                    </h2>
                </div>
            }
        >
            <Head title={isEdit ? 'Edit Setoran' : 'Input Setoran'} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="grid grid-cols-1 gap-8 lg:grid-cols-12"
                    >
                        {/* LEFT COLUMN: Metadata & Proof Slip Upload */}
                        <div className="space-y-6 lg:col-span-5">
                            {/* General details Card */}
                            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm dark:border-zinc-800">
                                <h3 className="border-b pb-3 text-lg font-semibold text-gray-900 dark:border-zinc-800 dark:text-gray-100">
                                    Informasi Transaksi
                                </h3>

                                {/* Date Input */}
                                <div>
                                    <label
                                        htmlFor="deposit_date"
                                        className="mb-1.5 block flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        Tanggal Setoran
                                    </label>
                                    <input
                                        type="date"
                                        id="deposit_date"
                                        value={data.deposit_date}
                                        onChange={(e) =>
                                            setData(
                                                'deposit_date',
                                                e.target.value,
                                            )
                                        }
                                        className="dark:border-zinc-850 w-full rounded-lg border-zinc-200 text-sm shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:bg-zinc-900 dark:text-gray-100"
                                        required
                                    />
                                    {errors.deposit_date && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.deposit_date}
                                        </p>
                                    )}
                                </div>

                                {/* Bank Account Dropdown */}
                                <div>
                                    <label
                                        htmlFor="bank_account_id"
                                        className="mb-1.5 block flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        Rekening Bank Tujuan
                                    </label>
                                    {bankAccounts.length === 0 ? (
                                        <div className="border-zinc-350 rounded-lg border border-dashed bg-zinc-50/50 p-3.5 text-center dark:border-zinc-800 dark:bg-zinc-950/20">
                                            <p className="text-xs text-muted-foreground">
                                                Belum ada rekening terdaftar.
                                            </p>
                                            <Link
                                                href={route('profile.edit')}
                                                className="mt-1 inline-block text-xs font-bold text-primary hover:underline"
                                            >
                                                Daftarkan rekening di Profil
                                                &rarr;
                                            </Link>
                                        </div>
                                    ) : (
                                        <CustomSelect
                                            value={data.bank_account_id}
                                            onChange={(val) =>
                                                setData('bank_account_id', val)
                                            }
                                            options={bankAccounts}
                                            placeholder="-- Pilih Rekening Bank Tujuan --"
                                            error={errors.bank_account_id}
                                        />
                                    )}
                                    {errors.bank_account_id && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.bank_account_id}
                                        </p>
                                    )}
                                </div>

                                {/* Notes Input */}
                                <div>
                                    <label
                                        htmlFor="notes"
                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Catatan / Keterangan
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={4}
                                        placeholder="Tulis catatan setoran di sini (misal: Setoran sisa kas acara mingguan)..."
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        className="dark:border-zinc-850 w-full rounded-lg border-zinc-200 text-sm shadow-sm placeholder:text-zinc-400 focus:border-primary focus:ring focus:ring-primary/20 dark:bg-zinc-900 dark:text-gray-100 dark:placeholder:text-zinc-500"
                                    />
                                    {errors.notes && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Proof Image Card */}
                            <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm dark:border-zinc-800">
                                <div className="flex items-center justify-between border-b pb-3 dark:border-zinc-800">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Bukti Slip Setoran
                                    </h3>
                                    {deposit?.proof_image_path && (
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                                            Tersimpan
                                        </span>
                                    )}
                                </div>

                                {/* File Input Wrapper */}
                                <div className="space-y-4">
                                    <div className="relative rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center transition-all hover:border-primary dark:border-zinc-800 dark:bg-zinc-950/20 dark:hover:border-primary/55">
                                        <input
                                            type="file"
                                            id="proof_image"
                                            accept=".jpeg,.jpg,.png,.pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        />

                                        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-60" />

                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            Klik untuk upload slip bank
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Format: JPG, JPEG, PNG, atau PDF
                                            (Maks. 5MB)
                                        </p>
                                    </div>

                                    {errors.proof_image && (
                                        <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.proof_image}
                                        </p>
                                    )}

                                    {/* Preview container */}
                                    {imagePreview ? (
                                        <div className="relative overflow-hidden rounded-lg border bg-zinc-100 p-2 dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded bg-black">
                                                <img
                                                    src={imagePreview}
                                                    alt="Slip preview"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                            <p className="mt-2 truncate text-center text-xs font-medium text-muted-foreground">
                                                {data.proof_image?.name}
                                            </p>
                                        </div>
                                    ) : data.proof_image &&
                                      data.proof_image.type ===
                                          'application/pdf' ? (
                                        <div className="flex items-center gap-3 rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="rounded bg-red-500/10 p-2.5 text-red-500">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {data.proof_image.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(
                                                        data.proof_image.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{' '}
                                                    MB • File PDF
                                                </p>
                                            </div>
                                        </div>
                                    ) : isEdit && deposit?.proof_image_path ? (
                                        <div className="rounded-lg border bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                                            <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                <ImageIcon className="h-3.5 w-3.5" />
                                                File bukti saat ini:
                                            </p>
                                            <a
                                                href={route(
                                                    'deposit.proof',
                                                    deposit.uuid,
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                Lihat Bukti Lampiran
                                            </a>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Interactive Cash Calculator */}
                        <div className="space-y-6 lg:col-span-7">
                            {/* Cash counter card */}
                            <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm dark:border-zinc-800">
                                <div className="flex items-center justify-between border-b pb-3 dark:border-zinc-800">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        <FileEdit className="h-5 w-5 text-primary" />
                                        Denominasi Uang Kertas & Logam
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        Masukkan jumlah lembar/keping uang
                                    </span>
                                </div>

                                {/* Denominations List */}
                                <div className="space-y-3">
                                    {data.details.map((item) => {
                                        const denomConfig = DENOM_COLORS[
                                            item.denomination
                                        ] || {
                                            bg: 'bg-zinc-50 dark:bg-zinc-900',
                                            border: 'border-zinc-200 dark:border-zinc-800',
                                            text: 'text-zinc-700 dark:text-zinc-300',
                                            labelBg: 'bg-zinc-500',
                                        };

                                        return (
                                            <div
                                                key={item.denomination}
                                                className={`flex flex-col items-start justify-between rounded-xl border p-4 transition-all sm:flex-row sm:items-center ${denomConfig.bg} ${denomConfig.border}`}
                                            >
                                                {/* Left: Denomination Title */}
                                                <div className="flex w-full items-center gap-3 sm:w-1/3">
                                                    <span
                                                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white ${denomConfig.labelBg}`}
                                                    >
                                                        Rp{' '}
                                                        {item.denomination >=
                                                        1000
                                                            ? `${item.denomination / 1000}K`
                                                            : item.denomination}
                                                    </span>
                                                    <span
                                                        className={`text-base font-bold tracking-tight ${denomConfig.text}`}
                                                    >
                                                        {formatIDR(
                                                            item.denomination,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Center: Input field */}
                                                <div className="mt-3 flex w-full items-center gap-2 sm:mt-0 sm:w-1/3">
                                                    <span className="w-12 text-xs text-muted-foreground sm:text-right">
                                                        Qty:
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            item.quantity === 0
                                                                ? ''
                                                                : item.quantity
                                                        }
                                                        placeholder="0"
                                                        onChange={(e) =>
                                                            handleQtyChange(
                                                                item.denomination,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-lg border-zinc-200 py-1.5 text-center text-sm font-semibold shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                                    />
                                                </div>

                                                {/* Right: Subtotal */}
                                                <div className="mt-3 w-full text-right sm:mt-0 sm:w-1/3">
                                                    <span className="block text-xs text-muted-foreground sm:hidden">
                                                        Subtotal:
                                                    </span>
                                                    <span className="text-base font-extrabold text-gray-950 dark:text-white">
                                                        {formatIDR(
                                                            item.quantity *
                                                                item.denomination,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Grand Total Section */}
                                <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Grand Total Pelaporan
                                        </p>
                                        <p className="mt-1 text-3xl font-black text-gray-950 dark:text-white">
                                            {formatIDR(grandTotal)}
                                        </p>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex w-full gap-3 sm:w-auto">
                                        {/* Save Draft */}
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() =>
                                                handleSubmit('draft')
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 transition-all hover:bg-zinc-50 active:scale-95 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-zinc-800 sm:flex-none"
                                        >
                                            <Save className="h-4 w-4" />
                                            Simpan Draf
                                        </button>

                                        {/* Complete/Finalize */}
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() =>
                                                handleSubmit('completed')
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/10 transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50 sm:flex-none"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            Selesaikan Setoran
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
