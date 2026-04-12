import { Search, KeyRound, Link, Bookmark, LayoutGrid, Shield, Lock } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
} from '../ui/sidebar'

interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  locked?: boolean
}

const menuItems: MenuItem[] = [
  { title: '광고 조회', url: '/ad-library-scraper/results', icon: Search },
  { title: '랜딩 주소', url: '/ad-library-scraper/landing-urls', icon: Link },
  { title: '북마크', url: '/ad-library-scraper/bookmarks', icon: Bookmark },
  { title: '레퍼런스', url: '/ad-library-scraper/references', icon: LayoutGrid },
  { title: '키워드 관리', url: '/ad-library-scraper/keywords', icon: KeyRound },
  { title: '관리자', url: '/ad-library-scraper/admin', icon: Shield, locked: true },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="text-lg font-bold">Ad Library Scraper</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>메뉴</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.locked ? (
                    <SidebarMenuButton
                      className="opacity-60 cursor-not-allowed"
                      onClick={(e) => e.preventDefault()}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      <Lock className="h-3 w-3 ml-auto text-muted-foreground" />
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      isActive={location.pathname === item.url || location.pathname.endsWith(item.url.split('/').pop()!)}
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
