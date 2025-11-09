export type ToastType = 'success' | 'error' | 'info'

export function useToast() {
  function showToast(message: string, type: ToastType = 'info', duration = 3000) {
    const event = new CustomEvent('toast', { detail: { message, type, duration, id: Math.random().toString(36).slice(2) } })
    document.dispatchEvent(event)
  }
  return { showToast }
}
