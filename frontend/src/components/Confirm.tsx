import { ReactNode } from 'react'

export default function Confirm({ open, title, message, onCancel, onConfirm }: {
  open: boolean
  title: string
  message: string | ReactNode
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="card max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className="text-white/80 mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
