import { useState, useRef, useCallback, useEffect } from 'react'
import { FileArchive, FileText, Tags, HelpCircle, Pencil } from 'lucide-react'
import { cn } from '../../lib/utils'
import { isZipFile } from '../../lib/zipUtils'
import { convertHeicIfNeeded } from '../../lib/imageUtils'
import { COLUMN_LABELS, loadColumnWidths, saveColumnWidths } from '../../lib/table-columns'
import type { BrowseFile } from '../../types/browse'
import type { Product } from '../../types/product'

const STORAGE_KEY = 'browse-table-column-widths'

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif']
const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv']

function isImage(fileType: string) {
  const lower = fileType.toLowerCase()
  return lower.startsWith('image/') || imageExtensions.some(ext => lower.includes(ext))
}

function isVideo(fileType: string) {
  const lower = fileType.toLowerCase()
  return lower.startsWith('video/') || videoExtensions.some(ext => lower.includes(ext))
}

function isTxtFile(fileType: string, fileName: string) {
  return fileType === 'text/plain' || fileName.toLowerCase().endsWith('.txt')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

function formatNumber(n?: number) {
  if (n === undefined) return '-'
  return n.toLocaleString('ko-KR')
}

function formatCurrency(n?: number) {
  if (n === undefined) return '-'
  return '₩' + n.toLocaleString('ko-KR')
}

interface ResizableHeaderProps {
  columnKey: string
  children: React.ReactNode
  width: number
  onResize: (key: string, width: number) => void
  minWidth?: number
}

function ResizableHeader({ columnKey, children, width, onResize, minWidth = 40 }: ResizableHeaderProps) {
  const isResizing = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    startX.current = e.clientX
    startWidth.current = width

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const diff = e.clientX - startX.current
      const newWidth = Math.max(minWidth, startWidth.current + diff)
      onResize(columnKey, newWidth)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [columnKey, width, onResize, minWidth])

  return (
    <th style={{ width: `${width}px`, position: 'relative' }} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">
      {children}
      <div
        className="absolute right-0 top-0 h-full w-px cursor-col-resize bg-border hover:bg-border/70 transition-colors"
        onMouseDown={handleMouseDown}
      />
    </th>
  )
}

interface BrowseTableViewProps {
  files: BrowseFile[]
  getFileUrl: (s3Key: string) => string
  selectedIds: string[]
  onSelect: (id: string, index: number, shiftKey: boolean) => void
  onSelectAll: () => void
  products?: Product[]
  visibleMetrics?: string[]
  onEditAdCode?: (file: BrowseFile) => void
  onEdit?: (file: BrowseFile) => void
}

export function BrowseTableView({
  files,
  getFileUrl,
  selectedIds,
  onSelect,
  onSelectAll,
  products,
  visibleMetrics,
  onEditAdCode,
  onEdit,
}: BrowseTableViewProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () => loadColumnWidths(STORAGE_KEY)
  )
  const [convertedUrls, setConvertedUrls] = useState<Record<string, string>>({})

  const isAllSelected = files.length > 0 && files.every(f => selectedIds.includes(f.id))
  const isIndeterminate = selectedIds.length > 0 && !isAllSelected

  const allSelectedRef = useRef<HTMLInputElement>(null)
  if (allSelectedRef.current) {
    allSelectedRef.current.indeterminate = isIndeterminate
  }

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

  const handleResize = useCallback((key: string, width: number) => {
    setColumnWidths(prev => {
      const next = { ...prev, [key]: width }
      saveColumnWidths(STORAGE_KEY, next)
      return next
    })
  }, [])

  const getProductName = (productId?: string) => {
    if (!productId) return null
    return products?.find(p => p.id === productId)?.name ?? null
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-muted">
            <th className="w-10 px-3 py-2 border-b bg-muted">
              <input
                ref={allSelectedRef}
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="w-4 h-4"
              />
            </th>
            <th className="w-12 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">
              {COLUMN_LABELS.thumbnail}
            </th>
            <ResizableHeader columnKey="name" width={columnWidths.name} onResize={handleResize} minWidth={80}>
              {COLUMN_LABELS.name}
            </ResizableHeader>
            <ResizableHeader columnKey="labels" width={columnWidths.labels} onResize={handleResize} minWidth={100}>
              <div className="flex items-center gap-1">
                {COLUMN_LABELS.labels}
                <span className="cursor-help" title="파란색: 제품 / 초록색: 카테고리 / 주황색: 속성">
                  <HelpCircle className="w-3 h-3 text-muted-foreground" />
                </span>
              </div>
            </ResizableHeader>
            <ResizableHeader columnKey="adCode" width={columnWidths.adCode} onResize={handleResize} minWidth={80}>
              {COLUMN_LABELS.adCode}
            </ResizableHeader>
            {(!visibleMetrics || visibleMetrics.includes('spend')) && (
              <th className="w-24 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">광고비</th>
            )}
            {(!visibleMetrics || visibleMetrics.includes('revenue')) && (
              <th className="w-24 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">매출액</th>
            )}
            {(!visibleMetrics || visibleMetrics.includes('conversions')) && (
              <th className="w-20 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">전환수</th>
            )}
            {(!visibleMetrics || visibleMetrics.includes('impressions')) && (
              <th className="w-24 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">노출수</th>
            )}
            {(!visibleMetrics || visibleMetrics.includes('clicks')) && (
              <th className="w-20 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">클릭</th>
            )}
            {(!visibleMetrics || visibleMetrics.includes('cpc')) && (
              <th className="w-20 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">CPC</th>
            )}
            <th className="w-24 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide border-b bg-muted">{COLUMN_LABELS.created}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {files.map((file, index) => {
            const isSelected = selectedIds.includes(file.id)
            const url = convertedUrls[file.id] || getFileUrl(file.s3_key)
            const productName = getProductName(file.product_id)

            return (
              <tr
                key={file.id}
                className={cn(
                  'hover:bg-muted/50 cursor-pointer transition-colors',
                  isSelected && 'bg-primary/5'
                )}
                onClick={(e) => onSelect(file.id, index, e.shiftKey)}
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(file.id, index, false)}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                    {isZipFile(file.file_type, file.name) ? (
                      <FileArchive className="w-6 h-6 text-amber-500" />
                    ) : isTxtFile(file.file_type, file.name) ? (
                      <FileText className="w-6 h-6 text-blue-500" />
                    ) : isImage(file.file_type) ? (
                      <img
                        src={url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const t = e.target as HTMLImageElement
                          if (t.onerror) { t.onerror = null; t.src = `https://picsum.photos/seed/${file.id}/80/80` }
                        }}
                      />
                    ) : isVideo(file.file_type) ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-white ml-0.5" />
                      </div>
                    ) : (
                      <FileArchive className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </td>
                <td className="px-3 py-2" style={{ width: `${columnWidths.name}px` }}>
                  <p className="truncate font-medium text-foreground" title={file.name}>{file.name}</p>
                  {file.memo && (
                    <p className="text-xs text-muted-foreground truncate">{file.memo}</p>
                  )}
                </td>
                <td className="px-3 py-2" style={{ width: `${columnWidths.labels}px` }}>
                  <div className="flex flex-wrap gap-1 items-center">
                    {productName && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 border border-border rounded-full">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-xs">{productName}</span>
                      </div>
                    )}
                    {file.category_labels?.map(l => (
                      <div key={l.id} className="flex items-center gap-1.5 px-2 py-0.5 border border-border rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-xs">{l.name}</span>
                      </div>
                    ))}
                    {file.attribute_labels?.map(l => (
                      <div key={l.id} className="flex items-center gap-1.5 px-2 py-0.5 border border-border rounded-full">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                        <span className="text-xs">{l.name}</span>
                      </div>
                    ))}
                    <button
                      className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); onEdit?.(file) }}
                    >
                      <Tags className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2" style={{ width: `${columnWidths.adCode}px` }}>
                  <div className="flex items-center gap-1">
                    <span className="truncate text-foreground">
                      {file.ad_codes?.join(', ') || '-'}
                    </span>
                    <button
                      className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded shrink-0"
                      onClick={(e) => { e.stopPropagation(); onEditAdCode?.(file) }}
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </td>
                {(!visibleMetrics || visibleMetrics.includes('spend')) && (
                  <td className="px-3 py-2 text-sm tabular-nums text-right">{formatCurrency(file.total_spend)}</td>
                )}
                {(!visibleMetrics || visibleMetrics.includes('revenue')) && (
                  <td className="px-3 py-2 text-sm tabular-nums text-right">{formatCurrency(file.total_revenue)}</td>
                )}
                {(!visibleMetrics || visibleMetrics.includes('conversions')) && (
                  <td className="px-3 py-2 text-sm tabular-nums text-right">{formatNumber(file.total_conversions)}</td>
                )}
                {(!visibleMetrics || visibleMetrics.includes('impressions')) && (
                  <td className="px-3 py-2 text-sm tabular-nums text-right">{formatNumber(file.total_impressions)}</td>
                )}
                {(!visibleMetrics || visibleMetrics.includes('clicks')) && (
                  <td className="px-3 py-2 text-sm tabular-nums text-right">{formatNumber(file.total_clicks)}</td>
                )}
                {(!visibleMetrics || visibleMetrics.includes('cpc')) && (
                  <td className="px-3 py-2 text-sm tabular-nums text-right">{file.cpc ? `₩${Math.round(file.cpc).toLocaleString()}` : '-'}</td>
                )}
                <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(file.created_at)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
