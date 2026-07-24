import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, X, UserPlus, FileSpreadsheet } from 'lucide-react'
import { api } from '../lib/api'
import { SlidePanel } from '../components/layout/SlidePanel'
import { SearchableSelect } from '../components/ui/SearchableSelect'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Employee, Department } from '../types/hr'
import { EmployeeSlideContent, formatDateInput } from '../components/employee/EmployeeSlideContent'
import { DeptAddButtons } from '../components/department/DeptAddButtons'
import { EmployeeCreateContent } from '../components/employee/EmployeeCreateContent'
import { exportEmployeesToExcel } from '../lib/exportExcel'

// ── Row type ───────────────────────────────────────────────────────────────────

interface FlatRow {
  employee: Employee
  division: string | null
  team: string | null
  part: string | null
  showDivision: boolean
  showTeam: boolean
  showPart: boolean
  isDivisionStart: boolean
  isTeamStart: boolean
}

// ── buildFlatRows ──────────────────────────────────────────────────────────────

function buildFlatRows(employees: Employee[]): FlatRow[] {
  return employees.map((emp, idx) => {
    const segs = emp.department_full_path ? emp.department_full_path.split('_') : []
    const division = segs[0] ?? null
    const team = segs[1] ?? null
    const part = segs[2] ?? null

    const prev = idx > 0 ? employees[idx - 1] : null
    const prevSegs = prev?.department_full_path ? prev.department_full_path.split('_') : []
    const prevDiv = prevSegs[0] ?? null
    const prevTeam = prevSegs[1] ?? null
    const prevPart = prevSegs[2] ?? null

    const isDivisionStart = division !== prevDiv
    const isTeamStart = isDivisionStart || team !== prevTeam

    const showDivision = isDivisionStart
    const showTeam = isTeamStart
    const showPart = isTeamStart || part !== prevPart

    return { employee: emp, division, team, part, showDivision, showTeam, showPart, isDivisionStart, isTeamStart }
  })
}

// ── calcTenure ─────────────────────────────────────────────────────────────────

function calcTenure(hireDate: string | null): string {
  if (!hireDate) return '-'
  const start = new Date(hireDate)
  const now = new Date('2026-03-16')
  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()
  if (months < 0) { years--; months += 12 }
  if (years === 0) return `${months}개월`
  return `${years}년 ${months}개월`
}

// ── SortIcon ───────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <span className="ml-1 opacity-30">↕</span>
  return <span className="ml-1 text-primary">{dir === 'asc' ? '↑' : '↓'}</span>
}

// ── EmployeeListPage ───────────────────────────────────────────────────────────

type SortKey = 'division' | 'team' | 'part' | 'name' | 'employment_type' | 'hire_date' | 'tenure' | 'gender' | 'employee_no' | 'job_grade' | 'email' | 'phone' | 'updated_at'

export default function EmployeeListPage() {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterQuery, setFilterQuery] = useState('')
  const [filterDivision, setFilterDivision] = useLocalStorage('emp_filter_division', '')
  const [filterTeam, setFilterTeam] = useLocalStorage('emp_filter_team', '')
  const [filterPart, setFilterPart] = useLocalStorage('emp_filter_part', '')
  const [filterEmploymentType, setFilterEmploymentType] = useLocalStorage('emp_filter_employment_type', '')
  const [filterHireDateFrom, setFilterHireDateFrom] = useState('')
  const [filterHireDateTo, setFilterHireDateTo] = useState('')

  // 검색 버튼 클릭 시에만 반영되는 확정 필터
  const [committed, setCommitted] = useState({
    query: '', division: filterDivision, team: filterTeam,
    part: filterPart, employmentType: filterEmploymentType,
    hireDateFrom: '', hireDateTo: '',
  })

  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [createPanelOpen, setCreatePanelOpen] = useState(false)

  const teamSelectRef = useRef<HTMLButtonElement>(null)
  const partSelectRef = useRef<HTMLButtonElement>(null)

  const PAGE_SIZE = 100
  const [currentPage, setCurrentPage] = useState(1)

  function commitSearch() {
    setCommitted({
      query: filterQuery,
      division: filterDivision,
      team: filterTeam,
      part: filterPart,
      employmentType: filterEmploymentType,
      hireDateFrom: filterHireDateFrom,
      hireDateTo: filterHireDateTo,
    })
    setCurrentPage(1)
  }

  function fetchAll() {
    setLoading(true)
    setError(null)
    api.getEmployees({ limit: 9999 })
      .then(r => setAllEmployees(r.employees))
      .catch(err => setError(err.message || '직원 목록을 불러오지 못했습니다'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {})
  }, [])

  useEffect(() => {
    const handler = () => api.getDepartments().then(setDepartments).catch(() => {})
    window.addEventListener('hr:dept-changed', handler)
    return () => window.removeEventListener('hr:dept-changed', handler)
  }, [])

  function handleSort(key: SortKey) {
    setCurrentPage(1)
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // 실 변경 시 팀/파트 초기화
  useEffect(() => {
    setFilterTeam('')
    setFilterPart('')
  }, [filterDivision])

  // 팀 변경 시 파트 초기화
  useEffect(() => {
    setFilterPart('')
  }, [filterTeam])

  function resetFilters() {
    setFilterQuery('')
    setFilterDivision('')
    setFilterTeam('')
    setFilterPart('')
    setFilterEmploymentType('')
    setFilterHireDateFrom('')
    setFilterHireDateTo('')
    setCommitted({ query: '', division: '', team: '', part: '', employmentType: '', hireDateFrom: '', hireDateTo: '' })
    setCurrentPage(1)
  }

  // ── 클라이언트 사이드 필터/정렬/페이지네이션 ──────────────────────────────────

  const filteredEmployees = useMemo(() => {
    let result = allEmployees

    if (committed.query) {
      const q = committed.query.toLowerCase()
      result = result.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.phone?.includes(q) ||
        e.initial?.toLowerCase().includes(q)
      )
    }

    if (committed.division) {
      result = result.filter(e => {
        const segs = e.department_full_path?.split('_') ?? []
        return segs[0] === committed.division
      })
    }
    if (committed.team) {
      result = result.filter(e => {
        const segs = e.department_full_path?.split('_') ?? []
        return segs[1] === committed.team
      })
    }
    if (committed.part) {
      result = result.filter(e => {
        const segs = e.department_full_path?.split('_') ?? []
        return segs[2] === committed.part
      })
    }

    if (committed.employmentType) {
      result = result.filter(e => e.employment_type === committed.employmentType)
    }

    if (committed.hireDateFrom) {
      result = result.filter(e => e.hire_date && e.hire_date >= committed.hireDateFrom)
    }
    if (committed.hireDateTo) {
      result = result.filter(e => e.hire_date && e.hire_date <= committed.hireDateTo)
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let aVal: string | null = null
        let bVal: string | null = null

        if (sortKey === 'division' || sortKey === 'team' || sortKey === 'part') {
          const idx = sortKey === 'division' ? 0 : sortKey === 'team' ? 1 : 2
          aVal = a.department_full_path?.split('_')[idx] ?? null
          bVal = b.department_full_path?.split('_')[idx] ?? null
        } else if (sortKey === 'tenure') {
          // 근속: hire_date 빠를수록 근속 길다 → 방향 반전
          aVal = a.hire_date ?? null
          bVal = b.hire_date ?? null
          const cmp = (aVal ?? '').localeCompare(bVal ?? '')
          return sortDir === 'asc' ? -cmp : cmp
        } else {
          aVal = (a[sortKey as keyof Employee] as string | null) ?? null
          bVal = (b[sortKey as keyof Employee] as string | null) ?? null
        }

        const cmp = (aVal ?? '').localeCompare(bVal ?? '')
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [allEmployees, committed, sortKey, sortDir])

  const total = filteredEmployees.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pagedEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // ── Chip lists ───────────────────────────────────────────────────────────────

  const divisions = useMemo(
    () => departments.filter(d => d.level === 'division').sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  )

  const allTeams = useMemo(
    () => departments.filter(d => d.level === 'team').sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  )
  const allParts = useMemo(
    () => departments.filter(d => d.level === 'part').sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  )

  const filteredTeamOptions = useMemo(() => {
    if (!filterDivision) return []
    const selectedDiv = divisions.find(d => d.name === filterDivision)
    if (!selectedDiv) return []
    return allTeams.filter(t => t.parent_id === selectedDiv.id)
  }, [filterDivision, divisions, allTeams])

  const filteredPartOptions = useMemo(() => {
    if (!filterTeam) return []
    const selectedTeam = allTeams.find(t => t.name === filterTeam)
    if (!selectedTeam) return []
    return allParts.filter(p => p.parent_id === selectedTeam.id)
  }, [filterTeam, allTeams, allParts])

  const employmentTypes = useMemo(
    () => [...new Set(allEmployees.map(e => e.employment_type).filter(Boolean) as string[])].sort(),
    [allEmployees]
  )

  // ── Misc ─────────────────────────────────────────────────────────────────────

  const rows = buildFlatRows(pagedEmployees)
  const hasFilters = !!(filterQuery || filterDivision || filterTeam || filterPart || filterEmploymentType || filterHireDateFrom || filterHireDateTo ||
    committed.query || committed.division || committed.team || committed.part || committed.employmentType || committed.hireDateFrom || committed.hireDateTo)

  const pageStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const pageEnd = Math.min(currentPage * PAGE_SIZE, total)

  return (
    <div className="flex flex-col h-full">
      {/* Filter Bar */}
      <div className="sticky top-0 z-20 px-4 py-3 border-b bg-card shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* 이름/전화/이니셜 검색 */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="이름 / 전화 / 이니셜 검색..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitSearch() }}
              className="h-8 pl-3 pr-8 border rounded-md bg-background text-foreground text-sm outline-none focus:border-primary w-56 transition-colors"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery('')}
                className="absolute right-2 h-6 w-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* 실 선택 */}
          <SearchableSelect
            value={filterDivision}
            onChange={setFilterDivision}
            options={divisions.map(d => ({ value: d.name, label: d.name }))}
            placeholder="실 전체"
            onSelect={() => setTimeout(() => teamSelectRef.current?.focus(), 50)}
          />

          {/* 팀 선택 */}
          <SearchableSelect
            value={filterTeam}
            onChange={setFilterTeam}
            options={filteredTeamOptions.map(t => ({ value: t.name, label: t.name }))}
            placeholder="팀 전체"
            disabled={!filterDivision}
            triggerRef={teamSelectRef}
            onSelect={() => setTimeout(() => partSelectRef.current?.focus(), 50)}
          />

          {/* 파트 선택 */}
          <SearchableSelect
            value={filterPart}
            onChange={setFilterPart}
            options={filteredPartOptions.map(p => ({ value: p.name, label: p.name }))}
            placeholder="파트 전체"
            disabled={!filterTeam}
            triggerRef={partSelectRef}
          />

          {/* 고용형태 선택 */}
          <SearchableSelect
            value={filterEmploymentType}
            onChange={setFilterEmploymentType}
            options={employmentTypes.map(t => ({ value: t, label: t }))}
            placeholder="고용형태 전체"
          />

          {/* 입사일 범위 */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground shrink-0">입사일</span>
            <input
              type="text"
              value={filterHireDateFrom}
              onChange={e => setFilterHireDateFrom(formatDateInput(e.target.value))}
              placeholder="YYYY-MM-DD"
              className="h-8 w-28 px-2 border rounded-md bg-background text-sm outline-none focus:border-primary text-foreground"
            />
            <span className="text-xs text-muted-foreground">~</span>
            <input
              type="text"
              value={filterHireDateTo}
              onChange={e => setFilterHireDateTo(formatDateInput(e.target.value))}
              placeholder="YYYY-MM-DD"
              className="h-8 w-28 px-2 border rounded-md bg-background text-sm outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* 검색 */}
          <button
            onClick={commitSearch}
            className="h-8 px-3 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Search size={12} />
            검색
          </button>

          {/* 초기화 */}
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="h-8 px-3 border rounded-md text-xs text-muted-foreground bg-background hover:bg-muted transition-colors flex items-center gap-1"
            >
              <X size={12} />
              초기화
            </button>
          )}

          <div className="flex-1" />

          {/* 부서 추가 버튼들 */}
          <DeptAddButtons onAdded={() => api.getDepartments().then(setDepartments).catch(() => {})} />

          {/* 직원 추가 */}
          <button
            onClick={() => setCreatePanelOpen(true)}
            className="h-8 px-3 rounded-md border text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <UserPlus size={13} />
            직원 추가
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-background">
        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">직원 목록 불러오는 중...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p className="text-sm font-medium text-foreground">{error}</p>
            <button
              onClick={fetchAll}
              className="px-4 py-1.5 text-sm border rounded-md hover:bg-muted transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && !error && total === 0 && (
          <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
            No search results
          </div>
        )}

        {!loading && !error && total > 0 && (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted border-b">
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-24 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('employee_no')}>사번<SortIcon active={sortKey === 'employee_no'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-20 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('name')}>이름<SortIcon active={sortKey === 'name'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-20 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('job_grade')}>직급<SortIcon active={sortKey === 'job_grade'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-32 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('division')}>실<SortIcon active={sortKey === 'division'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-32 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('team')}>팀<SortIcon active={sortKey === 'team'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-28 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('part')}>파트<SortIcon active={sortKey === 'part'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-24 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('employment_type')}>고용형태<SortIcon active={sortKey === 'employment_type'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-24 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('hire_date')}>입사일<SortIcon active={sortKey === 'hire_date'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-20 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('tenure')}>근속<SortIcon active={sortKey === 'tenure'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-32 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('phone')}>전화<SortIcon active={sortKey === 'phone'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-36 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('email')}>이메일<SortIcon active={sortKey === 'email'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-16 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('gender')}>성별<SortIcon active={sortKey === 'gender'} dir={sortDir} /></th>
                <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-28 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('updated_at')}>최근 수정일<SortIcon active={sortKey === 'updated_at'} dir={sortDir} /></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isResigned = !!row.employee.leave_date
                return (
                  <tr
                    key={row.employee.id}
                    onClick={() => {
                      setSelectedEmployee(row.employee)
                      setPanelOpen(true)
                    }}
                    className={`hover:bg-muted cursor-pointer transition-colors border-b border-border ${isResigned ? 'opacity-50' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-xs text-muted-foreground align-top">{row.employee.employee_no ?? ''}</td>
                    <td className="px-3 py-2.5 align-top">
                      <span className="font-medium text-foreground">{row.employee.name}</span>
                      {isResigned && <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-600">퇴사</span>}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-foreground align-top">{row.employee.job_grade ?? ''}</td>
                    <td className="px-3 py-2.5 text-sm text-foreground font-medium align-top">
                      {row.division ?? ''}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-foreground align-top">
                      {row.team ?? ''}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground align-top">
                      {row.part ?? ''}
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {row.employee.employment_type && (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted border text-muted-foreground">
                          {row.employee.employment_type}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-foreground align-top">{row.employee.hire_date ?? ''}</td>
                    <td className="px-3 py-2.5 text-sm text-muted-foreground align-top">{calcTenure(row.employee.hire_date)}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground align-top">{row.employee.phone ?? ''}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground align-top">{row.employee.email ?? ''}</td>
                    <td className="px-3 py-2.5 text-sm text-foreground align-top">{row.employee.gender ?? ''}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground align-top">{row.employee.updated_at ? new Date(row.employee.updated_at).toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16) : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-background shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {pageStart}-{pageEnd} / 총 {total}명
            </span>
            <button
              onClick={() => exportEmployeesToExcel(filteredEmployees)}
              className="px-2 py-1 text-xs border rounded-md hover:bg-muted transition-colors flex items-center gap-1"
            >
              <FileSpreadsheet size={12} />
              엑셀 다운로드
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs border rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &lt; 이전
            </button>
            <span className="text-xs text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs border rounded-md hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음 &gt;
            </button>
          </div>
        </div>
      )}

      <SlidePanel
        open={panelOpen}
        title={selectedEmployee?.name ?? '직원 상세'}
        onClose={() => setPanelOpen(false)}
      >
        {selectedEmployee && (
          <EmployeeSlideContent
            employee={selectedEmployee}
            onUpdated={(updated) => {
              setSelectedEmployee(updated)
              setAllEmployees(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e))
            }}
            onDeleted={() => {
              setAllEmployees(prev => prev.filter(e => e.id !== selectedEmployee.id))
              setPanelOpen(false)
              window.dispatchEvent(new Event('hr:stats-changed'))
            }}
            departments={departments}
            allEmployees={allEmployees}
          />
        )}
      </SlidePanel>

      <SlidePanel
        open={createPanelOpen}
        title="직원 추가"
        onClose={() => setCreatePanelOpen(false)}
      >
        <EmployeeCreateContent
          departments={departments}
          allEmployees={allEmployees}
          onCreated={(newEmployee) => {
            setAllEmployees(prev => [...prev, newEmployee])
            setCreatePanelOpen(false)
            window.dispatchEvent(new Event('hr:stats-changed'))
          }}
        />
      </SlidePanel>
    </div>
  )
}
