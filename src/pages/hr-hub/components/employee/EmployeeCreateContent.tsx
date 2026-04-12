import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { SearchableSelect } from '../ui/SearchableSelect'
import { formatDateInput, formatPhoneInput } from './EmployeeSlideContent'
import type { Employee, Department } from '../../types/hr'

export function EmployeeCreateContent({ departments, allEmployees, onCreated }: { departments: Department[]; allEmployees: Employee[]; onCreated: (emp: Employee) => void }) {
  const [form, setForm] = useState<Partial<Employee> & { name: string }>({ name: '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [suggestedNo, setSuggestedNo] = useState<string | null>(null)
  const [allEmployeeNos, setAllEmployeeNos] = useState<string[]>([])
  const [noUpdatedMsg, setNoUpdatedMsg] = useState<string | null>(null)
  const [divisionId, setDivisionId] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')
  const [partId, setPartId] = useState<string>('')
  const isFirstHireDateEffect = useRef(true)

  async function fetchSuggestion(hireDate: string): Promise<string | null> {
    if (!hireDate) return null
    try {
      const data = await api.suggestEmployeeNo(hireDate)
      setSuggestedNo(data.suggested)
      setAllEmployeeNos(data.all_employee_nos ?? [])
      return data.suggested as string
    } catch { return null }
  }

  // 마운트 시 오늘 날짜 기준 사번 자동 부여
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    fetchSuggestion(today).then(no => {
      if (no) setForm(p => ({ ...p, employee_no: no }))
    })
  }, [])

  // 입사일 변경 시 사번 자동 업데이트
  useEffect(() => {
    const hireDate = form.hire_date as string | undefined
    if (isFirstHireDateEffect.current) { isFirstHireDateEffect.current = false; return }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(hireDate))) return
    fetchSuggestion(String(hireDate)).then(no => {
      if (no) {
        setForm(p => ({ ...p, employee_no: no }))
        setNoUpdatedMsg(`입사일 변경으로 사번이 ${no}로 업데이트되었습니다`)
      }
    })
  }, [form.hire_date])

  const divisionOptions = departments.filter(d => d.level === 'division').sort((a, b) => a.name.localeCompare(b.name))
  const teamOptions = divisionId ? departments.filter(d => d.level === 'team' && d.parent_id === divisionId).sort((a, b) => a.name.localeCompare(b.name)) : []
  const partOptions = teamId ? departments.filter(d => d.level === 'part' && d.parent_id === teamId).sort((a, b) => a.name.localeCompare(b.name)) : []
  const duplicateInitialEmployee = (form.initial as string | undefined)
    ? allEmployees.find(e => e.initial === form.initial)
    : null
  const duplicateEmailEmployee = (form.email as string | undefined)
    ? allEmployees.find(e => e.email === form.email)
    : null
  const duplicateEmployeeNo = (form.employee_no as string | undefined)
    ? allEmployees.find(e => e.employee_no === form.employee_no)
    : null
  const invalidInitial = (form.initial as string | undefined)
    ? !/^[A-Z]{2}$/.test(form.initial as string)
    : false

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-4 space-y-5 flex-1 overflow-y-auto">
        <p className="text-sm font-semibold text-foreground mb-3">신규 직원 정보</p>

        <div>
          <div className="flex items-center gap-1">
            <label className="text-[11px] text-muted-foreground">사번</label>
            <div className="relative group">
              <span className="text-[10px] text-muted-foreground border rounded-full w-3.5 h-3.5 inline-flex items-center justify-center cursor-default select-none leading-none">?</span>
              <div className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex whitespace-nowrap bg-foreground text-background text-[11px] px-2 py-1 rounded shadow-md z-50 pointer-events-none">
                입사 년도+월+일+순번 세자리 기준
              </div>
            </div>
          </div>
          <div className="mt-1 flex gap-1.5">
            <input
              type="text"
              value={(form.employee_no as string | undefined) ?? ''}
              onChange={e => { setForm(p => ({ ...p, employee_no: e.target.value })); setNoUpdatedMsg(null) }}
              className="flex-1 h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary"
            />
            {suggestedNo && (form.employee_no as string | undefined) !== suggestedNo && (
              <button
                type="button"
                onClick={() => { setForm(p => ({ ...p, employee_no: suggestedNo })); setNoUpdatedMsg(null) }}
                className="h-8 px-2.5 border rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors shrink-0"
                title={`추천: ${suggestedNo}`}
              >
                추천
              </button>
            )}
          </div>
          {allEmployeeNos.includes((form.employee_no as string | undefined) ?? '') && (
            <p className="text-[11px] text-red-500 mt-1">이미 사용 중인 사번입니다</p>
          )}
          {noUpdatedMsg && (
            <p className="text-[11px] text-blue-500 mt-1">{noUpdatedMsg}</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">이름 *</label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">직급</label>
          <SearchableSelect
            value={(form.job_grade as string | undefined) ?? ''}
            onChange={v => setForm(p => ({ ...p, job_grade: v }))}
            options={[
              { value: '인턴', label: '인턴' },
              { value: '사원', label: '사원' },
              { value: '주임', label: '주임' },
              { value: '대리', label: '대리' },
              { value: '과장', label: '과장' },
              { value: '팀장', label: '팀장' },
              { value: '실장', label: '실장' },
              { value: '이사', label: '이사' },
              { value: '대표이사', label: '대표이사' },
            ]}
            placeholder="선택"
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">실</label>
          <SearchableSelect
            value={divisionId}
            onChange={v => {
              setDivisionId(v)
              setTeamId('')
              setPartId('')
              setForm(p => ({ ...p, department_id: v || undefined }))
            }}
            options={divisionOptions.map(d => ({ value: d.id, label: d.name }))}
            placeholder="선택"
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">팀</label>
          <SearchableSelect
            value={teamId}
            onChange={v => {
              setTeamId(v)
              setPartId('')
              setForm(p => ({ ...p, department_id: v || divisionId || undefined }))
            }}
            options={teamOptions.map(d => ({ value: d.id, label: d.name }))}
            placeholder="선택"
            disabled={!divisionId}
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">파트</label>
          <SearchableSelect
            value={partId}
            onChange={v => {
              setPartId(v)
              setForm(p => ({ ...p, department_id: v || teamId || divisionId || undefined }))
            }}
            options={partOptions.map(d => ({ value: d.id, label: d.name }))}
            placeholder="선택"
            disabled={!teamId}
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">고용형태</label>
          <SearchableSelect
            value={(form.employment_type as string | undefined) ?? ''}
            onChange={v => setForm(p => ({ ...p, employment_type: v }))}
            options={[
              { value: '정규직', label: '정규직' },
              { value: '계약직', label: '계약직' },
            ]}
            placeholder="선택"
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">입사일</label>
          <input type="text" value={(form.hire_date as string | undefined) ?? ''} onChange={e => setForm(p => ({ ...p, hire_date: formatDateInput(e.target.value) }))}
            placeholder="YYYY-MM-DD"
            className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
          {(form.hire_date as string | undefined) && !/^\d{4}-\d{2}-\d{2}$/.test((form.hire_date as string) ?? '') && (
            <p className="text-[11px] text-red-500 mt-1">YYYY-MM-DD 형식으로 입력해주세요</p>
          )}
          {noUpdatedMsg && (
            <p className="text-[11px] text-blue-500 mt-1">{noUpdatedMsg}</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">전화</label>
          <input type="text" value={(form.phone as string | undefined) ?? ''} onChange={e => setForm(p => ({ ...p, phone: formatPhoneInput(e.target.value) }))}
            placeholder="010-0000-0000"
            className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">이메일</label>
          <input type="email" value={(form.email as string | undefined) ?? ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
          {duplicateEmailEmployee && (
            <p className="text-[11px] text-red-500 mt-1">{duplicateEmailEmployee.name}님과 중복된 이메일입니다</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">성별</label>
          <SearchableSelect
            value={(form.gender as string | undefined) ?? ''}
            onChange={v => setForm(p => ({ ...p, gender: v }))}
            options={[
              { value: 'M', label: 'M' },
              { value: 'F', label: 'F' },
            ]}
            placeholder="선택"
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">생년월일</label>
          <input type="text" value={(form.birth_date as string | undefined) ?? ''} onChange={e => setForm(p => ({ ...p, birth_date: formatDateInput(e.target.value) }))}
            placeholder="YYYY-MM-DD"
            className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
          {(form.birth_date as string | undefined) && !/^\d{4}-\d{2}-\d{2}$/.test((form.birth_date as string) ?? '') && (
            <p className="text-[11px] text-red-500 mt-1">YYYY-MM-DD 형식으로 입력해주세요</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">이니셜</label>
          <input type="text" value={(form.initial as string | undefined) ?? ''} onChange={e => setForm(p => ({ ...p, initial: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) }))}
            placeholder="예: AB (대문자 2글자)"
            className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
          <p className="text-[11px] text-muted-foreground mt-1">광고 코드 생성 시 해당 이니셜이 코드에 포함됩니다</p>
          {invalidInitial && (
            <p className="text-[11px] text-red-500 mt-1">대문자 2글자만 입력 가능합니다</p>
          )}
          {!invalidInitial && duplicateInitialEmployee && (
            <p className="text-[11px] text-red-500 mt-1">{duplicateInitialEmployee.name}님과 중복된 이니셜입니다</p>
          )}
        </div>

        <div>
          <label className="text-[11px] text-muted-foreground">메모</label>
          <textarea value={(form.note as string | undefined) ?? ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
            rows={3}
            className="mt-1 w-full px-2.5 py-1.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary resize-none" />
        </div>
      </div>

      <div className="shrink-0 border-t bg-card px-4 py-3">
        {saveError && <p className="text-xs text-red-500 mb-2">{saveError}</p>}
        <button
          onClick={async () => {
            if (!form.name) { setSaveError('이름을 입력해주세요'); return }
            setSaving(true)
            setSaveError(null)
            try {
              const newEmployee = await api.createEmployee(form as Partial<Employee> & { name: string })
              onCreated(newEmployee)
            } catch (e: unknown) {
              setSaveError(e instanceof Error ? e.message : '직원 등록 실패')
            } finally {
              setSaving(false)
            }
          }}
          disabled={saving || !form.name || !!duplicateInitialEmployee || !!duplicateEmailEmployee || !!duplicateEmployeeNo || invalidInitial ||
            ((form.hire_date as string | undefined) ? !/^\d{4}-\d{2}-\d{2}$/.test(form.hire_date as string) : false) ||
            ((form.birth_date as string | undefined) ? !/^\d{4}-\d{2}-\d{2}$/.test(form.birth_date as string) : false)}
          className="w-full h-10 border rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
