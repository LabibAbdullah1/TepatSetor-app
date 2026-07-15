import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
}

interface CustomSelectProps {
    value: string | number;
    onChange: (val: string) => void;
    options: BankAccount[];
    placeholder?: string;
    error?: string;
}

export default function CustomSelect({
    value,
    onChange,
    options = [],
    placeholder = '-- Pilih Rekening Bank --',
    error,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search query
    const filteredOptions = options.filter(
        (option) =>
            option.bank_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            option.account_number
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            option.account_holder_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
    );

    // Find currently selected item
    const selectedOption = options.find(
        (opt) => String(opt.id) === String(value),
    );

    const handleSelect = (id: number) => {
        onChange(String(id));
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-left text-sm shadow-sm transition-all focus:border-primary focus:ring focus:ring-primary/20 dark:bg-zinc-900 ${
                    error
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                        : 'border-zinc-200 dark:border-zinc-800'
                }`}
            >
                {selectedOption ? (
                    <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                            {selectedOption.bank_name}
                        </span>
                        <span className="font-semibold text-gray-950 dark:text-white">
                            {selectedOption.account_number}
                        </span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                            (a.n. {selectedOption.account_holder_name})
                        </span>
                    </div>
                ) : (
                    <span className="text-zinc-400 dark:text-zinc-500">
                        {placeholder}
                    </span>
                )}
                <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                    {/* Search Field */}
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Cari bank, no. rek, atau nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="dark:border-zinc-850 w-full rounded-lg border-zinc-200 py-2 pl-9 pr-4 text-xs shadow-inner focus:border-primary focus:ring-primary/20 dark:bg-zinc-950 dark:text-gray-100"
                        />
                    </div>

                    {/* Options List */}
                    <ul className="max-h-60 space-y-0.5 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-4 text-center text-xs italic text-muted-foreground">
                                Tidak ada rekening ditemukan
                            </li>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected =
                                    String(option.id) === String(value);
                                return (
                                    <li key={option.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSelect(option.id)
                                            }
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                                                isSelected
                                                    ? 'bg-primary/10 font-bold text-primary dark:bg-primary/20'
                                                    : 'dark:text-zinc-350 text-gray-800 hover:bg-zinc-50 dark:hover:bg-zinc-950'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    {option.bank_name}
                                                </span>
                                                <span className="font-semibold">
                                                    {option.account_number}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground opacity-80">
                                                    (
                                                    {option.account_holder_name}
                                                    )
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-primary" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
