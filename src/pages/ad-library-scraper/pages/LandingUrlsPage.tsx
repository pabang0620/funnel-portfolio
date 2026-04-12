import { useState, useEffect, useMemo, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getKeywords,
  getLandingUrls,
  getBlockedDomains,
  createBlockedDomain,
  deleteBlockedDomain,
  createBookmark,
  deleteBookmark,
  updateBookmarkNote,
} from '../../../data/ad-library-scraper/mockService'
import type { BlockedDomain } from '../../../data/ad-library-scraper/mockService'
import { BookmarkButton } from '../components/bookmarks/BookmarkButton'
import { BookmarkModal } from '../components/bookmarks/BookmarkModal'
import { DateRangePicker } from '../components/ui/DateRangePicker'
import { Pagination } from '../components/ui/Pagination'
import { CopyButton } from '../components/CopyButton'
import { getYouTubeThumbnail } from '../lib/media'
import { useBookmarkStatus } from '../hooks/useBookmarkStatus'
import type { Keyword } from '../types/keyword'
import type { LandingUrlItem } from '../types/landingUrl'

const PAGE_SIZE = 20

function resolveThumbUrl(imageUrl: string | null, landingUrl: string): string | null {
  if (imageUrl) return getYouTubeThumbnail(imageUrl) ?? imageUrl
  return getYouTubeThumbnail(landingUrl)
}

function ThumbMedia({ thumb }: { thumb: string }) {
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(thumb)) {
    return <video src={thumb} className="h-full w-full object-cover" muted playsInline controls />
  }
  return <img src={thumb} className="h-full w-full object-cover" alt="" />
}

type TabValue = 'meta' | 'google' | 'blocked'

export function LandingUrlsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [selectedKeywordId, setSelectedKeywordId] = useState<string>('')
  const [tab, setTab] = useState<TabValue>('meta')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<LandingUrlItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [blockedDomains, setBlockedDomains] = useState<BlockedDomain[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [adding, setAdding] = useState(false)
  const [bookmarkTarget, setBookmarkTarget] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const source = tab === 'blocked' ? 'meta' : tab
  const queryKeywordId = (!selectedKeywordId || selectedKeywordId === 'all') ? undefined : selectedKeywordId
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const filterKey = `${source}-${queryKeywordId ?? 'all'}`
  const emptyAdIds = useMemo(() => [], [])
  const landingUrls = useMemo(() => items.map(i => i.landing_url), [items])
  const { bookmarkedLandingUrls, bookmarkIds, bookmarkNotes, markBookmarked, unmarkBookmarked } = useBookmarkStatus(emptyAdIds, landingUrls, filterKey, 'full')

  useEffect(() => {
    getKeywords().then(setKeywords).catch(() => toast.error('키워드 목록을 불러올 수 없습니다'))
    getBlockedDomains().then(setBlockedDomains).catch(() => toast.error('차단 도메인 목록을 불러올 수 없습니다'))
  }, [])

  useEffect(() => {
    setSelectedKeywordId('')
    setPage(1)
  }, [tab])

  useEffect(() => {
    if (tab === 'blocked') return
    let cancelled = false
    setLoading(true)
    setItems([])
    getLandingUrls({
      source,
      keyword_id: queryKeywordId,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      page,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        if (!cancelled) { setItems(data.items); setTotal(data.total) }
      })
      .catch(() => { if (!cancelled) toast.error('랜딩 URL을 불러오는데 실패했습니다') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [source, queryKeywordId, dateFrom, dateTo, page, tab])

  const keywordOptions = source === 'meta'
    ? [{ value: 'all', label: '전체' }, ...keywords.filter((kw) => kw.sources === 'meta' || kw.sources === 'both').sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko')).map((kw) => ({ value: kw.id, label: kw.keyword }))]
    : [{ value: 'all', label: '전체' }, ...keywords.filter((kw) => kw.sources === 'google' || kw.sources === 'both').sort((a, b) => a.keyword.localeCompare(b.keyword, 'ko')).map((kw) => ({ value: kw.id, label: kw.keyword }))]

  const thumbMap = useMemo(() => {
    const map = new Map<string, string | null>()
    items.forEach((item) => map.set(item.landing_url, resolveThumbUrl(item.image_url, item.landing_url)))
    return map
  }, [items])

  async function handleAddDomain() {
    const domain = newDomain.trim().replace(/^www\./, '')
    if (!domain) return
    setAdding(true)
    try {
      const created = await createBlockedDomain(domain)
      setBlockedDomains((prev) => [...prev, created])
      setNewDomain('')
      toast.success(`${domain} 차단됨`)
      inputRef.current?.focus()
    } catch {
      toast.error('이미 차단된 도메인이거나 추가에 실패했습니다')
    } finally {
      setAdding(false)
    }
  }

  async function handleBookmarkAdd(note: string | null) {
    if (!bookmarkTarget) return
    try {
      const bm = await createBookmark({ target_type: 'landing_url', landing_url: bookmarkTarget, note })
      markBookmarked('landing_url', bookmarkTarget, bm.id, note)
      toast.success('북마크에 추가되었습니다')
    } catch (e) {
      toast.error('북마크 추가에 실패했습니다')
      throw e
    }
  }

  async function handleBookmarkDelete() {
    if (!bookmarkTarget) return
    const bmId = bookmarkIds.get(`url:${bookmarkTarget}`)
    if (!bmId) return
    try {
      await deleteBookmark(bmId)
      unmarkBookmarked('landing_url', bookmarkTarget)
      toast.success('북마크가 해제되었습니다')
    } catch (e) {
      toast.error('북마크 해제에 실패했습니다')
      throw e
    }
  }

  async function handleBookmarkUpdateNote(note: string | null) {
    if (!bookmarkTarget) return
    const bmId = bookmarkIds.get(`url:${bookmarkTarget}`)
    if (!bmId) return
    try {
      await updateBookmarkNote(bmId, note)
      markBookmarked('landing_url', bookmarkTarget, bmId, note)
      toast.success('메모가 수정되었습니다')
    } catch (e) {
      toast.error('메모 수정에 실패했습니다')
      throw e
    }
  }

  async function handleDeleteDomain(bd: BlockedDomain) {
    try {
      await deleteBlockedDomain(bd.id)
      setBlockedDomains((prev) => prev.filter((d) => d.id !== bd.id))
      toast.success(`${bd.domain} 차단 해제됨`)
    } catch {
      toast.error('차단 해제에 실패했습니다')
    }
  }

  return (
    <div className="space-y-4">
      <div className={`flex items-center justify-between${tab === 'blocked' ? ' invisible' : ''}`}>
          <div>
            {!loading && total > 0 && (
              <span className="text-sm text-muted-foreground">총 {total}건</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedKeywordId} onValueChange={(v) => { setSelectedKeywordId(v); setPage(1) }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="키워드 선택" />
              </SelectTrigger>
              <SelectContent position="popper" align="end" style={{ maxHeight: '500px' }} className="overflow-y-auto">
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
                onChange={(from, to) => { setDateFrom(from); setDateTo(to); setPage(1) }}
              />
            </div>
          </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="meta">Meta</TabsTrigger>
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="blocked">도메인 차단</TabsTrigger>
        </TabsList>

        {/* Meta / Google */}
        {(tab === 'meta' || tab === 'google') && (
          <TabsContent value={tab} className="mt-4">
            {loading ? (
              <div className="flex justify-center py-12 text-muted-foreground">로딩 중...</div>
            ) : items.length === 0 ? (
              <div className="flex justify-center py-12 text-muted-foreground">랜딩 URL이 없습니다.</div>
            ) : (
              <div className="border rounded-lg divide-y divide-border overflow-hidden">
                {items.map((item) => {
                  const thumb = thumbMap.get(item.landing_url) ?? null
                  return (
                    <div key={item.landing_url} className="flex items-center gap-4 px-4 py-3 overflow-hidden">
                      <div className="h-[200px] w-[200px] shrink-0 rounded-md bg-muted overflow-hidden">
                        {thumb && <ThumbMedia thumb={thumb} />}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{item.advertiser_name || '광고주 미상'}</p>
                          <Badge variant="secondary" className="text-xs shrink-0">{item.source}</Badge>
                          <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap shrink-0">
                            {item.last_shown_date ?? '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 w-full overflow-hidden">
                          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <a
                              href={item.landing_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline block truncate"
                            >
                              {item.landing_url}
                            </a>
                          </div>
                          <CopyButton url={item.landing_url} />
                          <BookmarkButton
                            isBookmarked={bookmarkedLandingUrls.has(item.landing_url)}
                            onClick={() => setBookmarkTarget(item.landing_url)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        )}

        {/* 도메인 차단 */}
        <TabsContent value="blocked" className="mt-4">
          <div className="space-y-4">
            {/* 추가 입력 */}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="차단할 도메인 입력 (예: example.com)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddDomain() }}
                className="max-w-sm"
              />
              <Button onClick={handleAddDomain} disabled={adding || !newDomain.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </div>

            {/* 차단 목록 */}
            {blockedDomains.length === 0 ? (
              <div className="flex justify-center py-12 text-muted-foreground">차단된 도메인이 없습니다.</div>
            ) : (
              <div className="border rounded-lg divide-y divide-border overflow-hidden">
                {blockedDomains.map((bd) => (
                  <div key={bd.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{bd.domain}</p>
                      <p className="text-xs text-muted-foreground">{new Date(bd.created_at).toLocaleDateString('ko-KR')}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDomain(bd)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {tab !== 'blocked' && !loading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <BookmarkModal
        open={!!bookmarkTarget}
        onOpenChange={(open) => { if (!open) setBookmarkTarget(null) }}
        mode={bookmarkTarget && bookmarkedLandingUrls.has(bookmarkTarget) ? 'manage' : 'add'}
        initialNote={bookmarkTarget ? (bookmarkNotes.get(`url:${bookmarkTarget}`) ?? '') : ''}
        onAdd={handleBookmarkAdd}
        onDelete={handleBookmarkDelete}
        onUpdateNote={handleBookmarkUpdateNote}
      />
    </div>
  )
}
