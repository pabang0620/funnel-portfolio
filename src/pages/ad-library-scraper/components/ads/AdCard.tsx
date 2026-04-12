import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { CheckCircle2 } from 'lucide-react'
import { MediaPreview } from './MediaPreview'
import { BookmarkButton } from '../bookmarks/BookmarkButton'
import type { Ad } from '../../types/ad'

interface AdCardProps {
  ad: Ad
  onClick?: () => void
  isBookmarked?: boolean
  onBookmarkClick?: () => void
  bookmarkNote?: string | null
}

export function AdCard({ ad, onClick, isBookmarked, onBookmarkClick, bookmarkNote }: AdCardProps) {
  const firstVariant = ad.variants[0]
  const hasLandingUrl = ad.variants.some(
    (v) => v.landing_page_url && v.landing_page_url.startsWith('http')
  )

  return (
    <Card
      className={`overflow-hidden${onClick ? ' cursor-pointer' : ''}`}
      onClick={() => onClick?.()}
    >
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {firstVariant && (
          <MediaPreview
            contentUrl={firstVariant.content_url}
            thumbnailUrl={firstVariant.thumbnail_url}
            previewOnly
          />
        )}
        {onBookmarkClick && (
          <div
            className="absolute top-2 right-2 z-10"
            onClick={(e) => { e.stopPropagation(); onBookmarkClick() }}
          >
            <BookmarkButton
              isBookmarked={!!isBookmarked}
              onClick={onBookmarkClick}
              className="bg-background/80 hover:bg-background shadow-sm"
            />
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="font-medium text-sm truncate">{ad.advertiser_name || '광고주 미상'}</p>
            {hasLandingUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>랜딩 URL 있음</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {ad.variants.length > 1 && (
            <Badge variant="secondary" className="text-xs">
              {ad.variants.length} 대안
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          게시일: {ad.last_shown_date ?? '-'}
        </p>
        {bookmarkNote && (
          <p className="text-xs text-muted-foreground line-clamp-1">{bookmarkNote}</p>
        )}
      </CardContent>
    </Card>
  )
}
