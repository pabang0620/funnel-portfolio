import { useRef, useCallback } from 'react'
import Sidebar from './Sidebar'
import { useFolderTree } from '../../contexts/FolderTreeContext'
import type { Folder } from '../../types'

interface AppLayoutProps {
  selectedFolderId: string | null
  onFolderSelect: (folder: Folder | null) => void
  onSidebarRefresh: () => void
  children: React.ReactNode
}

const SIDEBAR_WIDTH = 240

export default function AppLayout({
  selectedFolderId,
  onFolderSelect,
  onSidebarRefresh,
  children,
}: AppLayoutProps) {
  const { refreshTree } = useFolderTree()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  function handleSidebarRefresh() {
    refreshTree()
    onSidebarRefresh()
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    const startX = e.clientX
    const startWidth = sidebarRef.current?.offsetWidth ?? SIDEBAR_WIDTH

    function onMouseMove(ev: MouseEvent) {
      if (!isDragging.current || !sidebarRef.current) return
      const newWidth = Math.min(400, Math.max(180, startWidth + (ev.clientX - startX)))
      sidebarRef.current.style.width = `${newWidth}px`
    }

    function onMouseUp() {
      isDragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--color-background)' }}>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{
          width: `${SIDEBAR_WIDTH}px`,
          minWidth: `${SIDEBAR_WIDTH}px`,
          maxWidth: '400px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Sidebar
          selectedFolderId={selectedFolderId}
          onFolderSelect={onFolderSelect}
          onRefresh={handleSidebarRefresh}
        />
      </div>

      {/* Resize handle */}
      <div
        ref={resizerRef}
        onMouseDown={onMouseDown}
        style={{
          width: '4px',
          cursor: 'col-resize',
          flexShrink: 0,
          background: 'var(--color-border, #e5e7eb)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-primary, #3b82f6)' }}
        onMouseLeave={e => { if (!isDragging.current) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-border, #e5e7eb)' }}
      />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
