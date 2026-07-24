import { useState, useEffect } from 'react'
import { Network, Users, PanelLeft, LogOut, CircleUser } from 'lucide-react'
import { api, decodeTokenUser } from '../../lib/api'

interface SidebarProps {
  activePage: 'org' | 'employees'
  onNavigate: (page: 'org' | 'employees') => void
  onLogout?: () => void
}

export function Sidebar({ activePage, onNavigate, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [stats, setStats] = useState({ employees: 0, divisions: 0, teams: 0, parts: 0 })
  const user = decodeTokenUser()
  const [deptLabel, setDeptLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.id === 'admin' || user.id === 'demo') return
    api.getEmployee(user.id).then(emp => {
      const hier = emp.hierarchy ?? []
      const division = hier.find(h => h.level === 'division')?.name
      const team = hier.find(h => h.level === 'team')?.name
      const part = hier.find(h => h.level === 'part')?.name
      const parts = [division, team, part].filter(Boolean)
      setDeptLabel(parts.length > 0 ? parts.join(' / ') : null)
    }).catch(() => {})
  }, [user?.id])

  function fetchStats() {
    Promise.all([
      api.getEmployees({ limit: 1 }),
      api.getDepartments(),
    ]).then(([empResult, depts]) => {
      setStats({
        employees: empResult.total,
        divisions: depts.filter(d => d.level === 'division').length,
        teams: depts.filter(d => d.level === 'team').length,
        parts: depts.filter(d => d.level === 'part').length,
      })
    }).catch(() => {})
  }

  useEffect(() => {
    fetchStats()
    const handler = () => fetchStats()
    window.addEventListener('hr:stats-changed', handler)
    return () => window.removeEventListener('hr:stats-changed', handler)
  }, [])

  return (
    <aside
      className={`shrink-0 border-r bg-card flex flex-col py-3 px-2 gap-1 overflow-hidden transition-all duration-200 ${
        isOpen ? 'w-[200px]' : 'w-12'
      }`}
    >
      <div className={`flex items-center mb-2 px-1 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-[6px] bg-[#2563EB] flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white leading-none">HR</span>
            </div>
            <span className="text-sm font-semibold text-foreground" title="Employee directory over a four-level org hierarchy, with Excel export">HR Hub</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <PanelLeft size={16} />
        </button>
      </div>

      <hr className="border-border mb-1" />

      <button
        onClick={() => onNavigate('employees')}
        className={`flex items-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
          isOpen ? 'px-2.5' : 'justify-center px-0'
        } ${
          activePage === 'employees'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Users size={16} className="shrink-0" />
        {isOpen && <span>Employees</span>}
      </button>
      <button
        onClick={() => onNavigate('org')}
        className={`flex items-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
          isOpen ? 'px-2.5' : 'justify-center px-0'
        } ${
          activePage === 'org'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <Network size={16} className="shrink-0" />
        {isOpen && <span>Org Chart</span>}
      </button>
      <div className="flex-1" />

      {!isOpen && (
        <button
          onClick={() => onLogout?.()}
          className="flex items-center justify-center py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Log out"
        >
          <LogOut size={16} className="shrink-0" />
        </button>
      )}

      {isOpen && (
        <div className="border-t pt-3 mt-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide px-2.5 mb-2">
            Stats
          </p>
          <div className="flex items-center justify-between px-2.5 py-1 text-sm">
            <span className="text-foreground">Total employees</span>
            <span className="font-semibold text-primary">{stats.employees}</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1 text-sm">
            <span className="text-foreground">Divisions</span>
            <span className="font-semibold text-primary">{stats.divisions}</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1 text-sm">
            <span className="text-foreground">Teams</span>
            <span className="font-semibold text-primary">{stats.teams}</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1 text-sm">
            <span className="text-foreground">Parts</span>
            <span className="font-semibold text-primary">{stats.parts}</span>
          </div>
        </div>
      )}

      {isOpen && user && (
        <div className="border-t pt-3 mt-1">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              User
            </p>
            <button
              onClick={() => onLogout?.()}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Log out"
            >
              <LogOut size={13} />
            </button>
          </div>
          <div className="px-2.5 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                <CircleUser size={14} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            </div>
            {deptLabel && (
              <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                <span className="font-medium">Dept: </span>{deptLabel}
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
