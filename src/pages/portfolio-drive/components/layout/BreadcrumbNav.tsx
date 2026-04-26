import { ChevronRight, ChevronLeft, Home, User, Shield, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import SearchBar from './SearchBar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import type { Folder } from '../../types'

interface BreadcrumbNavProps {
  path: Folder[]
  onNavigate: (folder: Folder | null) => void
}

export default function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  return (
    <nav className="flex items-center gap-2 px-4 py-2 text-sm border-b bg-background">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
        <button
          type="button"
          className="flex items-center justify-center w-7 h-7 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0 disabled:opacity-30 disabled:pointer-events-none"
          onClick={() => onNavigate(path.length >= 2 ? path[path.length - 2] : null)}
          disabled={path.length === 0}
          title="이전 폴더"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          onClick={() => onNavigate(null)}
        >
          <Home className="w-4 h-4" />
          <span>홈</span>
        </button>
        {path.map((folder) => (
          <span key={folder.id} className="flex items-center gap-1 flex-shrink-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-32"
              onClick={() => onNavigate(folder)}
            >
              {folder.name}
            </button>
          </span>
        ))}
      </div>

      {/* Right: file search + user dropdown */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-48">
          <SearchBar />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 h-8 px-2">
              <User className="w-4 h-4" />
              <span className="max-w-[80px] truncate">{user?.name ?? user?.username}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {user?.username}
            </div>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/portfolio-drive/admin')}>
                <Shield className="w-4 h-4 mr-2" />
                관리자 페이지
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
