import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useUiStore, type Toast as ToastType } from '@/stores/uiStore'

type ToastVariant = 'success' | 'error' | 'info'

const icons: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
}

const colors: Record<ToastVariant, string> = {
  success: 'bg-white dark:bg-[#1e2130] border-emerald-200 dark:border-emerald-500/30',
  error:   'bg-white dark:bg-[#1e2130] border-red-200 dark:border-red-500/30',
  info:    'bg-white dark:bg-[#1e2130] border-blue-200 dark:border-blue-500/30',
}

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUiStore((s) => s.removeToast)
  const Icon = icons[toast.type]

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[260px] max-w-xs ${colors[toast.type]}`}>
      <Icon className="w-4 h-4 shrink-0 text-current" />
      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss"
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts)

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[400]" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}
