import { FolderPlus, LayoutGrid, List, Trash2, Move, Upload } from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'

export type ViewMode = 'list' | 'grid'

interface ToolbarProps {
  folderName: string
  itemCount: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onNewFolder: () => void
  selectedCount: number
  onDelete: () => void
  onMove: () => void
  onUpload: () => void
}

export default function Toolbar({
  folderName,
  itemCount,
  viewMode,
  onViewModeChange,
  onNewFolder,
  selectedCount,
  onDelete,
  onMove,
  onUpload,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">{folderName}</span>
        <span className="text-sm text-muted-foreground">({itemCount}개 항목)</span>
        {selectedCount > 0 && (
          <span className="text-sm text-blue-600 font-medium">{selectedCount}개 선택됨</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {selectedCount > 0 && (
          <>
            <Button size="sm" variant="outline" onClick={onMove}>
              <Move className="w-4 h-4 mr-1" />
              이동
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete} className="text-destructive border-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-1" />
              삭제
            </Button>
          </>
        )}
        <Button size="sm" variant="outline" onClick={onUpload}>
          <Upload className="w-4 h-4 mr-1" />
          업로드
        </Button>
        <Button size="sm" variant="outline" onClick={onNewFolder}>
          <FolderPlus className="w-4 h-4 mr-1" />
          새 폴더
        </Button>
        <div className="flex border rounded-md overflow-hidden">
          <button
            type="button"
            className={cn(
              'px-2 py-1.5 transition-colors',
              viewMode === 'list' ? 'bg-secondary text-foreground' : 'hover:bg-accent text-muted-foreground',
            )}
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={cn(
              'px-2 py-1.5 transition-colors',
              viewMode === 'grid' ? 'bg-secondary text-foreground' : 'hover:bg-accent text-muted-foreground',
            )}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
