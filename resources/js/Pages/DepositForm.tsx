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
    Plus,
    Save,
    Trash2,
    Upload,
    UserCheck,
    Users,
    Layers,
    Check,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DepositDetail {
    id?: number;
    deposit_id?: number;
    denomination: number;
    quantity: number;
    subtotal: number;
}

interface DepositCategoryItem {
    id?: number;
    category_name: string;
    amount: number | string;
}

interface Signer {
    name: string;
    title: string;
}

interface Deposit {
    id: number;
    uuid: string;
    deposit_date: string;
    notes: string | null;
    signers: Signer[] | null;
    grand_total: number;
    status: 'draft' | 'completed';
    proof_image_path: string | null;
    bank_account_id: number | null;
    created_at: string;
    details: DepositDetail[];
    categories?: DepositCategoryItem[];
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
    defaultSigners?: Signer[] | null;
}

// Available Rupiah denominations
const DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000];

// Visual colors for Rupiah notes
const DENOM_COLORS: Record<
    number,
    { bg: string; border: string; text: string; labelBg: string }
> = {
    100000: {
        bg: 'bg-red-50/70 dark:bg-red-950/20',
        border: 'border-red-200 dark:border-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        labelBg: 'bg-red-500',
    },
    50000: {
        bg: 'bg-blue-50/70 dark:bg-blue-950/20',
        border: 'border-blue-200 dark:border-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        labelBg: 'bg-blue-500',
    },
    20000: {
        bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
        border: 'border-emerald-200 dark:border-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        labelBg: 'bg-emerald-500',
    },
    10000: {
        bg: 'bg-purple-50/70 dark:bg-purple-950/20',
        border: 'border-purple-200 dark:border-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
        labelBg: 'bg-purple-500',
    },
    5000: {
        bg: 'bg-amber-50/70 dark:bg-amber-950/20',
        border: 'border-amber-200 dark:border-amber-900/30',
        text: 'text-amber-700 dark:text-amber-400',
        labelBg: 'bg-amber-500',
    },
    2000: {
        bg: 'bg-zinc-100/70 dark:bg-zinc-900/40',
        border: 'border-zinc-300 dark:border-zinc-800',
        text: 'text-zinc-700 dark:text-zinc-400',
        labelBg: 'bg-zinc-600',
    },
    1000: {
        bg: 'bg-teal-50/70 dark:bg-teal-950/20',
        border: 'border-teal-200 dark:border-teal-900/30',
        text: 'text-teal-700 dark:text-teal-400',
        labelBg: 'bg-teal-600',
    },
};

const formatNumberWithDots = (val: number | string): string => {
    if (val === '' || val === 0 || val === '0' || val === null || val === undefined) return '';
    const rawDigits = String(val).replace(/\D/g, '');
    return rawDigits ? rawDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
};

export default function DepositForm({
    deposit,
    bankAccounts = [],
    defaultSigners = [],
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

    // Initialize signers
    const getInitialSigners = (): Signer[] => {
        if (deposit?.signers && deposit.signers.length > 0) {
            return [
                { name: deposit.signers[0]?.name || '', title: deposit.signers[0]?.title || 'Ketua Umum' },
                { name: deposit.signers[1]?.name || '', title: deposit.signers[1]?.title || 'Bendahara' },
                { name: deposit.signers[2]?.name || '', title: deposit.signers[2]?.title || 'Petugas Kas' },
            ];
        }
        if (defaultSigners && defaultSigners.length > 0) {
            return [
                { name: defaultSigners[0]?.name || '', title: defaultSigners[0]?.title || 'Ketua Umum' },
                { name: defaultSigners[1]?.name || '', title: defaultSigners[1]?.title || 'Bendahara' },
                { name: defaultSigners[2]?.name || '', title: defaultSigners[2]?.title || 'Petugas Kas' },
            ];
        }
        return [
            { name: '', title: 'Ketua Umum' },
            { name: '', title: 'Bendahara' },
            { name: '', title: 'Petugas Kas' },
        ];
    };

    const initialSignerCount = deposit?.signers
        ? Math.max(2, deposit.signers.length)
        : defaultSigners && defaultSigners.length >= 3
        ? 3
        : 2;

    const [signerCount, setSignerCount] = useState<number>(initialSignerCount);

    // Initialize categories
    const getInitialCategories = (): DepositCategoryItem[] => {
        if (deposit?.categories && deposit.categories.length > 0) {
            return deposit.categories.map((c) => ({
                category_name: c.category_name,
                amount: c.amount,
            }));
        }
        return [];
    };

    const { data, setData, post, transform, processing, errors } = useForm({
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
        signers: getInitialSigners(),
        categories: getInitialCategories(),
        _method: isEdit ? 'POST' : undefined,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [grandTotal, setGrandTotal] = useState(0);
    const [categoryTotal, setCategoryTotal] = useState(0);
    const [shouldSubmit, setShouldSubmit] = useState(false);

    // Calculate real-time grand total
    useEffect(() => {
        const total = data.details.reduce((sum, item) => {
            return sum + item.quantity * item.denomination;
        }, 0);
        setGrandTotal(total);
    }, [data.details]);

    // Calculate real-time category total
    useEffect(() => {
        const total = data.categories.reduce((sum, item) => {
            const amt = typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount;
            return sum + (item.category_name.trim() !== '' ? amt : 0);
        }, 0);
        setCategoryTotal(total);
    }, [data.categories]);

    // Handle form post after state has been successfully updated
    useEffect(() => {
        if (shouldSubmit) {
            setShouldSubmit(false);
            const url = isEdit
                ? route('deposit.update', deposit!.uuid)
                : route('deposit.store');

            transform((data) => ({
                ...data,
                signers: data.signers.slice(0, signerCount),
                categories: data.categories.filter(
                    (c) => c.category_name.trim() !== '' && Number(c.amount) > 0,
                ),
            }));

            post(url, {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    }, [shouldSubmit, deposit, isEdit, post, signerCount, transform]);

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

    // Category Handlers
    const handleAddCategory = () => {
        setData('categories', [
            ...data.categories,
            { category_name: '', amount: 0 },
        ]);
    };

    const handleRemoveCategory = (index: number) => {
        const updated = data.categories.filter((_, idx) => idx !== index);
        setData('categories', updated);
    };

    const handleCategoryChange = (
        index: number,
        field: 'category_name' | 'amount',
        val: string | number,
    ) => {
        const updated = [...data.categories];
        updated[index] = { ...updated[index], [field]: val };
        setData('categories', updated);
    };

    // Signers Handler
    const handleSignerChange = (
        index: number,
        field: 'name' | 'title',
        val: string,
    ) => {
        const updated = [...data.signers];
        updated[index] = { ...updated[index], [field]: val };
        setData('signers', updated);
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
                    setImagePreview(null);
                }
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    // Format currency helper
    const formatIDR = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Check if category is used and matches grand total
    const hasCategories = data.categories.some(
        (c) => c.category_name.trim() !== '' || Number(c.amount) > 0,
    );
    const isCategoryMatching = categoryTotal === grandTotal;
    const categoryDifference = grandTotal - categoryTotal;

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
                        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        {isEdit
                            ? 'Edit Laporan Setoran Kas'
                            : 'Input Setoran Kas Baru'}
                    </h2>
                </div>
            }
        >
            <Head title={isEdit ? 'Edit Setoran' : 'Input Setoran'} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
                    >
                        {/* LEFT COLUMN: Metadata, Signers & Breakdown Kategori */}
                        <div className="space-y-5 lg:col-span-5">
                            {/* General Details Card */}
                            <div className="space-y-3.5 rounded-xl border bg-card p-4 shadow-sm dark:border-zinc-800">
                                <h3 className="border-b pb-2 text-base font-bold text-gray-900 dark:border-zinc-800 dark:text-gray-100">
                                    Informasi Transaksi
                                </h3>

                                {/* Date Input */}
                                <div>
                                    <label
                                        htmlFor="deposit_date"
                                        className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
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
                                        className="w-full rounded-lg border-zinc-200 py-1.5 text-xs shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                        required
                                    />
                                    {errors.deposit_date && (
                                        <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.deposit_date}
                                        </p>
                                    )}
                                </div>

                                {/* Bank Account Dropdown */}
                                <div>
                                    <label
                                        htmlFor="bank_account_id"
                                        className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                        Rekening Bank Tujuan
                                    </label>
                                    {bankAccounts.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-950/20">
                                            <p className="text-[11px] text-muted-foreground">
                                                Belum ada rekening terdaftar.
                                            </p>
                                            <Link
                                                href={route('profile.edit')}
                                                className="mt-0.5 inline-block text-xs font-bold text-primary hover:underline"
                                            >
                                                Daftarkan di Profil &rarr;
                                            </Link>
                                        </div>
                                    ) : (
                                        <CustomSelect
                                            value={data.bank_account_id}
                                            onChange={(val) =>
                                                setData('bank_account_id', val)
                                            }
                                            options={bankAccounts}
                                            placeholder="-- Pilih Rekening Bank --"
                                            error={errors.bank_account_id}
                                        />
                                    )}
                                </div>

                                {/* Notes Input */}
                                <div>
                                    <label
                                        htmlFor="notes"
                                        className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        Catatan / Keterangan Uang
                                    </label>
                                    <textarea
                                        id="notes"
                                        rows={2}
                                        placeholder="Tulis catatan ringkas setoran..."
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData('notes', e.target.value)
                                        }
                                        className="w-full rounded-lg border-zinc-200 py-1.5 text-xs shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                    />
                                </div>
                            </div>

                            {/* FEATURE 1: PENANDA TANGAN (SIGNERS) CARD */}
                            <div className="space-y-3.5 rounded-xl border bg-card p-4 shadow-sm dark:border-zinc-800">
                                <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                                    <h3 className="flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-gray-100">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        Penanda Tangan Cetak PDF
                                    </h3>
                                    {/* 2 or 3 toggle */}
                                    <div className="flex items-center rounded-lg border bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
                                        <button
                                            type="button"
                                            onClick={() => setSignerCount(2)}
                                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                                                signerCount === 2
                                                    ? 'bg-white text-gray-900 shadow dark:bg-zinc-800 dark:text-gray-100'
                                                    : 'text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                        >
                                            2 Orang
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSignerCount(3)}
                                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all ${
                                                signerCount === 3
                                                    ? 'bg-white text-gray-900 shadow dark:bg-zinc-800 dark:text-gray-100'
                                                    : 'text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100'
                                            }`}
                                        >
                                            3 Orang
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[0, 1, 2].slice(0, signerCount).map((idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-12 gap-2 rounded-lg border bg-zinc-50/40 p-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/30"
                                        >
                                            <div className="col-span-5">
                                                <label className="mb-0.5 block text-[10px] font-bold uppercase text-muted-foreground">
                                                    Jabatan #{idx + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Jabatan"
                                                    value={data.signers[idx]?.title || ''}
                                                    onChange={(e) =>
                                                        handleSignerChange(
                                                            idx,
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border-zinc-200 px-2 py-1 text-xs shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                                />
                                            </div>
                                            <div className="col-span-7">
                                                <label className="mb-0.5 block text-[10px] font-bold uppercase text-muted-foreground">
                                                    Nama Penanda Tangan
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Nama Lengkap"
                                                    value={data.signers[idx]?.name || ''}
                                                    onChange={(e) =>
                                                        handleSignerChange(
                                                            idx,
                                                            'name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-md border-zinc-200 px-2 py-1 text-xs font-semibold shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FEATURE 2: KETERANGAN OPSIONAL (BREAKDOWN KATEGORI SETORAN) */}
                            <div className="space-y-3.5 rounded-xl border bg-card p-4 shadow-sm dark:border-zinc-800">
                                <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                                    <div>
                                        <h3 className="flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-gray-100">
                                            <Layers className="h-4 w-4 text-primary" />
                                            Breakdown Kategori Setoran (Opsional)
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground">
                                            Rincian sumber uang (misal: Infaq Jumat, Tiang Masjid)
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddCategory}
                                        className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/20"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Tambah
                                    </button>
                                </div>

                                {data.categories.length === 0 ? (
                                    <p className="py-2 text-center text-xs italic text-muted-foreground">
                                        Belum ada rincian kategori opsional. Klik "+ Tambah" jika setoran terdiri dari beberapa peruntukan.
                                    </p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {data.categories.map((cat, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Nama Kategori (misal: Infaq Jumat)"
                                                    value={cat.category_name}
                                                    onChange={(e) =>
                                                        handleCategoryChange(
                                                            idx,
                                                            'category_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg border-zinc-200 px-2.5 py-1 text-xs font-medium shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                                />
                                                <div className="relative w-36">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                                                        Rp
                                                    </span>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="0"
                                                        value={formatNumberWithDots(cat.amount)}
                                                        onChange={(e) => {
                                                            const raw = e.target.value.replace(/\D/g, '');
                                                            handleCategoryChange(
                                                                idx,
                                                                'amount',
                                                                raw === '' ? 0 : parseInt(raw, 10),
                                                            );
                                                        }}
                                                        className="w-full rounded-lg border-zinc-200 py-1 pl-8 pr-2 text-right text-xs font-bold shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCategory(idx)}
                                                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {/* Dynamic Match Status Banner */}
                                        {hasCategories && (
                                            <div
                                                className={`mt-2 flex items-center justify-between rounded-lg p-2.5 text-xs font-semibold ${
                                                    isCategoryMatching
                                                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                        : 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {isCategoryMatching ? (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                                    )}
                                                    <span>
                                                        {isCategoryMatching
                                                            ? 'Total Kategori Sesuai'
                                                            : `Selisih: ${formatIDR(Math.abs(categoryDifference))}`}
                                                    </span>
                                                </div>
                                                <span>
                                                    {formatIDR(categoryTotal)} / {formatIDR(grandTotal)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.categories && (
                                    <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-destructive">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        {errors.categories}
                                    </p>
                                )}
                            </div>

                            {/* Proof Image Upload Card */}
                            <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm dark:border-zinc-800">
                                <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                                        Bukti Slip Setoran
                                    </h3>
                                    {deposit?.proof_image_path && (
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                                            Tersimpan
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="relative rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-4 text-center transition-all hover:border-primary dark:border-zinc-800 dark:bg-zinc-950/20">
                                        <input
                                            type="file"
                                            id="proof_image"
                                            accept=".jpeg,.jpg,.png,.pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                        />
                                        <Upload className="mx-auto mb-1.5 h-6 w-6 text-muted-foreground opacity-60" />
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                            Upload slip bank (JPG, PNG, PDF)
                                        </p>
                                    </div>

                                    {errors.proof_image && (
                                        <p className="flex items-center gap-1 text-[11px] text-destructive">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            {errors.proof_image}
                                        </p>
                                    )}

                                    {imagePreview ? (
                                        <div className="overflow-hidden rounded-lg border bg-zinc-100 p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded bg-black">
                                                <img
                                                    src={imagePreview}
                                                    alt="Slip preview"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    ) : isEdit && deposit?.proof_image_path ? (
                                        <div className="rounded-lg border bg-zinc-50 p-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
                                            <a
                                                href={route(
                                                    'deposit.proof',
                                                    deposit.uuid,
                                                )}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline dark:text-blue-400"
                                            >
                                                <ImageIcon className="h-3.5 w-3.5" />
                                                Lihat Slip Saat Ini
                                            </a>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Compact Cash Calculator */}
                        <div className="space-y-5 lg:col-span-7">
                            <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm dark:border-zinc-800">
                                <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                                    <h3 className="flex items-center gap-1.5 text-base font-bold text-gray-900 dark:text-gray-100">
                                        <FileEdit className="h-4 w-4 text-primary" />
                                        Input Pecahan Uang Setoran
                                    </h3>
                                    <span className="text-[11px] text-muted-foreground">
                                        Rincian lembar / keping
                                    </span>
                                </div>

                                {/* Compact Denominations Grid/List */}
                                <div className="space-y-2">
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
                                                className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all ${denomConfig.bg} ${denomConfig.border}`}
                                            >
                                                {/* Left: Label */}
                                                <div className="flex items-center gap-2.5 w-2/5">
                                                    <span
                                                        className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase text-white ${denomConfig.labelBg}`}
                                                    >
                                                        Rp{' '}
                                                        {item.denomination >=
                                                        1000
                                                            ? `${item.denomination / 1000}K`
                                                            : item.denomination}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-extrabold ${denomConfig.text}`}
                                                    >
                                                        {formatIDR(
                                                            item.denomination,
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Center: Input */}
                                                <div className="flex items-center gap-1.5 w-1/4">
                                                    <span className="text-[10px] text-muted-foreground">
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
                                                        className="w-full rounded-md border-zinc-200 py-1 text-center text-xs font-bold shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                                    />
                                                </div>

                                                {/* Right: Subtotal */}
                                                <div className="w-1/3 text-right">
                                                    <span className="text-xs font-black text-gray-950 dark:text-white">
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

                                {/* Grand Total & Sticky Action Controls */}
                                <div className="flex flex-col items-center justify-between gap-3 rounded-xl border bg-zinc-900 p-4 text-white dark:border-zinc-800 sm:flex-row">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                            Grand Total Setoran Kas
                                        </p>
                                        <p className="text-2xl font-black text-emerald-400">
                                            {formatIDR(grandTotal)}
                                        </p>
                                    </div>

                                    <div className="flex w-full gap-2 sm:w-auto">
                                        <button
                                            type="button"
                                            disabled={processing}
                                            onClick={() =>
                                                handleSubmit('draft')
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 active:scale-95 disabled:opacity-50 sm:flex-none"
                                        >
                                            <Save className="h-3.5 w-3.5" />
                                            Simpan Draf
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                processing ||
                                                (hasCategories && !isCategoryMatching)
                                            }
                                            onClick={() =>
                                                handleSubmit('completed')
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-95 disabled:opacity-50 sm:flex-none"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
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
