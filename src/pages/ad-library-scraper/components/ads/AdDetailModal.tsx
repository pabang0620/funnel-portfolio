import { useEffect, useState, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Badge } from '../ui/badge'
import { MediaPreview } from './MediaPreview'
import { CopyButton } from '../CopyButton'
import { isSafeUrl } from '../../lib/utils'
import type { Ad } from '../../types/ad'

interface AdDetailModalProps {
  ad: Ad | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdDetailModal({ ad, open, onOpenChange }: AdDetailModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!ad) return
    setSelectedIndex(0)
    emblaApi?.scrollTo(0, true)
  }, [ad?.id, emblaApi])

  if (!ad) return null

  const variants = ad.variants
  const hasMultiple = variants.length > 1
  const currentVariant = variants[selectedIndex] ?? variants[0]
  const landingUrl = currentVariant?.landing_page_url && isSafeUrl(currentVariant.landing_page_url)
    ? currentVariant.landing_page_url
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle className="text-base leading-tight">
              {ad.advertiser_name || '광고주 미상'}
            </DialogTitle>
            <Badge variant="secondary" className="text-xs shrink-0">
              {ad.source === 'meta' ? 'Meta' : 'Google'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            게시일: {ad.last_shown_date ?? '-'}
          </p>
        </DialogHeader>

        <div className="relative h-[360px] bg-black">
          {hasMultiple ? (
            <>
              <div ref={emblaRef} className="overflow-hidden h-full">
                <div className="flex h-full">
                  {variants.map((variant, i) => (
                    <div key={i} className="flex-none w-full min-w-0 h-full">
                      <div className="relative w-full h-full">
                        <MediaPreview
                          contentUrl={variant.content_url}
                          thumbnailUrl={variant.thumbnail_url}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 text-white transition-colors"
                aria-label="이전"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-1.5 text-white transition-colors"
                aria-label="다음"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {variants.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === selectedIndex
                        ? 'w-4 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`슬라이드 ${i + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            variants[0] && (
              <div className="relative w-full h-full">
                <MediaPreview
                  contentUrl={variants[0].content_url}
                  thumbnailUrl={variants[0].thumbnail_url}
                />
              </div>
            )
          )}
        </div>

        <div className="px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">랜딩 페이지</p>
          {landingUrl ? (
            <div className="flex items-start gap-2">
              <a
                href={landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-600 hover:underline text-sm break-all min-w-0"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span>{landingUrl}</span>
              </a>
              <CopyButton url={landingUrl} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">랜딩 페이지 없음</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
