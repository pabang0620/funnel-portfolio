import executiveData from './executive-report.json'
import marketingData from './marketing-report.json'
import kpiData from './kpi-summary.json'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface DateRange {
  startDate: string
  endDate: string
}

export interface MonthlyRecord {
  month: string
  label: string
  sales: number
  profit: number
  adCost: number
}

export interface DailyRecord {
  date: string
  media: string
  adCost: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const inRange = (date: string, start: string, end: string): boolean => {
  if (!start || !end) return true
  return date >= start && date <= end
}

// ─────────────────────────────────────────────
// Executive Report
// ─────────────────────────────────────────────

export const getExecutiveReport = (dateRange?: DateRange) => {
  const monthly: MonthlyRecord[] = executiveData.monthly as MonthlyRecord[]
  let filtered = monthly

  if (dateRange?.startDate && dateRange?.endDate) {
    filtered = monthly.filter((m) =>
      inRange(m.month + '-01', dateRange.startDate, dateRange.endDate)
    )
  }

  const labels = filtered.map((m) => m.label)
  const salesData = filtered.map((m) => m.sales)
  const profitData = filtered.map((m) => m.profit)
  const adCostData = filtered.map((m) => m.adCost)

  const totalSales = salesData.reduce((s, v) => s + v, 0)
  const totalProfit = profitData.reduce((s, v) => s + v, 0)
  const totalAdCost = adCostData.reduce((s, v) => s + v, 0)

  return {
    labels,
    salesData,
    profitData,
    adCostData,
    totalSales,
    totalProfit,
    totalAdCost,
    avgMonthlySales: salesData.length ? Math.floor(totalSales / salesData.length) : 0,
    roas: totalAdCost > 0 ? ((totalSales / totalAdCost) * 100).toFixed(1) : '0.0',
    salesGrowth: kpiData.executive.salesGrowth,
    profitGrowth: kpiData.executive.profitGrowth,
  }
}

export const getSalesTable = () => {
  return executiveData.salesTable
}

export const getMarketplaces = () => executiveData.marketplaces

export const getProducts = () => executiveData.products

// ─────────────────────────────────────────────
// Marketing Report
// ─────────────────────────────────────────────

export const getMarketingReport = (dateRange?: DateRange, channels?: string[]) => {
  let data: DailyRecord[] = marketingData.dailyData as DailyRecord[]

  if (dateRange?.startDate && dateRange?.endDate) {
    data = data.filter((d) => inRange(d.date, dateRange.startDate, dateRange.endDate))
  }

  if (channels && channels.length > 0 && !channels.includes('전체')) {
    data = data.filter((d) => channels.includes(d.media))
  }

  return data
}

export const getMediaList = () => marketingData.mediaList

// ─────────────────────────────────────────────
// KPI Summary
// ─────────────────────────────────────────────

export const getExecutiveKPIs = () => kpiData.executive

export const getMarketingKPIs = () => kpiData.marketing

export const getChannelKPIs = () => kpiData.channels

// ─────────────────────────────────────────────
// Metric Calculations (client-side)
// ─────────────────────────────────────────────

export const calculateMetrics = (records: DailyRecord[]) => {
  const adCost = records.reduce((s, d) => s + d.adCost, 0)
  const impressions = records.reduce((s, d) => s + d.impressions, 0)
  const clicks = records.reduce((s, d) => s + d.clicks, 0)
  const conversions = records.reduce((s, d) => s + d.conversions, 0)
  const revenue = records.reduce((s, d) => s + d.revenue, 0)

  return {
    adCost,
    impressions,
    clicks,
    conversions,
    revenue,
    cpc: clicks > 0 ? Math.round(adCost / clicks) : 0,
    ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
    cvr: clicks > 0 ? parseFloat(((conversions / clicks) * 100).toFixed(2)) : 0,
    roas: adCost > 0 ? parseFloat(((revenue / adCost) * 100).toFixed(1)) : 0,
    avgOrderValue: conversions > 0 ? Math.round(revenue / conversions) : 0,
  }
}

export const groupByWeek = (records: DailyRecord[]) => {
  const groups: Record<string, DailyRecord[]> = {}

  records.forEach((r) => {
    const d = new Date(r.date)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekNum = Math.ceil(day / 7)
    const key = `${month}월 ${weekNum}주`
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  })

  return Object.entries(groups).map(([week, rows]) => ({
    week,
    ...calculateMetrics(rows),
  }))
}

export const aggregateByDate = (records: DailyRecord[]) => {
  const map: Record<string, DailyRecord[]> = {}
  records.forEach((r) => {
    if (!map[r.date]) map[r.date] = []
    map[r.date].push(r)
  })

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => ({
      date,
      ...calculateMetrics(rows),
    }))
}

// ─────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────

export const formatWon = (value: number): string => {
  return `₩${value.toLocaleString('ko-KR')}`
}

export const formatWonShort = (value: number): string => {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억원`
  if (value >= 10000) return `${Math.floor(value / 10000).toLocaleString('ko-KR')}만원`
  return `${value.toLocaleString('ko-KR')}원`
}
