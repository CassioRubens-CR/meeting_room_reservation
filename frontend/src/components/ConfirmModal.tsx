import { useEscapeKey } from '../hooks'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  error?: string | null
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  error = null,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEscapeKey(onClose, open && !loading)

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <section
        className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-5 shadow-xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
      >
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-stone-900">
          {title}
        </h2>
        <p id="confirm-modal-message" className="mt-2 text-sm leading-6 text-stone-600">
          {message}
        </p>
        {error && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-11 rounded-lg border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="min-h-11 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {loading ? 'Processando...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
