import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface SlidePanelProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function SlidePanel({ open, title, onClose, children }: SlidePanelProps) {
  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (open) {
      setRendered(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const timer = setTimeout(() => setRendered(false), 250)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!rendered) return null

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-[480px] bg-card border-l flex flex-col z-50 transition-transform duration-[250ms] ease-in-out"
        style={{ transform: visible ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-center justify-between h-12 px-4 border-b shrink-0">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </>
  )
}
