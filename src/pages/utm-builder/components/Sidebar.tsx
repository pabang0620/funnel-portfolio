import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Package, Monitor, FileType, LayoutGrid, Zap, List, ChevronLeft, ChevronRight, Users, Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavItem {
  to: string
  icon: React.ReactNode
  label: string
  locked?: boolean
}

function NavLink({ item, isCollapsed, showText, onClick }: {
  item: NavItem
  isCollapsed: boolean
  showText: boolean
  onClick: () => void
}) {
  const location = useLocation()
  const isActive = location.pathname === item.to

  const content = (
    <Link
      to={item.to}
      onClick={onClick}
      className={cn(
        isCollapsed && !showText
          ? 'flex items-center justify-center rounded-md p-2 text-sm hover:bg-sidebar-accent relative'
          : 'flex items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent',
        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : '',
        item.locked ? 'opacity-60' : '',
      )}
    >
      {item.icon}
      {!isCollapsed && showText && (
        <span className="whitespace-nowrap flex-1">{item.label}</span>
      )}
      {!isCollapsed && showText && item.locked && (
        <Lock className="w-3 h-3 text-muted-foreground ml-auto" />
      )}
    </Link>
  )

  if (isCollapsed && !showText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          {item.label}{item.locked ? ' (잠금)' : ''}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export function Sidebar({ isOpen = false, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [showText, setShowText] = useState(!isCollapsed)

  useEffect(() => {
    if (!isCollapsed) {
      const timer = setTimeout(() => setShowText(true), 280)
      return () => clearTimeout(timer)
    } else {
      setShowText(false)
    }
  }, [isCollapsed])

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  const basicMenuItems: NavItem[] = [
    { to: '/utm-builder/create', icon: <Zap className="w-4 h-4" />, label: 'UTM 생성' },
    { to: '/utm-builder/history', icon: <List className="w-4 h-4" />, label: 'UTM 목록' },
  ]

  const adminMenuItems: NavItem[] = [
    { to: '/utm-builder/product', icon: <Package className="w-4 h-4" />, label: '브랜드/제품 관리', locked: true },
    { to: '/utm-builder/media', icon: <Monitor className="w-4 h-4" />, label: '매체 관리', locked: true },
    { to: '/utm-builder/content-type', icon: <FileType className="w-4 h-4" />, label: '콘텐츠타입 관리', locked: true },
    { to: '/utm-builder/placement', icon: <LayoutGrid className="w-4 h-4" />, label: '지면/구좌 관리', locked: true },
    { to: '/utm-builder/users', icon: <Users className="w-4 h-4" />, label: '사용자 관리', locked: true },
  ]

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 h-screen border-r bg-white text-sidebar-foreground transition-all duration-300 ease-in-out overflow-hidden',
          'md:flex md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-16' : 'md:w-64',
          'w-64',
        )}
      >
        <div className="flex h-full w-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {showText && <h1 className="text-lg font-bold whitespace-nowrap">UTM Builder</h1>}
            {isCollapsed && <div className="w-full" />}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center h-8 w-8 rounded-md hover:bg-sidebar-accent"
                title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
            <nav className="flex flex-col gap-1">
              {/* 기본 메뉴 섹션 */}
              {showText && (
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    기본 메뉴
                  </p>
                </div>
              )}

              {basicMenuItems.map(item => (
                <NavLink
                  key={item.to}
                  item={item}
                  isCollapsed={isCollapsed}
                  showText={showText}
                  onClick={handleLinkClick}
                />
              ))}

              {/* 관리자 메뉴 섹션 */}
              <div className="my-2 border-t border-sidebar-border" />

              {showText && (
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    관리자 메뉴
                  </p>
                </div>
              )}

              {adminMenuItems.map(item => (
                <NavLink
                  key={item.to}
                  item={item}
                  isCollapsed={isCollapsed}
                  showText={showText}
                  onClick={handleLinkClick}
                />
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
