import { useCallback } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Folder as FolderIcon, Play } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Skeleton } from '../ui/skeleton'
import FileIcon from './FileIcon'
import type { FileItem, Folder } from '../../types'
import { formatFileSize } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface FileGridViewProps {
  folders: Folder[]
  files: FileItem[]
  isLoading: boolean
  selectedIds: Set<string>
  onFolderClick: (folder: Folder) => void
  onFileClick: (file: FileItem) => void
  onItemSelect: (id: string, index: number, shiftKey: boolean, ctrlKey: boolean) => void
  onSetAnchor?: (index: number) => void
  onContextMenu: (e: React.MouseEvent, id: string, isFolder: boolean) => void
  fileUrls: Record<string, string>
  onFolderRename?: (folder: Folder) => void
  onFileRename?: (file: FileItem) => void
}

interface FolderCardProps {
  folder: Folder
  index: number
  isSelected: boolean
  onFolderClick: (folder: Folder) => void
  onItemSelect: (id: string, index: number, shiftKey: boolean, ctrlKey: boolean) => void
  onSetAnchor?: (index: number) => void
  onContextMenu: (e: React.MouseEvent, id: string, isFolder: boolean) => void
  onFolderRename?: (folder: Folder) => void
}

function FolderCard({ folder, index, isSelected, onFolderClick, onItemSelect, onSetAnchor, onContextMenu, onFolderRename }: FolderCardProps) {
  const id = folder.id

  const {
    setNodeRef: setDragRef,
    listeners,
    attributes,
    transform,
    isDragging,
  } = useDraggable({
    id: `folder-${id}`,
    data: { folderId: id },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-folder-${id}`,
    data: { folderId: id, folderName: folder.name },
  })

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
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        'flex flex-col gap-2 p-3 rounded-lg border cursor-pointer hover:bg-accent select-none transition-colors',
        isSelected && 'bg-blue-50 border-blue-300 hover:bg-blue-100',
        isOver && 'ring-2 ring-blue-400 bg-blue-50',
      )}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation()
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
          onItemSelect(id, index, e.shiftKey, e.ctrlKey || e.metaKey)
        } else {
          onSetAnchor?.(index)
          onFolderClick(folder)
        }
      }}
      onDoubleClick={() => onFolderRename?.(folder)}
      onContextMenu={(e) => {
        e.preventDefault()
        onContextMenu(e, id, true)
      }}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onItemSelect(id, index, false, true)}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="self-start"
      />
      <div className="flex flex-col items-center gap-2">
        <FolderIcon className="w-10 h-10 text-yellow-500" />
        <p className="text-xs font-medium text-center truncate w-full">{folder.name}</p>
      </div>
    </div>
  )
}

interface FileCardProps {
  file: FileItem
  index: number
  isSelected: boolean
  onFileClick: (file: FileItem) => void
  onItemSelect: (id: string, index: number, shiftKey: boolean, ctrlKey: boolean) => void
  onSetAnchor?: (index: number) => void
  onContextMenu: (e: React.MouseEvent, id: string, isFolder: boolean) => void
  onFileRename?: (file: FileItem) => void
}

function FileCard({ file, index, isSelected, onFileClick, onItemSelect, onSetAnchor, onContextMenu, onFileRename }: FileCardProps) {
  const id = file.id

  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
    id: `file-${id}`,
    data: { fileId: id },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        'flex flex-col gap-2 p-2 rounded-lg border cursor-pointer hover:bg-accent select-none transition-colors',
        isSelected && 'bg-blue-50 border-blue-300 hover:bg-blue-100',
      )}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation()
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
          onItemSelect(id, index, e.shiftKey, e.ctrlKey || e.metaKey)
        } else {
          onSetAnchor?.(index)
          onFileClick(file)
        }
      }}
      onDoubleClick={() => onFileRename?.(file)}
      onContextMenu={(e) => {
        e.preventDefault()
        onContextMenu(e, id, false)
      }}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onItemSelect(id, index, false, true)}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="self-start"
      />
      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
        {file.mime_type?.startsWith('image/') && file.preview_url ? (
          <img
            src={file.preview_url}
            alt={file.file_name}
            className="w-full h-full object-contain"
          />
        ) : file.mime_type?.startsWith('video/') && file.preview_url ? (
          <>
            <video
              src={file.preview_url}
              preload="metadata"
              muted
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 rounded-full p-1">
              <Play className="w-3 h-3 text-white fill-white" />
            </div>
          </>
        ) : (
          <FileIcon
            mimeType={file.mime_type}
            previewUrl={null}
            size={40}
            className="rounded"
          />
        )}
      </div>
      <p className="text-xs font-medium text-center truncate w-full">{file.file_name}</p>
      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
    </div>
  )
}

export default function FileGridView({
  folders,
  files,
  isLoading,
  selectedIds,
  onFolderClick,
  onFileClick,
  onItemSelect,
  onSetAnchor,
  onContextMenu,
  fileUrls: _fileUrls,
  onFolderRename,
  onFileRename,
}: FileGridViewProps) {
  const allItems = [
    ...folders.map((f) => ({ type: 'folder' as const, item: f })),
    ...files.map((f) => ({ type: 'file' as const, item: f })),
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    )
  }

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <FolderIcon className="w-12 h-12 mb-2 opacity-30" />
        <p className="text-sm">이 폴더는 비어 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
      {allItems.map(({ type, item }, index) => {
        const id = item.id
        const isSelected = selectedIds.has(id)

        if (type === 'folder') {
          return (
            <FolderCard
              key={`folder-${id}`}
              folder={item as Folder}
              index={index}
              isSelected={isSelected}
              onFolderClick={onFolderClick}
              onItemSelect={onItemSelect}
              onSetAnchor={onSetAnchor}
              onContextMenu={onContextMenu}
              onFolderRename={onFolderRename}
            />
          )
        }

        return (
          <FileCard
            key={`file-${id}`}
            file={item as FileItem}
            index={index}
            isSelected={isSelected}
            onFileClick={onFileClick}
            onItemSelect={onItemSelect}
            onSetAnchor={onSetAnchor}
            onContextMenu={onContextMenu}
            onFileRename={onFileRename}
          />
        )
      })}
    </div>
  )
}
