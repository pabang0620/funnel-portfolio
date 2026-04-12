import { useState, useEffect } from 'react'
import { Mail, Phone, Calendar, Badge, Briefcase, Layers, Building2, Folder, UsersRound } from 'lucide-react'
import { EmployeeAvatar } from '../ui/EmployeeAvatar'
import { CompanyBadge } from '../ui/CompanyBadge'
import { api } from '../../lib/api'
import type { OrgNode, EmployeeDetail } from '../../types/hr'

interface NodePanelProps {
  node: OrgNode
}

function countNodes(node: OrgNode, type: string): number {
  let count = node.type === type ? 1 : 0
  if (node.children) node.children.forEach(c => { count += countNodes(c, type) })
  return count
}

function EmployeeNodePanel({ node }: { node: OrgNode }) {
  const [detail, setDetail] = useState<EmployeeDetail | null>(null)

  useEffect(() => {
    if (node.id) {
      api.getEmployee(node.id).then(setDetail).catch(() => {})
    }
  }, [node.id])

  const fields = [
    { label: '사번', value: detail?.employee_no },
    { label: '직급', value: detail?.job_grade },
    { label: '이름', value: node.name },
    { label: '고용형태', value: node.label },
    { label: '입사일', value: detail?.hire_date ? String(detail.hire_date) : null },
    { label: '퇴사일', value: detail?.leave_date ? String(detail.leave_date) : null },
    { label: '생년월일', value: detail?.birth_date ? String(detail.birth_date) : null },
    { label: '성별', value: detail?.gender },
    { label: '전화', value: detail?.phone },
    { label: '이메일', value: detail?.email },
    { label: '이니셜', value: node.initial },
    { label: '소속', value: detail?.department_full_path?.split('_').join(' › ') ?? null },
    { label: '메모', value: node.note ?? detail?.note },
  ]

  return (
    <div className="p-4">
      <div className="flex flex-col items-center text-center pb-4">
        <h3 className="text-lg font-bold text-foreground">{node.name}</h3>
        {detail?.department_full_path && (
          <p className="text-xs text-muted-foreground mt-1">{detail.department_full_path.split('_').join(' › ')}</p>
        )}
      </div>

      <div className="border-t pt-4 mt-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">인사 정보</p>
        <div className="space-y-2.5">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-start gap-2.5">
              <span className="text-[11px] text-muted-foreground w-16 shrink-0 pt-px">{label}</span>
              <span className="text-sm font-medium text-foreground break-all whitespace-pre-wrap">
                {value ?? ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NonEmployeeNodePanel({ node }: { node: OrgNode }) {
  const typeLabel: Record<string, string> = {
    group: '그룹',
    company: '계열사',
    dept: '부서',
    team: '팀',
  }

  const typeColors: Record<string, string> = {
    group: '#3B82F6',
    company: '#8B5CF6',
    dept: '#10B981',
    team: '#F59E0B',
  }

  const IconMap: Record<string, React.ElementType> = {
    group: Layers,
    company: Building2,
    dept: Folder,
    team: UsersRound,
  }

  const color = typeColors[node.type] || '#6B7280'
  const Icon = IconMap[node.type] || Folder

  const empCount = countNodes(node, 'employee')
  const teamCount = countNodes(node, 'team')
  const deptCount = countNodes(node, 'dept')
  const companyCount = countNodes(node, 'company')

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ background: `${color}22`, border: `1.5px solid ${color}44` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">{node.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {typeLabel[node.type] || node.type}
            {node.label ? ` · ${node.label}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {node.type === 'group' && (
          <>
            <StatCard value={companyCount} label="계열사" />
            <StatCard value={deptCount} label="부서" />
            <StatCard value={teamCount} label="팀" />
            <StatCard value={empCount} label="직원" />
          </>
        )}
        {node.type === 'company' && (
          <>
            <StatCard value={deptCount} label="부서" />
            <StatCard value={teamCount} label="팀" />
            <StatCard value={empCount} label="직원" />
          </>
        )}
        {node.type === 'dept' && (
          <>
            <StatCard value={teamCount} label="팀" />
            <StatCard value={empCount} label="직원" />
          </>
        )}
        {node.type === 'team' && (
          <StatCard value={empCount} label="팀원" />
        )}
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-muted border rounded-lg p-3">
      <p className="text-[22px] font-bold text-primary leading-none">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

export function NodePanel({ node }: NodePanelProps) {
  if (node.type === 'employee') {
    return <EmployeeNodePanel node={node} />
  }
  return <NonEmployeeNodePanel node={node} />
}

export function EmployeeDetailPanel({ node }: { node: OrgNode & {
  email?: string
  phone?: string
  join_date?: string
  emp_id?: string
  company_name?: string
  department_name?: string
  team?: string
  title?: string
} }) {
  return (
    <div className="p-4">
      <div className="flex flex-col items-center text-center pb-4">
        <EmployeeAvatar name={node.name} size="lg" />
        <h3 className="mt-3 text-lg font-bold text-foreground">{node.name}</h3>
        {node.title && (
          <p className="text-sm text-muted-foreground mt-0.5">{node.title}</p>
        )}
        <div className="flex flex-wrap gap-1.5 justify-center mt-2">
          {node.company_name && <CompanyBadge company={node.company_name} />}
          {node.department_name && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted border text-foreground">
              {node.department_name}
            </span>
          )}
          {node.team && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted border text-foreground">
              {node.team}
            </span>
          )}
        </div>
      </div>

      {(node.email || node.phone) && (
        <div className="border-t pt-4 mt-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">연락처</p>
          <div className="space-y-2.5">
            {node.email && (
              <div className="flex items-start gap-2.5">
                <Mail size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-[11px] text-muted-foreground w-12 shrink-0 pt-px">이메일</span>
                <span className="text-sm font-medium text-foreground break-all">{node.email}</span>
              </div>
            )}
            {node.phone && (
              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-[11px] text-muted-foreground w-12 shrink-0 pt-px">전화</span>
                <span className="text-sm font-medium text-foreground">{node.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(node.join_date || node.emp_id || node.title) && (
        <div className="border-t pt-4 mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">인사 정보</p>
          <div className="space-y-2.5">
            {node.join_date && (
              <div className="flex items-start gap-2.5">
                <Calendar size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-[11px] text-muted-foreground w-12 shrink-0 pt-px">입사일</span>
                <span className="text-sm font-medium text-foreground">{node.join_date}</span>
              </div>
            )}
            {node.emp_id && (
              <div className="flex items-start gap-2.5">
                <Badge size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-[11px] text-muted-foreground w-12 shrink-0 pt-px">사원번호</span>
                <span className="text-sm font-medium text-foreground">{node.emp_id}</span>
              </div>
            )}
            {node.title && (
              <div className="flex items-start gap-2.5">
                <Briefcase size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-[11px] text-muted-foreground w-12 shrink-0 pt-px">직책</span>
                <span className="text-sm font-medium text-foreground">{node.title}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
