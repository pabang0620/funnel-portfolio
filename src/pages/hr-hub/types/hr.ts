export interface Department {
  id: string
  name: string
  level: 'division' | 'team' | 'part'
  parent_id: string | null
  full_path: string | null
}

export interface Employee {
  id: string
  name: string
  department_id: string | null
  department_name: string | null
  department_level: string | null
  employment_type: string | null
  hire_date: string | null
  phone: string | null
  gender: string | null
  initial: string | null
  department_full_path: string | null
  employee_no: string | null
  job_grade: string | null
  leave_date: string | null
  email: string | null
  birth_date?: string | null
  note?: string | null
  updated_at?: string | null
  has_password?: boolean
}

export interface EmployeeDetail extends Employee {
  hierarchy: { name: string; level: string }[]
}

export interface OrgNode {
  id?: string
  name: string
  type: 'group' | 'company' | 'division' | 'dept' | 'team' | 'part' | 'employee'
  label?: string
  initial?: string
  note?: string
  children?: OrgNode[]
  // Employee-specific fields
  employee_no?: string | null
  job_grade?: string | null
  employment_type?: string | null
  hire_date?: string | null
  leave_date?: string | null
  birth_date?: string | null
  gender?: string | null
  phone?: string | null
  email?: string | null
  department_id?: string | null
  department_full_path?: string | null
  department_name?: string | null
  department_level?: string | null
}

export interface EmployeeFilter {
  department_id?: string
  employment_type?: string
  name?: string
}
