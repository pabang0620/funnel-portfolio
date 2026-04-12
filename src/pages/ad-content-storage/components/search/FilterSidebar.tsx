import { useState, useEffect, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { CategoryGroupWithLabels, AttributeLabel } from '../../types/labels'
import type { Product } from '../../types/product'
import type { Team } from '../../types/humanResource'

interface FilterSidebarProps {
  groups: CategoryGroupWithLabels[]
  attributeLabels: AttributeLabel[]
  products: Product[]
  teams: Team[]
  appliedProductIds: string[]
  appliedCategoryLabelIds: string[]
  appliedAttributeLabelIds: string[]
  appliedLabelingStatus: 'all' | 'labeled' | 'unlabeled'
  appliedSearchQuery: string
  appliedTeamIds: string[]
  onApplyFilters: (filters: {
    productIds: string[]
    categoryLabelIds: string[]
    attributeLabelIds: string[]
    labelingStatus: 'all' | 'labeled' | 'unlabeled'
    searchQuery: string
    teamIds: string[]
  }) => void
}

function FilterSection({
  title,
  count,
  open,
  onToggle,
  children,
}: {
  value?: string
  title: string
  count?: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              {count}
            </span>
          )}
        </span>
        <span className="text-muted-foreground text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-2 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

export function FilterSidebar({
  groups,
  attributeLabels,
  products,
  teams,
  appliedProductIds,
  appliedCategoryLabelIds,
  appliedAttributeLabelIds,
  appliedLabelingStatus,
  appliedSearchQuery,
  appliedTeamIds,
  onApplyFilters,
}: FilterSidebarProps) {
  const [stagedProductIds, setStagedProductIds] = useState<string[]>(appliedProductIds)
  const [stagedCategoryLabelIds, setStagedCategoryLabelIds] = useState<string[]>(appliedCategoryLabelIds)
  const [stagedAttributeLabelIds, setStagedAttributeLabelIds] = useState<string[]>(appliedAttributeLabelIds)
  const [stagedLabelingStatus, setStagedLabelingStatus] = useState<'all' | 'labeled' | 'unlabeled'>(appliedLabelingStatus)
  const [stagedSearchQuery, setStagedSearchQuery] = useState<string>(appliedSearchQuery)
  const [stagedTeamIds, setStagedTeamIds] = useState<string[]>(appliedTeamIds)
  const [stagedCompanies, setStagedCompanies] = useState<string[]>([])

  const [productSearch, setProductSearch] = useState('')
  const [categorySearches, setCategorySearches] = useState<Record<string, string>>({})
  const [attributeSearch, setAttributeSearch] = useState('')

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    product: false,
    ...Object.fromEntries(groups.map(g => [g.id, false])),
    team: false,
    attributes: false,
  })

  // Sync staged state with applied props
  useEffect(() => {
    setStagedProductIds(appliedProductIds)
    setStagedCategoryLabelIds(appliedCategoryLabelIds)
    setStagedAttributeLabelIds(appliedAttributeLabelIds)
    setStagedLabelingStatus(appliedLabelingStatus)
    setStagedSearchQuery(appliedSearchQuery)
    setStagedTeamIds(appliedTeamIds)
  }, [appliedProductIds, appliedCategoryLabelIds, appliedAttributeLabelIds, appliedLabelingStatus, appliedSearchQuery, appliedTeamIds])

  // Extract unique companies from products
  const companies = useMemo(() => {
    const companySet = new Set<string>()
    products.forEach(p => { if (p.company_name) companySet.add(p.company_name) })
    return Array.from(companySet).sort()
  }, [products])

  // Filter products by selected companies
  const filteredProducts = useMemo(() => {
    if (stagedCompanies.length === 0) return products
    return products.filter(p => p.company_name && stagedCompanies.includes(p.company_name))
  }, [products, stagedCompanies])

  const searchedProducts = useMemo(() => {
    return filteredProducts.filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    )
  }, [filteredProducts, productSearch])

  const totalStagedFilters =
    stagedCompanies.length +
    stagedProductIds.length +
    stagedCategoryLabelIds.length +
    stagedAttributeLabelIds.length +
    stagedTeamIds.length +
    (stagedLabelingStatus !== 'all' ? 1 : 0)

  const hasFilters = totalStagedFilters > 0

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCompanyToggle = (company: string) => {
    setStagedCompanies(prev => {
      const next = prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]
      if (prev.includes(company)) {
        const companyProductIds = products.filter(p => p.company_name === company).map(p => p.id)
        setStagedProductIds(pp => pp.filter(id => !companyProductIds.includes(id)))
      }
      return next
    })
  }

  const handleProductToggle = (productId: string) => {
    setStagedProductIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
  }

  const handleCategoryLabelToggle = (labelId: string) => {
    setStagedCategoryLabelIds(prev => prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId])
  }

  const handleAttributeLabelToggle = (labelId: string) => {
    setStagedAttributeLabelIds(prev => prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId])
  }

  const handleTeamToggle = (teamId: string) => {
    setStagedTeamIds(prev => prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId])
  }

  const handleClearAll = () => {
    setStagedCompanies([])
    setStagedProductIds([])
    setStagedCategoryLabelIds([])
    setStagedAttributeLabelIds([])
    setStagedLabelingStatus('all')
    setStagedSearchQuery('')
    setStagedTeamIds([])
  }

  const handleApply = () => {
    const effectiveProductIds = stagedCompanies.length > 0 && stagedProductIds.length === 0
      ? filteredProducts.map(p => p.id)
      : stagedProductIds
    onApplyFilters({
      productIds: effectiveProductIds,
      categoryLabelIds: stagedCategoryLabelIds,
      attributeLabelIds: stagedAttributeLabelIds,
      labelingStatus: stagedLabelingStatus,
      searchQuery: stagedSearchQuery,
      teamIds: stagedTeamIds,
    })
  }

  const allCategoryLabels = useMemo(() => groups.flatMap(g => g.labels), [groups])
  const stagedProducts = filteredProducts.filter(p => stagedProductIds.includes(p.id))

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Filters</h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="파일명 검색..."
              value={stagedSearchQuery}
              onChange={(e) => setStagedSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApply() }}
              className="w-full h-9 pl-9 pr-3 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Labeling Status */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">라벨링 상태</p>
            <div className="space-y-1.5">
              {(['all', 'labeled', 'unlabeled'] as const).map(status => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="labelingStatus"
                    value={status}
                    checked={stagedLabelingStatus === status}
                    onChange={() => setStagedLabelingStatus(status)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">
                    {status === 'all' ? '전체' : status === 'labeled' ? '라벨링 완료' : '라벨링 대기'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Accordion Sections */}
        <div>
          {/* Company Section */}
          <FilterSection value="company" title="회사" count={stagedCompanies.length} open={openSections.company} onToggle={() => toggleSection('company')}>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {companies.map(company => (
                <label key={company} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stagedCompanies.includes(company)}
                    onChange={() => handleCompanyToggle(company)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground truncate">{company}</span>
                </label>
              ))}
              {companies.length === 0 && <p className="text-sm text-muted-foreground">항목 없음</p>}
            </div>
          </FilterSection>

          {/* Product Section */}
          <FilterSection value="product" title="제품" count={stagedProductIds.length} open={openSections.product} onToggle={() => toggleSection('product')}>
            <div className="mb-2">
              <input
                type="text"
                placeholder="검색..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full h-8 px-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {searchedProducts.map(product => (
                <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stagedProductIds.includes(product.id)}
                    onChange={() => handleProductToggle(product.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground truncate">{product.name}</span>
                </label>
              ))}
              {searchedProducts.length === 0 && <p className="text-sm text-muted-foreground">검색 결과 없음</p>}
            </div>
          </FilterSection>

          {/* Dynamic Category Groups */}
          {groups.map(group => {
            const selectedCount = stagedCategoryLabelIds.filter(id => group.labels.some(l => l.id === id)).length
            const searchKey = `category-${group.id}`
            const searchQuery = categorySearches[searchKey] || ''
            const filteredLabels = group.labels.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
            return (
              <FilterSection key={group.id} value={group.id} title={group.name} count={selectedCount} open={!!openSections[group.id]} onToggle={() => toggleSection(group.id)}>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="검색..."
                    value={searchQuery}
                    onChange={(e) => setCategorySearches({ ...categorySearches, [searchKey]: e.target.value })}
                    className="w-full h-8 px-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {filteredLabels.map(label => (
                    <label key={label.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stagedCategoryLabelIds.includes(label.id)}
                        onChange={() => handleCategoryLabelToggle(label.id)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm text-foreground truncate">{label.name}</span>
                    </label>
                  ))}
                  {filteredLabels.length === 0 && <p className="text-sm text-muted-foreground">검색 결과 없음</p>}
                </div>
              </FilterSection>
            )
          })}

          {/* Team Section */}
          <FilterSection value="team" title="팀" count={stagedTeamIds.length} open={!!openSections.team} onToggle={() => toggleSection('team')}>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {teams.map(team => (
                <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stagedTeamIds.includes(team.id)}
                    onChange={() => handleTeamToggle(team.id)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground truncate">{team.name}</span>
                </label>
              ))}
              {teams.length === 0 && <p className="text-sm text-muted-foreground">항목 없음</p>}
            </div>
          </FilterSection>

          {/* Attribute Labels */}
          <FilterSection value="attributes" title="속성 라벨" count={stagedAttributeLabelIds.length} open={!!openSections.attributes} onToggle={() => toggleSection('attributes')}>
            <div className="mb-2">
              <input
                type="text"
                placeholder="검색..."
                value={attributeSearch}
                onChange={(e) => setAttributeSearch(e.target.value)}
                className="w-full h-8 px-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {attributeLabels
                .filter(l => l.name.toLowerCase().includes(attributeSearch.toLowerCase()))
                .map(label => (
                  <label key={label.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stagedAttributeLabelIds.includes(label.id)}
                      onChange={() => handleAttributeLabelToggle(label.id)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground truncate">{label.name}</span>
                  </label>
                ))}
              {attributeLabels.filter(l => l.name.toLowerCase().includes(attributeSearch.toLowerCase())).length === 0 && (
                <p className="text-sm text-muted-foreground">검색 결과 없음</p>
              )}
            </div>
          </FilterSection>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-3 bg-background shrink-0">
        <div className="flex gap-2">
          <button
            onClick={handleClearAll}
            disabled={!hasFilters}
            className={cn(
              'flex-1 h-9 text-sm border border-input rounded-md transition-colors',
              hasFilters ? 'hover:bg-muted text-foreground bg-background' : 'opacity-40 cursor-not-allowed bg-background text-muted-foreground'
            )}
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-9 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            적용 {totalStagedFilters > 0 && `(${totalStagedFilters})`}
          </button>
        </div>

        {/* Applied Filters Badges */}
        {hasFilters && (
          <div className="flex flex-wrap gap-1">
            {stagedCompanies.map(company => (
              <span key={`badge-company-${company}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {company}
                <button className="hover:opacity-70" onClick={() => handleCompanyToggle(company)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {stagedProducts.map(product => (
              <span key={`badge-product-${product.id}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                {product.name}
                <button className="hover:opacity-70" onClick={() => handleProductToggle(product.id)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {stagedCategoryLabelIds.map(id => {
              const label = allCategoryLabels.find(l => l.id === id)
              if (!label) return null
              return (
                <span key={`badge-cat-${id}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-border text-xs text-foreground">
                  {label.name}
                  <button className="hover:opacity-70" onClick={() => handleCategoryLabelToggle(id)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
            {stagedAttributeLabelIds.map(id => {
              const label = attributeLabels.find(l => l.id === id)
              if (!label) return null
              return (
                <span key={`badge-attr-${id}`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                  {label.name}
                  <button className="hover:opacity-70" onClick={() => handleAttributeLabelToggle(id)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
            {stagedLabelingStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                {stagedLabelingStatus === 'labeled' ? '라벨링 완료' : '라벨링 대기'}
                <button className="hover:opacity-70" onClick={() => setStagedLabelingStatus('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
