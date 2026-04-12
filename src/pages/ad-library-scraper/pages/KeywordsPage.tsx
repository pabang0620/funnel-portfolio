import { useState, useEffect, useCallback } from 'react'
import { Button } from '../components/ui/button'
import { Plus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { KeywordTable } from '../components/keywords/KeywordTable'
import { KeywordForm } from '../components/keywords/KeywordForm'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Pagination } from '../components/ui/Pagination'
import {
  getKeywords,
  createKeyword,
  updateKeyword,
  deleteKeyword,
} from '../../../data/ad-library-scraper/mockService'
import type { Keyword } from '../types/keyword'

export function KeywordsPage() {
  type PlatformTab = 'all' | 'google' | 'meta'

  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Keyword | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Keyword | null>(null)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<PlatformTab>('all')

  const PAGE_SIZE = 15
  const filteredKeywords = keywords
    .filter((kw) => {
      if (activeTab === 'all') return true
      if (activeTab === 'google') return kw.sources === 'google' || kw.sources === 'both'
      if (activeTab === 'meta') return kw.sources === 'meta' || kw.sources === 'both'
      return true
    })
    .sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko'))
  const totalPages = Math.ceil(filteredKeywords.length / PAGE_SIZE)
  const paginatedKeywords = filteredKeywords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const fetchKeywords = useCallback(async () => {
    try {
      const data = await getKeywords()
      setKeywords(data)
      setPage(1)
    } catch {
      toast.error('키워드 목록을 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  const handleApiError = (err: unknown, defaultMsg: string) => {
    const e = err as { status?: number }
    if (e?.status === 409) {
      toast.error('이미 존재하는 키워드입니다')
    } else {
      toast.error(defaultMsg)
    }
  }

  const handleCreate = async (keyword: string, sources: string) => {
    try {
      await createKeyword({ keyword, sources })
      toast.success('키워드가 추가되었습니다')
      fetchKeywords()
    } catch (err) {
      handleApiError(err, '키워드 추가에 실패했습니다')
    }
  }

  const handleEdit = async (keyword: string, sources: string) => {
    if (!editTarget) return
    try {
      await updateKeyword(editTarget.id, { keyword, sources })
      toast.success('키워드가 수정되었습니다')
      setEditTarget(null)
      fetchKeywords()
    } catch (err) {
      handleApiError(err, '키워드 수정에 실패했습니다')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteKeyword(deleteTarget.id)
      toast.success('키워드가 삭제되었습니다')
      setDeleteTarget(null)
      fetchKeywords()
    } catch {
      toast.error('키워드 삭제에 실패했습니다')
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12 text-muted-foreground">로딩 중...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">키워드 관리</h2>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as PlatformTab); setPage(1) }}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="meta">Meta</TabsTrigger>
          </TabsList>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            키워드 추가
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <KeywordTable
            keywords={paginatedKeywords}
            onEdit={(kw) => setEditTarget(kw)}
            onDelete={(id) => {
              const kw = keywords.find(k => k.id === id)
              if (kw) setDeleteTarget(kw)
            }}
          />
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </TabsContent>
      </Tabs>

      <KeywordForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(keyword, sources) => handleCreate(keyword, sources)}
        mode="create"
      />

      {editTarget && (
        <KeywordForm
          open={true}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
          onSubmit={handleEdit}
          initialValue={editTarget.keyword}
          initialSources={editTarget.sources}
          mode="edit"
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              키워드를 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    <strong>'{deleteTarget?.keyword}'</strong> 키워드를 삭제하면 해당 키워드로 수집된{' '}
                    <strong>모든 광고 데이터가 함께 삭제</strong>됩니다.
                    이 작업은 되돌릴 수 없습니다.
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
