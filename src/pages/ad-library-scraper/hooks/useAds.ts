import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { getAds } from '../../../data/ad-library-scraper/mockService'
import type { Ad } from '../types/ad'

interface UseAdsParams {
  keywordId?: string
  source: 'meta' | 'google'
  dateFrom: string
  dateTo: string
  page: number
  pageSize: number
  infinite?: boolean
  sortOrder?: 'default' | 'asc' | 'desc'
}

export function useAds({ keywordId, source, dateFrom, dateTo, page, pageSize, infinite = false, sortOrder = 'default' }: UseAdsParams) {
  const [ads, setAds] = useState<Ad[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    if (!infinite) {
      setAds([])
    }
    // Reset when page goes back to 1 in infinite mode
    if (infinite && page === 1) {
      setAds([])
    }
  }, [keywordId, source, dateFrom, dateTo, sortOrder, pageSize, infinite])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    if (!infinite) {
      setAds([])
    }
    getAds({
      keywordId,
      source,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      pageSize,
      sortOrder,
    })
      .then((data) => {
        if (!cancelled) {
          if (infinite) {
            setAds(prev => page === 1 ? data.ads : [...prev, ...data.ads])
          } else {
            setAds(data.ads)
          }
          setTotal(data.total)
          setHasMore(page * pageSize < data.total)
        }
      })
      .catch(() => { if (!cancelled) toast.error('광고 데이터를 불러오는데 실패했습니다') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [keywordId, source, dateFrom, dateTo, page, pageSize, infinite, sortOrder])

  return { ads, total, loading, hasMore }
}
