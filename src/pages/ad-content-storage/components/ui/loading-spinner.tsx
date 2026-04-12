import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
}

export function LoadingSpinner({ message = '잠시만 기다려주세요...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
