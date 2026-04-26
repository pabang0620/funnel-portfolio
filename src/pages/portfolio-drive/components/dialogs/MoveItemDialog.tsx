import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ChevronRight, ChevronDown, Folder as FolderIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { mockFolders } from '../../../../data/portfolio-drive/mockService'
import { cn } from '../../lib/utils'
import type { Folder } from '../../types'

interface MoveItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (targetFolderId: string) => Promise<void>
  excludeIds?: string[]
}

function FolderTreeNode({
  folder,
  selectedId,
  onSelect,
  excludeIds,
  depth,
}: {
  folder: Folder
  selectedId: string | null
  onSelect: (id: string) => void
  excludeIds: string[]
  depth: number
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasChildren = folder.children && folder.children.length > 0
  const isExcluded = excludeIds.includes(folder.id)

  if (isExcluded) return null

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-accent text-sm',
          selectedId === folder.id && 'bg-blue-100 text-blue-700',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(folder.id)}
      >
        <button
          type="button"
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )
          ) : null}
        </button>
        <FolderIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        <span className="truncate">{folder.name}</span>
      </div>
      {expanded && hasChildren && (
        <div>
          {folder.children!.map((child) => (
            <FolderTreeNode
              key={child.id}
              folder={child}
              selectedId={selectedId}
              onSelect={onSelect}
              excludeIds={excludeIds}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MoveItemDialog({
  open,
  onOpenChange,
  onConfirm,
  excludeIds = [],
}: MoveItemDialogProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFolders(mockFolders.getFolderTree())
      setSelectedId(null)
    }
  }, [open])

  async function handleConfirm() {
    if (!selectedId) return
    setIsLoading(true)
    try {
      await onConfirm(selectedId)
      onOpenChange(false)
    } catch {
      toast.error('이동에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이동할 폴더 선택</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-64 border rounded-md">
          <div className="p-2">
            {folders.map((folder) => (
              <FolderTreeNode
                key={folder.id}
                folder={folder}
                selectedId={selectedId}
                onSelect={setSelectedId}
                excludeIds={excludeIds}
                depth={0}
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId || isLoading}>
            {isLoading ? '이동 중...' : '이동'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
