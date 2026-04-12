import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { EmployeeAvatar } from '../ui/EmployeeAvatar'
import { SearchableSelect } from '../ui/SearchableSelect'
import type { Employee, Department } from '../../types/hr'

// ── EmployeeUpdatePayload ──────────────────────────────────────────────────────

interface EmployeeUpdatePayload {
  name?: string
  employee_no?: string
  job_grade?: string
  employment_type?: string
  hire_date?: string
  leave_date?: string
  birth_date?: string
  gender?: string
  phone?: string
  email?: string
  initial?: string
  note?: string
  department_id?: string
}

async function patchEmployee(id: string, payload: EmployeeUpdatePayload): Promise<Employee> {
  return api.patchEmployee(id, payload)
}

function isValidDateOrEmpty(v: string | undefined): boolean {
  if (!v) return true
  return /^\d{4}-\d{2}-\d{2}$/.test(v)
}

export function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0,4)}-${digits.slice(4)}`
  return `${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6)}`
}

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0,3)}-${digits.slice(3)}`
  return `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
}

// ── EmployeeSlideContent ───────────────────────────────────────────────────────

export function EmployeeSlideContent({ employee, onUpdated, onDeleted, departments, allEmployees }: {
  employee: Employee
  onUpdated: (updated: Employee) => void
  onDeleted: () => void
  departments: Department[]
  allEmployees: Employee[]
}) {
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<EmployeeUpdatePayload>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [suggestedNo, setSuggestedNo] = useState<string | null>(null)
  const [editDivisionId, setEditDivisionId] = useState<string>('')
  const [editTeamId, setEditTeamId] = useState<string>('')
  const [editPartId, setEditPartId] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function fetchSuggestion(hireDate: string) {
    if (!hireDate) return
    try {
      const data = await api.suggestEmployeeNo(hireDate)
      setSuggestedNo(data.suggested)
    } catch {}
  }

  useEffect(() => {
    if (!deleteConfirm) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDeleteConfirm(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [deleteConfirm])

  useEffect(() => {
    setEditMode(false)
    setForm({})
    setSaveError(null)
    setSuggestedNo(null)
    setEditDivisionId('')
    setEditTeamId('')
    setEditPartId('')
    setCopied(false)
    setDeleteConfirm(false)
  }, [employee.id])

  useEffect(() => {
    if (editMode && /^\d{4}-\d{2}-\d{2}$/.test(String(form.hire_date ?? ''))) fetchSuggestion(form.hire_date!)
  }, [form.hire_date, editMode])

  const divisionOptions = departments.filter(d => d.level === 'division').sort((a, b) => a.name.localeCompare(b.name))
  const teamOptions = editDivisionId ? departments.filter(d => d.level === 'team' && d.parent_id === editDivisionId).sort((a, b) => a.name.localeCompare(b.name)) : []
  const partOptions = editTeamId ? departments.filter(d => d.level === 'part' && d.parent_id === editTeamId).sort((a, b) => a.name.localeCompare(b.name)) : []
  const duplicateInitialEmployee = form.initial
    ? allEmployees.find(e => e.id !== employee.id && e.initial === form.initial)
    : null
  const duplicateEmailEmployee = form.email
    ? allEmployees.find(e => e.id !== employee.id && e.email === form.email)
    : null
  const duplicateEmployeeNo = form.employee_no && form.employee_no !== (employee.employee_no ?? '')
    ? allEmployees.find(e => e.id !== employee.id && e.employee_no === form.employee_no)
    : null
  const invalidInitial = form.initial !== undefined && form.initial !== (employee.initial ?? '')
    ? !/^[A-Z]{2}$/.test(form.initial)
    : false

  return (
    <>
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border rounded-xl shadow-lg p-6 w-80 flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-center">
              {employee.name}님을 삭제하시겠습니까?
              <br />
              <span className="text-xs text-muted-foreground">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 h-9 border rounded-md text-sm hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  await api.deleteEmployee(employee.id)
                  setDeleteConfirm(false)
                  onDeleted()
                }}
                className="flex-1 h-9 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-end px-4 pt-3">
        {!editMode && (
          <button
            onClick={() => {
              setForm({
                name: employee.name,
                employee_no: employee.employee_no ?? '',
                job_grade: employee.job_grade ?? '',
                employment_type: employee.employment_type ?? '',
                hire_date: employee.hire_date ? String(employee.hire_date) : '',
                leave_date: employee.leave_date ? String(employee.leave_date) : '',
                birth_date: employee.birth_date ? String(employee.birth_date) : '',
                gender: employee.gender ?? '',
                phone: employee.phone ?? '',
                email: employee.email ?? '',
                initial: employee.initial ?? '',
                note: employee.note ?? '',
              })
              setEditMode(true)
              setSaveError(null)
              // Initialize department selection from current employee
              const currentDept = departments.find(d => d.id === employee.department_id)
              if (currentDept) {
                if (currentDept.level === 'part') {
                  const team = departments.find(d => d.id === currentDept.parent_id)
                  const division = team ? departments.find(d => d.id === team.parent_id) : null
                  setEditDivisionId(division?.id ?? '')
                  setEditTeamId(team?.id ?? '')
                  setEditPartId(currentDept.id)
                } else if (currentDept.level === 'team') {
                  const division = departments.find(d => d.id === currentDept.parent_id)
                  setEditDivisionId(division?.id ?? '')
                  setEditTeamId(currentDept.id)
                  setEditPartId('')
                } else {
                  setEditDivisionId(currentDept.id)
                  setEditTeamId('')
                  setEditPartId('')
                }
              } else {
                setEditDivisionId('')
                setEditTeamId('')
                setEditPartId('')
              }
              if (employee.hire_date) fetchSuggestion(String(employee.hire_date))
            }}
            className="text-xs px-3 py-1.5 border rounded-md hover:bg-muted transition-colors"
          >
            수정
          </button>
        )}
      </div>

      {editMode ? (
        <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          <p className="text-sm font-semibold text-foreground mb-3">직원 정보 수정</p>

          <div>
            <label className="text-[11px] text-muted-foreground">사번</label>
            <div className="mt-1 flex gap-1.5">
              <input
                type="text"
                value={form.employee_no ?? ''}
                onChange={e => setForm(p => ({ ...p, employee_no: e.target.value }))}
                className="flex-1 h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary"
              />
              {suggestedNo && (
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, employee_no: suggestedNo }))}
                  className="h-8 px-2.5 border rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors shrink-0"
                  title={`추천: ${suggestedNo}`}
                >
                  추천
                </button>
              )}
            </div>
            {duplicateEmployeeNo && (
              <p className="text-[11px] text-red-500 mt-1">이미 사용 중인 사번입니다</p>
            )}
            {suggestedNo && !form.employee_no && (
              <p className="text-[11px] text-muted-foreground mt-1">추천: {suggestedNo}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">이름</label>
            <input type="text" value={form.name ?? ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">직급</label>
            <SearchableSelect
              value={form.job_grade ?? ''}
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
              value={editDivisionId}
              onChange={v => {
                setEditDivisionId(v)
                setEditTeamId('')
                setEditPartId('')
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
              value={editTeamId}
              onChange={v => {
                setEditTeamId(v)
                setEditPartId('')
                setForm(p => ({ ...p, department_id: v || editDivisionId || undefined }))
              }}
              options={teamOptions.map(d => ({ value: d.id, label: d.name }))}
              placeholder="선택"
              disabled={!editDivisionId}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">파트</label>
            <SearchableSelect
              value={editPartId}
              onChange={v => {
                setEditPartId(v)
                setForm(p => ({ ...p, department_id: v || editTeamId || editDivisionId || undefined }))
              }}
              options={partOptions.map(d => ({ value: d.id, label: d.name }))}
              placeholder="선택"
              disabled={!editTeamId}
              className="mt-1 w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">고용형태</label>
            <SearchableSelect
              value={form.employment_type ?? ''}
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
            <input type="text" value={form.hire_date ?? ''} onChange={e => setForm(p => ({ ...p, hire_date: formatDateInput(e.target.value) }))}
              placeholder="YYYY-MM-DD"
              className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
            {form.hire_date && !isValidDateOrEmpty(form.hire_date) && (
              <p className="text-[11px] text-red-500 mt-1">YYYY-MM-DD 형식으로 입력해주세요</p>
            )}
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">전화</label>
            <input type="text" value={form.phone ?? ''} onChange={e => setForm(p => ({ ...p, phone: formatPhoneInput(e.target.value) }))}
              placeholder="010-0000-0000"
              className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">이메일</label>
            <input type="email" value={form.email ?? ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
            {duplicateEmailEmployee && (
              <p className="text-[11px] text-red-500 mt-1">{duplicateEmailEmployee.name}님과 중복된 이메일입니다</p>
            )}
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">성별</label>
            <SearchableSelect
              value={form.gender ?? ''}
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
            <label className="text-[11px] text-muted-foreground">퇴사일</label>
            <input type="text" value={form.leave_date ?? ''} onChange={e => setForm(p => ({ ...p, leave_date: formatDateInput(e.target.value) }))}
              placeholder="YYYY-MM-DD"
              className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
            {form.leave_date && !isValidDateOrEmpty(form.leave_date) && (
              <p className="text-[11px] text-red-500 mt-1">YYYY-MM-DD 형식으로 입력해주세요</p>
            )}
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">생년월일</label>
            <input type="text" value={form.birth_date ?? ''} onChange={e => setForm(p => ({ ...p, birth_date: formatDateInput(e.target.value) }))}
              placeholder="YYYY-MM-DD"
              className="mt-1 w-full h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary" />
            {form.birth_date && !isValidDateOrEmpty(form.birth_date) && (
              <p className="text-[11px] text-red-500 mt-1">YYYY-MM-DD 형식으로 입력해주세요</p>
            )}
          </div>

          <div>
            <label className="text-[11px] text-muted-foreground">이니셜</label>
            <input type="text" value={form.initial ?? ''} onChange={e => setForm(p => ({ ...p, initial: e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) }))}
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
            <textarea value={form.note ?? ''} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              rows={3}
              className="mt-1 w-full px-2.5 py-1.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary resize-none" />
          </div>

          <div className="flex justify-start pt-2 pb-1">
            <button
              onClick={() => setDeleteConfirm(true)}
              className="h-7 px-2.5 border border-red-200 rounded-md text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              직원 삭제
            </button>
          </div>

        </div>
        <div className="shrink-0 border-t bg-card px-4 py-3">
          {saveError && <p className="text-xs text-red-500 mb-2">{saveError}</p>}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setSaving(true)
                setSaveError(null)
                const payload: EmployeeUpdatePayload = {}
                if (form.name !== employee.name) payload.name = form.name
                if (form.employee_no !== (employee.employee_no ?? '')) payload.employee_no = form.employee_no
                if (form.job_grade !== (employee.job_grade ?? '')) payload.job_grade = form.job_grade
                if (form.employment_type !== (employee.employment_type ?? '')) payload.employment_type = form.employment_type
                if (form.hire_date !== (employee.hire_date ? String(employee.hire_date) : '')) payload.hire_date = form.hire_date
                if (form.leave_date !== (employee.leave_date ? String(employee.leave_date) : '')) payload.leave_date = form.leave_date
                if (form.birth_date !== (employee.birth_date ? String(employee.birth_date) : '')) payload.birth_date = form.birth_date
                if (form.gender !== (employee.gender ?? '')) payload.gender = form.gender
                if (form.phone !== (employee.phone ?? '')) payload.phone = form.phone
                if (form.email !== (employee.email ?? '')) payload.email = form.email
                if (form.initial !== (employee.initial ?? '')) payload.initial = form.initial
                if (form.note !== (employee.note ?? '')) payload.note = form.note
                if (form.department_id !== undefined && form.department_id !== employee.department_id) payload.department_id = form.department_id
                try {
                  const updated = await patchEmployee(employee.id, payload)
                  onUpdated(updated)
                  setEditMode(false)
                } catch (e: unknown) {
                  setSaveError(e instanceof Error ? e.message : '수정 실패')
                } finally {
                  setSaving(false)
                }
              }}
              disabled={saving || !!duplicateInitialEmployee || !!duplicateEmailEmployee || !!duplicateEmployeeNo || invalidInitial || !isValidDateOrEmpty(form.hire_date) || !isValidDateOrEmpty(form.leave_date) || !isValidDateOrEmpty(form.birth_date)}
              className="flex-1 h-10 border rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="flex-1 h-10 border rounded-md text-sm hover:bg-muted transition-colors"
            >
              취소
            </button>
          </div>
        </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center text-center pb-4">
            <EmployeeAvatar name={employee.name} size="lg" />
            <h3 className="mt-3 text-lg font-bold text-foreground">{employee.name}</h3>
            {employee.job_grade && (
              <p className="text-sm text-muted-foreground mt-0.5">{employee.job_grade}</p>
            )}
            {employee.department_full_path && (
              <p className="text-xs text-muted-foreground mt-1">{employee.department_full_path.split('_').join(' › ')}</p>
            )}
          </div>

          <div className="border-t pt-4 mt-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">인사 정보</p>
            <div className="space-y-2.5">
              {[
                { label: '사번', value: employee.employee_no },
                { label: '이름', value: employee.name },
                { label: '직급', value: employee.job_grade },
                { label: '실', value: employee.department_full_path?.split('_')[0] ?? null },
                { label: '팀', value: employee.department_full_path?.split('_')[1] ?? null },
                { label: '파트', value: employee.department_full_path?.split('_')[2] ?? null },
                { label: '고용형태', value: employee.employment_type },
                { label: '입사일', value: employee.hire_date ? String(employee.hire_date) : null },
                { label: '전화', value: employee.phone },
                { label: '이메일', value: employee.email },
                { label: '성별', value: employee.gender },
                { label: '퇴사일', value: employee.leave_date ? String(employee.leave_date) : null },
                { label: '생년월일', value: employee.birth_date ? String(employee.birth_date) : null },
                { label: '이니셜', value: employee.initial },
                { label: '메모', value: employee.note },
                { label: '최근 수정일', value: employee.updated_at ? new Date(employee.updated_at).toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16) : null },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="text-sm text-muted-foreground w-16 shrink-0 pt-px">{label}</span>
                  <span className="text-sm font-medium text-foreground break-all whitespace-pre-wrap">
                    {value ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t bg-card px-4 py-3 flex flex-col gap-2">
          {!employee.email && (
            <p className="text-xs text-muted-foreground text-center">이메일을 먼저 기입해주세요</p>
          )}
          {(() => {
                const now = new Date()
                const yymmdd = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
                const reversed = yymmdd.split('').reverse().join('')
                const token = `${employee.id}_${employee.employee_no}_${reversed}`
                const url = `${window.location.origin}${window.location.pathname}?register=${token}`
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { if (employee.email) window.open(url, '_blank') }}
                      disabled={!employee.email}
                      className="flex-1 h-9 border rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      {employee.has_password ? '비밀번호 재설정 링크 이동' : '비밀번호 설정 링크 이동'}
                    </button>
                    <button
                      onClick={() => {
                        if (!employee.email) return
                        navigator.clipboard.writeText(url).then(() => {
                          setCopied(true)
                          setTimeout(() => setCopied(false), 2000)
                        })
                      }}
                      disabled={!employee.email}
                      className="flex-1 h-9 border rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      {copied ? '복사됨!' : employee.has_password ? '비밀번호 재설정 링크 복사' : '비밀번호 설정 링크 복사'}
                    </button>
                  </div>
                )
              })()}
        </div>
        </div>
      )}
    </>
  )
}
