import { Bookmark } from 'lucide-react'
import { Button } from '../ui/button'

interface BookmarkButtonProps {
  isBookmarked: boolean
  onClick: () => void
  className?: string
}

export function BookmarkButton({ isBookmarked, onClick, className }: BookmarkButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
      onClick={onClick}
    >
      <Bookmark
        className={`h-4 w-4 ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
      />
    </Button>
  )
}
