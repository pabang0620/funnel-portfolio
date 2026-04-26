import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Wand2,
  BookOpen,
  Tags,
  FolderTree,
  Package,
  Link,
  Users,
  Lock,
} from 'lucide-react'
import { cn } from '../../lib/utils'

export type Tab = 'upload' | 'dashboard' | 'analytics' | 'search' | 'products' | 'category-groups' | 'attribute-labels' | 'label-connections' | 'guide' | 'admin' | 'ad-code-mapping'

interface AppSidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const mainMenuItems = [
  { id: 'dashboard' as Tab, icon: LayoutDashboard, label: '대시보드', locked: true },
  { id: 'upload' as Tab, icon: Upload, label: '업로드' },
  { id: 'search' as Tab, icon: Search, label: '콘텐츠 검색' },
  { id: 'guide' as Tab, icon: BookOpen, label: '가이드', locked: true },
  { id: 'analytics' as Tab, icon: BarChart3, label: '콘텐츠 분석' },
  { id: 'ad-code-mapping' as Tab, icon: Wand2, label: '광고코드 자동 입력', locked: true },
]

const adminMenuItems = [
  { id: 'products' as Tab, icon: Package, label: '제품', locked: true },
  { id: 'category-groups' as Tab, icon: FolderTree, label: '카테고리 그룹', locked: true },
  { id: 'attribute-labels' as Tab, icon: Tags, label: '속성 라벨', locked: true },
  { id: 'label-connections' as Tab, icon: Link, label: '라벨 연결', locked: true },
  { id: 'admin' as Tab, icon: Users, label: '사용자 관리', locked: true },
]

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn('flex flex-col h-full transition-all duration-200', collapsed ? 'w-14' : 'w-56')}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b h-14">
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground truncate">Ad Content Storage</span>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="p-1 rounded hover:bg-sidebar-accent text-sidebar-muted shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main menu */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-1.5 text-xs font-medium text-sidebar-muted uppercase tracking-wide">Basic</div>
        )}
        {mainMenuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left',
              activeTab === item.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              item.locked ? 'opacity-60' : ''
            )}
            title={collapsed ? `${item.label}${item.locked ? ' (잠금)' : ''}` : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate flex-1">{item.label}</span>}
            {!collapsed && item.locked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
          </button>
        ))}

        {!collapsed && (
          <div className="px-3 py-1.5 mt-2 text-xs font-medium text-sidebar-muted uppercase tracking-wide">Admin</div>
        )}
        {collapsed && <div className="border-t border-sidebar-border my-2" />}
        {adminMenuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left',
              activeTab === item.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
              item.locked ? 'opacity-60' : ''
            )}
            title={collapsed ? `${item.label}${item.locked ? ' (잠금)' : ''}` : undefined}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate flex-1">{item.label}</span>}
            {!collapsed && item.locked && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
          </button>
        ))}
      </nav>

      {/* Footer user info */}
      <div className={cn('border-t border-sidebar-border p-3 flex items-center gap-2', collapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
          관
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">관리자</div>
            <div className="text-xs text-sidebar-muted truncate">admin@portfoliomance.co.kr</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for use in pages
export function useTabNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentTab: Tab = location.pathname.includes('/upload') ? 'upload'
    : location.pathname.includes('/search') ? 'search'
    : location.pathname.includes('/dashboard') ? 'dashboard'
    : location.pathname.includes('/analytics') ? 'analytics'
    : location.pathname.includes('/products') ? 'products'
    : location.pathname.includes('/category-groups') ? 'category-groups'
    : location.pathname.includes('/attribute-labels') ? 'attribute-labels'
    : location.pathname.includes('/label-connections') ? 'label-connections'
    : location.pathname.includes('/admin') ? 'admin'
    : location.pathname.includes('/ad-code-mapping') ? 'ad-code-mapping'
    : 'search'

  const handleTabChange = (tab: Tab) => {
    const base = location.pathname.replace(/\/ad-content-storage\/.+/, '/ad-content-storage')
    navigate(`${base}/${tab}`)
  }

  return { currentTab, handleTabChange }
}
