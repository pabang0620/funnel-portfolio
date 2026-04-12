import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  return (
    <div className="flex h-full overflow-hidden bg-background">
      {sidebar && (
        <div className="shrink-0 border-r bg-sidebar flex flex-col">
          {sidebar}
        </div>
      )}
      <div className="flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
