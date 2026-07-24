import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import type { OrgNode, Department } from '../../types/hr'

interface DepartmentSlideContentProps {
  node: OrgNode
  departments: Department[]
  onChanged: () => void
  onSelectNode?: (node: OrgNode) => void
  onNavigateUp?: () => void
  parentName?: string
}

const TYPE_LABEL: Record<string, string> = {
  division: '실',
  team: '팀',
  part: '파트',
}

const CHILD_LEVEL: Record<string, 'team' | 'part'> = {
  division: 'team',
  team: 'part',
}

const CHILD_LABEL: Record<string, string> = {
  division: '팀',
  team: '파트',
}

export function DepartmentSlideContent({ node, departments, onChanged, onSelectNode, onNavigateUp, parentName }: DepartmentSlideContentProps) {
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState(node.name)
  const [editError, setEditError] = useState<string | null>(null)

  const [addName, setAddName] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!deleteConfirm) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDeleteConfirm(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [deleteConfirm])

  useEffect(() => {
    setEditMode(false)
    setEditName(node.name)
    setEditError(null)
    setAddOpen(false)
    setAddName('')
    setAddError(null)
    setDeleteConfirm(false)
    setDeleteError(null)
  }, [node.id, node.name])

  async function handleSaveEdit() {
    if (!editName.trim() || !node.id) return
    try {
      await api.updateDepartment(node.id, editName.trim())
      setEditMode(false)
      setEditError(null)
      onChanged()
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : '수정 실패')
    }
  }

  async function handleDelete() {
    if (!node.id) return
    try {
      await api.deleteDepartment(node.id)
      setDeleteConfirm(false)
      setDeleteError(null)
      onChanged()
    } catch (e: unknown) {
      setDeleteError(e instanceof Error ? e.message : '삭제 실패')
    }
  }

  async function handleAdd() {
    if (!addName.trim() || !node.id) return
    const childLevel = CHILD_LEVEL[node.type]
    if (!childLevel) return
    try {
      await api.createDepartment({ name: addName.trim(), level: childLevel, parent_id: node.id })
      setAddOpen(false)
      setAddName('')
      setAddError(null)
      onChanged()
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : '추가 실패')
    }
  }

  const typeLabel = TYPE_LABEL[node.type] ?? node.type
  const childLabel = CHILD_LABEL[node.type]
  const subDepts = node.children?.filter(c => c.type !== 'employee') ?? []

  const duplicateEditName = editName.trim() !== node.name && departments.some(d => d.level === node.type && d.name === editName.trim())
  const childLevel = CHILD_LEVEL[node.type]
  const duplicateAddName = addName.trim() ? departments.some(d => d.level === childLevel && d.name === addName.trim()) : false

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground mb-1">{typeLabel}</p>
            {editMode ? (
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary w-full"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit() }}
              />
            ) : (
              <p className="text-lg font-bold text-foreground">{node.name}</p>
            )}
            {duplicateEditName && <p className="text-xs text-red-500 mt-1">이미 존재하는 {typeLabel} 이름입니다</p>}
            {editError && <p className="text-xs text-red-500 mt-1">{editError}</p>}
          </div>
          {!editMode && (
            <button
              onClick={() => { setEditName(node.name); setEditMode(true); setAddOpen(false) }}
              className="h-8 px-3 border rounded-md text-xs font-medium bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
              수정
            </button>
          )}
        </div>

        {/* Children list + add button */}
        {(subDepts.length > 0 || (editMode && childLabel)) && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              하위 {childLabel ?? '부서'}
            </p>
            <div className="space-y-1">
              {subDepts.map(child => {
                const parts = child.children?.filter(c => c.type !== 'employee') ?? []
                return (
                  <div key={child.name}>
                    <div
                      onDoubleClick={() => onSelectNode?.(child)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40 text-sm text-foreground ${onSelectNode ? 'cursor-pointer hover:bg-muted' : ''}`}
                    >
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {TYPE_LABEL[child.type] ?? child.type}
                      </span>
                      <span className="font-medium">{child.name}</span>
                    </div>
                    {parts.length > 0 && (
                      <div className="ml-4 mt-0.5 space-y-0.5">
                        {parts.map(part => (
                          <div
                            key={part.name}
                            onDoubleClick={() => onSelectNode?.(part)}
                            className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-sm text-foreground ${onSelectNode ? 'cursor-pointer hover:bg-muted/60' : ''}`}
                          >
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                              {TYPE_LABEL[part.type] ?? part.type}
                            </span>
                            <span>{part.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* 추가 input (edit mode) */}
              {editMode && childLabel && (
                addOpen ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={addName}
                        onChange={e => setAddName(e.target.value)}
                        placeholder={`새 ${childLabel} 이름`}
                        className="flex-1 h-8 px-2.5 border rounded-md text-sm bg-background focus:outline-none focus:border-primary"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAddOpen(false); setAddName(''); setAddError(null) } }}
                      />
                      <button onClick={handleAdd} disabled={!addName.trim() || duplicateAddName} className="h-8 px-2.5 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">추가</button>
                      <button onClick={() => { setAddOpen(false); setAddName(''); setAddError(null) }} className="h-8 px-2.5 border rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors shrink-0">취소</button>
                    </div>
                    {duplicateAddName && <p className="text-xs text-red-500 mt-1">이미 존재하는 {childLabel} 이름입니다</p>}
                  </div>
                ) : (
                  <button
                    onClick={() => setAddOpen(true)}
                    className="flex items-center gap-1.5 w-full px-2.5 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted/40 transition-colors mt-1 border border-dashed"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {childLabel} 추가
                  </button>
                )
              )}
              {addError && <p className="text-xs text-red-500 mt-1">{addError}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar (edit mode only) */}
      {editMode && (
        <div className="shrink-0 border-t bg-card px-4 py-3 space-y-2">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setDeleteConfirm(true)}
              className="h-7 px-2.5 border border-red-200 rounded-md text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditMode(false); setEditName(node.name); setEditError(null); setAddOpen(false); setAddName(''); setAddError(null) }}
                className="h-9 px-4 border rounded-md text-sm hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editName.trim() || duplicateEditName}
                className="h-9 px-4 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigate up */}
      {onNavigateUp && parentName && (
        <div className="shrink-0 border-t px-4 py-2">
          <button
            onClick={onNavigateUp}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            {parentName}
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border rounded-xl shadow-lg p-6 w-80 flex flex-col items-center gap-4">
            <p className="text-sm font-medium text-center">
              {node.name}을(를) 삭제하시겠습니까?
              <br />
              <span className="text-xs text-muted-foreground">This action cannot be undone.</span>
            </p>
            {deleteError && <p className="text-xs text-red-500 text-center">{deleteError}</p>}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteError(null) }}
                className="flex-1 h-9 border rounded-md text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-9 rounded-md text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
