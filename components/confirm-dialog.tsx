'use client'

import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
    cancelText?: string
}


export function ConfirmDialog({
                                  isOpen,
                                  title,
                                  message,
                                  onConfirm,
                                  onCancel,
                                  confirmText = 'Delete',
                                  cancelText = 'Cancel',
                              }: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-card rounded-lg border border-border shadow-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    )


}

