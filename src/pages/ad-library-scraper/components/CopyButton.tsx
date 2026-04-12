import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  url: string
  className?: string
  iconSize?: string
}

export function CopyButton({ url, className = 'shrink-0 text-muted-foreground hover:text-foreground transition-colors', iconSize = 'h-3.5 w-3.5' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className={className}
      title="URL 복사"
    >
      {copied ? <Check className={`${iconSize} text-green-500`} /> : <Copy className={iconSize} />}
    </button>
  )
}
