import { useState, useRef, useEffect } from 'react'
import { FileArchive, FileText, Tags, FolderOpen, Pencil } from 'lucide-react'
import { cn } from '../../lib/utils'
import { isZipFile } from '../../lib/zipUtils'
import { convertHeicIfNeeded } from '../../lib/imageUtils'
import type { BrowseFile } from '../../types/browse'
import type { Product } from '../../types/product'

interface BrowseGridViewProps {
  files: BrowseFile[]
  getFileUrl: (s3Key: string) => string
  selectedIds: string[]
  onSelect: (id: string, index: number, shiftKey: boolean) => void
  products?: Product[]
  visibleMetrics?: string[]
  onEditAdCode?: (file: BrowseFile) => void
  onEdit?: (file: BrowseFile) => void
}

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif']
const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv']

function isImage(fileType: string) {
  const lower = fileType.toLowerCase()
  return lower.startsWith('image/') || imageExtensions.includes(lower)
}

function isVideo(fileType: string) {
  const lower = fileType.toLowerCase()
  return lower.startsWith('video/') || videoExtensions.includes(lower)
}

function isTxtFile(fileType: string, fileName: string) {
  return fileType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')
}

function formatNumber(n?: number) {
  if (n === undefined) return '-'
  return n.toLocaleString('ko-KR')
}

function formatCurrency(n?: number) {
  if (n === undefined) return '-'
  return '₩' + n.toLocaleString('ko-KR')
}

export function BrowseGridView({
  files,
  getFileUrl,
  selectedIds,
  onSelect,
  products,
  visibleMetrics,
  onEditAdCode,
  onEdit,
}: BrowseGridViewProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [convertedUrls, setConvertedUrls] = useState<Record<string, string>>({})
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  useEffect(() => {
    const convertUrls = async () => {
      const urls: Record<string, string> = {}
      for (const file of files) {
        if (isImage(file.file_type)) {
          const originalUrl = getFileUrl(file.s3_key)
          if (originalUrl) {
            urls[file.id] = await convertHeicIfNeeded(originalUrl)
          }
        }
      }
      setConvertedUrls(urls)
    }
    convertUrls()
  }, [files, getFileUrl])

  const handleVideoClick = (fileId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(fileId, index, e.shiftKey)
    const clickedVideo = videoRefs.current.get(fileId)
    if (playingId === fileId) {
      if (clickedVideo) clickedVideo.pause()
      setPlayingId(null)
    } else {
      videoRefs.current.forEach((video, id) => {
        if (id !== fileId) { video.pause(); video.currentTime = 0 }
      })
      if (clickedVideo) clickedVideo.play().catch(() => {})
      setPlayingId(fileId)
    }
  }

  const getProductName = (productId?: string) => {
    if (!productId) return null
    return products?.find(p => p.id === productId)?.name ?? null
  }

  return (
    <div className="grid grid-cols-5 gap-3 p-3">
      {files.map((file, index) => {
        const isSelected = selectedIds.includes(file.id)
        const url = convertedUrls[file.id] || getFileUrl(file.s3_key)
        const productName = getProductName(file.product_id)

        return (
          <div
            key={file.id}
            className={cn(
              'relative group overflow-hidden rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer p-[0.45rem]',
              isSelected && 'border-primary/50 bg-primary/5'
            )}
            onClick={(e) => onSelect(file.id, index, e.shiftKey)}
          >
            {/* Checkbox */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(file.id, index, false)}
                onClick={e => e.stopPropagation()}
                className="w-4 h-4 rounded border-border bg-background/80"
              />
            </div>

            {/* Action buttons */}
            <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1">
              <button
                className="h-7 w-7 bg-secondary border border-border rounded flex items-center justify-center hover:bg-secondary/80 shadow-sm"
                onClick={(e) => { e.stopPropagation(); onEdit?.(file) }}
                title="라벨 편집"
              >
                <Tags className="w-4 h-4" />
              </button>
              <button
                className="h-7 w-7 bg-secondary border border-border rounded flex items-center justify-center hover:bg-secondary/80 shadow-sm"
                title="업로드 페이지에서 보기"
                onClick={(e) => e.stopPropagation()}
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Thumbnail area */}
              <div className="relative aspect-square bg-muted overflow-hidden rounded-lg">
                {isZipFile(file.file_type, file.name) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileArchive className="w-12 h-12 text-amber-500" />
                  </div>
                ) : isTxtFile(file.file_type, file.name) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-blue-500" />
                  </div>
                ) : isImage(file.file_type) ? (
                  <img
                    src={url}
                    alt={file.name}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); onSelect(file.id, index, e.shiftKey) }}
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      if (t.onerror) { t.onerror = null; t.src = `https://picsum.photos/seed/${file.id}/400/400` }
                    }}
                  />
                ) : isVideo(file.file_type) ? (
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current.set(file.id, el)
                      else videoRefs.current.delete(file.id)
                    }}
                    src={getFileUrl(file.s3_key)}
                    className="w-full h-full object-contain cursor-pointer"
                    muted
                    controls
                    onClick={(e) => handleVideoClick(file.id, index, e)}
                    onEnded={() => setPlayingId(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileArchive className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium truncate" title={file.name}>
                  {file.name}
                </p>

                {/* Labels */}
                <div className="flex flex-wrap gap-1">
                  {productName && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-px">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[10px]">{productName}</span>
                    </span>
                  )}
                  {file.category_labels?.slice(0, 2).map(label => (
                    <span key={label.id} className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-px">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="text-[10px]">{label.name}</span>
                    </span>
                  ))}
                  {file.attribute_labels?.slice(0, 2).map(label => (
                    <span key={label.id} className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-px">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                      <span className="text-[10px]">{label.name}</span>
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="space-y-1 text-xs border-t pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground shrink-0">광고코드</span>
                    <div className="flex items-center gap-1 ml-1">
                      {file.ad_codes && file.ad_codes.length > 0 && (
                        <span className="font-medium truncate max-w-[80px]" title={file.ad_codes.join('\n')}>
                          {file.ad_codes[0]}
                        </span>
                      )}
                      <button
                        className="h-5 w-5 shrink-0 flex items-center justify-center hover:bg-muted rounded"
                        onClick={(e) => { e.stopPropagation(); onEditAdCode?.(file) }}
                      >
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  {file.ad_codes && file.ad_codes.length > 0 && (
                    <>
                      {(!visibleMetrics || visibleMetrics.includes('spend')) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">광고비</span>
                          <span>{formatCurrency(file.total_spend)}</span>
                        </div>
                      )}
                      {(!visibleMetrics || visibleMetrics.includes('revenue')) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">매출액</span>
                          <span>{formatCurrency(file.total_revenue)}</span>
                        </div>
                      )}
                      {(!visibleMetrics || visibleMetrics.includes('conversions')) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">전환수</span>
                          <span>{formatNumber(file.total_conversions)}</span>
                        </div>
                      )}
                      {(!visibleMetrics || visibleMetrics.includes('impressions')) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">노출수</span>
                          <span>{formatNumber(file.total_impressions)}</span>
                        </div>
                      )}
                      {(!visibleMetrics || visibleMetrics.includes('clicks')) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">클릭</span>
                          <span>{formatNumber(file.total_clicks)}</span>
                        </div>
                      )}
                      {(!visibleMetrics || visibleMetrics.includes('cpc')) && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CPC</span>
                          <span>{file.cpc ? `₩${Math.round(file.cpc).toLocaleString()}` : '-'}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
