import adContentsRaw from './ad-contents.json'
import attributesRaw from './attributes.json'
import adCodesRaw from './ad-codes.json'
import aiAnalysesRaw from './ai-analyses.json'
import type { BrowseFile, BrowseFilter, PaginatedBrowseResponse } from '@/pages/ad-content-storage/types/browse'
import type { AttributeLabel } from '@/pages/ad-content-storage/types/labels'
import type { Product } from '@/pages/ad-content-storage/types/product'
import type { Team } from '@/pages/ad-content-storage/types/humanResource'

// Cast raw JSON to typed arrays
const adContents = adContentsRaw as unknown as BrowseFile[]
const attributeLabels = attributesRaw as AttributeLabel[]

// ─── Static mock data ────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: '1',
  email: 'admin@funnelmance.co.kr',
  name: '관리자',
  role: 'admin',
  team: '운영팀',
  isAdmin: true,
  isApproved: true,
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: '퓨어 진정크림',
    images: ['https://picsum.photos/seed/prod001/200/200'],
    thumbnail_image: 'https://picsum.photos/seed/prod001/200/200',
    description: '민감한 피부를 위한 진정 크림',
    company_name: '퓨어스킨',
    price: 38000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'prod-002',
    name: '두피케어 탈모샴푸',
    images: ['https://picsum.photos/seed/prod002/200/200'],
    thumbnail_image: 'https://picsum.photos/seed/prod002/200/200',
    description: '두피를 강화하는 탈모 전문 샴푸',
    company_name: '헤어닥터',
    price: 25000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'prod-003',
    name: '비타민C 고함량 영양제',
    images: ['https://picsum.photos/seed/prod003/200/200'],
    thumbnail_image: 'https://picsum.photos/seed/prod003/200/200',
    description: '1000mg 고함량 비타민C',
    company_name: '뉴트리헬스',
    price: 18000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'prod-004',
    name: '슬림다운 다이어트쉐이크',
    images: ['https://picsum.photos/seed/prod004/200/200'],
    thumbnail_image: 'https://picsum.photos/seed/prod004/200/200',
    description: '과학적으로 설계된 다이어트 식사 대용 쉐이크',
    company_name: '슬림팩토리',
    price: 52000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'prod-005',
    name: '프리미엄 프로바이오틱스',
    images: ['https://picsum.photos/seed/prod005/200/200'],
    thumbnail_image: 'https://picsum.photos/seed/prod005/200/200',
    description: '200억 CFU 프리미엄 유산균',
    company_name: '뉴트리헬스',
    price: 42000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'prod-006',
    name: '프로 크레아틴 모노하이드레이트',
    images: ['https://picsum.photos/seed/prod006/200/200'],
    thumbnail_image: 'https://picsum.photos/seed/prod006/200/200',
    description: '순도 99.9% 크레아틴',
    company_name: '마슬랩',
    price: 35000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'prod-007',
    name: '눈밑지방재배치 시술',
    images: ['https://picsum.photos/seed/prod007/200/200'],
    thumbnail_image: 'https://picsum.photos/seed/prod007/200/200',
    description: '눈밑 지방을 재배치하는 안티에이징 시술',
    company_name: '리뉴클리닉',
    price: 850000,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
]

export const MOCK_TEAMS: Team[] = [
  { id: 'team-001', name: '콘텐츠팀' },
  { id: 'team-002', name: '마케팅팀' },
  { id: 'team-003', name: '운영팀' },
  { id: 'team-004', name: '디자인팀' },
]

export const MOCK_CATEGORY_GROUPS = [
  {
    id: 'cg-001',
    name: '미디어 유형',
    priority: 1,
    user_id: 'user-001',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    labels: [
      { id: 'cl-001', name: '영상', group_id: 'cg-001', group_name: '미디어 유형', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 'cl-002', name: '이미지', group_id: 'cg-001', group_name: '미디어 유형', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 'cl-003', name: '텍스트', group_id: 'cg-001', group_name: '미디어 유형', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
    ],
  },
  {
    id: 'cg-002',
    name: '제품 카테고리',
    priority: 2,
    user_id: 'user-001',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    labels: [
      { id: 'cl-010', name: '스킨케어', group_id: 'cg-002', group_name: '제품 카테고리', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 'cl-011', name: '헤어케어', group_id: 'cg-002', group_name: '제품 카테고리', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 'cl-012', name: '건강기능식품', group_id: 'cg-002', group_name: '제품 카테고리', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 'cl-013', name: '다이어트', group_id: 'cg-002', group_name: '제품 카테고리', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 'cl-014', name: '스포츠영양', group_id: 'cg-002', group_name: '제품 카테고리', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
      { id: 'cl-015', name: '성형/시술', group_id: 'cg-002', group_name: '제품 카테고리', is_active: true, user_id: 'user-001', created_at: '2023-01-01T00:00:00Z', updated_at: '2023-01-01T00:00:00Z' },
    ],
  },
]

export const MOCK_AD_CODES = adCodesRaw

// ─── API mock functions ───────────────────────────────────────────────────────

function applyFilters(files: BrowseFile[], filter: BrowseFilter): BrowseFile[] {
  let result = [...files]

  if (filter.search) {
    const q = filter.search.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.memo?.toLowerCase().includes(q) ||
      f.ad_codes?.some(c => c.toLowerCase().includes(q))
    )
  }

  if (filter.product_ids && filter.product_ids.length > 0) {
    result = result.filter(f => f.product_id && filter.product_ids!.includes(f.product_id))
  }

  if (filter.category_label_ids && filter.category_label_ids.length > 0) {
    result = result.filter(f =>
      f.category_labels?.some(cl => filter.category_label_ids!.includes(cl.id))
    )
  }

  if (filter.attribute_label_ids && filter.attribute_label_ids.length > 0) {
    result = result.filter(f =>
      f.attribute_labels?.some(al => filter.attribute_label_ids!.includes(al.id))
    )
  }

  if (filter.is_labeled !== undefined) {
    result = result.filter(f => {
      const hasLabels = (f.category_labels?.length ?? 0) > 0 || (f.attribute_labels?.length ?? 0) > 0
      return filter.is_labeled ? hasLabels : !hasLabels
    })
  }

  if (filter.start_date) {
    const start = new Date(filter.start_date)
    result = result.filter(f => new Date(f.created_at) >= start)
  }

  if (filter.end_date) {
    const end = new Date(filter.end_date + 'T23:59:59Z')
    result = result.filter(f => new Date(f.created_at) <= end)
  }

  // Sort
  const sortField = filter.sort_by ?? 'created_at'
  const sortDir = filter.sort_order === 'asc' ? 1 : -1
  result.sort((a, b) => {
    let valA: number | string = 0
    let valB: number | string = 0
    switch (sortField) {
      case 'created_at':
        valA = new Date(a.created_at).getTime()
        valB = new Date(b.created_at).getTime()
        break
      case 'name':
        valA = a.name.toLowerCase()
        valB = b.name.toLowerCase()
        break
      case 'ad_code':
        valA = (a.ad_codes?.[0] ?? '').toLowerCase()
        valB = (b.ad_codes?.[0] ?? '').toLowerCase()
        break
      case 'spend':
        valA = a.total_spend ?? 0
        valB = b.total_spend ?? 0
        break
      case 'revenue':
        valA = a.total_revenue ?? 0
        valB = b.total_revenue ?? 0
        break
      case 'conversions':
        valA = a.total_conversions ?? 0
        valB = b.total_conversions ?? 0
        break
      case 'impressions':
        valA = a.total_impressions ?? 0
        valB = b.total_impressions ?? 0
        break
      case 'clicks':
        valA = a.total_clicks ?? 0
        valB = b.total_clicks ?? 0
        break
      case 'cpc':
        valA = a.cpc ?? 0
        valB = b.cpc ?? 0
        break
      default:
        return 0
    }
    if (valA < valB) return -sortDir
    if (valA > valB) return sortDir
    return 0
  })

  return result
}

export async function mockGetBrowseFiles(filter: BrowseFilter): Promise<PaginatedBrowseResponse> {
  await delay(300)
  const filtered = applyFilters(adContents, filter)
  const total = filtered.length
  const start = (filter.page - 1) * filter.limit
  const files = filtered.slice(start, start + filter.limit)
  return {
    files,
    total,
    page: filter.page,
    limit: filter.limit,
    has_next: start + filter.limit < total,
  }
}

export async function mockGetProducts() {
  await delay(200)
  return { items: MOCK_PRODUCTS, total: MOCK_PRODUCTS.length }
}

export async function mockGetGroups() {
  await delay(150)
  return MOCK_CATEGORY_GROUPS
}

export async function mockGetAttributeLabels(): Promise<AttributeLabel[]> {
  await delay(150)
  return attributeLabels
}

export async function mockGetTeams() {
  await delay(100)
  return MOCK_TEAMS
}

export async function mockGetDownloadUrl(fileId: string): Promise<{ download_url: string }> {
  await delay(100)
  const file = adContents.find(f => f.id === fileId)
  const url = (file as any)?.thumbnail_url ?? `https://picsum.photos/seed/${fileId}/400/400`
  return { download_url: url }
}

export async function mockGetFiles(path?: string) {
  await delay(200)
  let files = adContents as any[]
  if (path && path !== '/') {
    files = files.filter(f => f.path.startsWith(path))
  }
  return files
}

export async function mockUploadFile(file: File, path?: string): Promise<{ id: string; name: string }> {
  await delay(800)
  const blobUrl = URL.createObjectURL(file)
  const mockId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  console.info(`[Mock Upload] ${file.name} → ${blobUrl} (path: ${path ?? '/'})`)
  return { id: mockId, name: file.name }
}

export async function mockGetAiAnalysis(fileId: string) {
  await delay(1200)
  const analyses = aiAnalysesRaw
  const found = analyses.find((a: any) => a.file_id === fileId)
  if (found) return found
  // Rotate through analyses for other files
  const idx = parseInt(fileId.replace(/\D/g, '').slice(-2) || '0', 10) % analyses.length
  return { ...analyses[idx], file_id: fileId }
}

export async function mockGetAdCodes(): Promise<string[]> {
  await delay(100)
  return adCodesRaw.map(ac => ac.ad_code)
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}
