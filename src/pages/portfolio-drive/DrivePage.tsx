import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import AppLayout from './components/layout/AppLayout'
import BreadcrumbNav from './components/layout/BreadcrumbNav'
import Toolbar from './components/files/Toolbar'
import FileListView from './components/files/FileListView'
import FileGridView from './components/files/FileGridView'
import UploadDropzone from './components/upload/UploadDropzone'
import DndProvider from './components/dnd/DndProvider'
import PreviewDialog from './components/preview/PreviewDialog'
import DeleteConfirmDialog from './components/dialogs/DeleteConfirmDialog'
import MoveItemDialog from './components/dialogs/MoveItemDialog'
import CreateFolderDialog from './components/dialogs/CreateFolderDialog'
import RenameFileDialog from './components/dialogs/RenameFileDialog'
import RenameFolderDialog from './components/dialogs/RenameFolderDialog'
import { useSelection } from './hooks/useSelection'
import { useFileUpload } from './hooks/useFileUpload'
import { useFolderTree } from './contexts/FolderTreeContext'
import { mockFiles, mockFolders } from '../../data/portfolio-drive/mockService'
import type { FileItem, Folder } from './types'
import type { ViewMode } from './components/files/Toolbar'

export default function DrivePage() {
  const { refreshTree } = useFolderTree()
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [folderPath, setFolderPath] = useState<Folder[]>([])
  const [subFolders, setSubFolders] = useState<Folder[]>([])
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [renameFileTarget, setRenameFileTarget] = useState<FileItem | null>(null)
  const [renameFolderTarget, setRenameFolderTarget] = useState<Folder | null>(null)

  const uploadInputRef = useRef<HTMLInputElement>(null)
  const { uploadFiles } = useFileUpload({
    folderId: selectedFolder?.id ?? null,
    onSuccess: () => loadContents(selectedFolder?.id ?? null),
  })

  const allIds = [
    ...subFolders.map((f) => f.id),
    ...files.map((f) => f.id),
  ]
  const { selectedIds, toggle, selectAll, setAnchor, clearSelection } = useSelection(allIds)

  const selectedFileIds = files.filter((f) => selectedIds.has(f.id)).map((f) => f.id)
  const selectedFolderIds = subFolders.filter((f) => selectedIds.has(f.id)).map((f) => f.id)

  const loadContents = useCallback((folderId: string | null) => {
    setIsLoading(true)
    clearSelection()
    try {
      if (folderId) {
        const folders = mockFolders.getFolders(folderId)
        const filesList = mockFiles.getFiles(folderId)
        setSubFolders(folders)
        setFiles(filesList)
      } else {
        const folders = mockFolders.getFolders()
        setSubFolders(folders)
        setFiles([])
      }
    } catch {
      toast.error('파일 목록을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [clearSelection])

  useEffect(() => {
    loadContents(selectedFolder?.id ?? null)
  }, [selectedFolder, loadContents])

  function handleFolderSelect(folder: Folder | null) {
    setSelectedFolder(folder)
    if (!folder) {
      setFolderPath([])
    } else {
      setFolderPath((prev) => {
        const existingIdx = prev.findIndex((f) => f.id === folder.id)
        if (existingIdx >= 0) return prev.slice(0, existingIdx + 1)
        return [...prev, folder]
      })
    }
  }

  function handleBreadcrumbNavigate(folder: Folder | null) {
    setSelectedFolder(folder)
    if (!folder) {
      setFolderPath([])
    } else {
      setFolderPath((prev) => {
        const idx = prev.findIndex((f) => f.id === folder.id)
        return idx >= 0 ? prev.slice(0, idx + 1) : prev
      })
    }
  }

  function handleFolderClick(folder: Folder) {
    handleFolderSelect(folder)
  }

  function handleFileClick(file: FileItem) {
    setPreviewFile(file)
    setPreviewOpen(true)
  }

  function handleContextMenu(e: React.MouseEvent, id: string, _isFolder: boolean) {
    e.preventDefault()
    if (!selectedIds.has(id)) {
      clearSelection()
      toggle(id, allIds.indexOf(id), false, false)
    }
  }

  async function handleDeleteSelected() {
    setIsDeleting(true)
    try {
      if (selectedFileIds.length > 0) mockFiles.bulkDeleteFiles(selectedFileIds)
      if (selectedFolderIds.length > 0) mockFolders.bulkDeleteFolders(selectedFolderIds)
      toast.success('삭제되었습니다.')
      clearSelection()
      if (selectedFolderIds.length > 0) refreshTree()
      loadContents(selectedFolder?.id ?? null)
    } catch {
      toast.error('삭제에 실패했습니다.')
    } finally {
      setIsDeleting(false)
      setDeleteOpen(false)
    }
  }

  function handleUploadClick() {
    uploadInputRef.current?.click()
  }

  async function handleMoveSelected(targetFolderId: string) {
    try {
      if (selectedFileIds.length > 0) mockFiles.bulkMoveFiles(selectedFileIds, targetFolderId)
      if (selectedFolderIds.length > 0) mockFolders.bulkMoveFolders(selectedFolderIds, targetFolderId)
      toast.success('이동했습니다.')
      clearSelection()
      if (selectedFolderIds.length > 0) refreshTree()
      loadContents(selectedFolder?.id ?? null)
    } catch {
      toast.error('이동에 실패했습니다.')
    }
  }

  const folderName = selectedFolder?.name ?? '내 드라이브'
  const itemCount = subFolders.length + files.length

  return (
    <DndProvider
      selectedIds={selectedIds}
      selectedFileIds={selectedFileIds}
      selectedFolderIds={selectedFolderIds}
      currentFolderName={selectedFolder?.name ?? '내 드라이브'}
      onMoveComplete={() => {
        loadContents(selectedFolder?.id ?? null)
      }}
      onFolderMoved={refreshTree}
    >
      <AppLayout
        selectedFolderId={selectedFolder?.id ?? null}
        onFolderSelect={handleFolderSelect}
        onSidebarRefresh={() => {
          loadContents(selectedFolder?.id ?? null)
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <input
            ref={uploadInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const uploadedFiles = Array.from(e.target.files ?? [])
              if (uploadedFiles.length > 0) uploadFiles(uploadedFiles)
              e.target.value = ''
            }}
          />
          <BreadcrumbNav path={folderPath} onNavigate={handleBreadcrumbNavigate} />
          <Toolbar
            folderName={folderName}
            itemCount={itemCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNewFolder={() => setCreateFolderOpen(true)}
            selectedCount={selectedIds.size}
            onDelete={() => setDeleteOpen(true)}
            onMove={() => setMoveOpen(true)}
            onUpload={handleUploadClick}
          />
          <UploadDropzone
            folderId={selectedFolder?.id ?? null}
            onUploadComplete={() => loadContents(selectedFolder?.id ?? null)}
          >
            <div className="flex-1 overflow-auto" onClick={() => clearSelection()}>
              {viewMode === 'list' ? (
                <FileListView
                  folders={subFolders}
                  files={files}
                  isLoading={isLoading}
                  selectedIds={selectedIds}
                  onFolderClick={handleFolderClick}
                  onFileClick={handleFileClick}
                  onItemSelect={(id, idx, shift, ctrl) => toggle(id, idx, shift, ctrl)}
                  onSetAnchor={setAnchor}
                  onSelectAll={() => selectedIds.size === allIds.length ? clearSelection() : selectAll()}
                  onContextMenu={handleContextMenu}
                  fileUrls={{}}
                  onFileRename={(file) => setRenameFileTarget(file)}
                  onFolderRename={(folder) => setRenameFolderTarget(folder)}
                />
              ) : (
                <FileGridView
                  folders={subFolders}
                  files={files}
                  isLoading={isLoading}
                  selectedIds={selectedIds}
                  onFolderClick={handleFolderClick}
                  onFileClick={handleFileClick}
                  onItemSelect={(id, idx, shift, ctrl) => toggle(id, idx, shift, ctrl)}
                  onSetAnchor={setAnchor}
                  onContextMenu={handleContextMenu}
                  fileUrls={{}}
                  onFileRename={(file) => setRenameFileTarget(file)}
                  onFolderRename={(folder) => setRenameFolderTarget(folder)}
                />
              )}
            </div>
          </UploadDropzone>
        </div>
      </AppLayout>

      <PreviewDialog
        file={previewFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteSelected}
        title="선택 항목 삭제"
        description={`선택한 ${selectedIds.size}개 항목을 휴지통으로 이동하시겠습니까?`}
        isLoading={isDeleting}
      />

      <MoveItemDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        onConfirm={handleMoveSelected}
        excludeIds={selectedFolderIds}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentId={selectedFolder?.id ?? null}
        onSuccess={() => {
          refreshTree()
          loadContents(selectedFolder?.id ?? null)
        }}
      />

      {renameFolderTarget && (
        <RenameFolderDialog
          open={renameFolderTarget !== null}
          onOpenChange={(open) => { if (!open) setRenameFolderTarget(null) }}
          folderId={renameFolderTarget.id}
          currentName={renameFolderTarget.name}
          onSuccess={() => {
            setRenameFolderTarget(null)
            refreshTree()
            loadContents(selectedFolder?.id ?? null)
          }}
        />
      )}

      {renameFileTarget && (
        <RenameFileDialog
          open={renameFileTarget !== null}
          onOpenChange={(open) => { if (!open) setRenameFileTarget(null) }}
          fileId={renameFileTarget.id}
          currentName={renameFileTarget.file_name}
          onSuccess={() => {
            setRenameFileTarget(null)
            loadContents(selectedFolder?.id ?? null)
          }}
        />
      )}
    </DndProvider>
  )
}
