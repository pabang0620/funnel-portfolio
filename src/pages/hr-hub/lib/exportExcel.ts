import * as XLSX from 'xlsx'
import type { Employee } from '../types/hr'

export function exportEmployeesToExcel(employees: Employee[]) {
  const today = new Date()
  const yyyymmdd = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('')

  const rows = employees.map(e => {
    const segs = e.department_full_path ? e.department_full_path.split('_') : []
    return {
      '사원번호': e.employee_no ?? '',
      '이름': e.name ?? '',
      '성별': e.gender ?? '',
      '생년월일': e.birth_date ?? '',
      '소속': e.department_full_path ?? '',
      '실': segs[0] ?? '',
      '팀': segs[1] ?? '',
      '파트': segs[2] ?? '',
      '직급': e.job_grade ?? '',
      '고용형태': e.employment_type ?? '',
      '입사일': e.hire_date ?? '',
      '퇴사일': e.leave_date ?? '',
      '전화번호': e.phone ?? '',
      '이메일': e.email ?? '',
      '메모': e.note ?? '',
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '직원목록')

  XLSX.writeFile(workbook, `직원목록_${yyyymmdd}.xlsx`)
}
