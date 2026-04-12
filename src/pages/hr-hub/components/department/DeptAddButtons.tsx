import { useState, useEffect } from 'react'
import { Building2, Users, Layers } from 'lucide-react'
import { api } from '../../lib/api'
import { SearchableSelect } from '../ui/SearchableSelect'
import type { Department } from '../../types/hr'

interface DeptAddButtonsProps {
  onAdded: () => void
}

export function DeptAddButtons({ onAdded }: DeptAddButtonsProps) {
  const [departments, setDepartments] = useState<Department[]>([])

  const [addDivisionOpen, setAddDivisionOpen] = useState(false)
  const [newDivisionName, setNewDivisionName] = useState('')
  const [addDivisionError, setAddDivisionError] = useState<string | null>(null)

  const [addTeamOpen, setAddTeamOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [addTeamDivision, setAddTeamDivision] = useState('')
  const [addTeamError, setAddTeamError] = useState<string | null>(null)

  const [addPartOpen, setAddPartOpen] = useState(false)
  const [newPartName, setNewPartName] = useState('')
  const [addPartTeam, setAddPartTeam] = useState('')
  const [addPartError, setAddPartError] = useState<string | null>(null)

  function loadDepartments() {
    api.getDepartments().then(setDepartments).catch(() => {})
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  useEffect(() => {
    const handler = () => loadDepartments()
    window.addEventListener('hr:dept-changed', handler)
    return () => window.removeEventListener('hr:dept-changed', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (addDivisionOpen) { setAddDivisionOpen(false); setNewDivisionName(''); setAddDivisionError(null) }
      if (addTeamOpen) { setAddTeamOpen(false); setNewTeamName(''); setAddTeamDivision(''); setAddTeamError(null) }
      if (addPartOpen) { setAddPartOpen(false); setNewPartName(''); setAddPartTeam(''); setAddPartError(null) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [addDivisionOpen, addTeamOpen, addPartOpen])

  const divisions = departments.filter(d => d.level === 'division').sort((a, b) => a.name.localeCompare(b.name))
  const allTeams = departments.filter(d => d.level === 'team').sort((a, b) => a.name.localeCompare(b.name))
  const allParts = departments.filter(d => d.level === 'part')

  const divDept = departments.find(d => d.name === addTeamDivision && d.level === 'division')
  const teamDept = departments.find(d => d.name === addPartTeam && d.level === 'team')

  const duplicateDivision = newDivisionName.trim() ? divisions.some(d => d.name === newDivisionName.trim()) : false
  const duplicateTeam = newTeamName.trim() && addTeamDivision ? allTeams.some(t => t.name === newTeamName.trim() && t.parent_id === divDept?.id) : false
  const duplicatePart = newPartName.trim() && addPartTeam ? allParts.some(p => p.name === newPartName.trim() && p.parent_id === teamDept?.id) : false

  const btnClass = 'h-8 px-3 rounded-md border text-xs font-medium bg-card text-foreground hover:bg-muted transition-colors flex items-center gap-1.5'

  return (
    <>
      <button onClick={() => setAddDivisionOpen(true)} className={btnClass}>
        <Building2 size={13} />
        실 추가
      </button>
      <button onClick={() => setAddTeamOpen(true)} className={btnClass}>
        <Users size={13} />
        팀 추가
      </button>
      <button onClick={() => setAddPartOpen(true)} className={btnClass}>
        <Layers size={13} />
        파트 추가
      </button>

      {addDivisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border rounded-xl shadow-lg p-6 w-80 flex flex-col gap-4">
            <p className="text-sm font-semibold">새 실 추가</p>
            <input
              type="text"
              value={newDivisionName}
              onChange={e => setNewDivisionName(e.target.value)}
              placeholder="실 이름"
              className="h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (!newDivisionName.trim()) return
                  api.createDepartment({ name: newDivisionName.trim(), level: 'division' })
                    .then(() => {
                      setAddDivisionOpen(false)
                      setNewDivisionName('')
                      setAddDivisionError(null)
                      onAdded()
                      window.dispatchEvent(new Event('hr:stats-changed'))
                      window.dispatchEvent(new Event('hr:dept-changed'))
                    })
                    .catch((e: unknown) => setAddDivisionError(e instanceof Error ? e.message : '추가 실패'))
                }
              }}
            />
            {duplicateDivision && <p className="text-xs text-red-500">이미 존재하는 실 이름입니다</p>}
            {addDivisionError && <p className="text-xs text-red-500">{addDivisionError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => { setAddDivisionOpen(false); setNewDivisionName(''); setAddDivisionError(null) }}
                className="flex-1 h-9 border rounded-md text-sm hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!newDivisionName.trim() || duplicateDivision) return
                  try {
                    await api.createDepartment({ name: newDivisionName.trim(), level: 'division' })
                    setAddDivisionOpen(false)
                    setNewDivisionName('')
                    setAddDivisionError(null)
                    onAdded()
                    window.dispatchEvent(new Event('hr:stats-changed'))
                    window.dispatchEvent(new Event('hr:dept-changed'))
                  } catch (e: unknown) {
                    setAddDivisionError(e instanceof Error ? e.message : '추가 실패')
                  }
                }}
                disabled={!newDivisionName.trim() || duplicateDivision}
                className="flex-1 h-9 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {addTeamOpen && (() => {
        const submit = async () => {
          if (!newTeamName.trim() || !addTeamDivision) return
          try {
            await api.createDepartment({ name: newTeamName.trim(), level: 'team', parent_id: divDept?.id })
            setAddTeamOpen(false); setNewTeamName(''); setAddTeamDivision(''); setAddTeamError(null)
            onAdded()
            window.dispatchEvent(new Event('hr:stats-changed'))
            window.dispatchEvent(new Event('hr:dept-changed'))
          } catch (e: unknown) { setAddTeamError(e instanceof Error ? e.message : '추가 실패') }
        }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-card border rounded-xl shadow-lg p-6 w-80 flex flex-col gap-4">
              <p className="text-sm font-semibold">새 팀 추가</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">상위 실</label>
                <SearchableSelect
                  value={addTeamDivision}
                  onChange={setAddTeamDivision}
                  options={divisions.map(d => ({ value: d.name, label: d.name }))}
                  placeholder="실 선택"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">팀 이름</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  placeholder="팀 이름"
                  className="h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') submit() }}
                />
              </div>
              {duplicateTeam && <p className="text-xs text-red-500">이미 존재하는 팀 이름입니다</p>}
              {addTeamError && <p className="text-xs text-red-500">{addTeamError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setAddTeamOpen(false); setNewTeamName(''); setAddTeamDivision(''); setAddTeamError(null) }}
                  className="flex-1 h-9 border rounded-md text-sm hover:bg-muted transition-colors"
                >취소</button>
                <button
                  onClick={submit}
                  disabled={!newTeamName.trim() || !addTeamDivision || duplicateTeam}
                  className="flex-1 h-9 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >추가</button>
              </div>
            </div>
          </div>
        )
      })()}

      {addPartOpen && (() => {
        const submit = async () => {
          if (!newPartName.trim() || !addPartTeam) return
          try {
            await api.createDepartment({ name: newPartName.trim(), level: 'part', parent_id: teamDept?.id })
            setAddPartOpen(false); setNewPartName(''); setAddPartTeam(''); setAddPartError(null)
            onAdded()
            window.dispatchEvent(new Event('hr:stats-changed'))
            window.dispatchEvent(new Event('hr:dept-changed'))
          } catch (e: unknown) { setAddPartError(e instanceof Error ? e.message : '추가 실패') }
        }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-card border rounded-xl shadow-lg p-6 w-80 flex flex-col gap-4">
              <p className="text-sm font-semibold">새 파트 추가</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">상위 팀</label>
                <SearchableSelect
                  value={addPartTeam}
                  onChange={setAddPartTeam}
                  options={allTeams.map(t => ({ value: t.name, label: t.name }))}
                  placeholder="팀 선택"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">파트 이름</label>
                <input
                  type="text"
                  value={newPartName}
                  onChange={e => setNewPartName(e.target.value)}
                  placeholder="파트 이름"
                  className="h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') submit() }}
                />
              </div>
              {duplicatePart && <p className="text-xs text-red-500">이미 존재하는 파트 이름입니다</p>}
              {addPartError && <p className="text-xs text-red-500">{addPartError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setAddPartOpen(false); setNewPartName(''); setAddPartTeam(''); setAddPartError(null) }}
                  className="flex-1 h-9 border rounded-md text-sm hover:bg-muted transition-colors"
                >취소</button>
                <button
                  onClick={submit}
                  disabled={!newPartName.trim() || !addPartTeam || duplicatePart}
                  className="flex-1 h-9 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >추가</button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
