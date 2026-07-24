import { useState, useEffect, useCallback } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { AppSidebar, useTabNavigation } from './components/layout/AppSidebar'
import { FilterSidebar } from './components/search/FilterSidebar'
import { BrowseGridView } from './components/browse/BrowseGridView'
import { BrowseTableView } from './components/browse/BrowseTableView'
import { ViewToggle } from './components/browse/ViewToggle'
import { SortFieldSelect } from './components/browse/SortFieldSelect'
import { SortOrderSelect } from './components/browse/SortOrderSelect'
import { MetricsVisibilityToggle } from './components/browse/MetricsVisibilityToggle'
import { DateRangePicker } from './components/ui/date-range-picker'
import type { DateRange } from './components/ui/date-range-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  mockGetBrowseFiles,
  mockGetProducts,
  mockGetGroups,
  mockGetAttributeLabels,
  mockGetTeams,
  mockGetDownloadUrl,
} from '@/data/ad-content-storage/mockService'
import type { BrowseFile } from './types/browse'
import type { CategoryGroupWithLabels, AttributeLabel } from './types/labels'
import type { Product } from './types/product'
import type { Team } from './types/humanResource'

const PAGE_LIMIT = 25
const STORAGE_KEY = 'browse-visible-metrics'

function SearchPage() {
  const { currentTab, handleTabChange } = useTabNavigation()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [selectedCategoryLabelIds, setSelectedCategoryLabelIds] = useState<string[]>([])
  const [selectedAttributeLabelIds, setSelectedAttributeLabelIds] = useState<string[]>([])
  const [selectedLabelingStatus, setSelectedLabelingStatus] = useState<'all' | 'labeled' | 'unlabeled'>('all')
  const [selectedSearchQuery, setSelectedSearchQuery] = useState<string>('')
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])

  const [files, setFiles] = useState<BrowseFile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [loading, setLoading] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [groups, setGroups] = useState<CategoryGroupWithLabels[]>([])
  const [attributeLabels, setAttributeLabels] = useState<AttributeLabel[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [urlCache, setUrlCache] = useState<Record<string, string>>({})
  const [initialized, setInitialized] = useState(false)

  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : ['spend', 'revenue']
  })

  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT))

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    const ac = new AbortController()
    const [productsData, groupsData, attrsData, teamsData, filesResponse] = await Promise.all([
      mockGetProducts(),
      mockGetGroups(),
      mockGetAttributeLabels(),
      mockGetTeams(),
      mockGetBrowseFiles({
        page: 1,
        limit: PAGE_LIMIT,
        sort_by: 'created_at',
        sort_order: 'desc',
      }),
    ])
    setProducts(productsData.items)
    setGroups(groupsData as CategoryGroupWithLabels[])
    setAttributeLabels(attrsData)
    setTeams(teamsData)
    setFiles(filesResponse.files)
    setTotal(filesResponse.total)
    setInitialized(true)
    setLoading(false)

    filesResponse.files.forEach(async (file) => {
      if (!urlCache[file.s3_key]) {
        const r = await mockGetDownloadUrl(file.id)
        setUrlCache(prev => ({ ...prev, [file.s3_key]: r.download_url }))
      }
    })
    return () => ac.abort()
  }, [])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const fetchFiles = useCallback(async () => {
    if (!initialized) return
    setLoading(true)
    const response = await mockGetBrowseFiles({
      product_ids: selectedProductIds.length > 0 ? selectedProductIds : undefined,
      category_label_ids: selectedCategoryLabelIds.length > 0 ? selectedCategoryLabelIds : undefined,
      attribute_label_ids: selectedAttributeLabelIds.length > 0 ? selectedAttributeLabelIds : undefined,
      team_ids: selectedTeamIds.length > 0 ? selectedTeamIds : undefined,
      is_labeled: selectedLabelingStatus === 'all' ? undefined : selectedLabelingStatus === 'labeled',
      search: selectedSearchQuery || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      start_date: dateRange?.from?.toISOString().split('T')[0],
      end_date: dateRange?.to?.toISOString().split('T')[0],
      page,
      limit: PAGE_LIMIT,
    })
    setFiles(response.files)
    setTotal(response.total)
    setLoading(false)

    response.files.forEach(async (file) => {
      if (!urlCache[file.s3_key]) {
        const r = await mockGetDownloadUrl(file.id)
        setUrlCache(prev => ({ ...prev, [file.s3_key]: r.download_url }))
      }
    })
  }, [initialized, selectedProductIds, selectedCategoryLabelIds, selectedAttributeLabelIds, selectedTeamIds, selectedLabelingStatus, selectedSearchQuery, sortBy, sortOrder, dateRange, page])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleApplyFilters = (filters: {
    productIds: string[]
    categoryLabelIds: string[]
    attributeLabelIds: string[]
    labelingStatus: 'all' | 'labeled' | 'unlabeled'
    searchQuery: string
    teamIds: string[]
  }) => {
    setSelectedProductIds(filters.productIds)
    setSelectedCategoryLabelIds(filters.categoryLabelIds)
    setSelectedAttributeLabelIds(filters.attributeLabelIds)
    setSelectedLabelingStatus(filters.labelingStatus)
    setSelectedSearchQuery(filters.searchQuery)
    setSelectedTeamIds(filters.teamIds)
    setPage(1)
    setPageInput('1')
  }

  const handleMetricsChange = (metrics: string[]) => {
    setVisibleMetrics(metrics)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
  }

  const handleSelect = (id: string, index: number, shiftKey: boolean) => {
    if (shiftKey && selectedIds.length > 0) {
      const lastIdx = files.findIndex(f => f.id === selectedIds[selectedIds.length - 1])
      if (lastIdx !== -1) {
        const [start, end] = [Math.min(lastIdx, index), Math.max(lastIdx, index)]
        const rangeIds = files.slice(start, end + 1).map(f => f.id)
        setSelectedIds(prev => Array.from(new Set([...prev, ...rangeIds])))
        return
      }
    }
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (files.every(f => selectedIds.includes(f.id))) {
      setSelectedIds([])
    } else {
      setSelectedIds(files.map(f => f.id))
    }
  }

  const getFileUrl = useCallback((s3Key: string) => {
    return urlCache[s3Key] ?? `https://picsum.photos/seed/${s3Key.replace(/[^a-z0-9]/gi, '')}/400/400`
  }, [urlCache])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    setPageInput(String(newPage))
  }

  return (
    <AppLayout sidebar={<AppSidebar activeTab={currentTab} onTabChange={handleTabChange} />}>
      <div className="flex h-full overflow-hidden">
        {/* Filter sidebar */}
        <div className="w-64 shrink-0 border-r overflow-y-auto">
          <FilterSidebar
            groups={groups}
            attributeLabels={attributeLabels}
            products={products}
            teams={teams}
            appliedProductIds={selectedProductIds}
            appliedCategoryLabelIds={selectedCategoryLabelIds}
            appliedAttributeLabelIds={selectedAttributeLabelIds}
            appliedLabelingStatus={selectedLabelingStatus}
            appliedSearchQuery={selectedSearchQuery}
            appliedTeamIds={selectedTeamIds}
            onApplyFilters={handleApplyFilters}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b bg-background px-4 py-3 flex items-center gap-3 flex-wrap shrink-0">
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <SortFieldSelect value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }} />
              <SortOrderSelect value={sortOrder} onValueChange={(v) => { setSortOrder(v); setPage(1) }} />
              <MetricsVisibilityToggle visibleMetrics={visibleMetrics} onChange={handleMetricsChange} />
            </div>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          {/* Selection info + count */}
          <div className="border-b bg-muted/30 px-4 py-2 flex items-center justify-between text-sm shrink-0">
            <span className="text-muted-foreground">
              총 <strong className="text-foreground">{total}</strong>개
              {selectedIds.length > 0 && (
                <span className="ml-2 text-primary">{selectedIds.length}개 선택됨</span>
              )}
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                선택 해제
              </button>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">로딩 중...</span>
                </div>
              </div>
            ) : files.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">No files</p>
                  <p className="text-sm mt-1">필터 조건을 변경해보세요</p>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <BrowseGridView
                files={files}
                getFileUrl={getFileUrl}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                products={products}
                visibleMetrics={visibleMetrics}
              />
            ) : (
              <BrowseTableView
                files={files}
                getFileUrl={getFileUrl}
                selectedIds={selectedIds}
                onSelect={handleSelect}
                onSelectAll={handleSelectAll}
                products={products}
                visibleMetrics={visibleMetrics}
              />
            )}
          </div>

          {/* Pagination */}
          <div className="border-t bg-background px-4 py-3 flex items-center justify-between shrink-0">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="number"
                value={pageInput}
                onChange={e => setPageInput(e.target.value)}
                onBlur={() => {
                  const n = parseInt(pageInput, 10)
                  if (!isNaN(n)) handlePageChange(n)
                  else setPageInput(String(page))
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const n = parseInt(pageInput, 10)
                    if (!isNaN(n)) handlePageChange(n)
                  }
                }}
                className="w-12 text-center border border-border rounded px-1 py-0.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                min={1}
                max={totalPages}
              />
              <span>/ {totalPages}</span>
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export { SearchPage }
export default SearchPage
