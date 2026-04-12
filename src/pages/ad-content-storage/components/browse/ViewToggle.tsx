import { LayoutGrid, List } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ViewToggleProps {
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex border border-input rounded-md overflow-hidden">
      <button
        onClick={() => onViewModeChange('grid')}
        className={cn(
          'flex items-center justify-center h-9 w-9 transition-colors',
          viewMode === 'grid' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted/50'
        )}
        title="그리드 보기"
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewModeChange('table')}
        className={cn(
          'flex items-center justify-center h-9 w-9 transition-colors',
          viewMode === 'table' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted/50'
        )}
        title="테이블 보기"
        aria-label="Table view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}
