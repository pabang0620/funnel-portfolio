import { type ReactNode, useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { Button } from './ui/button'
import { Menu, X } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  fullWidth?: boolean
}

export function Layout({ children, fullWidth = false }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('utm-sidebar-collapsed')
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem('utm-sidebar-collapsed', String(isCollapsed))
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: isCollapsed } }))
  }, [isCollapsed])

  return (
    <div className="flex h-screen">
      {/* Mobile Header with Toggle Button */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center gap-3 bg-background border-b p-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <h1 className="text-lg font-bold">UTM Builder</h1>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <main
        className={`flex-1 overflow-hidden bg-background pt-16 md:pt-4 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        {fullWidth
          ? children
          : (
            <div className="w-full h-full flex flex-col max-w-[1480px] mx-auto">
              {children}
            </div>
          )}
      </main>
    </div>
  )
}
