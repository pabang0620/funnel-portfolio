import type { Keyword } from '../../pages/ad-library-scraper/types/keyword'
import type { Ad, AdListResponse } from '../../pages/ad-library-scraper/types/ad'
import type { LandingUrlItem, LandingUrlListResponse } from '../../pages/ad-library-scraper/types/landingUrl'
import keywordsData from './keywords.json'
import adsData from './scrape-results.json'
import landingUrlsData from './landing-urls.json'
import blockedDomainsData from './blocked-domains.json'
import bookmarksData from './bookmarks.json'
import referencesData from './references.json'

export interface Bookmark {
  id: string
  user_id: string
  target_type: 'ad' | 'landing_url'
  ad_id: string | null
  landing_url: string | null
  note: string | null
  created_at: string
  advertiser_name?: string
  source?: 'meta' | 'google'
  variants?: unknown[]
  scraped_date?: string
  last_shown_date?: string | null
  keyword_id?: string
}

export interface BlockedDomain {
  id: string
  domain: string
  created_at: string
}

export interface ReferenceItem {
  id: string
  set_id: string
  url: string
  url_type: 'image' | 'video' | 'link'
  note: string | null
  created_at: string
  ad_id: string | null
  ad_data: Ad | null
}

export interface ReferenceSet {
  id: string
  user_id?: string
  name: string
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
  item_count: number
  items: ReferenceItem[]
}

export interface ReferenceSetListResponse {
  items: ReferenceSet[]
  total: number
  has_more: boolean
}

// --- In-memory state ---
let keywords: Keyword[] = keywordsData as Keyword[]
let ads: Ad[] = adsData as Ad[]
const landingUrls: LandingUrlItem[] = landingUrlsData as LandingUrlItem[]

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ===== Keywords =====

export async function getKeywords(): Promise<Keyword[]> {
  await delay()
  return [...keywords]
}

export async function createKeyword(body: { keyword: string; sources: string }): Promise<Keyword> {
  await delay()
  const existing = keywords.find((k) => k.keyword === body.keyword)
  if (existing) {
    const err = new Error('Conflict') as Error & { status: number }
    err.status = 409
    throw err
  }
  const newKw: Keyword = {
    id: `kw-${Date.now()}`,
    keyword: body.keyword,
    sources: body.sources,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  keywords = [...keywords, newKw]
  return newKw
}

export async function updateKeyword(id: string, body: { keyword: string; sources?: string }): Promise<Keyword> {
  await delay()
  const existing = keywords.find((k) => k.keyword === body.keyword && k.id !== id)
  if (existing) {
    const err = new Error('Conflict') as Error & { status: number }
    err.status = 409
    throw err
  }
  keywords = keywords.map((k) =>
    k.id === id
      ? { ...k, keyword: body.keyword, sources: body.sources ?? k.sources, updated_at: new Date().toISOString() }
      : k
  )
  const updated = keywords.find((k) => k.id === id)
  if (!updated) throw new Error('Keyword not found')
  return updated
}

export async function deleteKeyword(id: string): Promise<void> {
  await delay()
  keywords = keywords.filter((k) => k.id !== id)
  // Also remove associated ads
  ads = ads.filter((a) => a.keyword_id !== id)
}

// ===== Ads =====

export async function getAds(params: {
  keywordId?: string
  source?: 'meta' | 'google'
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
  sortOrder?: 'default' | 'asc' | 'desc'
}): Promise<AdListResponse> {
  await delay()
  const { keywordId, source, dateFrom, dateTo, page = 1, pageSize = 12, sortOrder = 'default' } = params

  let filtered = [...ads]

  if (keywordId) {
    filtered = filtered.filter((a) => a.keyword_id === keywordId)
  }
  if (source) {
    filtered = filtered.filter((a) => a.source === source)
  }
  if (dateFrom) {
    filtered = filtered.filter((a) => a.last_shown_date != null && a.last_shown_date >= dateFrom)
  }
  if (dateTo) {
    filtered = filtered.filter((a) => a.last_shown_date != null && a.last_shown_date <= dateTo)
  }

  if (sortOrder === 'desc') {
    filtered.sort((a, b) => {
      const da = a.scraped_date ?? ''
      const db = b.scraped_date ?? ''
      return db.localeCompare(da)
    })
  } else if (sortOrder === 'asc') {
    filtered.sort((a, b) => {
      const da = a.scraped_date ?? ''
      const db = b.scraped_date ?? ''
      return da.localeCompare(db)
    })
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return { ads: items, total, page, page_size: pageSize }
}

// ===== Landing URLs =====

export async function getLandingUrls(params: {
  source: 'meta' | 'google'
  keyword_id?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}): Promise<LandingUrlListResponse> {
  await delay()
  const { source, keyword_id, date_from, date_to, page = 1, page_size = 20 } = params

  // Build keyword IDs matching source
  let filteredKeywordIds: string[] | undefined
  if (keyword_id) {
    filteredKeywordIds = [keyword_id]
  }

  // Get landing URLs tied to relevant ads
  let filteredAds = ads.filter((a) => a.source === source)
  if (filteredKeywordIds) {
    filteredAds = filteredAds.filter((a) => filteredKeywordIds!.includes(a.keyword_id))
  }
  if (date_from) {
    filteredAds = filteredAds.filter((a) => a.last_shown_date != null && a.last_shown_date >= date_from)
  }
  if (date_to) {
    filteredAds = filteredAds.filter((a) => a.last_shown_date != null && a.last_shown_date <= date_to)
  }

  // Collect unique landing URLs from matching ads
  const seenUrls = new Set<string>()
  const adLandingUrls: string[] = []
  filteredAds.forEach((a) => {
    a.variants.forEach((v) => {
      if (v.landing_page_url && !seenUrls.has(v.landing_page_url)) {
        seenUrls.add(v.landing_page_url)
        adLandingUrls.push(v.landing_page_url)
      }
    })
  })

  // Match against our landingUrls data
  let filtered = landingUrls.filter((lu) => {
    if (lu.source !== source) return false
    if (keyword_id && !adLandingUrls.includes(lu.landing_url)) return false
    if (date_from && lu.last_shown_date && lu.last_shown_date < date_from) return false
    if (date_to && lu.last_shown_date && lu.last_shown_date > date_to) return false
    return true
  })

  // If no specific keyword filter, just show all matching source
  if (!keyword_id) {
    filtered = landingUrls.filter((lu) => {
      if (lu.source !== source) return false
      if (date_from && lu.last_shown_date && lu.last_shown_date < date_from) return false
      if (date_to && lu.last_shown_date && lu.last_shown_date > date_to) return false
      return true
    })
  }

  const total = filtered.length
  const start = (page - 1) * page_size
  const items = filtered.slice(start, start + page_size)

  return { items, total, page, page_size }
}

// ===== Bookmarks =====
let bookmarks: Bookmark[] = bookmarksData as Bookmark[]
let bookmarkIdCounter = bookmarksData.length + 1

export async function getBookmarks(params: {
  target_type?: 'all' | 'ad' | 'landing_url'
  page?: number
  page_size?: number
}): Promise<{ items: Bookmark[]; total: number; page: number; page_size: number }> {
  await delay()
  const { target_type = 'all', page = 1, page_size = 20 } = params
  const filtered = target_type === 'all' ? bookmarks : bookmarks.filter(b => b.target_type === target_type)
  const total = filtered.length
  const items = filtered.slice((page - 1) * page_size, page * page_size)
  return { items, total, page, page_size }
}

export async function createBookmark(body: {
  target_type: 'ad' | 'landing_url'
  ad_id?: string
  landing_url?: string
  note?: string | null
}): Promise<Bookmark> {
  await delay()
  const ad = body.ad_id ? ads.find(a => a.id === body.ad_id) : undefined
  const bm: Bookmark = {
    id: `bm-${bookmarkIdCounter++}`,
    user_id: 'demo-user',
    target_type: body.target_type,
    ad_id: body.ad_id ?? null,
    landing_url: body.landing_url ?? null,
    note: body.note ?? null,
    created_at: new Date().toISOString(),
    advertiser_name: ad?.advertiser_name,
    source: ad?.source,
    variants: ad?.variants,
    scraped_date: ad?.scraped_date,
    last_shown_date: ad?.last_shown_date,
    keyword_id: ad?.keyword_id,
  }
  bookmarks = [...bookmarks, bm]
  return bm
}

export async function updateBookmarkNote(id: string, note: string | null): Promise<Bookmark> {
  await delay()
  bookmarks = bookmarks.map(b => b.id === id ? { ...b, note } : b)
  const updated = bookmarks.find(b => b.id === id)
  if (!updated) throw new Error('Bookmark not found')
  return updated
}

export async function deleteBookmark(id: string): Promise<void> {
  await delay()
  bookmarks = bookmarks.filter(b => b.id !== id)
}

export async function getBookmarkStatus(
  adIds: string[],
  landingUrls: string[]
): Promise<{ bookmarked_ad_ids: string[]; bookmarked_landing_urls: string[]; bookmark_ids: Record<string, string>; bookmark_notes: Record<string, string | null> }> {
  await delay(50)
  const bookmarked_ad_ids = adIds.filter(id => bookmarks.some(b => b.ad_id === id))
  const bookmarked_landing_urls = landingUrls.filter(url => bookmarks.some(b => b.landing_url === url))
  const bookmark_ids: Record<string, string> = {}
  const bookmark_notes: Record<string, string | null> = {}
  bookmarks.forEach(b => {
    if (b.ad_id && adIds.includes(b.ad_id)) {
      bookmark_ids[`ad:${b.ad_id}`] = b.id
      bookmark_notes[`ad:${b.ad_id}`] = b.note
    }
    if (b.landing_url && landingUrls.includes(b.landing_url)) {
      bookmark_ids[`url:${b.landing_url}`] = b.id
      bookmark_notes[`url:${b.landing_url}`] = b.note
    }
  })
  return { bookmarked_ad_ids, bookmarked_landing_urls, bookmark_ids, bookmark_notes }
}

// ===== Blocked Domains =====
let blockedDomains: BlockedDomain[] = blockedDomainsData as BlockedDomain[]

export async function getBlockedDomains(): Promise<BlockedDomain[]> {
  await delay()
  return [...blockedDomains]
}

export async function createBlockedDomain(domain: string): Promise<BlockedDomain> {
  await delay()
  if (blockedDomains.some(d => d.domain === domain)) {
    const err = new Error('Conflict') as Error & { status: number }
    err.status = 409
    throw err
  }
  const bd: BlockedDomain = { id: `bd-${Date.now()}`, domain, created_at: new Date().toISOString() }
  blockedDomains = [...blockedDomains, bd]
  return bd
}

export async function deleteBlockedDomain(id: string): Promise<void> {
  await delay()
  blockedDomains = blockedDomains.filter(d => d.id !== id)
}

// ===== References =====
let referenceSets: ReferenceSet[] = (referencesData as Array<{
  id: string
  name: string
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
  items: ReferenceItem[]
}>).map(s => ({ ...s, user_id: 'demo-user', item_count: s.items.length }))

export async function getReferenceSets(limit = 5, offset = 0, _userId?: string): Promise<ReferenceSetListResponse> {
  await delay()
  const sorted = [...referenceSets].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
  const items = sorted.slice(offset, offset + limit)
  return { items, total: sorted.length, has_more: offset + limit < sorted.length }
}

export async function createReferenceSet(name: string): Promise<ReferenceSet> {
  await delay()
  const set: ReferenceSet = {
    id: `ref-${Date.now()}`,
    user_id: 'demo-user',
    name,
    completed: false,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 0,
    items: [],
  }
  referenceSets = [...referenceSets, set]
  return set
}

export async function deleteReferenceSet(id: string): Promise<void> {
  await delay()
  referenceSets = referenceSets.filter(s => s.id !== id)
}

export async function updateReferenceSetName(id: string, name: string): Promise<ReferenceSet> {
  await delay()
  referenceSets = referenceSets.map(s => s.id === id ? { ...s, name, updated_at: new Date().toISOString() } : s)
  const updated = referenceSets.find(s => s.id === id)
  if (!updated) throw new Error('Not found')
  return updated
}

export async function toggleReferenceSetComplete(id: string): Promise<ReferenceSet> {
  await delay()
  referenceSets = referenceSets.map(s =>
    s.id === id
      ? { ...s, completed: !s.completed, completed_at: !s.completed ? new Date().toISOString() : null, updated_at: new Date().toISOString() }
      : s
  )
  const updated = referenceSets.find(s => s.id === id)
  if (!updated) throw new Error('Not found')
  return updated
}

export async function createReferenceItem(setId: string, url: string, note?: string | null, _adId?: string | null): Promise<ReferenceItem> {
  await delay()
  const item: ReferenceItem = {
    id: `ri-${Date.now()}`,
    set_id: setId,
    url,
    url_type: /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) ? 'video' : /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url) ? 'image' : 'link',
    note: note ?? null,
    created_at: new Date().toISOString(),
    ad_id: null,
    ad_data: null,
  }
  referenceSets = referenceSets.map(s =>
    s.id === setId
      ? { ...s, items: [...s.items, item], item_count: s.item_count + 1, updated_at: new Date().toISOString() }
      : s
  )
  return item
}

export async function deleteReferenceItem(setId: string, itemId: string): Promise<void> {
  await delay()
  referenceSets = referenceSets.map(s =>
    s.id === setId
      ? { ...s, items: s.items.filter(i => i.id !== itemId), item_count: Math.max(0, s.item_count - 1) }
      : s
  )
}

export async function updateReferenceItem(setId: string, itemId: string, url: string, note: string | null): Promise<ReferenceItem> {
  await delay()
  let found: ReferenceItem | undefined
  referenceSets = referenceSets.map(s => {
    if (s.id !== setId) return s
    return {
      ...s,
      items: s.items.map(i => {
        if (i.id === itemId) {
          found = { ...i, url, note, url_type: /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) ? 'video' : /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url) ? 'image' : 'link' }
          return found
        }
        return i
      }),
    }
  })
  if (!found) throw new Error('Not found')
  return found
}
