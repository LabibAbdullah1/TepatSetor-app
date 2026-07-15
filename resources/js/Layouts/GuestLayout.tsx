import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 text-zinc-950 transition-colors duration-200 dark:bg-gradient-to-br dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 dark:text-zinc-100">
            {/* Absolute positioned theme switcher */}
            <div className="absolute right-4 top-4 z-20">
                <ThemeToggle />
            </div>

            {/* Decorative background grid and glow */}
            <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:14px_24px] dark:block" />
            <div className="pointer-events-none absolute left-[20%] top-[20%] hidden h-[40%] w-[40%] rounded-full bg-emerald-600/5 blur-[120px] dark:block" />
            <div className="pointer-events-none absolute bottom-[20%] right-[20%] hidden h-[40%] w-[40%] rounded-full bg-emerald-600/5 blur-[120px] dark:block" />

            <div className="relative z-10 flex w-full max-w-md flex-col items-center">
                <div className="mb-6">
                    <Link href="/" className="flex flex-col items-center gap-2">
                        <div className="dark:bg-emerald-550/10 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all hover:scale-105 dark:border-emerald-500/20 dark:shadow-emerald-500/5">
                            <ApplicationLogo className="h-12 w-12" />
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                            TepatSetor
                        </h1>
                    </Link>
                </div>

                <div className="w-full rounded-2xl border border-zinc-200 bg-white px-8 py-8 shadow-xl transition-all duration-200 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:backdrop-blur-md">
                    {children}
                </div>
            </div>
        </div>
    );
}
