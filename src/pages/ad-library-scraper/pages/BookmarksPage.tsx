import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { BookmarkButton } from '../components/bookmarks/BookmarkButton'
import { BookmarkModal } from '../components/bookmarks/BookmarkModal'
import { Pagination } from '../components/ui/Pagination'
import { AdCard } from '../components/ads/AdCard'
import { AdDetailModal } from '../components/ads/AdDetailModal'
import { getBookmarks, deleteBookmark, updateBookmarkNote } from '../../../data/ad-library-scraper/mockService'
import type { Bookmark } from '../../../data/ad-library-scraper/mockService'
import type { Ad } from '../types/ad'

type TabValue = 'all' | 'ad' | 'landing_url'

const PAGE_SIZE = 20

function bookmarkToAd(bm: Bookmark): Ad | null {
  if (!bm.ad_id) return null
  return {
    id: bm.ad_id,
    keyword_id: bm.keyword_id ?? '',
    source: bm.source ?? 'meta',
    advertiser_name: bm.advertiser_name ?? '',
    variants: (bm.variants as Ad['variants']) ?? [],
    scraped_date: bm.scraped_date ?? '',
    last_shown_date: bm.last_shown_date ?? null,
    created_at: bm.created_at,
    updated_at: bm.created_at,
  }
}

export function BookmarksPage() {
  const [tab, setTab] = useState<TabValue>('all')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<Bookmark[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [bookmarkTarget, setBookmarkTarget] = useState<Bookmark | null>(null)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [tab])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setItems([])
    getBookmarks({
      target_type: tab,
      page,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        if (!cancelled) { setItems(data.items); setTotal(data.total) }
      })
      .catch(() => { if (!cancelled) toast.error('북마크를 불러오는데 실패했습니다') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [tab, page])

  async function handleDelete() {
    if (!bookmarkTarget) return
    try {
      await deleteBookmark(bookmarkTarget.id)
      const next = items.filter(i => i.id !== bookmarkTarget.id)
      setItems(next)
      setTotal(prev => prev - 1)
      if (next.length === 0 && page > 1) setPage(p => p - 1)
      setBookmarkTarget(null)
      toast.success('북마크가 해제되었습니다')
    } catch (err) {
      toast.error('북마크 해제에 실패했습니다')
      throw err
    }
  }

  async function handleUpdateNote(note: string | null) {
    if (!bookmarkTarget) return
    try {
      const updated = await updateBookmarkNote(bookmarkTarget.id, note)
      setItems(prev => prev.map(i => i.id === bookmarkTarget.id ? { ...i, note: updated.note } : i))
      setBookmarkTarget(prev => prev ? { ...prev, note: updated.note } : null)
      toast.success('메모가 수정되었습니다')
    } catch (err) {
      toast.error('메모 수정에 실패했습니다')
      throw err
    }
  }

  const adItems = useMemo(() => items.filter(i => i.target_type === 'ad'), [items])
  const urlItems = useMemo(() => items.filter(i => i.target_type === 'landing_url'), [items])

  function renderAdList(list: Bookmark[]) {
    if (list.length === 0) return <div className="flex justify-center py-12 text-muted-foreground">북마크된 광고가 없습니다.</div>
    const ads = list.map(bm => ({ bm, ad: bookmarkToAd(bm) })).filter((x): x is { bm: Bookmark; ad: Ad } => x.ad !== null)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ads.map(({ bm, ad }) => (
          <div key={bm.id} className="relative">
            <AdCard
              ad={ad}
              onClick={() => setSelectedAd(ad)}
              isBookmarked
              onBookmarkClick={() => setBookmarkTarget(bm)}
              bookmarkNote={bm.note}
            />
          </div>
        ))}
      </div>
    )
  }

  function renderUrlList(list: Bookmark[]) {
    if (list.length === 0) return <div className="flex justify-center py-12 text-muted-foreground">북마크된 랜딩 URL이 없습니다.</div>
    return (
      <div className="border rounded-lg divide-y divide-border overflow-hidden">
        {list.map((bm) => (
          <div key={bm.id} className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{bm.advertiser_name || '광고주 미상'}</p>
                {bm.source && <Badge variant="secondary" className="text-xs shrink-0">{bm.source}</Badge>}
              </div>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                <a
                  href={bm.landing_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate"
                >
                  {bm.landing_url}
                </a>
              </div>
              {bm.note && <p className="text-xs text-muted-foreground line-clamp-1">{bm.note}</p>}
            </div>
            <BookmarkButton
              isBookmarked
              onClick={() => setBookmarkTarget(bm)}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {!loading && total > 0 && (
          <span className="text-sm text-muted-foreground">총 {total}건</span>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="ad">광고</TabsTrigger>
          <TabsTrigger value="landing_url">랜딩 URL</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12 text-muted-foreground">로딩 중...</div>
          ) : tab === 'landing_url' ? (
            renderUrlList(urlItems)
          ) : tab === 'ad' ? (
            renderAdList(adItems)
          ) : (
            <div className="space-y-6">
              {adItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">광고</h3>
                  {renderAdList(adItems)}
                </div>
              )}
              {urlItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">랜딩 URL</h3>
                  {renderUrlList(urlItems)}
                </div>
              )}
              {adItems.length === 0 && urlItems.length === 0 && (
                <div className="flex justify-center py-12 text-muted-foreground">북마크가 없습니다.</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {!loading && totalPages > 1 && (
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
        mode="manage"
        initialNote={bookmarkTarget?.note ?? ''}
        onAdd={async () => {}}
        onDelete={handleDelete}
        onUpdateNote={handleUpdateNote}
      />
    </div>
  )
}
