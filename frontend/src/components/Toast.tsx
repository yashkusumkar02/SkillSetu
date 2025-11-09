import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

type ToastData = { id: string; message: string; type: 'success' | 'error' | 'info'; duration: number }

export default function Toast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<ToastData>
      const data = ce.detail
      setToasts((prev) => [...prev, data])
      setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== data.id)), data.duration)
    }
    document.addEventListener('toast', handler as EventListener)
    return () => document.removeEventListener('toast', handler as EventListener)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(t => t.id !== id))
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={clsx(
              'glass px-4 py-3 flex items-start gap-3 min-w-[260px] max-w-md pointer-events-auto',
              'shadow-lg'
            )}
            role="alert"
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" aria-hidden="true" />
              ) : toast.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
              ) : (
                <Info className="w-5 h-5 text-blue-400" aria-hidden="true" />
              )}
            </div>
            <div className="text-sm text-white flex-1">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 rounded p-0.5 shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}