import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import BankAccountSection from './Partials/BankAccountSection';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
}

export default function Edit({
    mustVerifyEmail,
    status,
    bankAccounts = [],
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
    bankAccounts?: BankAccount[];
}>) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="border border-zinc-200 bg-white p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:rounded-xl sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="border border-zinc-200 bg-white p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:rounded-xl sm:p-8">
                        <BankAccountSection
                            bankAccounts={bankAccounts}
                            className="max-w-3xl"
                        />
                    </div>

                    <div className="border border-zinc-200 bg-white p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:rounded-xl sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
