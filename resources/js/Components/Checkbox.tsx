import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500 dark:border-gray-700 dark:bg-zinc-900 dark:focus:ring-emerald-600 dark:focus:ring-offset-zinc-900 ' +
                className
            }
        />
    );
}
