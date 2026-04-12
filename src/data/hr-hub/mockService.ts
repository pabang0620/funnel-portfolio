import type { Employee, Department, OrgNode } from '../../pages/hr-hub/types/hr'
import employeesJson from './employees.json'
import departmentsJson from './departments.json'
import orgChartJson from './org-chart.json'

// In-memory state (mutable copies)
let _employees: Employee[] = employeesJson as Employee[]
let _departments: Department[] = departmentsJson as Department[]
const _orgChart: OrgNode[] = orgChartJson as OrgNode[]

let _nextId = 100

// ── Departments ────────────────────────────────────────────────────────────────

export function getDepartments(level?: string, parent_id?: string): Department[] {
  let result = [..._departments]
  if (level) result = result.filter(d => d.level === level)
  if (parent_id) result = result.filter(d => d.parent_id === parent_id)
  return result
}

export function createDepartment(data: { name: string; level: 'division' | 'team' | 'part'; parent_id?: string }): Department {
  const parent = data.parent_id ? _departments.find(d => d.id === data.parent_id) : null
  const fullPath = parent ? `${parent.full_path}_${data.name}` : data.name
  const newDept: Department = {
    id: `dept-new-${++_nextId}`,
    name: data.name,
    level: data.level,
    parent_id: data.parent_id ?? null,
    full_path: fullPath,
  }
  _departments = [..._departments, newDept]
  return newDept
}

export function updateDepartment(id: string, name: string): Department {
  const dept = _departments.find(d => d.id === id)
  if (!dept) throw new Error('부서를 찾을 수 없습니다')
  const updated = { ...dept, name }
  _departments = _departments.map(d => d.id === id ? updated : d)
  return updated
}

export function deleteDepartment(id: string): void {
  const hasChildren = _departments.some(d => d.parent_id === id)
  if (hasChildren) throw new Error('하위 부서가 있는 경우 삭제할 수 없습니다')
  const hasEmployees = _employees.some(e => e.department_id === id)
  if (hasEmployees) throw new Error('소속 직원이 있는 경우 삭제할 수 없습니다')
  _departments = _departments.filter(d => d.id !== id)
}

// ── Employees ──────────────────────────────────────────────────────────────────

export interface EmployeeListParams {
  page?: number
  limit?: number
  division_name?: string
  team_name?: string
  part_name?: string
  employment_type?: string
  search?: string
  hire_date_from?: string
  hire_date_to?: string
  sort_by?: string
  sort_dir?: string
}

export interface EmployeeListResult {
  employees: Employee[]
  total: number
}

export function getEmployees(params?: EmployeeListParams): EmployeeListResult {
  let result = [..._employees]

  if (params?.search) {
    const q = params.search.toLowerCase()
    result = result.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.phone?.includes(q) ||
      e.initial?.toLowerCase().includes(q)
    )
  }

  if (params?.division_name) {
    result = result.filter(e => e.department_full_path?.split('_')[0] === params.division_name)
  }
  if (params?.team_name) {
    result = result.filter(e => e.department_full_path?.split('_')[1] === params.team_name)
  }
  if (params?.part_name) {
    result = result.filter(e => e.department_full_path?.split('_')[2] === params.part_name)
  }
  if (params?.employment_type) {
    result = result.filter(e => e.employment_type === params.employment_type)
  }
  if (params?.hire_date_from) {
    result = result.filter(e => e.hire_date && e.hire_date >= params.hire_date_from!)
  }
  if (params?.hire_date_to) {
    result = result.filter(e => e.hire_date && e.hire_date <= params.hire_date_to!)
  }

  const total = result.length
  const limit = params?.limit ?? 9999
  const page = params?.page ?? 1
  const start = (page - 1) * limit
  const paged = limit === 9999 ? result : result.slice(start, start + limit)

  return { employees: paged, total }
}

export function getEmployee(id: string): Employee & { hierarchy: { name: string; level: string }[] } {
  const emp = _employees.find(e => e.id === id)
  if (!emp) throw new Error('직원을 찾을 수 없습니다')

  const hierarchy: { name: string; level: string }[] = []
  if (emp.department_full_path) {
    const segs = emp.department_full_path.split('_')
    const levels: ('division' | 'team' | 'part')[] = ['division', 'team', 'part']
    segs.forEach((name, i) => {
      if (levels[i]) hierarchy.push({ name, level: levels[i] })
    })
  }

  return { ...emp, hierarchy }
}

export function createEmployee(data: Partial<Employee> & { name: string }): Employee {
  // Resolve department_full_path from department_id
  let department_full_path: string | null = null
  let department_name: string | null = null
  let department_level: string | null = null

  if (data.department_id) {
    const dept = _departments.find(d => d.id === data.department_id)
    if (dept) {
      department_full_path = dept.full_path
      department_name = dept.name
      department_level = dept.level
    }
  }

  const newEmployee: Employee = {
    id: `emp-new-${++_nextId}`,
    name: data.name,
    employee_no: data.employee_no ?? null,
    job_grade: data.job_grade ?? null,
    department_id: data.department_id ?? null,
    department_name,
    department_level,
    department_full_path,
    employment_type: data.employment_type ?? null,
    hire_date: data.hire_date ?? null,
    leave_date: data.leave_date ?? null,
    birth_date: data.birth_date ?? null,
    gender: data.gender ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    initial: data.initial ?? null,
    note: data.note ?? null,
    updated_at: new Date().toISOString(),
  }
  _employees = [..._employees, newEmployee]
  return newEmployee
}

export function updateEmployee(id: string, payload: Partial<Employee>): Employee {
  const emp = _employees.find(e => e.id === id)
  if (!emp) throw new Error('직원을 찾을 수 없습니다')

  // If department_id changed, update related fields
  let department_full_path = emp.department_full_path
  let department_name = emp.department_name
  let department_level = emp.department_level

  if (payload.department_id && payload.department_id !== emp.department_id) {
    const dept = _departments.find(d => d.id === payload.department_id)
    if (dept) {
      department_full_path = dept.full_path
      department_name = dept.name
      department_level = dept.level
    }
  }

  const updated: Employee = {
    ...emp,
    ...payload,
    department_full_path,
    department_name,
    department_level,
    updated_at: new Date().toISOString(),
  }
  _employees = _employees.map(e => e.id === id ? updated : e)
  return updated
}

export function deleteEmployee(id: string): void {
  _employees = _employees.filter(e => e.id !== id)
}

export function suggestEmployeeNo(hireDate: string): { suggested: string; all_employee_nos: string[] } {
  const prefix = hireDate.replace(/-/g, '').slice(0, 8)
  const existing = _employees
    .filter(e => e.employee_no?.startsWith(prefix))
    .map(e => e.employee_no!)
    .sort()
  const maxSeq = existing.length > 0
    ? parseInt(existing[existing.length - 1].slice(-3), 10)
    : 0
  const suggested = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`
  return { suggested, all_employee_nos: _employees.map(e => e.employee_no!).filter(Boolean) }
}

// ── Org Tree ───────────────────────────────────────────────────────────────────

export function getOrgTree(): OrgNode[] {
  return _orgChart
}

// ── Reset (for testing) ────────────────────────────────────────────────────────

export function resetData(): void {
  _employees = employeesJson as Employee[]
  _departments = departmentsJson as Department[]
}
