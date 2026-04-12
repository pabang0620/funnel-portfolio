interface MetricOption {
  id: string
  label: string
}

const AVAILABLE_METRICS: MetricOption[] = [
  { id: 'spend', label: '광고비' },
  { id: 'revenue', label: '매출액' },
  { id: 'conversions', label: '전환수' },
  { id: 'impressions', label: '노출수' },
  { id: 'clicks', label: '클릭' },
  { id: 'cpc', label: 'CPC' },
]

interface MetricsVisibilityToggleProps {
  visibleMetrics: string[]
  onChange: (metrics: string[]) => void
}

export function MetricsVisibilityToggle({
  visibleMetrics,
  onChange,
}: MetricsVisibilityToggleProps) {
  const handleToggle = (metricId: string) => {
    const newMetrics = visibleMetrics.includes(metricId)
      ? visibleMetrics.filter(id => id !== metricId)
      : [...visibleMetrics, metricId]
    onChange(newMetrics)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {AVAILABLE_METRICS.map((metric) => (
        <label key={metric.id} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={visibleMetrics.includes(metric.id)}
            onChange={() => handleToggle(metric.id)}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">{metric.label}</span>
        </label>
      ))}
    </div>
  )
}
