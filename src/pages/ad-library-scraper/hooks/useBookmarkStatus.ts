import { useState, useEffect, useRef } from 'react'
import { getBookmarkStatus } from '../../../data/ad-library-scraper/mockService'

export function useBookmarkStatus(
  adIds: string[],
  landingUrls: string[],
  filterKey: string,
  mode: 'incremental' | 'full' = 'incremental'
) {
  const [bookmarkedAdIds, setBookmarkedAdIds] = useState<Set<string>>(new Set())
  const [bookmarkedLandingUrls, setBookmarkedLandingUrls] = useState<Set<string>>(new Set())
  const [bookmarkIds, setBookmarkIds] = useState<Map<string, string>>(new Map())
  const [bookmarkNotes, setBookmarkNotes] = useState<Map<string, string | null>>(new Map())
  const seenAdIdsRef = useRef<Set<string>>(new Set())
  const seenLandingUrlsRef = useRef<Set<string>>(new Set())
  const inFlightAdIdsRef = useRef<Set<string>>(new Set())
  const inFlightLandingUrlsRef = useRef<Set<string>>(new Set())

  // filterKey 변경 시 상태 초기화
  useEffect(() => {
    seenAdIdsRef.current = new Set()
    seenLandingUrlsRef.current = new Set()
    inFlightAdIdsRef.current = new Set()
    inFlightLandingUrlsRef.current = new Set()
    setBookmarkedAdIds(new Set())
    setBookmarkedLandingUrls(new Set())
    setBookmarkIds(new Map())
    setBookmarkNotes(new Map())
  }, [filterKey])

  useEffect(() => {
    if (mode === 'full') {
      if (adIds.length === 0 && landingUrls.length === 0) return
      let cancelled = false
      getBookmarkStatus(adIds, landingUrls).then(data => {
        if (cancelled) return
        setBookmarkedAdIds(new Set(data.bookmarked_ad_ids))
        setBookmarkedLandingUrls(new Set(data.bookmarked_landing_urls))
        const idMap = new Map<string, string>()
        const noteMap = new Map<string, string | null>()
        Object.entries(data.bookmark_ids).forEach(([k, v]) => idMap.set(k, v))
        Object.entries(data.bookmark_notes ?? {}).forEach(([k, v]) => noteMap.set(k, v as string | null))
        setBookmarkIds(idMap)
        setBookmarkNotes(noteMap)
      }).catch(() => {})
      return () => { cancelled = true }
    } else {
      const newAdIds = adIds.filter(id => !seenAdIdsRef.current.has(id) && !inFlightAdIdsRef.current.has(id))
      const newLandingUrls = landingUrls.filter(url => !seenLandingUrlsRef.current.has(url) && !inFlightLandingUrlsRef.current.has(url))
      if (newAdIds.length === 0 && newLandingUrls.length === 0) return

      newAdIds.forEach(id => inFlightAdIdsRef.current.add(id))
      newLandingUrls.forEach(url => inFlightLandingUrlsRef.current.add(url))

      getBookmarkStatus(newAdIds, newLandingUrls).then(data => {
        newAdIds.forEach(id => { seenAdIdsRef.current.add(id); inFlightAdIdsRef.current.delete(id) })
        newLandingUrls.forEach(url => { seenLandingUrlsRef.current.add(url); inFlightLandingUrlsRef.current.delete(url) })
        setBookmarkedAdIds(prev => new Set([...prev, ...data.bookmarked_ad_ids]))
        setBookmarkedLandingUrls(prev => new Set([...prev, ...data.bookmarked_landing_urls]))
        setBookmarkIds(prev => {
          const next = new Map(prev)
          Object.entries(data.bookmark_ids).forEach(([k, v]) => next.set(k, v))
          return next
        })
        setBookmarkNotes(prev => {
          const next = new Map(prev)
          Object.entries(data.bookmark_notes ?? {}).forEach(([k, v]) => next.set(k, v as string | null))
          return next
        })
      }).catch(() => {
        newAdIds.forEach(id => inFlightAdIdsRef.current.delete(id))
        newLandingUrls.forEach(url => inFlightLandingUrlsRef.current.delete(url))
      })
    }
  }, [adIds, landingUrls, mode, filterKey])

  function markBookmarked(type: 'ad' | 'landing_url', key: string, bookmarkId: string, note?: string | null) {
    if (type === 'ad') setBookmarkedAdIds(prev => new Set([...prev, key]))
    else setBookmarkedLandingUrls(prev => new Set([...prev, key]))
    const mapKey = type === 'ad' ? `ad:${key}` : `url:${key}`
    setBookmarkIds(prev => new Map([...prev, [mapKey, bookmarkId]]))
    setBookmarkNotes(prev => new Map([...prev, [mapKey, note ?? null]]))
  }

  function unmarkBookmarked(type: 'ad' | 'landing_url', key: string) {
    if (type === 'ad') setBookmarkedAdIds(prev => { const s = new Set(prev); s.delete(key); return s })
    else setBookmarkedLandingUrls(prev => { const s = new Set(prev); s.delete(key); return s })
    const mapKey = type === 'ad' ? `ad:${key}` : `url:${key}`
    setBookmarkIds(prev => { const m = new Map(prev); m.delete(mapKey); return m })
    setBookmarkNotes(prev => { const m = new Map(prev); m.delete(mapKey); return m })
  }

  return { bookmarkedAdIds, bookmarkedLandingUrls, bookmarkIds, bookmarkNotes, markBookmarked, unmarkBookmarked }
}
