import dbListData from './db-list.json'
import mainReportData from './main-report.json'
import createCodeOptions from './create-code-options.json'
import createdCodesData from './created-codes.json'
import tmStatusData from './tm-status.json'

// ──────────────────────────────────────────────
// DB List (고객 DB 리스트) — mock API wrappers
// These mirror the real API endpoints used by the source CustomerDbPage
// ──────────────────────────────────────────────

// In-memory mutable customer list so updates/deletes persist within a session
interface CustomerEntry {
  id: number
  name: string
  phone: string
  date: string
  hospital_name: string
  advertising_company: string
  ad_title: string
  event_name: string
  ip: string
  customer_option: string
  dividend_status: string
  data_status: number
  isDuplicatePhone: boolean
  isDuplicateIP: boolean
  advertising_company_id: number
}

// Derive customer list from existing db-list.json
const COMPANIES = ['네이버', '카카오', '인스타그램', '유튜브', '페이스북'] as const
const COMPANY_IDS: Record<string, number> = {
  '네이버': 1,
  '카카오': 2,
  '인스타그램': 3,
  '유튜브': 4,
  '페이스북': 5,
}
const HOSPITALS = [
  { id: 1, name: '강남 스마일 치과' },
  { id: 2, name: '홍대 미소 피부과' },
  { id: 3, name: '분당 연세 안과' },
  { id: 4, name: '신촌 바른 정형외과' },
]
const ADVERTISING_COMPANIES = COMPANIES.map((name, idx) => ({ id: idx + 1, name }))

// Build a richer in-memory customer store
let _customers: CustomerEntry[] = (dbListData as DbEntry[]).map((d, idx) => ({
  id: d.id,
  name: d.name,
  phone: d.phone,
  date: d.date,
  hospital_name: d.hospital_name,
  advertising_company: d.advertising_company_name,
  ad_title: d.ad_title,
  event_name: d.event_name,
  ip: `192.168.${Math.floor(idx / 10) + 1}.${(idx % 10) + 1}`,
  customer_option: d.event_name,
  dividend_status: idx % 3 === 0 ? 'Y' : 'N',
  data_status: 1,
  isDuplicatePhone: false,
  isDuplicateIP: false,
  advertising_company_id: COMPANY_IDS[d.advertising_company_name] ?? 1,
}))

// Add some trash entries (data_status 0, 3)
_customers = [
  ..._customers,
  {
    id: 101,
    name: '테스트삭제',
    phone: '010-0000-9999',
    date: '2026-04-01T10:00:00',
    hospital_name: '강남 스마일 치과',
    advertising_company: '네이버',
    ad_title: '[삭제]테스트광고',
    event_name: '삭제이벤트',
    ip: '10.0.0.1',
    customer_option: '',
    dividend_status: 'N',
    data_status: 3, // 허수 휴지통
    isDuplicatePhone: false,
    isDuplicateIP: false,
    advertising_company_id: 1,
  },
]

export interface SearchCustomersParams {
  data_status?: number
  page?: number
  limit?: number
  advertising_company_ids?: string | number
  newCompany?: string | number
  startDate?: string
  endDate?: string
  url_code_setting_id?: string | number
  hospital_name?: string
  selected_hospital_id?: string | number
  [key: string]: unknown
}

export function searchCustomers(params: SearchCustomersParams = {}) {
  const {
    data_status = 1,
    page = 1,
    limit = 10,
    advertising_company_ids,
    newCompany,
    startDate,
    endDate,
    hospital_name,
    selected_hospital_id,
  } = params

  let data = _customers.filter(c => c.data_status === data_status)

  // Filter by company
  const companyFilter = newCompany
    ? [Number(newCompany)]
    : advertising_company_ids
    ? String(advertising_company_ids).split(',').map(Number).filter(Boolean)
    : []

  if (companyFilter.length > 0) {
    data = data.filter(c => companyFilter.includes(c.advertising_company_id))
  }

  // Filter by hospital
  if (selected_hospital_id && selected_hospital_id !== 'all') {
    const hid = Number(selected_hospital_id)
    const hospital = HOSPITALS.find(h => h.id === hid)
    if (hospital) {
      data = data.filter(c => c.hospital_name === hospital.name)
    }
  } else if (hospital_name) {
    data = data.filter(c => c.hospital_name.includes(hospital_name))
  }

  // Filter by date
  if (startDate) {
    const start = startDate.slice(0, 10)
    data = data.filter(c => c.date >= start)
  }
  if (endDate) {
    const end = endDate.slice(0, 10)
    data = data.filter(c => c.date.slice(0, 10) <= end)
  }

  const totalCount = data.length
  const start = (page - 1) * limit
  const customers = data.slice(start, start + limit)

  // countsByCompany
  const countsByCompany = ADVERTISING_COMPANIES.map(company => ({
    advertising_company_id: company.id,
    count: data.filter(c => c.advertising_company_id === company.id).length,
  }))

  // recentSettings from createdCodesData
  const recentSettings = (_createdCodes as CreatedCode[]).slice(0, 5).map(c => ({
    id: c.id,
    ad_title: c.ad_title,
    count: c.db_count,
  }))

  return {
    success: true,
    data: {
      customers,
      total: { totalCount, countsByCompany },
      recentSettings,
    },
  }
}

export function getCustomerMetrics() {
  return {
    success: true,
    data: {
      conversionRates: [],
      isPeriodBelowThreshold: false,
    },
  }
}

export function updateCustomer(id: number, data: Partial<CustomerEntry>) {
  const idx = _customers.findIndex(c => c.id === id)
  if (idx !== -1) {
    _customers[idx] = { ..._customers[idx], ...data }
    return { success: true, data: _customers[idx] }
  }
  return { success: false, msg: '고객을 찾을 수 없습니다.' }
}

export function deleteCustomer(ids: number[]) {
  _customers = _customers.filter(c => !ids.includes(c.id))
  return { success: true }
}

export function updateCustomerStatus(ids: number[], data_status: number) {
  ids.forEach(id => {
    const idx = _customers.findIndex(c => c.id === id)
    if (idx !== -1) {
      _customers[idx] = { ..._customers[idx], data_status }
    }
  })
  return { success: true, msg: '처리가 완료되었습니다.' }
}

export function getHospitalsForFilter() {
  return {
    success: true,
    data: { items: HOSPITALS },
  }
}

export function getAdvertisingCompaniesForFilter() {
  return {
    success: true,
    data: { items: ADVERTISING_COMPANIES },
  }
}

export function getDuplicateData(field: 'ip' | 'phone', value: string) {
  const matches = _customers.filter(c => {
    if (field === 'ip') return c.ip === value
    return c.phone.split('T')[0] === value
  })
  return { success: true, data: matches }
}

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface DbEntry {
  id: number
  customer_id: number
  name: string
  phone: string
  date: string
  hospital_name: string
  advertising_company_name: string
  ad_title: string
  call_history: string
  visit_status: string
  follow_up_time: string | null
  reservation_date: string | null
  user_id: number
  user_name: string
  status: number
  url_code: string
  event_name: string
}

export interface CreatedCode {
  id: number
  ad_title: string
  ad_number: string
  hospital_name_id: number
  hospital_name: string
  event_name_id: number[]
  event_name: string
  advertising_company_id: number
  advertising_company_name: string
  url_code: string
  region: number
  content_type: number
  marketer: number
  creator: number
  domain: number
  landing_url: string
  source_link: string
  notes: string
  created_at: string
  click_count: number
  db_count: number
}

export interface TmEntry {
  customer_id: number
  name: string
  phone: string
  hospital_name: string
  date: string
  call_history: string
  visit_status: string
  follow_up_time: string | null
  reservation_date: string | null
  user_id: number
  advertising_company_name: string
  call_memo_updated_at: string | null
  isNewStatus: boolean
}

// ──────────────────────────────────────────────
// In-memory store for created codes (supports add)
// ──────────────────────────────────────────────

let _createdCodes: CreatedCode[] = [...createdCodesData as CreatedCode[]]

// ──────────────────────────────────────────────
// DB List Service
// ──────────────────────────────────────────────

export interface DbListFilters {
  hospitalName?: string
  advertisingCompany?: string
  callHistory?: string
  searchKeyword?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export function getDbList(filters: DbListFilters = {}) {
  const {
    hospitalName,
    advertisingCompany,
    callHistory,
    searchKeyword,
    startDate,
    endDate,
    page = 1,
    pageSize = 10,
  } = filters

  let data = [...dbListData] as DbEntry[]

  if (hospitalName) {
    data = data.filter(d => d.hospital_name.includes(hospitalName))
  }
  if (advertisingCompany) {
    data = data.filter(d => d.advertising_company_name === advertisingCompany)
  }
  if (callHistory) {
    data = data.filter(d => d.call_history === callHistory)
  }
  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase()
    data = data.filter(
      d =>
        d.name.toLowerCase().includes(kw) ||
        d.phone.includes(kw) ||
        d.ad_title.toLowerCase().includes(kw)
    )
  }
  if (startDate) {
    data = data.filter(d => d.date >= startDate)
  }
  if (endDate) {
    data = data.filter(d => d.date <= endDate + 'T23:59:59')
  }

  const total = data.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const items = data.slice(start, start + pageSize)

  // Stats
  const all = dbListData as DbEntry[]
  const statCounts = {
    total: all.length,
    reservation: all.filter(d => ['예약', '재예약'].includes(d.call_history)).length,
    absence: all.filter(d => ['부재', '장기부재'].includes(d.call_history)).length,
    cancel: all.filter(d => d.call_history === '취소요청').length,
  }

  return { items, total, totalPages, statCounts }
}

export function getDbStats() {
  const data = dbListData as DbEntry[]
  const hospitalMap: Record<string, number> = {}
  const mediaMap: Record<string, number> = {}

  data.forEach(d => {
    hospitalMap[d.hospital_name] = (hospitalMap[d.hospital_name] || 0) + 1
    mediaMap[d.advertising_company_name] = (mediaMap[d.advertising_company_name] || 0) + 1
  })

  return {
    total: data.length,
    byHospital: Object.entries(hospitalMap).map(([name, count]) => ({ name, count })),
    byMedia: Object.entries(mediaMap).map(([name, count]) => ({ name, count })),
    recentSettings: _createdCodes.slice(0, 5).map(c => ({
      id: c.id,
      ad_title: c.ad_title,
      count: c.db_count,
    })),
  }
}

// ──────────────────────────────────────────────
// Main Report Service
// ──────────────────────────────────────────────

export function getAdvertisingCompanies() {
  return mainReportData.advertisingCompanies
}

export function getHospitals() {
  return mainReportData.hospitals
}

export function getMainReportData(_params?: {
  hospital_name_id?: number | string
  startDate?: string
  endDate?: string
  main_media?: string
  sub_media?: string
}) {
  return mainReportData.reportData
}

export function searchMainReport(_params?: {
  hospital_name_id?: number | string
  startDate?: string
  endDate?: string
  date_field?: number
  main_media?: string
  sub_media?: string
  cohort?: number | null
}) {
  // Demo: always return the same reportData regardless of params
  return mainReportData.reportData
}

export function getAllHospitalsData(_params?: {
  date_field?: number
  startDate?: string
  endDate?: string
}) {
  return mainReportData.allHospitalsData
}

export function getCohortList(_hospitalId?: number | string) {
  const data = mainReportData as unknown as Record<string, unknown>
  return (data.cohortList as Array<{ cohort: number; start_date: string; end_date: string }>) || []
}

export function getHospitalInfo(_hospitalId?: number | string) {
  const data = mainReportData as unknown as Record<string, unknown>
  return (data.hospitalInfo as { cohort: number; main_media: number[]; sub_media: number[] }) || { cohort: null, main_media: [], sub_media: [] }
}

export function updateHospitalInfo(_hospitalId: number | string, _data: unknown) {
  // Demo: no-op, returns success
  return true
}

// ──────────────────────────────────────────────
// Create Code Service
// ──────────────────────────────────────────────

export function getCreateCodeOptions() {
  return {
    hospitals: createCodeOptions.hospitals,
    events: createCodeOptions.events,
    advertisingCompanies: createCodeOptions.advertisingCompanies,
    regions: createCodeOptions.regions,
    contentTypes: createCodeOptions.contentTypes,
    domains: createCodeOptions.domains,
    usersWithInitial: createCodeOptions.usersWithInitial,
  }
}

export function getRecentCodes(limit = 5): CreatedCode[] {
  return _createdCodes.slice(0, limit)
}

export function getCreatedCodesList(filters: {
  hospitalId?: number
  mediaId?: number
  searchKeyword?: string
  page?: number
  pageSize?: number
} = {}) {
  const { hospitalId, mediaId, searchKeyword, page = 1, pageSize = 10 } = filters

  let data = [..._createdCodes]

  if (hospitalId) {
    data = data.filter(c => c.hospital_name_id === hospitalId)
  }
  if (mediaId) {
    data = data.filter(c => c.advertising_company_id === mediaId)
  }
  if (searchKeyword) {
    const kw = searchKeyword.toLowerCase()
    data = data.filter(
      c =>
        c.ad_title.toLowerCase().includes(kw) ||
        c.ad_number.toLowerCase().includes(kw) ||
        c.landing_url.toLowerCase().includes(kw)
    )
  }

  const total = data.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const items = data.slice(start, start + pageSize)

  return { items, total, totalPages }
}

export function createCode(formData: {
  ad_title: string
  ad_number: string
  hospital_name_id: string | number
  event_name_id: number[]
  advertising_company_id: string | number
  url_code: string
  region?: string | number
  content_type?: string | number
  marketer?: string | number
  creator?: string | number
  domain?: string | number
  notes?: string
  source_link?: string
}): CreatedCode {
  const hospitals = createCodeOptions.hospitals
  const events = createCodeOptions.events
  const companies = createCodeOptions.advertisingCompanies
  const domains = createCodeOptions.domains

  const hospital = hospitals.find(h => String(h.value) === String(formData.hospital_name_id))
  const company = companies.find(c => String(c.value) === String(formData.advertising_company_id))
  const domain = domains.find(d => String(d.value) === String(formData.domain))
  const eventNames = events
    .filter(e => formData.event_name_id.includes(e.value))
    .map(e => e.label)
    .join(', ')

  const domainLabel = domain?.label || ''
  const landingUrl = domainLabel
    ? `${domainLabel}/${formData.ad_number}/${formData.url_code}`
    : `${formData.ad_number}/${formData.url_code}`

  const newCode: CreatedCode = {
    id: _createdCodes.length + 1,
    ad_title: formData.ad_title,
    ad_number: formData.ad_number,
    hospital_name_id: Number(formData.hospital_name_id),
    hospital_name: hospital?.label || '',
    event_name_id: formData.event_name_id,
    event_name: eventNames,
    advertising_company_id: Number(formData.advertising_company_id),
    advertising_company_name: company?.label || '',
    url_code: formData.url_code,
    region: Number(formData.region) || 0,
    content_type: Number(formData.content_type) || 0,
    marketer: Number(formData.marketer) || 0,
    creator: Number(formData.creator) || 0,
    domain: Number(formData.domain) || 0,
    landing_url: landingUrl,
    source_link: formData.source_link || '',
    notes: formData.notes || '',
    created_at: new Date().toISOString(),
    click_count: 0,
    db_count: 0,
  }

  _createdCodes = [newCode, ..._createdCodes]
  return newCode
}

// ──────────────────────────────────────────────
// TM Status Service
// ──────────────────────────────────────────────

export interface TmListFilters {
  hospitalId?: number | string
  userId?: number | string
  startDate?: Date
  endDate?: Date
  searchField?: string
  searchKeyword?: string
  page?: number
  pageSize?: number
  sortColumn?: string | null
  sortOrder?: 'asc' | 'desc' | null
}

export function getTmHospitals() {
  return tmStatusData.hospitals
}

export function getTmUsers() {
  return [{ value: 0, label: '담당자 전체' }, ...tmStatusData.users]
}

export function getAdvertisingCompaniesTm() {
  return tmStatusData.advertisingCompanies
}

export function getTmList(filters: TmListFilters = {}) {
  const {
    hospitalId,
    userId,
    startDate,
    endDate,
    searchField,
    searchKeyword,
    page = 1,
    pageSize = 10,
    sortColumn,
    sortOrder,
  } = filters

  let data = [...tmStatusData.tmList] as TmEntry[]

  if (hospitalId && Number(hospitalId) !== 0) {
    const hospital = tmStatusData.hospitals.find(h => h.value === Number(hospitalId))
    if (hospital) {
      data = data.filter(d => d.hospital_name === hospital.label)
    }
  }

  if (userId && Number(userId) !== 0) {
    data = data.filter(d => d.user_id === Number(userId))
  }

  if (startDate) {
    const start = startDate.toISOString().slice(0, 10)
    data = data.filter(d => d.date >= start)
  }

  if (endDate) {
    const end = endDate.toISOString().slice(0, 10)
    data = data.filter(d => d.date.slice(0, 10) <= end)
  }

  if (searchField && searchKeyword) {
    const kw = searchKeyword.toLowerCase()
    switch (searchField) {
      case 'call_history':
        data = data.filter(d => d.call_history === searchKeyword)
        break
      case 'name_or_reserver':
        data = data.filter(d => d.name.toLowerCase().includes(kw))
        break
      case 'phone_or_reserver':
        data = data.filter(d => d.phone.includes(kw))
        break
      case 'visit_status':
        data = data.filter(d => d.visit_status === searchKeyword)
        break
      case 'advertising_company_name':
        data = data.filter(d => d.advertising_company_name === searchKeyword)
        break
    }
  }

  if (sortColumn && sortOrder) {
    data = [...data].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortColumn as string]
      const bVal = (b as unknown as Record<string, unknown>)[sortColumn as string]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sortOrder === 'asc' ? 1 : -1
      if (bVal == null) return sortOrder === 'asc' ? -1 : 1
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }

  const all = data
  const reservationCount = all.filter(d =>
    ['예약', '재예약'].includes(d.call_history) &&
    !['노쇼', '재통화요청', '개인일정취소', '상담종료'].includes(d.visit_status)
  ).length
  const absenceCount = all.filter(d => ['부재', '장기부재'].includes(d.call_history)).length
  const cancellationsCount = all.filter(d =>
    d.call_history === '취소요청' || ['개인일정취소', '상담종료'].includes(d.visit_status)
  ).length
  const todayEmptyMemosCount = all.filter(d => d.isNewStatus).length
  const callProgressCount = all.filter(d => d.call_memo_updated_at !== null).length

  const totalItems = all.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const start = (page - 1) * pageSize
  const items = data.slice(start, start + pageSize)

  const userMap: Record<number, string> = {}
  tmStatusData.users.forEach(u => {
    userMap[u.value] = u.label
  })

  return {
    tmWithDetails: items,
    totalItems,
    totalPages,
    reservationCount,
    absenceCount,
    cancellationsCount,
    todayEmptyMemosCount,
    callProgressCount,
    userMap,
  }
}
