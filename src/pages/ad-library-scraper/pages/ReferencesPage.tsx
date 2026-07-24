import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Trash2, Check, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { ReferenceMediaItem } from '../components/references/ReferenceMediaItem'
import { AddItemDialog } from '../components/references/AddItemDialog'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import {
  getReferenceSets,
  createReferenceSet,
  deleteReferenceSet,
  createReferenceItem,
  deleteReferenceItem,
  updateReferenceItem,
  updateReferenceSetName,
  toggleReferenceSetComplete,
} from '../../../data/ad-library-scraper/mockService'
import type { ReferenceSet } from '../types/reference'

const LIMIT = 5

// Mock auth — always admin in portfolio demo
const useAuth = () => ({ user: { is_admin: true } })

function sortSets(sets: ReferenceSet[]): ReferenceSet[] {
  return [...sets].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.completed) {
      const ta = a.completed_at ? new Date(a.completed_at).getTime() : 0
      const tb = b.completed_at ? new Date(b.completed_at).getTime() : 0
      return tb - ta
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
}

export function ReferencesPage() {
  const { user } = useAuth()
  const isAdmin = !!user?.is_admin
  const [sets, setSets] = useState<ReferenceSet[]>([])
  const [loadingSets, setLoadingSets] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [setsOffset, setSetsOffset] = useState(0)
  const [addItemSetId, setAddItemSetId] = useState<string | null>(null)
  const [editingNameSetId, setEditingNameSetId] = useState<string | null>(null)
  const [nameValue, setNameValue] = useState('')
  const [deleteSetId, setDeleteSetId] = useState<string | null>(null)
  const [completeSetId, setCompleteSetId] = useState<string | null>(null)
  const [createSetOpen, setCreateSetOpen] = useState(false)
  const [newSetName, setNewSetName] = useState('')
  const [creatingSet, setCreatingSet] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoadingSets(true)
    setSets([])
    setSetsOffset(0)
    setHasMore(false)
    getReferenceSets(LIMIT, 0)
      .then(data => {
        setSets(data.items as ReferenceSet[])
        setHasMore(data.has_more)
        setSetsOffset(LIMIT)
      })
      .catch(() => toast.error('세트를 불러오지 못했습니다'))
      .finally(() => setLoadingSets(false))
  }, [])

  const loadMoreSets = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const data = await getReferenceSets(LIMIT, setsOffset)
      setSets(prev => {
        const existingIds = new Set(prev.map(s => s.id))
        const newItems = (data.items as ReferenceSet[]).filter(s => !existingIds.has(s.id))
        return [...prev, ...newItems]
      })
      setHasMore(data.has_more)
      setSetsOffset(prev => prev + LIMIT)
    } catch {
      toast.error('세트를 불러오지 못했습니다')
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, setsOffset])

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMoreSets() },
      { threshold: 1.0 }
    )
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadMoreSets])

  async function handleCreateSet() {
    const name = newSetName.trim()
    if (!name) return
    setCreatingSet(true)
    try {
      const newSet = await createReferenceSet(name)
      setSets(prev => sortSets([
        { ...newSet, items: [], item_count: 0, completed: false },
        ...prev,
      ]))
      setNewSetName('')
      setCreateSetOpen(false)
    } catch {
      toast.error('세트 생성에 실패했습니다')
    } finally {
      setCreatingSet(false)
    }
  }

  async function handleSaveName(setId: string) {
    const name = nameValue.trim()
    setEditingNameSetId(null)
    const target = sets.find(s => s.id === setId)
    if (!name || name === target?.name) return
    try {
      await updateReferenceSetName(setId, name)
      setSets(prev => prev.map(s => s.id === setId ? { ...s, name } : s))
    } catch {
      toast.error('이름 수정에 실패했습니다')
    }
  }

  async function handleToggleSetComplete(setId: string) {
    try {
      const updated = await toggleReferenceSetComplete(setId)
      setSets(prev => sortSets(
        prev.map(s => s.id === setId
          ? {
              ...s,
              completed: updated.completed,
              completed_at: updated.completed
                ? (updated.completed_at ?? new Date().toISOString())
                : null,
              updated_at: updated.updated_at ?? new Date().toISOString(),
            }
          : s
        )
      ))
    } catch {
      toast.error('상태 변경에 실패했습니다')
    }
  }

  async function handleDeleteSet(setId: string) {
    try {
      await deleteReferenceSet(setId)
      setSets(prev => prev.filter(s => s.id !== setId))
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  async function handleAddItem(url: string, note: string | null) {
    if (!addItemSetId) return
    try {
      const item = await createReferenceItem(addItemSetId, url, note)
      setSets(prev => prev.map(s =>
        s.id === addItemSetId
          ? { ...s, items: [item, ...s.items], item_count: s.item_count + 1 }
          : s
      ))
      toast.success('추가되었습니다')
    } catch (err) {
      toast.error('아이템 추가에 실패했습니다')
      throw err
    }
  }

  async function handleDeleteItem(setId: string, itemId: string) {
    try {
      await deleteReferenceItem(setId, itemId)
      setSets(prev => prev.map(s =>
        s.id === setId
          ? { ...s, items: s.items.filter(i => i.id !== itemId), item_count: Math.max(0, s.item_count - 1) }
          : s
      ))
    } catch {
      toast.error('삭제에 실패했습니다')
    }
  }

  async function handleUpdateItem(setId: string, itemId: string, url: string, note: string | null) {
    try {
      const updated = await updateReferenceItem(setId, itemId, url, note)
      setSets(prev => prev.map(s =>
        s.id === setId
          ? { ...s, items: s.items.map(i => i.id === itemId ? updated : i) }
          : s
      ))
    } catch {
      toast.error('수정에 실패했습니다')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">레퍼런스</h1>
          {isAdmin && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Demo</span>
          )}
        </div>
        <Button onClick={() => { setNewSetName(''); setCreateSetOpen(true) }}>
          <Plus className="h-4 w-4 mr-1" /> 새 세트
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingSets ? (
          <p className="text-sm text-muted-foreground text-center py-8">로딩 중...</p>
        ) : sets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">세트를 만들어보세요</p>
        ) : (
          <>
            {sets.map(set => (
              <div
                key={set.id}
                className={`rounded-xl border bg-card p-4 ${set.completed ? 'opacity-60' : ''}`}
              >
                {/* 세트 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {editingNameSetId === set.id ? (
                      <input
                        autoFocus
                        className="font-medium bg-transparent border-b border-border outline-none flex-1"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(set.id)
                          if (e.key === 'Escape') setEditingNameSetId(null)
                        }}
                      />
                    ) : (
                      <>
                        <h2 className="font-medium truncate">{set.name}</h2>
                        <button
                          type="button"
                          onClick={() => { setEditingNameSetId(set.id); setNameValue(set.name) }}
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="이름 수정"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0">{set.item_count}개</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {editingNameSetId === set.id ? (
                      <>
                        <Button size="sm" onClick={() => handleSaveName(set.id)}>
                          <Check className="h-3 w-3 mr-1" /> 완료
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingNameSetId(null)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setAddItemSetId(set.id)}>
                          <Plus className="h-3 w-3 mr-1" /> 추가
                        </Button>
                        <Button
                          size="sm"
                          variant={set.completed ? 'default' : 'outline'}
                          onClick={() => setCompleteSetId(set.id)}
                        >
                          {set.completed ? (
                            <><Check className="h-3 w-3 mr-1" /> 완료됨</>
                          ) : (
                            '완료'
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteSetId(set.id)}
                          aria-label="세트 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 아이템 그리드 */}
                {set.items.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">아이템을 추가해보세요</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {set.items.map(item => (
                      <ReferenceMediaItem
                        key={item.id}
                        item={item}
                        onDelete={(id) => handleDeleteItem(set.id, id)}
                        onEdit={(id, url, note) => handleUpdateItem(set.id, id, url, note)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={loaderRef} className="h-1" />
            {loadingMore && <p className="text-xs text-muted-foreground text-center py-2">로딩 중...</p>}
          </>
        )}
      </div>

      <AddItemDialog
        open={addItemSetId !== null}
        onOpenChange={(open) => { if (!open) setAddItemSetId(null) }}
        onAdd={handleAddItem}
      />

      <Dialog open={createSetOpen} onOpenChange={setCreateSetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>새 세트</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-set-name">이름</Label>
              <Input
                id="new-set-name"
                autoFocus
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSet() }}
                placeholder="세트 이름"
                maxLength={255}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setCreateSetOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSet} disabled={creatingSet || !newSetName.trim()}>
              {creatingSet ? '생성 중...' : '생성'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={completeSetId !== null}
        onOpenChange={(open) => { if (!open) setCompleteSetId(null) }}
        title={
          sets.find(s => s.id === completeSetId)?.completed
            ? '세트를 미완료로 되돌리시겠습니까?'
            : '세트를 완료로 표시하시겠습니까?'
        }
        description={
          sets.find(s => s.id === completeSetId)?.completed
            ? '미완료 목록 상단으로 이동합니다.'
            : '완료된 세트는 목록 하단으로 이동합니다.'
        }
        confirmLabel="OK"
        onConfirm={() => {
          if (completeSetId) handleToggleSetComplete(completeSetId)
          setCompleteSetId(null)
        }}
      />

      <ConfirmDialog
        open={deleteSetId !== null}
        onOpenChange={(open) => { if (!open) setDeleteSetId(null) }}
        title="세트를 삭제하시겠습니까?"
        description="This action cannot be undone."
        confirmLabel="삭제"
        destructive
        onConfirm={() => {
          if (deleteSetId) handleDeleteSet(deleteSetId)
          setDeleteSetId(null)
        }}
      />
    </div>
  )
}
