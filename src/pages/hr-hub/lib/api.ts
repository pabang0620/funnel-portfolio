import type { Department, Employee, EmployeeDetail, OrgNode } from '../types/hr'
import * as mock from '../../../data/hr-hub/mockService'

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

// Token stubs (포트폴리오에서는 항상 로그인 상태)
export function getToken(): string | null { return 'demo-token' }
export function setToken(_token: string): void { /* no-op */ }
export function removeToken(): void { /* no-op */ }
export function decodeTokenUser(): { id: string; name: string; email: string } | null {
  return { id: 'demo', name: '데모 사용자', email: 'demo@example.com' }
}

function delay<T>(fn: () => T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(fn()), 0))
}

export const api = {
  getDepartments: (level?: string, parent_id?: string): Promise<Department[]> =>
    delay(() => mock.getDepartments(level, parent_id)),

  getEmployees: (params?: EmployeeListParams): Promise<EmployeeListResult> =>
    delay(() => mock.getEmployees(params)),

  getEmployee: (id: string): Promise<EmployeeDetail> =>
    delay(() => mock.getEmployee(id) as EmployeeDetail),

  getOrgTree: (): Promise<OrgNode[]> =>
    delay(() => mock.getOrgTree()),

  createEmployee: (data: Partial<Employee> & { name: string }): Promise<Employee> =>
    delay(() => mock.createEmployee(data)),

  setupEmployee: async (_employeeNo: string, _data: Record<string, string>): Promise<Employee> => {
    throw new Error('포트폴리오 모드에서는 지원되지 않습니다')
  },

  getSetupInfo: async (_token: string): Promise<{ name: string }> => {
    throw new Error('포트폴리오 모드에서는 지원되지 않습니다')
  },

  setupPassword: async (_token: string, _email: string, _password: string): Promise<Employee> => {
    throw new Error('포트폴리오 모드에서는 지원되지 않습니다')
  },

  deleteEmployee: (id: string): Promise<void> =>
    delay(() => mock.deleteEmployee(id)),

  createDepartment: (data: { name: string; level: string; parent_id?: string }): Promise<Department> =>
    delay(() => mock.createDepartment(data as { name: string; level: 'division' | 'team' | 'part'; parent_id?: string })),

  updateDepartment: (id: string, name: string): Promise<Department> =>
    delay(() => mock.updateDepartment(id, name)),

  deleteDepartment: (id: string): Promise<void> =>
    delay(() => mock.deleteDepartment(id)),

  login: async (_email: string, _password: string): Promise<{ id: string; name: string; email: string }> => {
    return { id: 'demo', name: '데모 사용자', email: 'demo@example.com' }
  },

  patchEmployee: (id: string, payload: Partial<Employee>): Promise<Employee> =>
    delay(() => mock.updateEmployee(id, payload)),

  suggestEmployeeNo: (hireDate: string): Promise<{ suggested: string; all_employee_nos: string[] }> =>
    delay(() => mock.suggestEmployeeNo(hireDate)),
}
