import { useState } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { toast } from 'sonner'
import { mockFiles, mockFolders } from '../../../../data/funnels-drive/mockService'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'

interface PendingMove {
  rawId: string
  targetFolderId: string
  targetFolderName: string
  isActiveFile: boolean
  isActiveFolder: boolean
  isMulti: boolean
  count: number
}

interface DndProviderProps {
  selectedIds: Set<string>
  selectedFileIds: string[]
  selectedFolderIds: string[]
  currentFolderName?: string
  onMoveComplete: () => void
  onFolderMoved?: () => void
  children: React.ReactNode
}

export default function DndProvider({
  selectedIds,
  selectedFileIds,
  selectedFolderIds,
  currentFolderName = '현재 위치',
  onMoveComplete,
  onFolderMoved,
  children,
}: DndProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overData = over.data.current as { folderId?: string; folderName?: string } | undefined
    const targetFolderId = overData?.folderId
    const targetFolderName = overData?.folderName ?? '선택한 폴더'
    if (!targetFolderId) return

    const isActiveFile = activeId.startsWith('file-')
    const isActiveFolder = activeId.startsWith('folder-') || activeId.startsWith('sidebar-folder-')
    const rawId = activeId.replace(/^(file-|sidebar-folder-|folder-)/, '')
    if (rawId === targetFolderId) return

    const isMulti = selectedIds.size > 1 && selectedIds.has(rawId)

    setPendingMove({
      rawId,
      targetFolderId,
      targetFolderName,
      isActiveFile,
      isActiveFolder,
      isMulti,
      count: isMulti ? selectedIds.size : 1,
    })
  }

  async function confirmMove() {
    if (!pendingMove) return
    const { rawId, targetFolderId, isActiveFile, isActiveFolder, isMulti } = pendingMove
    setIsMoving(true)
    try {
      if (isMulti) {
        if (selectedFileIds.length > 0) mockFiles.bulkMoveFiles(selectedFileIds, targetFolderId)
        if (selectedFolderIds.length > 0) mockFolders.bulkMoveFolders(selectedFolderIds, targetFolderId)
        toast.success('선택한 항목들을 이동했습니다.')
      } else {
        if (isActiveFile) mockFiles.moveFile(rawId, targetFolderId)
        else if (isActiveFolder) mockFolders.moveFolder(rawId, targetFolderId)
        toast.success('이동했습니다.')
      }
      onMoveComplete()
      if (isActiveFolder || selectedFolderIds.length > 0) onFolderMoved?.()
    } catch {
      toast.error('이동에 실패했습니다.')
    } finally {
      setIsMoving(false)
      setPendingMove(null)
    }
  }

  const activeRawId = activeId ? activeId.replace(/^(file-|sidebar-folder-|folder-)/, '') : null
  const isMultiDrag = activeRawId != null && selectedIds.size > 1 && selectedIds.has(activeRawId)

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {children}

      <DragOverlay>
        {activeId ? (
          <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none">
            {isMultiDrag ? `${selectedIds.size}개 항목 이동 중` : '이동 중'}
          </div>
        ) : null}
      </DragOverlay>

      <Dialog open={pendingMove !== null} onOpenChange={(open) => { if (!open && !isMoving) setPendingMove(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이동 확인</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {pendingMove?.count === 1 ? '선택한 항목' : `선택한 ${pendingMove?.count}개 항목`}을
                  아래 폴더로 이동하시겠습니까?
                </p>
                <p className="font-medium text-foreground">
                  📂 {currentFolderName} → 📂 {pendingMove?.targetFolderName}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMove(null)} disabled={isMoving}>
              취소
            </Button>
            <Button onClick={confirmMove} disabled={isMoving}>
              {isMoving ? '이동 중...' : '이동'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  )
}
