import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Plus, User } from 'lucide-react';
import { PropsWithChildren, ReactNode } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    // Helper to check active route
    const isRouteActive = (routeName: string) => route().current(routeName);

    return (
        <div className="dark:text-zinc-150 flex min-h-screen bg-zinc-50/50 text-zinc-900 transition-colors duration-200 dark:bg-zinc-950">
            {/* BACKGROUND DECORATION */}
            <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:block" />

            {/* DESKTOP SIDEBAR */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/70 lg:flex lg:flex-col lg:justify-between">
                <div className="flex flex-col space-y-6 px-6 py-6">
                    {/* Brand header */}
                    <div className="flex items-center gap-3">
                        <ApplicationLogo className="h-10 w-10" />
                        <div>
                            <h1 className="text-sm font-black tracking-tight text-gray-950 dark:text-white">
                                TepatSetor
                            </h1>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1.5 pt-4">
                        <Link
                            href={route('dashboard')}
                            className={`active:scale-98 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                isRouteActive('dashboard')
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                    : 'hover:bg-zinc-105 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                            <LayoutDashboard className="h-4.5 w-4.5" />
                            Dashboard
                        </Link>

                        <Link
                            href={route('profile.edit')}
                            className={`active:scale-98 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                                isRouteActive('profile.edit')
                                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/10'
                                    : 'hover:bg-zinc-105 text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                            <User className="h-4.5 w-4.5" />
                            Profile Rekening
                        </Link>
                    </nav>
                </div>

                {/* Sidebar Footer User Details */}
                <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-950/30">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-gray-950 dark:text-white">
                                {user.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                        <ThemeToggle />
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="border-zinc-205 mt-4 flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-2 text-xs font-bold text-zinc-700 transition-all hover:bg-zinc-50 hover:text-destructive active:scale-95 dark:border-zinc-900 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-950"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar (Log Out)
                    </Link>
                </div>
            </aside>

            {/* MOBILE TOPBAR & BOTTOM NAVIGATION BAR */}
            <div className="lg:hidden">
                {/* Mobile Top Header */}
                <header className="border-zinc-205 fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/80">
                    <Link
                        href={route('dashboard')}
                        className="flex items-center gap-2"
                    >
                        <ApplicationLogo className="h-7 w-7" />
                        <span className="text-sm font-black tracking-tight text-gray-950 dark:text-white">
                            TepatSetor
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-zinc-550 rounded-lg p-2 hover:bg-zinc-100 hover:text-destructive dark:text-zinc-400 dark:hover:bg-zinc-800"
                            title="Log Out"
                        >
                            <LogOut className="h-5 w-5" />
                        </Link>
                    </div>
                </header>

                {/* Mobile Bottom Tab Bar */}
                <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/85 px-6 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/85">
                    <Link
                        href={route('dashboard')}
                        className={`flex flex-col items-center justify-center gap-1 text-center transition-all ${
                            isRouteActive('dashboard')
                                ? 'font-bold text-emerald-600 dark:text-emerald-400'
                                : 'dark:hover:text-zinc-250 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                        }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-[10px]">Dashboard</span>
                    </Link>

                    <Link
                        href={route('deposit.create')}
                        className="relative -top-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        className={`flex flex-col items-center justify-center gap-1 text-center transition-all ${
                            isRouteActive('profile.edit')
                                ? 'font-bold text-emerald-600 dark:text-emerald-400'
                                : 'dark:hover:text-zinc-250 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                        }`}
                    >
                        <User className="h-5 w-5" />
                        <span className="text-[10px]">Profil</span>
                    </Link>
                </nav>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="flex min-w-0 flex-1 flex-col pb-20 pt-14 lg:pb-0 lg:pl-64 lg:pt-0">
                {/* Optional Custom Header bar */}
                {header && (
                    <header className="hidden border-b border-zinc-200/80 bg-white/70 px-6 py-6 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/70 lg:block">
                        <div className="mx-auto max-w-7xl">{header}</div>
                    </header>
                )}

                {/* Subheader header in mobile view */}
                {header && (
                    <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-900 dark:bg-zinc-900/30 lg:hidden">
                        {header}
                    </div>
                )}

                {/* Page children container */}
                <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
