import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { AppSidebar, useTabNavigation } from './components/layout/AppSidebar'
import { UploadDropzone } from './components/upload/UploadDropzone'
import {
  mockGetFiles,
  mockGetDownloadUrl,
  MOCK_PRODUCTS,
} from '@/data/ad-content-storage/mockService'
import type { BrowseFile } from './types/browse'
import { ChevronRight, Folder, FileText, FileArchive, Image, Video, Search, X } from 'lucide-react'
import { cn } from './lib/utils'

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv']

function getFileIcon(fileType: string, name: string) {
  const lower = (fileType + ' ' + name).toLowerCase()
  if (lower.includes('image') || imageExtensions.some(e => lower.endsWith(e))) return Image
  if (lower.includes('video') || videoExtensions.some(e => lower.endsWith(e))) return Video
  if (lower.includes('zip')) return FileArchive
  return FileText
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function UploadPage() {
  const { currentTab, handleTabChange } = useTabNavigation()
  const [files, setFiles] = useState<BrowseFile[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPath, setCurrentPath] = useState<string>('/')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [urlCache, setUrlCache] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')

  const loadFiles = useCallback(async () => {
    setLoading(true)
    const allFiles = await mockGetFiles()
    setFiles(allFiles as BrowseFile[])
    setLoading(false)

    const visible = allFiles as BrowseFile[]
    visible.slice(0, 20).forEach(async (file) => {
      if (!urlCache[file.s3_key]) {
        const r = await mockGetDownloadUrl(file.id)
        setUrlCache(prev => ({ ...prev, [file.s3_key]: r.download_url }))
      }
    })
  }, [])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const filteredFiles = files.filter(f => {
    const inPath = currentPath === '/'
      ? true
      : f.path === currentPath || f.path.startsWith(currentPath + '/')
    const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
    return inPath && matchesSearch
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name)
      case 'size': return (b.size ?? 0) - (a.size ?? 0)
      case 'date':
      default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const handleUploadComplete = async (uploaded: Array<{ id: string; name: string }>) => {
    setUploadSuccess(`${uploaded.length}개 파일이 업로드되었습니다.`)
    setTimeout(() => setUploadSuccess(null), 4000)
    await loadFiles()
  }

  const handleSelect = (id: string, index: number, shiftKey: boolean) => {
    if (shiftKey && selectedIds.length > 0) {
      const lastIdx = filteredFiles.findIndex(f => f.id === selectedIds[selectedIds.length - 1])
      if (lastIdx !== -1) {
        const [start, end] = [Math.min(lastIdx, index), Math.max(lastIdx, index)]
        const rangeIds = filteredFiles.slice(start, end + 1).map(f => f.id)
        setSelectedIds(prev => Array.from(new Set([...prev, ...rangeIds])))
        return
      }
    }
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const breadcrumbs = currentPath === '/'
    ? [{ label: '전체', path: '/' }]
    : [
        { label: '전체', path: '/' },
        ...currentPath.split('/').filter(Boolean).map((part, i, arr) => ({
          label: part,
          path: '/' + arr.slice(0, i + 1).join('/'),
        })),
      ]

  return (
    <AppLayout sidebar={<AppSidebar activeTab={currentTab} onTabChange={handleTabChange} />}>
      <div className="flex h-full overflow-hidden">
        {/* Left panel: Folder tree */}
        <div className="w-52 shrink-0 border-r bg-background overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">폴더</h3>
            <button
              onClick={() => setCurrentPath('/')}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors',
                currentPath === '/' ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground hover:bg-muted/50'
              )}
            >
              <Folder className="w-4 h-4 shrink-0" />
              전체
            </button>
            {Array.from(new Set(files.map(f => f.path).filter(p => p && p !== '/'))).sort().map(p => {
              const label = p.split('/').filter(Boolean).join(' / ')
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPath(p)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors mt-0.5 pl-4',
                    currentPath === p ? 'bg-accent text-accent-foreground font-medium' : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <Folder className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Upload zone */}
          <div className="border-b bg-background p-4">
            <UploadDropzone
              currentPath={currentPath}
              onUploadComplete={handleUploadComplete}
            />
            {uploadSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 flex items-center justify-between">
                {uploadSuccess}
                <button onClick={() => setUploadSuccess(null)} className="text-green-500 hover:text-green-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* File toolbar */}
          <div className="border-b bg-background px-4 py-2.5 flex items-center gap-3">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-1 min-w-0">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.path} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  <button
                    onClick={() => setCurrentPath(crumb.path)}
                    className={cn(
                      'hover:text-foreground transition-colors truncate',
                      i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'hover:underline'
                    )}
                  >
                    {crumb.label}
                  </button>
                </span>
              ))}
            </nav>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="파일 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 text-sm border border-border rounded-md w-44 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'date' | 'size')}
              className="h-8 text-sm border border-border rounded-md px-2 bg-background text-foreground"
            >
              <option value="date">날짜순</option>
              <option value="name">이름순</option>
              <option value="size">크기순</option>
            </select>

            {/* View toggle */}
            <div className="flex border border-border rounded overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 text-sm', viewMode === 'list' ? 'bg-muted text-foreground' : 'hover:bg-muted/50 text-muted-foreground')}
                title="목록"
              >
                ≡
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 text-sm', viewMode === 'grid' ? 'bg-muted text-foreground' : 'hover:bg-muted/50 text-muted-foreground')}
                title="그리드"
              >
                ⊞
              </button>
            </div>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <FileArchive className="w-12 h-12 mb-3" />
                <p className="text-sm">파일이 없습니다</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
                {filteredFiles.map((file, index) => {
                  const Icon = getFileIcon(file.file_type, file.name)
                  const url = urlCache[file.s3_key]
                  const isImg = file.file_type.startsWith('image/') || imageExtensions.some(e => file.name.toLowerCase().endsWith(e))
                  const isSelected = selectedIds.includes(file.id)

                  return (
                    <div
                      key={file.id}
                      onClick={(e) => handleSelect(file.id, index, e.shiftKey)}
                      className={cn(
                        'border border-border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md bg-card',
                        isSelected && 'border-primary ring-2 ring-primary/20'
                      )}
                    >
                      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                        {isImg && url ? (
                          <img src={url} alt={file.name} className="w-full h-full object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement
                              if (t.onerror) { t.onerror = null; t.src = `https://picsum.photos/seed/${file.id}/200/200` }
                            }} />
                        ) : (
                          <Icon className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium truncate text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="w-8 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={filteredFiles.length > 0 && filteredFiles.every(f => selectedIds.includes(f.id))}
                        onChange={() => {
                          if (filteredFiles.every(f => selectedIds.includes(f.id))) {
                            setSelectedIds([])
                          } else {
                            setSelectedIds(filteredFiles.map(f => f.id))
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="w-10 px-2 py-2" />
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">파일명</th>
                    <th className="w-24 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">크기</th>
                    <th className="w-32 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">생성일</th>
                    <th className="w-48 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">라벨</th>
                    <th className="w-32 px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">광고코드</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFiles.map((file, index) => {
                    const Icon = getFileIcon(file.file_type, file.name)
                    const url = urlCache[file.s3_key]
                    const isImg = file.file_type.startsWith('image/') || imageExtensions.some(e => file.name.toLowerCase().endsWith(e))
                    const isSelected = selectedIds.includes(file.id)
                    const productName = MOCK_PRODUCTS.find(p => p.id === file.product_id)?.name

                    return (
                      <tr
                        key={file.id}
                        onClick={(e) => handleSelect(file.id, index, e.shiftKey)}
                        className={cn(
                          'hover:bg-muted/50 cursor-pointer',
                          isSelected && 'bg-primary/5'
                        )}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(file.id, index, false)}
                            onClick={e => e.stopPropagation()}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="w-8 h-8 rounded overflow-hidden bg-muted flex items-center justify-center">
                            {isImg && url ? (
                              <img src={url} alt={file.name} className="w-full h-full object-cover"
                                onError={(e) => {
                                  const t = e.target as HTMLImageElement
                                  if (t.onerror) { t.onerror = null; t.src = `https://picsum.photos/seed/${file.id}/60/60` }
                                }} />
                            ) : (
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium truncate text-foreground max-w-xs" title={file.name}>{file.name}</p>
                          {file.memo && <p className="text-xs text-muted-foreground truncate">{file.memo}</p>}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatFileSize(file.size)}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(file.created_at)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {productName && (
                              <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">{productName}</span>
                            )}
                            {file.category_labels?.slice(0, 1).map(l => (
                              <span key={l.id} className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700">{l.name}</span>
                            ))}
                            {file.attribute_labels?.slice(0, 1).map(l => (
                              <span key={l.id} className="rounded-full bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">{l.name}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-[8rem]">
                          {file.ad_codes?.join(', ') || '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export { UploadPage }
export default UploadPage
