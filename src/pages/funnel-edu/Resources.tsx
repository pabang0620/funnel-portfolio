import { useState } from 'react'
import { Search, Plus, Pen, Trash2, X, AlertTriangle, FileText, User, Calendar } from 'lucide-react'
import { mockService } from '@/data/funnel-edu/mockService'
import type { Resource } from './types/index'
import { useAuthStore } from './store/auth'
import RichTextEditor from './components/RichTextEditor'

function hashColor(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash)
}

const BADGE_PALETTES = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
]

function getBadgeCls(type: string) {
  return BADGE_PALETTES[hashColor(type) % BADGE_PALETTES.length]
}

type PanelMode = 'closed' | 'read' | 'edit' | 'create'

export default function Resources() {
  const { user, viewAsStudent } = useAuthStore()
  const isAdmin = (user?.is_admin ?? false) && !viewAsStudent

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filterTypes, setFilterTypes] = useState<string[]>([])
  const [panelMode, setPanelMode] = useState<PanelMode>('closed')
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)

  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editType, setEditType] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [localResources, setLocalResources] = useState<Resource[]>(() => mockService.getResources().data as Resource[])

  const allTypes = Array.from(new Set(localResources.map(r => r.type).filter(Boolean))) as string[]

  const filtered = localResources.filter(r => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterTypes.length > 0 && !filterTypes.includes(r.type ?? '')) return false
    return true
  })

  function openResource(r: Resource) {
    setSelectedResource(r)
    setPanelMode('read')
  }

  function startEdit() {
    if (!selectedResource) return
    setEditTitle(selectedResource.title)
    setEditContent(selectedResource.content ?? '')
    setEditType(selectedResource.type ?? '')
    setPanelMode('edit')
  }

  function startCreate() {
    setSelectedResource(null)
    setEditTitle('')
    setEditContent('')
    setEditType('')
    setPanelMode('create')
  }

  function handleSave() {
    setSaving(true)
    if (panelMode === 'edit' && selectedResource) {
      const updated = mockService.updateResource(selectedResource.id, {
        title: editTitle,
        content: editContent,
        type: editType,
      }) as Resource
      if (updated) {
        setLocalResources(prev => prev.map(r => r.id === updated.id ? updated : r))
        setSelectedResource(updated)
      }
      setPanelMode('read')
    } else if (panelMode === 'create') {
      const newR = mockService.createResource({
        title: editTitle,
        content: editContent,
        type: editType || null,
        thumbnail_url: null,
      }) as Resource
      setLocalResources(prev => [newR, ...prev])
      setSelectedResource(newR)
      setPanelMode('read')
    }
    setSaving(false)
  }

  function handleDelete() {
    if (!selectedResource) return
    mockService.deleteResource(selectedResource.id)
    setLocalResources(prev => prev.filter(r => r.id !== selectedResource.id))
    setShowDeleteConfirm(false)
    setPanelMode('closed')
    setSelectedResource(null)
  }

  return (
    <div className="flex h-full">
      {/* List panel */}
      <div className={`flex-1 min-w-0 px-8 py-8 overflow-y-auto transition-all ${panelMode !== 'closed' ? 'max-w-xl' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">교육자료실</h1>
            <p className="text-sm text-gray-500 mt-0.5">총 {localResources.length}개의 자료</p>
          </div>
          {isAdmin && (
            <button
              onClick={startCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> 자료 등록
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput) }}
              placeholder="자료명 검색 (Enter)"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          {allTypes.map(t => (
            <button key={t}
              onClick={() => setFilterTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${filterTypes.includes(t) ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(r => (
            <div
              key={r.id}
              onClick={() => openResource(r)}
              className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all ${selectedResource?.id === r.id ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {r.type && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeCls(r.type)}`}>{r.type}</span>}
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{r.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {r.created_by_name && (
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{r.created_by_name}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.created_at.slice(0, 10)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail/Edit panel */}
      {panelMode !== 'closed' && (
        <div className="w-[560px] flex-shrink-0 border-l border-gray-200 bg-white flex flex-col h-full overflow-hidden">
          {/* Delete Confirm */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
              <div className="bg-white rounded-xl w-80 shadow-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-bold text-gray-900">자료를 삭제하시겠습니까?</h3>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleDelete} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">삭제</button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">취소</button>
                </div>
              </div>
            </div>
          )}

          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              {panelMode === 'read' ? (
                <>
                  {selectedResource?.type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeCls(selectedResource.type)}`}>{selectedResource.type}</span>
                  )}
                  <h2 className="text-base font-bold text-gray-900 truncate max-w-[280px]">{selectedResource?.title}</h2>
                </>
              ) : (
                <h2 className="text-base font-bold text-gray-900">{panelMode === 'create' ? '자료 등록' : '자료 수정'}</h2>
              )}
            </div>
            <button onClick={() => { setPanelMode('closed'); setSelectedResource(null) }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {panelMode === 'read' && selectedResource && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-gray-400 pb-3 border-b border-gray-100">
                  {selectedResource.created_by_name && (
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{selectedResource.created_by_name}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedResource.created_at.slice(0, 10)}</span>
                </div>
                {selectedResource.content && (
                  <RichTextEditor content={selectedResource.content} editable={false} />
                )}
              </div>
            )}

            {(panelMode === 'edit' || panelMode === 'create') && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">제목</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">유형</label>
                  <input value={editType} onChange={e => setEditType(e.target.value)}
                    placeholder="공지, 가이드, 자료 등"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">내용</label>
                  <RichTextEditor content={editContent} onChange={setEditContent} />
                </div>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          {panelMode === 'read' && isAdmin && (
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />삭제
              </button>
              <button onClick={startEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
                <Pen className="w-3.5 h-3.5" /> 수정
              </button>
            </div>
          )}

          {(panelMode === 'edit' || panelMode === 'create') && (
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={() => setPanelMode(selectedResource ? 'read' : 'closed')}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">
                취소
              </button>
              <button onClick={handleSave} disabled={saving || !editTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                저장
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
