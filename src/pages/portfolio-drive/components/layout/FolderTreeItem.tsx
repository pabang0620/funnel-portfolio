import { useState, useEffect, memo, useCallback } from 'react'
import { ChevronRight, ChevronDown, Folder as FolderIcon, FolderOpen, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'
import type { Folder } from '../../types'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

function hasSelectedDescendant(folder: Folder, selectedId: string): boolean {
  return (folder.children ?? []).some(
    (child) => child.id === selectedId || hasSelectedDescendant(child, selectedId)
  )
}

interface FolderTreeItemProps {
  folder: Folder
  depth: number
  selectedId: string | null
  onSelect: (folder: Folder) => void
  onRename: (folder: Folder) => void
  onDelete: (folder: Folder) => void
  onNewFolder: (parentId: string) => void
  filterText?: string
}

const FolderTreeItem = memo(function FolderTreeItem({
  folder,
  depth,
  selectedId,
  onSelect,
  onRename,
  onDelete,
  onNewFolder,
  filterText,
}: FolderTreeItemProps) {
  const [expanded, setExpanded] = useState(depth === 0)

  useEffect(() => {
    if (filterText?.trim()) {
      setExpanded(true)
    }
  }, [filterText])

  useEffect(() => {
    if (selectedId && hasSelectedDescendant(folder, selectedId)) {
      setExpanded(true)
    }
  }, [selectedId, folder])
  const [menuOpen, setMenuOpen] = useState(false)
  const isSelected = selectedId === folder.id
  const hasChildren = folder.children && folder.children.length > 0

  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    transform,
    isDragging,
  } = useDraggable({
    id: `sidebar-folder-${folder.id}`,
    data: { folderId: folder.id },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `folder-${folder.id}`, data: { folderId: folder.id, folderName: folder.name } })

  const refCallback = useCallback(
    (el: HTMLDivElement | null) => {
      setDragRef(el)
      setDropRef(el)
    },
    [setDragRef, setDropRef],
  )

  return (
    <div
      ref={refCallback}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
    >
      <div
        className={cn(
          'group flex items-center gap-1 py-1 rounded-md cursor-grab transition-colors text-sm select-none',
          'hover:bg-sidebar-accent',
          isSelected && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
          isOver && 'bg-blue-100 ring-2 ring-blue-400',
          isDragging && 'cursor-grabbing',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: '4px' }}
        {...listeners}
        {...attributes}
        onClick={() => {
          onSelect(folder)
          if (hasChildren) setExpanded((v) => !v)
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          setMenuOpen(true)
        }}
      >
        <button
          type="button"
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-muted-foreground"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded((v) => !v)
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )
          ) : (
            <span className="w-3.5 h-3.5" />
          )}
        </button>
        {isSelected && expanded ? (
          <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        ) : (
          <FolderIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        )}
        <span className="flex-1 truncate text-sidebar-foreground">{folder.name}</span>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-sidebar-border transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(true)
              }}
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-40">
            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); onNewFolder(folder.id) }}>
              새 폴더
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); onRename(folder) }}>
              이름 변경
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(folder) }}
              className="text-destructive focus:text-destructive"
            >
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {expanded && hasChildren && (
        <div>
          {folder.children!.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
              onNewFolder={onNewFolder}
              filterText={filterText}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default FolderTreeItem
