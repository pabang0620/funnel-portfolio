import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trash2, HardDrive, FolderPlus, Shield } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'
import FolderTree from './FolderTree'
import { useState } from 'react'
import CreateFolderDialog from '../dialogs/CreateFolderDialog'
import { useAuth } from '../../contexts/AuthContext'
import { useFolderTree } from '../../contexts/FolderTreeContext'
import type { Folder } from '../../types'

interface SidebarProps {
  selectedFolderId: string | null
  onFolderSelect: (folder: Folder | null) => void
  onRefresh?: () => void
}

export default function Sidebar({ selectedFolderId, onFolderSelect }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { refreshTree } = useFolderTree()
  const [createRootOpen, setCreateRootOpen] = useState(false)
  const [folderFilter, setFolderFilter] = useState('')

  // Determine active path relative to the file-hub base
  const path = location.pathname

  return (
    <div className="flex flex-col h-full bg-sidebar border-r">
      {/* Row 1: Logo */}
      <button
        type="button"
        onClick={() => navigate('/file-hub')}
        className="px-3 pt-3 pb-2 flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer"
      >
        <HardDrive className="w-5 h-5 text-sidebar-primary flex-shrink-0" />
        <span className="font-bold text-sidebar-foreground text-base truncate" title="Internal file storage and sharing">File Hub</span>
      </button>

      {/* Row 2: Folder Filter + FolderPlus */}
      <div className="px-3 pb-2 flex items-center gap-1">
        <Input
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          placeholder="Search folders..."
          className="flex-1 h-8 text-sm"
        />
        <Button
          size="icon"
          variant="ghost"
          className="w-7 h-7 flex-shrink-0 text-sidebar-muted hover:text-sidebar-foreground"
          onClick={() => setCreateRootOpen(true)}
          title="Create root folder"
        >
          <FolderPlus className="w-4 h-4" />
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 min-h-0 py-2">
        <FolderTree selectedFolderId={selectedFolderId} onFolderSelect={onFolderSelect} filterText={folderFilter} />
      </ScrollArea>

      <Separator className="bg-sidebar-border" />

      <div className="p-2 flex flex-col gap-0.5">
        {isAdmin && (
          <Link
            to="/file-hub/admin"
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
              path.endsWith('/admin')
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        )}
        <Link
          to="/file-hub/trash"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
            path.endsWith('/trash')
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          )}
        >
          <Trash2 className="w-4 h-4" />
          <span>Trash</span>
        </Link>
      </div>

      <CreateFolderDialog
        open={createRootOpen}
        onOpenChange={setCreateRootOpen}
        parentId={null}
        onSuccess={refreshTree}
      />
    </div>
  )
}
