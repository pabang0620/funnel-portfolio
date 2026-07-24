import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Trash2, FileIcon, Folder as FolderIcon } from 'lucide-react'
import { Button } from './components/ui/button'
import { Skeleton } from './components/ui/skeleton'
import AppLayout from './components/layout/AppLayout'
import DeleteConfirmDialog from './components/dialogs/DeleteConfirmDialog'
import { mockTrash } from '../../data/file-hub/mockService'
import { formatFileSize, formatDate } from './lib/utils'
import type { FileItem, Folder } from './types'

interface TrashData {
  files: FileItem[]
  folders: Folder[]
}

export default function TrashPage() {
  const [trash, setTrash] = useState<TrashData>({ files: [], folders: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [emptyConfirmOpen, setEmptyConfirmOpen] = useState(false)
  const [isEmptying, setIsEmptying] = useState(false)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const loadTrash = useCallback(() => {
    setIsLoading(true)
    try {
      const data = mockTrash.getTrash()
      setTrash(data)
    } catch {
      toast.error('휴지통을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadTrash() }, [loadTrash])

  function handleEmptyTrash() {
    setIsEmptying(true)
    try {
      mockTrash.emptyTrash()
      toast.success('휴지통을 비웠습니다.')
      setEmptyConfirmOpen(false)
      loadTrash()
    } catch {
      toast.error('휴지통 비우기에 실패했습니다.')
    } finally {
      setIsEmptying(false)
    }
  }

  function handleDeleteFile() {
    if (!deleteFileId) return
    setIsDeleting(true)
    try {
      mockTrash.deleteFile(deleteFileId)
      toast.success('파일이 영구 삭제되었습니다.')
      setDeleteFileId(null)
      loadTrash()
    } catch {
      toast.error('파일 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  function handleDeleteFolder() {
    if (!deleteFolderId) return
    setIsDeleting(true)
    try {
      mockTrash.deleteFolder(deleteFolderId)
      toast.success('폴더가 영구 삭제되었습니다.')
      setDeleteFolderId(null)
      loadTrash()
    } catch {
      toast.error('폴더 삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  function handleRestore(type: 'file' | 'folder', id: string) {
    setIsRestoring(true)
    try {
      if (type === 'file') mockTrash.restoreFile(id)
      else mockTrash.restoreFolder(id)
      toast.success('복구되었습니다.')
      loadTrash()
    } catch {
      toast.error('복구에 실패했습니다.')
    } finally {
      setIsRestoring(false)
    }
  }

  const totalCount = trash.files.length + trash.folders.length

  return (
    <AppLayout
      selectedFolderId={null}
      onFolderSelect={() => {}}
      onSidebarRefresh={() => {}}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-muted-foreground" />
            <h1 className="font-semibold text-foreground">휴지통</h1>
            <span className="text-sm text-muted-foreground">({totalCount}개 항목)</span>
          </div>
          {totalCount > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setEmptyConfirmOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              휴지통 비우기
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="flex flex-col gap-1 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          )}

          {!isLoading && totalCount === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Trash2 className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">Trash is empty.</p>
            </div>
          )}

          {!isLoading && totalCount > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50 text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">이름</th>
                  <th className="px-4 py-2 text-left font-medium hidden md:table-cell">종류</th>
                  <th className="px-4 py-2 text-left font-medium hidden lg:table-cell">삭제일</th>
                  <th className="px-4 py-2 text-right font-medium hidden md:table-cell">용량</th>
                  <th className="px-4 py-2 text-right font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {trash.folders.map((folder) => (
                  <tr key={`folder-${folder.id}`} className="border-b hover:bg-accent">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <FolderIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span>{folder.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">폴더</td>
                    <td className="px-4 py-2 hidden lg:table-cell text-muted-foreground">
                      {folder.deleted_at ? formatDate(folder.deleted_at) : '-'}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell text-right text-muted-foreground">-</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore('folder', folder.id)}
                          disabled={isRestoring}
                        >
                          복구
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteFolderId(folder.id)}
                        >
                          영구 삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {trash.files.map((file) => (
                  <tr key={`file-${file.id}`} className="border-b hover:bg-accent">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <FileIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>{file.file_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">파일</td>
                    <td className="px-4 py-2 hidden lg:table-cell text-muted-foreground">
                      {file.deleted_at ? formatDate(file.deleted_at) : '-'}
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell text-right text-muted-foreground">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore('file', file.id)}
                          disabled={isRestoring}
                        >
                          복구
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteFileId(file.id)}
                        >
                          영구 삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={emptyConfirmOpen}
        onOpenChange={setEmptyConfirmOpen}
        onConfirm={handleEmptyTrash}
        title="휴지통 비우기"
        description="Permanently deletes all files and folders in the trash. This action cannot be undone."
        isLoading={isEmptying}
        destructive={true}
      />

      <DeleteConfirmDialog
        open={!!deleteFileId}
        onOpenChange={(open) => !open && setDeleteFileId(null)}
        onConfirm={handleDeleteFile}
        title="파일 영구 삭제"
        description="Permanently deletes this file. This action cannot be undone."
        isLoading={isDeleting}
        destructive={true}
      />

      <DeleteConfirmDialog
        open={!!deleteFolderId}
        onOpenChange={(open) => !open && setDeleteFolderId(null)}
        onConfirm={handleDeleteFolder}
        title="폴더 영구 삭제"
        description="Permanently deletes this folder. This action cannot be undone."
        isLoading={isDeleting}
        destructive={true}
      />
    </AppLayout>
  )
}
