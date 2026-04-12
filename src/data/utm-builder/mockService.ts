// TODO: dummy-data-integrator
import type { UTMCode, UTMListParams, UTMListResponse, UTMDecodeResult } from '@/pages/utm-builder/types/utm_codes'
import type { Product } from '@/pages/utm-builder/types/products'
import type { Media } from '@/pages/utm-builder/types/media'
import type { ContentType } from '@/pages/utm-builder/types/content_types'
import type { Placement } from '@/pages/utm-builder/types/placements'

import utmListData from './utm-list.json'
import productsData from './products.json'
import mediaChannelsData from './media-channels.json'
import contentTypesData from './content-types.json'
import placementsData from './placements.json'

// In-memory stores (CRUD works in demo session)
let utmCodes: UTMCode[] = utmListData as UTMCode[]
const products: Product[] = productsData as Product[]
const media: Media[] = mediaChannelsData as Media[]
const contentTypes: ContentType[] = contentTypesData as ContentType[]
const placements: Placement[] = placementsData as Placement[]

export const employees = [
  { id: 'emp-001', name: '김민준', initial: 'KM', department: '마케팅' },
  { id: 'emp-002', name: '이지현', initial: 'LJ', department: '마케팅' },
  { id: 'emp-003', name: '박현우', initial: 'PH', department: '기획' },
  { id: 'emp-004', name: '최성훈', initial: 'CS', department: '마케팅' },
  { id: 'emp-005', name: '유재원', initial: 'YJ', department: '제작' },
  { id: 'emp-006', name: '신예진', initial: 'SY', department: '제작' },
]

const delay = (ms = 350) => new Promise<void>(resolve => setTimeout(resolve, ms))

function genId(): string {
  return 'utm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ── Products ────────────────────────────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
  await delay()
  return [...products]
}

// ── Media ────────────────────────────────────────────────────────────────────
export async function getMedia(): Promise<Media[]> {
  await delay()
  return [...media]
}

// ── Content Types ────────────────────────────────────────────────────────────
export async function getContentTypes(): Promise<ContentType[]> {
  await delay()
  return [...contentTypes]
}

// ── Placements ───────────────────────────────────────────────────────────────
export async function getPlacements(): Promise<Placement[]> {
  await delay()
  return [...placements]
}

// ── Employees ────────────────────────────────────────────────────────────────
export async function getEmployees(): Promise<typeof employees> {
  await delay()
  return [...employees]
}

// ── Brands (derived from products) ──────────────────────────────────────────
export async function getBrands(): Promise<{ id: string; name: string }[]> {
  await delay()
  const seen = new Set<string>()
  const brands: { id: string; name: string }[] = []
  for (const p of products) {
    if (!seen.has(p.brand_id)) {
      seen.add(p.brand_id)
      brands.push({ id: p.brand_id, name: p.brand_name })
    }
  }
  return brands
}

// ── UTM Codes: list with filters ─────────────────────────────────────────────
export async function getUTMCodes(params?: UTMListParams): Promise<UTMListResponse> {
  await delay()
  let filtered = [...utmCodes]

  if (params?.utm_code) {
    const term = params.utm_code.toLowerCase()
    filtered = filtered.filter(u => u.utm_code.toLowerCase().includes(term))
  }
  if (params?.product_initials?.length) {
    filtered = filtered.filter(u => params.product_initials!.includes(u.product_initial ?? ''))
  }
  if (params?.media_initials?.length) {
    filtered = filtered.filter(u => params.media_initials!.includes(u.media_initial ?? ''))
  }
  if (params?.content_type_initials?.length) {
    filtered = filtered.filter(u => params.content_type_initials!.includes(u.content_type_initial ?? ''))
  }
  if (params?.placement_id) {
    const pl = placements.find(p => p.id === params.placement_id)
    if (pl) filtered = filtered.filter(u => u.placement_initial === pl.initial)
  }
  if (params?.planner_initials?.length) {
    filtered = filtered.filter(u => params.planner_initials!.includes(u.planner_initial ?? ''))
  }
  if (params?.marketer_initials?.length) {
    filtered = filtered.filter(u => params.marketer_initials!.includes(u.marketer_initial ?? ''))
  }
  if (params?.creator_initials?.length) {
    filtered = filtered.filter(u => params.creator_initials!.includes(u.creator_initial ?? ''))
  }
  if (params?.author_name) {
    const term = params.author_name.toLowerCase()
    filtered = filtered.filter(u => (u.author_name ?? '').toLowerCase().includes(term))
  }
  if (params?.created_at_from) {
    filtered = filtered.filter(u => u.created_at >= params.created_at_from!)
  }
  if (params?.created_at_to) {
    filtered = filtered.filter(u => u.created_at <= params.created_at_to!)
  }

  // Sort
  if (params?.sort_key && params?.sort_dir) {
    const key = params.sort_key as keyof UTMCode
    const dir = params.sort_dir === 'asc' ? 1 : -1
    filtered.sort((a, b) => {
      const av = String(a[key] ?? '')
      const bv = String(b[key] ?? '')
      return av.localeCompare(bv) * dir
    })
  } else {
    // Default: newest first
    filtered.sort((a, b) => b.created_at.localeCompare(a.created_at))
  }

  const page = params?.page ?? 1
  const limit = params?.limit ?? 50
  const total = filtered.length
  const items = filtered.slice((page - 1) * limit, page * limit)

  return { items, total }
}

// ── UTM Codes: export all matching (no pagination) ───────────────────────────
export async function exportUTMCodes(params?: Omit<UTMListParams, 'page' | 'limit' | 'sort_key' | 'sort_dir'>): Promise<UTMCode[]> {
  const result = await getUTMCodes({ ...params, limit: 9999, page: 1 })
  return result.items
}

// ── Generate UTM Code ─────────────────────────────────────────────────────────
export async function generateUTMCode(data: {
  media_id: string
  content_type_id: string
  placement_id: string
  product_id: string
  landing_number_id: string
  planner_id: string
  marketer_id: string
  creator_id: string
  sequence?: string
  simple_url?: boolean
}): Promise<UTMCode> {
  await delay(600)

  const m = media.find(x => x.id === data.media_id)
  const ct = contentTypes.find(x => x.id === data.content_type_id)
  const pl = placements.find(x => x.id === data.placement_id)
  const pr = products.find(x => x.id === data.product_id)
  const ln = pr?.landing_numbers.find(x => x.id === data.landing_number_id)
  const planner = employees.find(x => x.id === data.planner_id)
  const marketer = employees.find(x => x.id === data.marketer_id)
  const creator = employees.find(x => x.id === data.creator_id)

  if (!m || !ct || !pl || !pr || !ln) throw new Error('필수 데이터 누락')

  const baseCode = `${pr.initial}${m.initial}${ct.initial}${pl.initial}`
  const existing = utmCodes.filter(u => u.base_code === baseCode)
  const seq = data.sequence || String(existing.length + 1).padStart(3, '0')
  const utmCode = `${baseCode}${seq}`

  const adUrl = `${pr.base_url ?? 'https://example.com'}?utm_source=${m.name}&utm_medium=cpc&utm_campaign=${utmCode}`

  const newUtm: UTMCode = {
    id: genId(),
    base_code: baseCode,
    sequence: seq,
    utm_code: utmCode,
    ad_url: adUrl,
    media_name: m.name,
    media_display: m.display_name,
    content_type_name: ct.name,
    content_type_display: ct.display_name,
    placement_name: pl.name,
    placement_display: pl.display_name,
    product_name: pr.name,
    product_id: pr.id,
    brand_name: pr.brand_name,
    landing_display: ln.description ? `${ln.number} (${ln.description})` : ln.number,
    media_initial: m.initial,
    content_type_initial: ct.initial,
    placement_initial: pl.initial,
    product_initial: pr.initial,
    planner_initial: planner?.initial ?? null,
    marketer_initial: marketer?.initial ?? null,
    creator_initial: creator?.initial ?? null,
    planner_name: planner?.name ?? null,
    marketer_name: marketer?.name ?? null,
    creator_name: creator?.name ?? null,
    author_name: planner?.name ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  utmCodes = [newUtm, ...utmCodes]
  return newUtm
}

// ── Suggest Sequence ───────────────────────────────────────────────────────────
export async function suggestSequence(data: {
  media_id: string
  landing_number_id: string
  content_type_id: string
  placement_id: string
  product_id: string
  planner_id: string
  marketer_id: string
  creator_id: string
}): Promise<{
  base_code: string
  suggested_sequence: string
  existing_sequences: string[]
  existing_ad_urls: Record<string, string>
  next_available: string
}> {
  await delay(300)

  const m = media.find(x => x.id === data.media_id)
  const ct = contentTypes.find(x => x.id === data.content_type_id)
  const pl = placements.find(x => x.id === data.placement_id)
  const pr = products.find(x => x.id === data.product_id)

  if (!m || !ct || !pl || !pr) throw new Error('필수 데이터 누락')

  const baseCode = `${pr.initial}${m.initial}${ct.initial}${pl.initial}`
  const existing = utmCodes.filter(u => u.base_code === baseCode)
  const existingSeqs = existing.map(u => u.sequence ?? '001')
  const existingUrls: Record<string, string> = {}
  existing.forEach(u => {
    if (u.sequence) existingUrls[u.sequence] = u.ad_url ?? ''
  })

  const nextNum = existing.length + 1
  const suggested = String(nextNum).padStart(3, '0')

  return {
    base_code: baseCode,
    suggested_sequence: suggested,
    existing_sequences: existingSeqs,
    existing_ad_urls: existingUrls,
    next_available: suggested,
  }
}

// ── Suggest Sequence by Base Code ─────────────────────────────────────────────
export async function suggestSequenceByBase(baseCode: string): Promise<{
  suggested_sequence: string
  existing_sequences: string[]
}> {
  await delay(200)
  const existing = utmCodes.filter(u => u.base_code === baseCode)
  const existingSeqs = existing.map(u => u.sequence ?? '001')
  const nextNum = existing.length + 1
  const suggested = String(nextNum).padStart(3, '0')
  return { suggested_sequence: suggested, existing_sequences: existingSeqs }
}

// ── Decode UTM Codes ───────────────────────────────────────────────────────────
export async function decodeUTMCodes(codes: string[]): Promise<UTMDecodeResult[]> {
  await delay(400)
  return codes.map(code => {
    const found = utmCodes.find(u => u.utm_code === code)
    if (found) {
      const pr = products.find(p => p.id === found.product_id)
      const ln = pr?.landing_numbers.find(l => found.landing_display?.startsWith(l.number))
      return {
        input_code: code,
        utm_code: found.utm_code,
        base_code: found.base_code,
        sequence: found.sequence ?? '001',
        status: 'registered' as const,
        media_name: found.media_name ?? undefined,
        media_display: found.media_display ?? undefined,
        product_name: found.product_name ?? undefined,
        product_id: found.product_id ?? undefined,
        brand_name: found.brand_name ?? undefined,
        brand_url: pr?.base_url ?? undefined,
        planner_name: found.planner_name ?? undefined,
        marketer_name: found.marketer_name ?? undefined,
        creator_name: found.creator_name ?? undefined,
        ad_url: found.ad_url ?? undefined,
        landing_number: ln?.number ?? null,
        product_landing_number_id: ln?.id ?? undefined,
        landing_name: found.landing_display ?? undefined,
      }
    }
    return {
      input_code: code,
      utm_code: code,
      base_code: code.slice(0, -3),
      sequence: code.slice(-3),
      status: 'not_found' as const,
    }
  })
}

// ── Delete UTM Code ────────────────────────────────────────────────────────────
export async function deleteUTMCode(id: string): Promise<void> {
  await delay(300)
  utmCodes = utmCodes.filter(u => u.id !== id)
}

// ── Update UTM Code ────────────────────────────────────────────────────────────
export async function updateUTMCode(id: string, data: Partial<UTMCode>): Promise<UTMCode> {
  await delay(300)
  const idx = utmCodes.findIndex(u => u.id === id)
  if (idx === -1) throw new Error('UTM 코드를 찾을 수 없습니다')
  utmCodes[idx] = { ...utmCodes[idx], ...data, updated_at: new Date().toISOString() }
  return utmCodes[idx]
}

// ── Suggest Fields ────────────────────────────────────────────────────────────
export async function suggestFields(data: { marketer_id: string; product_id: string }): Promise<{
  media_id: string | null
  content_type_id: string | null
  placement_id: string | null
  planner_id: string | null
  creator_id: string | null
  landing_number_id: string | null
  simple_url: boolean
} | null> {
  await delay(200)
  // Find most recent UTM with matching marketer and product
  const marketer = employees.find(e => e.id === data.marketer_id)
  const product = products.find(p => p.id === data.product_id)
  if (!marketer || !product) return null

  const matching = utmCodes.find(u =>
    u.marketer_initial === marketer.initial && u.product_id === data.product_id
  )
  if (!matching) return null

  const m = media.find(x => x.initial === matching.media_initial)
  const ct = contentTypes.find(x => x.initial === matching.content_type_initial)
  const pl = placements.find(x => x.initial === matching.placement_initial)
  const planner = employees.find(e => e.initial === matching.planner_initial)
  const creator = employees.find(e => e.initial === matching.creator_initial)
  const ln = product.landing_numbers[0]

  return {
    media_id: m?.id ?? null,
    content_type_id: ct?.id ?? null,
    placement_id: pl?.id ?? null,
    planner_id: planner?.id ?? null,
    creator_id: creator?.id ?? null,
    landing_number_id: ln?.id ?? null,
    simple_url: false,
  }
}

// ── Bulk Create UTM Codes ─────────────────────────────────────────────────────
export async function bulkCreateUTMCodes(items: Array<{
  media_id: string
  content_type_id: string
  placement_id: string
  product_id: string
  landing_number_id: string
  planner_id: string
  marketer_id: string
  creator_id: string
  sequence: string
}>): Promise<{
  success_count: number
  fail_count: number
  results: Array<{ input_index: number; utm_code: string | null; success: boolean; error: string | null }>
}> {
  await delay(800)
  const results = await Promise.all(items.map(async (item, idx) => {
    try {
      const utm = await generateUTMCode(item)
      return { input_index: idx, utm_code: utm.utm_code, success: true, error: null }
    } catch (e) {
      return { input_index: idx, utm_code: null, success: false, error: String(e) }
    }
  }))
  return {
    success_count: results.filter(r => r.success).length,
    fail_count: results.filter(r => !r.success).length,
    results,
  }
}
