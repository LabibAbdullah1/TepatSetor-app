import { useForm } from '@inertiajs/react';
import { Check, Save, UserCheck, Users } from 'lucide-react';
import React, { useState } from 'react';

interface Signer {
    name: string;
    title: string;
}

interface DefaultSignersSectionProps {
    defaultSigners?: Signer[] | null;
    className?: string;
}

export default function DefaultSignersSection({
    defaultSigners = [],
    className = '',
}: DefaultSignersSectionProps) {
    const initialSignersCount = (defaultSigners && defaultSigners.length >= 3) ? 3 : 2;
    const [signerCount, setSignerCount] = useState<number>(initialSignersCount);

    const getInitialSigners = (): Signer[] => {
        const list = defaultSigners || [];
        return [
            {
                name: list[0]?.name || '',
                title: list[0]?.title || 'Ketua Umum',
            },
            {
                name: list[1]?.name || '',
                title: list[1]?.title || 'Bendahara',
            },
            {
                name: list[2]?.name || '',
                title: list[2]?.title || 'Petugas Kas',
            },
        ];
    };

    const { data, setData, patch, transform, processing, recentlySuccessful } =
        useForm({
            default_signers: getInitialSigners(),
        });

    const handleSignerChange = (
        index: number,
        field: 'name' | 'title',
        val: string,
    ) => {
        const updated = [...data.default_signers];
        updated[index] = { ...updated[index], [field]: val };
        setData('default_signers', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((data) => ({
            ...data,
            default_signers: data.default_signers.slice(0, signerCount),
        }));
        patch(route('profile.default-signers.update'), {
            preserveScroll: true,
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <UserCheck className="h-5 w-5 text-primary" />
                        Preset Penanda Tangan Default
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Atur nama dan jabatan default penanda tangan laporan PDF
                        agar terisi otomatis setiap membuat setoran baru.
                    </p>
                </div>

                {/* Count toggle buttons */}
                <div className="flex items-center rounded-lg border bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
                    <button
                        type="button"
                        onClick={() => setSignerCount(2)}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all ${
                            signerCount === 2
                                ? 'bg-white text-gray-900 shadow dark:bg-zinc-800 dark:text-gray-100'
                                : 'text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                        <Users className="h-3.5 w-3.5" />
                        2 Penanda Tangan
                    </button>
                    <button
                        type="button"
                        onClick={() => setSignerCount(3)}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all ${
                            signerCount === 3
                                ? 'bg-white text-gray-900 shadow dark:bg-zinc-800 dark:text-gray-100'
                                : 'text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                        <Users className="h-3.5 w-3.5" />
                        3 Penanda Tangan
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[0, 1, 2].slice(0, signerCount).map((idx) => (
                        <div
                            key={idx}
                            className="space-y-3 rounded-xl border bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                        >
                            <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                                <span className="text-xs font-bold uppercase text-primary">
                                    Penanda Tangan #{idx + 1}
                                </span>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Jabatan / Posisi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Ketua Umum, Bendahara"
                                    value={data.default_signers[idx]?.title || ''}
                                    onChange={(e) =>
                                        handleSignerChange(
                                            idx,
                                            'title',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border-zinc-200 py-1.5 text-xs shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nama Penanda Tangan"
                                    value={data.default_signers[idx]?.name || ''}
                                    onChange={(e) =>
                                        handleSignerChange(
                                            idx,
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border-zinc-200 py-1.5 text-xs font-semibold shadow-sm focus:border-primary focus:ring focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-100"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Simpan Preset Penanda Tangan
                    </button>

                    {recentlySuccessful && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <Check className="h-4 w-4" />
                            Berhasil disimpan.
                        </span>
                    )}
                </div>
            </form>
        </section>
    );
}
