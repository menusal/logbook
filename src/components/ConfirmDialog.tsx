interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8">
      <div className="w-full max-w-xs rounded-[14px] bg-[#F2F2F7]/90 backdrop-blur-md dark:bg-[#1C1C1E]/95">
        <div className="px-4 py-5 text-center">
          <h2 className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white">{title}</h2>
          <p className="mt-1 text-[13px] text-[#8E8E93] leading-relaxed">{message}</p>
        </div>
        <div className="border-t border-[#C6C6C8]/50 dark:border-[#38383A]/50">
          <button
            onClick={onConfirm}
            className={`w-full py-[13px] text-center text-[17px] font-semibold active:bg-black/5 dark:active:bg-white/10 ${
              danger ? 'text-ios-red' : 'text-ios-blue'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
        <div className="border-t border-[#C6C6C8]/50 dark:border-[#38383A]/50">
          <button
            onClick={onCancel}
            className="w-full py-[13px] text-center text-[17px] font-semibold text-ios-blue active:bg-black/5 dark:active:bg-white/10"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
