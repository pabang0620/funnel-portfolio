import { useState } from 'react'
import { toast } from 'sonner'
import { Skeleton } from '../ui/skeleton'
import FolderTreeItem from './FolderTreeItem'
import { mockFolders } from '../../../../data/portfolio-drive/mockService'
import CreateFolderDialog from '../dialogs/CreateFolderDialog'
import RenameFolderDialog from '../dialogs/RenameFolderDialog'
import DeleteConfirmDialog from '../dialogs/DeleteConfirmDialog'
import { useFolderTree } from '../../contexts/FolderTreeContext'
import type { Folder } from '../../types'

interface FolderTreeProps {
  selectedFolderId: string | null
  onFolderSelect: (folder: Folder | null) => void
  filterText?: string
}

function filterFolders(folders: Folder[], text: string): Folder[] {
  return folders.reduce<Folder[]>((acc, folder) => {
    const filteredChildren = filterFolders(folder.children ?? [], text)
    const nameMatch = folder.name.toLowerCase().includes(text.toLowerCase())
    if (nameMatch || filteredChildren.length > 0) {
      acc.push({ ...folder, children: filteredChildren })
    }
    return acc
  }, [])
}

export default function FolderTree({ selectedFolderId, onFolderSelect, filterText }: FolderTreeProps) {
  const { folders, isLoading, refreshTree } = useFolderTree()
  const [createParentId, setCreateParentId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [renameFolder, setRenameFolder] = useState<Folder | null>(null)
  const [deleteFolder_, setDeleteFolder] = useState<Folder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleNewFolder(parentId: string) {
    setCreateParentId(parentId)
    setCreateOpen(true)
  }

  async function handleDeleteConfirm() {
    if (!deleteFolder_) return
    setIsDeleting(true)
    try {
      mockFolders.deleteFolder(deleteFolder_.id)
      toast.success('폴더가 삭제되었습니다.')
      setDeleteFolder(null)
      refreshTree()
      if (selectedFolderId === deleteFolder_.id) onFolderSelect(null)
    } catch {
      toast.error('폴더 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full rounded" />
        ))}
      </div>
    )
  }

  const displayFolders = filterText?.trim()
    ? filterFolders(folders, filterText.trim())
    : folders

  return (
    <>
      <div className="flex flex-col gap-0.5 px-2">
        {displayFolders.map((folder) => (
          <FolderTreeItem
            key={folder.id}
            folder={folder}
            depth={0}
            selectedId={selectedFolderId}
            onSelect={onFolderSelect}
            onRename={setRenameFolder}
            onDelete={setDeleteFolder}
            onNewFolder={handleNewFolder}
            filterText={filterText}
          />
        ))}
        {displayFolders.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-2">
            {filterText?.trim() ? '검색 결과가 없습니다.' : '폴더가 없습니다.'}
          </p>
        )}
      </div>

      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parentId={createParentId}
        onSuccess={refreshTree}
      />
      {renameFolder && (
        <RenameFolderDialog
          open={!!renameFolder}
          onOpenChange={(open) => !open && setRenameFolder(null)}
          folderId={renameFolder.id}
          currentName={renameFolder.name}
          onSuccess={refreshTree}
        />
      )}
      <DeleteConfirmDialog
        open={!!deleteFolder_}
        onOpenChange={(open) => !open && setDeleteFolder(null)}
        onConfirm={handleDeleteConfirm}
        title="폴더 삭제"
        description={`"${deleteFolder_?.name}" 폴더를 휴지통으로 이동하시겠습니까?`}
        isLoading={isDeleting}
      />
    </>
  )
}
