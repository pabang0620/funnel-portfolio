import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { Loader2, LayoutGrid, Table as TableIcon, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { getKeywords } from '../../../data/ad-library-scraper/mockService'
import { AdCardGrid } from '../components/ads/AdCardGrid'
import { AdDataTable } from '../components/ads/AdDataTable'
import { AdDetailModal } from '../components/ads/AdDetailModal'
import { BookmarkModal } from '../components/bookmarks/BookmarkModal'
import { Pagination } from '../components/ui/Pagination'
import { DateRangePicker } from '../components/ui/DateRangePicker'
import { useAds } from '../hooks/useAds'
import { useBookmarkStatus } from '../hooks/useBookmarkStatus'
import { createBookmark, deleteBookmark, updateBookmarkNote } from '../../../data/ad-library-scraper/mockService'
import type { Keyword } from '../types/keyword'
import type { Ad } from '../types/ad'

export function ResultsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>('all')
  const [source, setSource] = useState<'meta' | 'google'>('meta')
  const [viewMode, setViewMode] = useState<'card' | 'table'>(
    () => (localStorage.getItem('adlib-viewMode') as 'card' | 'table') || 'card'
  )
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [bookmarkTarget, setBookmarkTarget] = useState<Ad | null>(null)
  const [page, setPage] = useState(1)
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default')
  const sentinelRef = useRef<HTMLDivElement>(null)
  const isFetchingRef = useRef<boolean>(false)

  const queryKeywordId = (!selectedKeywordId || selectedKeywordId === 'all') ? undefined : selectedKeywordId
  const isInfinite = viewMode === 'card'
  const pageSize = isInfinite ? 24 : 20
  const { ads, total, loading, hasMore } = useAds({ keywordId: queryKeywordId, source, dateFrom, dateTo, page, pageSize, infinite: isInfinite, sortOrder })

  const filterKey = `${source}-${queryKeywordId ?? 'all'}`
  const adIds = useMemo(() => ads.map(a => a.id), [ads])
  const emptyArray = useMemo(() => [], [])
  const { bookmarkedAdIds, bookmarkIds, bookmarkNotes, markBookmarked, unmarkBookmarked } = useBookmarkStatus(adIds, emptyArray, filterKey, 'incremental')

  // Sync isFetchingRef with loading state to guard infinite scroll stale closure
  useEffect(() => {
    isFetchingRef.current = loading
  }, [loading])
  const totalPages = Math.ceil(total / pageSize)

  useEffect(() => {
    getKeywords().then(setKeywords).catch(() => toast.error('Failed to load keyword list'))
  }, [])

  // Reset page on filter change
  useEffect(() => {
    setSelectedKeywordId('all')
    setPage(1)
  }, [source])

  useEffect(() => {
    setPage(1)
  }, [viewMode, queryKeywordId, dateFrom, dateTo, sortOrder])

  useEffect(() => {
    localStorage.setItem('adlib-viewMode', viewMode)
  }, [viewMode])

  // Infinite scroll sentinel (card view only)
  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting && hasMore && !isFetchingRef.current && isInfinite) {
      isFetchingRef.current = true
      setPage(p => p + 1)
    }
  }, [hasMore, isInfinite])

  useEffect(() => {
    if (!isInfinite) return
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersect, isInfinite])

  async function handleBookmarkAdd(note: string | null) {
    if (!bookmarkTarget) return
    try {
      const bm = await createBookmark({ target_type: 'ad', ad_id: bookmarkTarget.id, note })
      markBookmarked('ad', bookmarkTarget.id, bm.id, note)
      toast.success('북마크에 추가되었습니다')
    } catch (e) {
      toast.error('북마크 추가에 실패했습니다')
      throw e
    }
  }

  async function handleBookmarkDelete() {
    if (!bookmarkTarget) return
    const bmId = bookmarkIds.get(`ad:${bookmarkTarget.id}`)
    if (!bmId) return
    try {
      await deleteBookmark(bmId)
      unmarkBookmarked('ad', bookmarkTarget.id)
      toast.success('북마크가 해제되었습니다')
    } catch (e) {
      toast.error('북마크 해제에 실패했습니다')
      throw e
    }
  }

  async function handleBookmarkUpdateNote(note: string | null) {
    if (!bookmarkTarget) return
    const bmId = bookmarkIds.get(`ad:${bookmarkTarget.id}`)
    if (!bmId) return
    try {
      await updateBookmarkNote(bmId, note)
      markBookmarked('ad', bookmarkTarget.id, bmId, note)
      toast.success('메모가 수정되었습니다')
    } catch (e) {
      toast.error('메모 수정에 실패했습니다')
      throw e
    }
  }

  const keywordOptions = source === 'meta'
    ? [{ value: 'all', label: '전체' }, ...keywords.filter((kw) => kw.sources === 'meta' || kw.sources === 'both').sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko')).map((kw) => ({ value: kw.id, label: kw.keyword }))]
    : [{ value: 'all', label: '전체' }, ...keywords.filter((kw) => kw.sources === 'google' || kw.sources === 'both').sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko')).map((kw) => ({ value: kw.id, label: kw.keyword }))]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!loading && total > 0 && (
            <span className="text-sm text-muted-foreground">총 {total}건</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedKeywordId} onValueChange={(v) => { setSelectedKeywordId(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="키워드 선택" />
            </SelectTrigger>
            <SelectContent position="popper" style={{ maxHeight: '500px' }} className="overflow-y-auto">
              {keywordOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <span className="absolute -top-2 left-2 z-10 bg-background px-1 text-[10px] text-muted-foreground">게시일</span>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => {
                setDateFrom(from)
                setDateTo(to)
                setPage(1)
              }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSortOrder(prev => prev === 'default' ? 'desc' : prev === 'desc' ? 'asc' : 'default')
              setPage(1)
            }}
            className="flex items-center gap-1.5"
          >
            {sortOrder === 'default' && <ArrowUpDown className="h-4 w-4" />}
            {sortOrder === 'desc' && <ArrowDown className="h-4 w-4" />}
            {sortOrder === 'asc' && <ArrowUp className="h-4 w-4" />}
            <span className="text-xs">
              {sortOrder === 'default' ? '기본' : sortOrder === 'desc' ? '최신순' : '오래된순'}
            </span>
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('card')}
              title="카드형"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
              title="테이블형"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={source} onValueChange={(v) => setSource(v as 'meta' | 'google')}>
        <TabsList>
          <TabsTrigger value="meta">Meta</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
        </TabsList>
        <TabsContent value={source} className="mt-4">
          {loading && ads.length === 0 ? (
            <div className="flex justify-center py-12 text-muted-foreground">로딩 중...</div>
          ) : viewMode === 'card' ? (
            <AdCardGrid
              ads={ads}
              onAdClick={setSelectedAd}
              bookmarkedIds={bookmarkedAdIds}
              bookmarkNotes={bookmarkNotes}
              onBookmarkClick={(ad) => setBookmarkTarget(ad)}
            />
          ) : (
            <AdDataTable ads={ads} onAdClick={setSelectedAd} />
          )}
        </TabsContent>
      </Tabs>

      {/* Infinite scroll (card) */}
      {isInfinite && (
        <>
          <div ref={sentinelRef} className="h-4" />
          {loading && ads.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      )}

      {/* Pagination (table) */}
      {!isInfinite && !loading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <AdDetailModal
        ad={selectedAd}
        open={!!selectedAd}
        onOpenChange={(open) => { if (!open) setSelectedAd(null) }}
      />

      <BookmarkModal
        open={!!bookmarkTarget}
        onOpenChange={(open) => { if (!open) setBookmarkTarget(null) }}
        mode={bookmarkTarget && bookmarkedAdIds.has(bookmarkTarget.id) ? 'manage' : 'add'}
        initialNote={bookmarkTarget ? (bookmarkNotes.get(`ad:${bookmarkTarget.id}`) ?? '') : ''}
        onAdd={handleBookmarkAdd}
        onDelete={handleBookmarkDelete}
        onUpdateNote={handleBookmarkUpdateNote}
      />
    </div>
  )
}
