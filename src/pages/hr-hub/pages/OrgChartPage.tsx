import { useState, useEffect, useRef } from 'react'
import { Plus, Minus, RefreshCw, UserPlus } from 'lucide-react'
import { api } from '../lib/api'
import { OrgChartTree, type OrgChartTreeHandle } from '../components/org/OrgChartTree'
import { NodePanel } from '../components/org/NodePanel'
import { SlidePanel } from '../components/layout/SlidePanel'
import { SearchableSelect } from '../components/ui/SearchableSelect'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { EmployeeSlideContent } from '../components/employee/EmployeeSlideContent'
import { DepartmentSlideContent } from '../components/department/DepartmentSlideContent'
import { DeptAddButtons } from '../components/department/DeptAddButtons'
import { EmployeeCreateContent } from '../components/employee/EmployeeCreateContent'
import type { OrgNode, Department, Employee } from '../types/hr'

function collectAllNames(node: OrgNode): Set<string> {
  const names = new Set<string>([node.name])
  if (node.children) node.children.forEach(c => collectAllNames(c).forEach(n => names.add(n)))
  return names
}

function pruneTree(node: OrgNode, expandedNodes: Set<string>, isRoot: boolean, expandAll = false): OrgNode {
  const isExpanded = isRoot || expandAll || expandedNodes.has(node.name)
  if (!isExpanded || !node.children) {
    return { ...node, children: undefined }
  }
  return {
    ...node,
    children: node.children.map(c => pruneTree(c, expandedNodes, false, expandAll))
  }
}

const DEPT_TYPES = new Set(['division', 'team', 'part'])

function orgNodeToEmployee(node: OrgNode): Employee {
  return {
    id: node.id!,
    name: node.name,
    department_id: node.department_id ?? null,
    department_name: node.department_name ?? null,
    department_level: node.department_level ?? null,
    employment_type: node.employment_type ?? null,
    hire_date: node.hire_date ?? null,
    phone: node.phone ?? null,
    gender: node.gender ?? null,
    initial: node.initial ?? null,
    department_full_path: node.department_full_path ?? null,
    employee_no: node.employee_no ?? null,
    job_grade: node.job_grade ?? null,
    leave_date: node.leave_date ?? null,
    email: node.email ?? null,
    birth_date: node.birth_date ?? null,
    note: node.note ?? null,
  }
}

function findAncestors(target: OrgNode, nodes: OrgNode[], chain: OrgNode[] = []): OrgNode[] | null {
  for (const node of nodes) {
    if (node.name === target.name && node.id === target.id) return chain
    if (node.children) {
      const result = findAncestors(target, node.children, [...chain, node])
      if (result !== null) return result
    }
  }
  return null
}

export default function OrgChartPage() {
  const [orgData, setOrgData] = useState<OrgNode[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  const [nodeHistory, setNodeHistory] = useState<OrgNode[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [allEmployees, setAllEmployees] = useState<Employee[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedDivision, setSelectedDivision] = useLocalStorage('org_filter_division', '')
  const [departments, setDepartments] = useState<Department[]>([])
  const [filterTeam, setFilterTeam] = useLocalStorage('org_filter_team', '')
  const [filterPart, setFilterPart] = useLocalStorage('org_filter_part', '')
  const [showAll, setShowAll] = useState(false)
  const [createEmpPanelOpen, setCreateEmpPanelOpen] = useState(false)
  const teamSelectRef = useRef<HTMLButtonElement>(null)
  const partSelectRef = useRef<HTMLButtonElement>(null)
  const treeHandle = useRef<OrgChartTreeHandle | null>(null)

  function loadOrgTree() {
    setLoading(true)
    setError(null)
    api.getOrgTree()
      .then(data => {
        setOrgData(data)
        if (data.length > 0) {
          const currentDivision = selectedDivision
          const targetDiv =
            (currentDivision && data.find(d => d.name === currentDivision))
              ? data.find(d => d.name === currentDivision)!
              : data[0]
          if (!currentDivision || !data.find(d => d.name === currentDivision)) {
            setSelectedDivision(data[0].name)
          }
          const allNames = new Set<string>()
          collectAllNames(targetDiv).forEach(n => allNames.add(n))
          setExpandedNodes(allNames)
        }
      })
      .catch(err => setError(err.message || '조직도를 불러오지 못했습니다'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrgTree()
  }, [])

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {})
  }, [])

  useEffect(() => {
    api.getEmployees({ limit: 9999 }).then(r => setAllEmployees(r.employees)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!orgData || !selectedDivision) return
    const div = orgData.find(d => d.name === selectedDivision)
    if (div) setExpandedNodes(collectAllNames(div))
  }, [selectedDivision, orgData])

  useEffect(() => {
    setFilterTeam('')
    setFilterPart('')
  }, [selectedDivision])

  useEffect(() => {
    setFilterPart('')
  }, [filterTeam])

  useEffect(() => {
    if (!filterTeam || !orgData) return
    const div = orgData.find(d => d.name === selectedDivision)
    const team = div?.children?.find(t => t.name === filterTeam)
    if (team) setExpandedNodes(collectAllNames(team))
  }, [filterTeam, orgData, selectedDivision])

  useEffect(() => {
    if (!filterPart || !orgData) return
    const div = orgData.find(d => d.name === selectedDivision)
    const team = div?.children?.find(t => t.name === filterTeam)
    const part = team?.children?.find(p => p.name === filterPart)
    if (part) setExpandedNodes(collectAllNames(part))
  }, [filterPart, orgData, selectedDivision, filterTeam])

  function handleNodeClick(node: OrgNode) {
    if (node.type === 'employee') {
      setSelectedNode(node)
      setSelectedEmployee(orgNodeToEmployee(node))
      setPanelOpen(true)
    } else if (node.type === 'division' || node.type === 'team' || node.type === 'part') {
      setExpandedNodes(prev => new Set([...prev, node.name]))
      setSelectedNode(node)
      setPanelOpen(true)
      const ancestors = orgData ? (findAncestors(node, orgData) ?? []).filter(n => DEPT_TYPES.has(n.type)) : []
      setNodeHistory(ancestors)
    } else {
      setExpandedNodes(prev => {
        const next = new Set(prev)
        if (next.has(node.name)) next.delete(node.name)
        else next.add(node.name)
        return next
      })
    }
  }

  const divisions = departments.filter(d => d.level === 'division').sort((a, b) => a.name.localeCompare(b.name))
  const allTeams = departments.filter(d => d.level === 'team').sort((a, b) => a.name.localeCompare(b.name))
  const allParts = departments.filter(d => d.level === 'part').sort((a, b) => a.name.localeCompare(b.name))

  const filteredTeamOptions = (() => {
    if (!selectedDivision) return []
    const div = divisions.find(d => d.name === selectedDivision)
    if (!div) return []
    return allTeams.filter(t => t.parent_id === div.id)
  })()

  const filteredPartOptions = (() => {
    if (!filterTeam) return []
    const team = allTeams.find(t => t.name === filterTeam)
    if (!team) return []
    return allParts.filter(p => p.parent_id === team.id)
  })()

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 py-3 flex items-center gap-2 border-b bg-card shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2">
          <SearchableSelect
            value={selectedDivision}
            onChange={setSelectedDivision}
            options={(orgData ?? []).map(d => ({ value: d.name, label: d.name }))}
            placeholder="실 선택"
            onSelect={() => setTimeout(() => teamSelectRef.current?.focus(), 50)}
            className="min-w-[120px]"
          />
          <SearchableSelect
            value={filterTeam}
            onChange={setFilterTeam}
            options={filteredTeamOptions.map(t => ({ value: t.name, label: t.name }))}
            placeholder="팀 전체"
            disabled={!selectedDivision}
            triggerRef={teamSelectRef}
            onSelect={() => setTimeout(() => partSelectRef.current?.focus(), 50)}
            className="min-w-[120px]"
          />
          <SearchableSelect
            value={filterPart}
            onChange={setFilterPart}
            options={filteredPartOptions.map(p => ({ value: p.name, label: p.name }))}
            placeholder="파트 전체"
            disabled={!filterTeam}
            triggerRef={partSelectRef}
            className="min-w-[110px]"
          />
        </div>
        <button
          onClick={() => {
            setShowAll(prev => {
              const next = !prev
              if (next && orgData) {
                const allNames = new Set<string>()
                orgData.forEach(div => collectAllNames(div).forEach(n => allNames.add(n)))
                setExpandedNodes(allNames)
              }
              return next
            })
          }}
          className="flex items-center gap-2 h-[30px] px-2 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors select-none"
        >
          <span>전체보기</span>
          <div className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${showAll ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${showAll ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
        <div className="flex-1" />

        <DeptAddButtons
          onAdded={() => {
            loadOrgTree()
            api.getDepartments().then(setDepartments).catch(() => {})
          }}
        />

        <button
          onClick={() => setCreateEmpPanelOpen(true)}
          className="h-[30px] px-3 rounded-md border text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <UserPlus size={13} />
          직원 추가
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">조직도 불러오는 중...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{error}</p>
              <button
                onClick={loadOrgTree}
                className="mt-3 px-4 py-1.5 text-sm border rounded-md hover:bg-muted transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}
        {/* Zoom controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          <button
            onClick={() => treeHandle.current?.zoomIn()}
            className="flex items-center justify-center w-[30px] h-[30px] rounded-md border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
            title="확대"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => treeHandle.current?.zoomOut()}
            className="flex items-center justify-center w-[30px] h-[30px] rounded-md border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
            title="축소"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={() => treeHandle.current?.reset()}
            className="flex items-center justify-center w-[30px] h-[30px] rounded-md border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
            title="초기화"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {!loading && !error && orgData && orgData.length > 0 && (
          <OrgChartTree
            data={(() => {
              if (showAll) {
                const virtualRoot: OrgNode = {
                  name: 'funnelgroup',
                  type: 'group',
                  children: orgData,
                }
                return pruneTree(virtualRoot, expandedNodes, true, true)
              }
              const div = orgData.find(d => d.name === selectedDivision) ?? orgData[0]
              if (filterPart) {
                const teamNode = div.children?.find(t => t.name === filterTeam)
                const partNode = teamNode?.children?.find(p => p.name === filterPart)
                if (partNode) return pruneTree(partNode, expandedNodes, true)
              }
              if (filterTeam) {
                const teamNode = div.children?.find(t => t.name === filterTeam)
                if (teamNode) return pruneTree(teamNode, expandedNodes, true)
              }
              return pruneTree(div, expandedNodes, true)
            })()}
            onNodeClick={handleNodeClick}
            handleRef={treeHandle}
          />
        )}
      </div>

      <SlidePanel
        open={panelOpen}
        title={selectedNode?.name ?? '상세 정보'}
        onClose={() => { setPanelOpen(false); setNodeHistory([]) }}
      >
        {selectedNode && (
          selectedNode.type === 'employee' && selectedEmployee ? (
            <EmployeeSlideContent
              employee={selectedEmployee}
              onUpdated={(updated) => setSelectedEmployee(updated)}
              onDeleted={() => { setPanelOpen(false); loadOrgTree(); window.dispatchEvent(new Event('hr:stats-changed')) }}
              departments={departments}
              allEmployees={allEmployees}
            />
          ) : (selectedNode.type === 'division' || selectedNode.type === 'team' || selectedNode.type === 'part') ? (
            <DepartmentSlideContent
              node={selectedNode}
              departments={departments}
              onChanged={() => { setPanelOpen(false); setNodeHistory([]); loadOrgTree(); window.dispatchEvent(new Event('hr:stats-changed')) }}
              onSelectNode={child => {
                setNodeHistory(prev => [...prev, selectedNode])
                setSelectedNode(child)
                setExpandedNodes(prev => new Set([...prev, child.name]))
              }}
              onNavigateUp={nodeHistory.length > 0 ? () => {
                const prev = nodeHistory[nodeHistory.length - 1]
                setNodeHistory(h => h.slice(0, -1))
                setSelectedNode(prev)
              } : undefined}
              parentName={nodeHistory.length > 0 ? nodeHistory[nodeHistory.length - 1].name : undefined}
            />
          ) : (
            <NodePanel node={selectedNode} />
          )
        )}
      </SlidePanel>

      <SlidePanel open={createEmpPanelOpen} title="직원 추가" onClose={() => setCreateEmpPanelOpen(false)}>
        <EmployeeCreateContent
          departments={departments}
          allEmployees={allEmployees}
          onCreated={() => {
            setCreateEmpPanelOpen(false)
            window.dispatchEvent(new Event('hr:stats-changed'))
          }}
        />
      </SlidePanel>
    </div>
  )
}
