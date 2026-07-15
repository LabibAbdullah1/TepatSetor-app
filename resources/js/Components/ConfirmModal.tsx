import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
    processing?: boolean;
}

export default function ConfirmModal({
    show,
    title,
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    onConfirm,
    onClose,
    processing = false,
}: ConfirmModalProps) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-950 dark:text-white">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        {cancelText}
                    </SecondaryButton>

                    <DangerButton onClick={onConfirm} disabled={processing}>
                        {confirmText}
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
