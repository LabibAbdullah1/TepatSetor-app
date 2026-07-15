import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Calculator,
    FileText,
    LogIn,
    Share2,
    ShieldCheck,
} from 'lucide-react';

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Selamat Datang di TepatSetor" />

            <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-zinc-50 text-zinc-950 transition-colors duration-200 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:text-zinc-100">
                {/* Decorative background grid and glow */}
                <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:block" />
                <div className="pointer-events-none absolute left-[-10%] top-[-10%] hidden h-[50%] w-[50%] rounded-full bg-emerald-500/10 blur-[120px] dark:block" />
                <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] hidden h-[50%] w-[50%] rounded-full bg-emerald-500/10 blur-[120px] dark:block" />

                {/* Header Navbar */}
                <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between border-b border-zinc-200 px-6 py-6 dark:border-zinc-900">
                    <div className="flex items-center gap-2.5">
                        <ApplicationLogo className="h-9 w-9" />
                        <span className="text-xl font-black tracking-tight text-zinc-900 dark:bg-gradient-to-r dark:from-white dark:via-zinc-200 dark:to-zinc-400 dark:bg-clip-text dark:text-transparent">
                            TepatSetor
                        </span>
                    </div>

                    <nav className="-mx-3 flex flex-1 items-center justify-end gap-4">
                        <ThemeToggle />
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                            >
                                Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-600/10 transition-all hover:bg-emerald-500 active:scale-95"
                            >
                                <LogIn className="h-4 w-4" />
                                Masuk ke Aplikasi
                            </Link>
                        )}
                    </nav>
                </header>

                {/* Hero Section */}
                <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-16 px-6 py-16 lg:flex-row">
                    {/* Left: Headline & CTA */}
                    <div className="flex-1 space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                            ✨ Personal Cash Deposit Reporting
                        </div>

                        <h2 className="text-4xl font-black leading-[1.1] tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl">
                            Hitung Cash & <br />
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                                Lapor Setoran Instan
                            </span>
                        </h2>

                        <p className="mx-auto max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg lg:mx-0">
                            Kelola pelaporan setoran kas fisik harian Anda.
                            Hitung jumlah lembaran denominasi Rupiah secara
                            real-time, unggah bukti slip setoran bank secara
                            privat, unduh laporan PDF profesional, dan bagikan
                            laporannya langsung via WhatsApp.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] hover:from-emerald-500 hover:to-teal-500 active:scale-95 sm:w-auto"
                                >
                                    Buka Dashboard Setoran
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:translate-y-[-2px] hover:from-emerald-500 hover:to-teal-500 active:scale-95 sm:w-auto"
                                >
                                    Masuk ke Aplikasi
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right: Feature Cards Showcase */}
                    <div className="grid w-full max-w-xl flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Feature 1 */}
                        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-500/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none dark:hover:border-emerald-500/30">
                            <div className="w-fit rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-500">
                                <Calculator className="h-6 w-6" />
                            </div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                                Kalkulator Real-Time
                            </h4>
                            <p className="text-zinc-650 text-sm leading-relaxed dark:text-zinc-400">
                                Masukkan jumlah lembaran Rupiah (Rp1K s.d
                                Rp100K) dan saksikan total setoran diperbarui
                                secara instan.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-500/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none dark:hover:border-emerald-500/30">
                            <div className="w-fit rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                                Upload Bukti Aman
                            </h4>
                            <p className="text-zinc-650 text-sm leading-relaxed dark:text-zinc-400">
                                Bukti slip setoran bank disimpan di direktori
                                privat yang terproteksi dan hanya bisa diakses
                                setelah autentikasi.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-purple-500/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none dark:hover:border-purple-500/30">
                            <div className="w-fit rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-purple-400">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                                Unduh Dokumen PDF
                            </h4>
                            <p className="text-zinc-650 text-sm leading-relaxed dark:text-zinc-400">
                                Ekspor laporan kalkulasi kas fisik dan lampiran
                                slip bank ke dalam format PDF cetak profesional.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-teal-500/30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:shadow-none dark:hover:border-teal-500/30">
                            <div className="w-fit rounded-xl border border-teal-500/20 bg-teal-500/10 p-3 text-teal-400">
                                <Share2 className="h-6 w-6" />
                            </div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                                WhatsApp Integration
                            </h4>
                            <p className="text-zinc-650 text-sm leading-relaxed dark:text-zinc-400">
                                Kirim ringkasan status setoran secara instan
                                menggunakan URL-encoded template ke kontak
                                WhatsApp Anda.
                            </p>
                        </div>
                    </div>
                </main>

                {/* Footer Section */}
                <footer className="relative z-10 border-t border-zinc-200 py-8 text-center text-xs text-zinc-500 dark:border-zinc-900">
                    <p>
                        © {new Date().getFullYear()} TepatSetor. Dibuat
                        menggunakan Laravel 11, React (Inertia), & Tailwind CSS.
                    </p>
                </footer>
            </div>
        </>
    );
}
