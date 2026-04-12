import { useCallback } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Folder as FolderIcon } from 'lucide-react'
import { Checkbox } from '../ui/checkbox'
import { Skeleton } from '../ui/skeleton'
import FileIcon from './FileIcon'
import type { FileItem, Folder } from '../../types'
import { formatFileSize, formatDate } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface FileListViewProps {
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
  onSelectAll?: () => void
  onFileRename?: (file: FileItem) => void
  onFolderRename?: (folder: Folder) => void
}

interface FolderRowProps {
  folder: Folder
  index: number
  isSelected: boolean
  onFolderClick: (folder: Folder) => void
  onItemSelect: (id: string, index: number, shiftKey: boolean, ctrlKey: boolean) => void
  onSetAnchor?: (index: number) => void
  onContextMenu: (e: React.MouseEvent, id: string, isFolder: boolean) => void
  onFolderRename?: (folder: Folder) => void
}

function FolderRow({ folder, index, isSelected, onFolderClick, onItemSelect, onSetAnchor, onContextMenu, onFolderRename }: FolderRowProps) {
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
    (el: HTMLTableRowElement | null) => {
      setDragRef(el)
      setDropRef(el)
    },
    [setDragRef, setDropRef],
  )

  return (
    <tr
      ref={refCallback}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        'border-b hover:bg-accent cursor-pointer select-none',
        isSelected && 'bg-blue-50 hover:bg-blue-100',
        isOver && 'ring-2 ring-inset ring-blue-400 bg-blue-50',
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
      <td className="px-3 py-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onItemSelect(id, index, false, true)}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <FolderIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <span className="font-medium truncate">{folder.name}</span>
        </div>
      </td>
      <td className="px-3 py-2 hidden lg:table-cell text-muted-foreground">-</td>
      <td className="px-3 py-2 hidden lg:table-cell text-muted-foreground">-</td>
      <td className="px-3 py-2 hidden xl:table-cell text-muted-foreground">
        {folder.created_at ? formatDate(folder.created_at) : '-'}
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-right text-muted-foreground">-</td>
    </tr>
  )
}

interface FileRowProps {
  file: FileItem
  index: number
  isSelected: boolean
  fileUrls: Record<string, string>
  onFileClick: (file: FileItem) => void
  onItemSelect: (id: string, index: number, shiftKey: boolean, ctrlKey: boolean) => void
  onSetAnchor?: (index: number) => void
  onContextMenu: (e: React.MouseEvent, id: string, isFolder: boolean) => void
  onFileRename?: (file: FileItem) => void
}

function FileRow({ file, index, isSelected, fileUrls: _fileUrls, onFileClick, onItemSelect, onSetAnchor, onContextMenu, onFileRename }: FileRowProps) {
  const id = file.id

  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
    id: `file-${id}`,
    data: { fileId: id },
  })

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        'border-b hover:bg-accent cursor-pointer select-none',
        isSelected && 'bg-blue-50 hover:bg-blue-100',
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
      <td className="px-3 py-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onItemSelect(id, index, false, true)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <FileIcon
            mimeType={file.mime_type}
            previewUrl={file.preview_url ?? null}
            size={32}
          />
          <span className="truncate">{file.file_name}</span>
        </div>
      </td>
      <td className="px-3 py-2 hidden lg:table-cell text-muted-foreground">
        {file.creator ?? '-'}
      </td>
      <td className="px-3 py-2 hidden lg:table-cell text-muted-foreground">
        {file.uploader_name}
      </td>
      <td className="px-3 py-2 hidden xl:table-cell text-muted-foreground">
        {formatDate(file.upload_date)}
      </td>
      <td className="px-3 py-2 hidden md:table-cell text-right text-muted-foreground">
        {formatFileSize(file.size)}
      </td>
    </tr>
  )
}

export default function FileListView({
  folders,
  files,
  isLoading,
  selectedIds,
  onFolderClick,
  onFileClick,
  onItemSelect,
  onSetAnchor,
  onSelectAll,
  onContextMenu,
  fileUrls,
  onFileRename,
  onFolderRename,
}: FileListViewProps) {
  const allItems = [
    ...folders.map((f) => ({ type: 'folder' as const, item: f })),
    ...files.map((f) => ({ type: 'file' as const, item: f })),
  ]
  const isAllSelected = allItems.length > 0 && selectedIds.size === allItems.length

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
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
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-secondary/50 text-muted-foreground">
            <th className="w-10 px-3 py-2 text-left">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            </th>
            <th className="px-3 py-2 text-left font-medium">파일명</th>
            <th className="px-3 py-2 text-left font-medium hidden lg:table-cell">제작자</th>
            <th className="px-3 py-2 text-left font-medium hidden lg:table-cell">업로드한 사람</th>
            <th className="px-3 py-2 text-left font-medium hidden xl:table-cell">업로드일</th>
            <th className="px-3 py-2 text-right font-medium hidden md:table-cell">용량</th>
          </tr>
        </thead>
        <tbody>
          {allItems.map(({ type, item }, index) => {
            const id = item.id
            const isSelected = selectedIds.has(id)

            if (type === 'folder') {
              return (
                <FolderRow
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
              <FileRow
                key={`file-${id}`}
                file={item as FileItem}
                index={index}
                isSelected={isSelected}
                fileUrls={fileUrls}
                onFileClick={onFileClick}
                onItemSelect={onItemSelect}
                onSetAnchor={onSetAnchor}
                onContextMenu={onContextMenu}
                onFileRename={onFileRename}
              />
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
