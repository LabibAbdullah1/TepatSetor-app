import ConfirmModal from '@/Components/ConfirmModal';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { router, useForm } from '@inertiajs/react';
import { CreditCard, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
}

export default function BankAccountSection({
    bankAccounts = [],
    className = '',
}: {
    bankAccounts?: BankAccount[];
    className?: string;
}) {
    const { data, setData, post, reset, errors, processing } = useForm({
        bank_name: '',
        account_number: '',
        account_holder_name: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('bank-accounts.store'), {
            onSuccess: () => reset(),
        });
    };

    // Delete confirmation state and handlers
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = () => {
        if (confirmDeleteId === null) return;
        setIsDeleting(true);
        router.delete(route('bank-accounts.destroy', confirmDeleteId), {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setConfirmDeleteId(null);
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Daftar Rekening Bank Tujuan
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Kelola nomor rekening bank yang Anda gunakan untuk menerima
                    setoran uang kas fisik.
                </p>
            </header>

            {/* List of Registered Accounts */}
            <div className="mt-6 space-y-4">
                {bankAccounts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800">
                        <p className="text-sm text-muted-foreground">
                            Belum ada rekening bank yang didaftarkan.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
                        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {bankAccounts.map((account) => (
                                <li
                                    key={account.id}
                                    className="flex items-center justify-between p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                {account.bank_name}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {account.account_number}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Atas Nama:{' '}
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                                {account.account_holder_name}
                                            </span>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmDeleteId(account.id)
                                        }
                                        className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-destructive dark:text-zinc-500 dark:hover:bg-zinc-800"
                                        title="Hapus Rekening"
                                    >
                                        <Trash2 className="h-4.5 w-4.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Add Account Form */}
            <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Tambah Rekening Baru
                </h3>
                <form onSubmit={submit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Bank Name */}
                        <div>
                            <InputLabel htmlFor="bank_name" value="Nama Bank" />
                            <TextInput
                                id="bank_name"
                                className="mt-1 block w-full"
                                value={data.bank_name}
                                onChange={(e) =>
                                    setData('bank_name', e.target.value)
                                }
                                placeholder="Contoh: BCA, Mandiri, BRI"
                                required
                            />
                            <InputError
                                className="mt-2"
                                message={errors.bank_name}
                            />
                        </div>

                        {/* Account Number */}
                        <div>
                            <InputLabel
                                htmlFor="account_number"
                                value="No. Rekening"
                            />
                            <TextInput
                                id="account_number"
                                className="mt-1 block w-full"
                                value={data.account_number}
                                onChange={(e) =>
                                    setData('account_number', e.target.value)
                                }
                                placeholder="Contoh: 1234567890"
                                required
                            />
                            <InputError
                                className="mt-2"
                                message={errors.account_number}
                            />
                        </div>

                        {/* Account Holder Name */}
                        <div>
                            <InputLabel
                                htmlFor="account_holder_name"
                                value="Atas Nama"
                            />
                            <TextInput
                                id="account_holder_name"
                                className="mt-1 block w-full"
                                value={data.account_holder_name}
                                onChange={(e) =>
                                    setData(
                                        'account_holder_name',
                                        e.target.value,
                                    )
                                }
                                placeholder="Contoh: Ahmad Fauzi"
                                required
                            />
                            <InputError
                                className="mt-2"
                                message={errors.account_holder_name}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton disabled={processing}>
                            Tambah Rekening
                        </PrimaryButton>
                    </div>
                </form>
            </div>
            <ConfirmModal
                show={confirmDeleteId !== null}
                title="Hapus Rekening Tujuan"
                message="Apakah Anda yakin ingin menghapus rekening bank tujuan ini? Setoran kas yang dikaitkan ke rekening ini akan diset menjadi kosong (tidak terhubung), namun datanya tidak akan terhapus."
                onConfirm={handleConfirmDelete}
                onClose={() => setConfirmDeleteId(null)}
                processing={isDeleting}
            />
        </section>
    );
}
