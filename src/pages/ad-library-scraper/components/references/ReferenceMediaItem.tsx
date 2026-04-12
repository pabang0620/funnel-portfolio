import { useState } from 'react'
import { X, ExternalLink, Pencil, Play } from 'lucide-react'
import type { ReferenceItem } from '../../types/reference'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { getYouTubeThumbnail, getYouTubeId } from '../../lib/media'
import { MediaPreview } from '../ads/MediaPreview'
import { AdDetailModal } from '../ads/AdDetailModal'
import { ConfirmDialog } from '../ui/ConfirmDialog'

function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

function getVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
      const m = parsed.pathname.match(/\/(\d+)/)
      return m ? m[1] : null
    }
  } catch {}
  return null
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url)
}

function resolveMediaKind(item: ReferenceItem): 'video' | 'image' | 'link' {
  if (getYouTubeId(item.url) || getVimeoId(item.url) || isDirectVideo(item.url)) return 'video'
  if (isImageUrl(item.url)) return 'image'
  return item.url_type === 'video' ? 'video' : item.url_type === 'image' ? 'image' : 'link'
}

function LinkCard({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-4 bg-muted/30 hover:bg-muted/50 transition-colors min-h-[80px] h-full"
    >
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-xs truncate text-muted-foreground">{url}</span>
    </a>
  )
}

function VideoThumbnail({ url, onClick }: { url: string; onClick: () => void }) {
  const [thumbError, setThumbError] = useState(false)
  const ytThumb = getYouTubeThumbnail(url)
  const directVideo = isDirectVideo(url)

  return (
    <div
      onClick={onClick}
      className="relative aspect-video w-full bg-gray-900 cursor-pointer overflow-hidden"
    >
      {ytThumb && !thumbError ? (
        <img
          src={ytThumb}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          onError={() => setThumbError(true)}
        />
      ) : directVideo ? (
        <video
          src={`${url}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-900" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
        <div className="bg-white/90 rounded-full p-3 shadow-md">
          <Play className="h-6 w-6 text-gray-800 fill-gray-800" />
        </div>
      </div>
    </div>
  )
}

function ImageThumbnail({ url }: { url: string }) {
  const [imgError, setImgError] = useState(false)
  if (imgError) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
        미리보기 없음
      </div>
    )
  }
  return (
    <div className="relative aspect-video w-full bg-muted overflow-hidden">
      <img
        src={url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

function VideoPlayer({ url }: { url: string }) {
  const ytEmbed = getYouTubeEmbedUrl(url)
  if (ytEmbed) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          src={`${ytEmbed}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          title="영상"
        />
      </div>
    )
  }
  const vimeoId = getVimeoId(url)
  if (vimeoId) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          title="영상"
        />
      </div>
    )
  }
  if (isDirectVideo(url)) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        <video
          src={url}
          controls
          autoPlay
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    )
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
      재생할 수 없습니다
    </div>
  )
}

interface Props {
  item: ReferenceItem
  onDelete: (id: string) => void
  onEdit: (id: string, url: string, note: string | null) => void
}

export function ReferenceMediaItem({ item, onDelete, onEdit }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [adModalOpen, setAdModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [editUrl, setEditUrl] = useState(item.url)
  const [editNote, setEditNote] = useState(item.note ?? '')

  const kind = resolveMediaKind(item)
  const hasAdData = !!item.ad_data

  function renderMedia() {
    if (hasAdData) {
      const variant = item.ad_data!.variants[0]
      return (
        <div
          onClick={() => setAdModalOpen(true)}
          className="relative aspect-video w-full bg-gray-900 cursor-pointer overflow-hidden"
        >
          <MediaPreview
            contentUrl={variant?.content_url ?? ''}
            thumbnailUrl={variant?.thumbnail_url}
            previewOnly
          />
        </div>
      )
    }
    if (kind === 'video') {
      return <VideoThumbnail url={item.url} onClick={() => setVideoOpen(true)} />
    }
    if (kind === 'image') {
      return <ImageThumbnail url={item.url} />
    }
    return <LinkCard url={item.url} />
  }

  return (
    <div className="relative group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        {renderMedia()}
        <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1 z-10">
          {!hasAdData && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEditUrl(item.url)
                setEditNote(item.note ?? '')
                setEditOpen(true)
              }}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="편집"
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteConfirmOpen(true)
            }}
            className="flex items-center justify-center w-6 h-6 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="삭제"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
      {item.note && (
        <p className="text-xs text-muted-foreground px-3 py-2 line-clamp-2 border-t">{item.note}</p>
      )}

      {/* Ad detail modal for items linked to an ad */}
      {hasAdData && (
        <AdDetailModal
          ad={item.ad_data!}
          open={adModalOpen}
          onOpenChange={setAdModalOpen}
        />
      )}

      {/* Simple video modal for plain URL video items */}
      {!hasAdData && (
        <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
          <DialogContent className="sm:max-w-6xl w-full p-0 overflow-hidden max-h-[90vh] gap-0">
            <DialogHeader className="sr-only">
              <DialogTitle>영상</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col md:flex-row w-full min-w-0">
              {/* LEFT: Media panel (55%) */}
              <div className="md:w-[55%] md:sticky md:top-0 md:self-start">
                <div className="h-[300px] md:h-[500px] bg-black flex items-center justify-center relative">
                  <div className="relative w-full h-[300px] md:h-[500px]">
                    <VideoPlayer url={item.url} />
                  </div>
                </div>
                {/* URL bar below video */}
                <div className="flex items-start gap-2 px-4 py-2 bg-muted/30 border-t">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:underline text-xs break-all min-w-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.url}</span>
                  </a>
                </div>
              </div>

              {/* RIGHT: Details panel (45%) */}
              <div className="md:w-[45%] min-w-0 overflow-x-hidden flex flex-col gap-5 p-6 md:overflow-y-auto">
                {item.note ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">이유</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{item.note}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">이유 없음</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit dialog - only for non-ad items */}
      {!hasAdData && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>수정</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-url">URL</Label>
                <Input
                  id="edit-url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-note">이유 <span className="text-muted-foreground text-xs">(선택)</span></Label>
                <Textarea
                  id="edit-note"
                  value={editNote}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                  placeholder="이유를 입력하세요"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>취소</Button>
              <Button
                onClick={() => {
                  if (!editUrl.trim()) return
                  onEdit(item.id, editUrl.trim(), editNote.trim() || null)
                  setEditOpen(false)
                }}
              >
                저장
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="아이템을 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        destructive
        onConfirm={() => { onDelete(item.id); setDeleteConfirmOpen(false) }}
      />
    </div>
  )
}
