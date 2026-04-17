import { useMemo } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { AppSidebar, useTabNavigation } from './components/layout/AppSidebar'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import adContentsData from '@/data/ad-content-storage/ad-contents.json'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function formatKRW(value: number): string {
  return `₩${value.toLocaleString('ko-KR')}`
}

function AnalyticsPage() {
  const { currentTab, handleTabChange } = useTabNavigation()

  const contents = adContentsData as Array<{
    id: string
    name: string
    file_type: string
    created_at: string
    total_spend: number
    total_revenue: number
    total_conversions: number
    total_impressions: number
    total_clicks: number
    cpc: number
  }>

  const summaryStats = useMemo(() => {
    const totalContents = contents.length
    const totalSpend = contents.reduce((sum, c) => sum + (c.total_spend ?? 0), 0)
    const totalConversions = contents.reduce((sum, c) => sum + (c.total_conversions ?? 0), 0)
    const avgCpc = contents.length > 0
      ? Math.round(contents.reduce((sum, c) => sum + (c.cpc ?? 0), 0) / contents.length)
      : 0
    return { totalContents, totalSpend, totalConversions, avgCpc }
  }, [contents])

  const fileTypeData = useMemo(() => {
    const grouped: Record<string, number> = {}
    contents.forEach(c => {
      const type = c.file_type ?? '기타'
      grouped[type] = (grouped[type] ?? 0) + 1
    })
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [contents])

  const monthlyUploadData = useMemo(() => {
    const grouped: Record<string, number> = {}
    contents.forEach(c => {
      const month = c.created_at?.slice(0, 7) ?? '미상'
      grouped[month] = (grouped[month] ?? 0) + 1
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }))
  }, [contents])

  const top5BySpend = useMemo(() => {
    return [...contents]
      .sort((a, b) => (b.total_spend ?? 0) - (a.total_spend ?? 0))
      .slice(0, 5)
      .map(c => ({
        name: c.name.length > 20 ? c.name.slice(0, 20) + '…' : c.name,
        total_spend: c.total_spend ?? 0,
        total_conversions: c.total_conversions ?? 0,
      }))
  }, [contents])

  const top10Table = useMemo(() => {
    return [...contents]
      .sort((a, b) => (b.total_spend ?? 0) - (a.total_spend ?? 0))
      .slice(0, 10)
  }, [contents])

  const summaryCards = [
    { label: '총 콘텐츠 수', value: `${summaryStats.totalContents.toLocaleString('ko-KR')}개` },
    { label: '총 광고비', value: formatKRW(summaryStats.totalSpend) },
    { label: '총 전환수', value: `${summaryStats.totalConversions.toLocaleString('ko-KR')}건` },
    { label: '평균 CPC', value: formatKRW(summaryStats.avgCpc) },
  ]

  return (
    <AppLayout sidebar={<AppSidebar activeTab={currentTab} onTabChange={handleTabChange} />}>
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">콘텐츠 분석</h1>
          <p className="text-sm text-muted-foreground mt-0.5">광고 콘텐츠 성과 및 현황을 확인합니다.</p>
        </div>

        {/* 요약 카드 4개 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map(card => (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <p className="text-xl font-semibold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        {/* 차트 행 1: 파일 타입 + 월별 업로드 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 파일 타입별 PieChart */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-medium text-foreground mb-4">파일 타입별 콘텐츠 수</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={true}
                >
                  {fileTypeData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}개`, '콘텐츠 수']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 월별 업로드 BarChart */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-medium text-foreground mb-4">월별 업로드 수</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyUploadData} margin={{ top: 4, right: 8, left: 0, bottom: 24 }}>
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value}개`, '업로드 수']} />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 차트 행 2: 상위 5개 콘텐츠 성과 (Horizontal BarChart) */}
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-medium text-foreground mb-4">상위 5개 콘텐츠 성과 (광고비 기준)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={top5BySpend}
              layout="vertical"
              margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => `₩${(v / 10000).toFixed(0)}만`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, name) => {
                  const num = typeof value === 'number' ? value : Number(value)
                  if (name === '광고비') return [formatKRW(num), '광고비']
                  if (name === '전환수') return [`${num}건`, '전환수']
                  return [value, name]
                }}
              />
              <Legend />
              <Bar dataKey="total_spend" name="광고비" fill="#6366f1" radius={[0, 3, 3, 0]} />
              <Bar dataKey="total_conversions" name="전환수" fill="#22c55e" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 테이블: 성과 상위 10개 */}
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">전체 콘텐츠 성과 상위 10개</h2>
            <p className="text-xs text-muted-foreground mt-0.5">광고비 내림차순 정렬</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">콘텐츠명</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">파일타입</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">광고비</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">노출수</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">클릭수</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">전환수</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">CPC</th>
                </tr>
              </thead>
              <tbody>
                {top10Table.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                  >
                    <td className="px-4 py-2.5 text-foreground max-w-[200px] truncate" title={item.name}>
                      {item.name}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                        {item.file_type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                      {formatKRW(item.total_spend ?? 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                      {(item.total_impressions ?? 0).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                      {(item.total_clicks ?? 0).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-foreground tabular-nums font-medium">
                      {(item.total_conversions ?? 0).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                      {formatKRW(item.cpc ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export { AnalyticsPage }
export default AnalyticsPage
