import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Search, Folder as FolderIcon, File as FileIcon } from 'lucide-react'
import { Skeleton } from './components/ui/skeleton'
import AppLayout from './components/layout/AppLayout'
import { mockSearch } from '../../data/portfolio-drive/mockService'
import { formatFileSize, formatDate } from './lib/utils'
import type { FileItem, Folder } from './types'

interface SearchResults {
  files: FileItem[]
  folders: Folder[]
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') ?? ''
  const [results, setResults] = useState<SearchResults>({ files: [], folders: [] })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!q.trim()) {
      setResults({ files: [], folders: [] })
      return
    }
    setIsLoading(true)
    try {
      const data = mockSearch.search(q)
      setResults(data)
    } catch {
      toast.error('검색에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [q])

  function handleFolderClick(_folder: Folder) {
    navigate('/portfolio-drive')
  }

  const totalCount = results.files.length + results.folders.length

  return (
    <AppLayout
      selectedFolderId={null}
      onFolderSelect={() => {}}
      onSidebarRefresh={() => {}}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0">
          <Search className="w-5 h-5 text-muted-foreground" />
          <h1 className="font-semibold text-foreground">검색 결과</h1>
          {q && <span className="text-sm text-muted-foreground">"{q}"</span>}
          {!isLoading && q && (
            <span className="text-sm text-muted-foreground">({totalCount}개 결과)</span>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!q && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Search className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">검색어를 입력하세요.</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          )}

          {!isLoading && q && totalCount === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Search className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">검색 결과가 없습니다.</p>
            </div>
          )}

          {!isLoading && results.folders.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">폴더</h2>
              <div className="border rounded-md overflow-hidden">
                {results.folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <FolderIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{folder.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {folder.created_at ? formatDate(folder.created_at) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isLoading && results.files.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">파일</h2>
              <div className="border rounded-md overflow-hidden">
                {results.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent cursor-pointer transition-colors"
                  >
                    <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.file_name}</p>
                      {file.event_name && (
                        <p className="text-xs text-muted-foreground">{file.event_name}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground text-right hidden sm:block">
                      <p>{formatFileSize(file.size)}</p>
                      <p>{formatDate(file.upload_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
