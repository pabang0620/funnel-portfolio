import { AdCard } from './AdCard'
import type { Ad } from '../../types/ad'

interface AdCardGridProps {
  ads: Ad[]
  onAdClick?: (ad: Ad) => void
  bookmarkedIds?: Set<string>
  bookmarkNotes?: Map<string, string | null>
  onBookmarkClick?: (ad: Ad) => void
}

export function AdCardGrid({ ads, onAdClick, bookmarkedIds, bookmarkNotes, onBookmarkClick }: AdCardGridProps) {
  if (ads.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        수집된 광고가 없습니다
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {ads.map((ad) => (
        <AdCard
          key={ad.id}
          ad={ad}
          onClick={() => onAdClick?.(ad)}
          isBookmarked={bookmarkedIds?.has(ad.id)}
          onBookmarkClick={onBookmarkClick ? () => onBookmarkClick(ad) : undefined}
          bookmarkNote={bookmarkNotes?.get(`ad:${ad.id}`) ?? null}
        />
      ))}
    </div>
  )
}
