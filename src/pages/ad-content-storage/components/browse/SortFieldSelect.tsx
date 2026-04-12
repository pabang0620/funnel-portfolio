import { cn } from '../../lib/utils'

interface SortFieldSelectProps {
  value: string
  onValueChange: (value: string) => void
}

const SORT_FIELDS = [
  { value: 'created_at', label: '생성일' },
  { value: 'name', label: '파일명' },
  { value: 'ad_code', label: '광고코드' },
  { value: 'spend', label: '광고비' },
  { value: 'revenue', label: '매출액' },
  { value: 'conversions', label: '전환수' },
  { value: 'impressions', label: '노출수' },
  { value: 'clicks', label: '클릭' },
  { value: 'cpc', label: 'CPC' },
]

export function SortFieldSelect({ value, onValueChange }: SortFieldSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onValueChange(e.target.value)}
      className={cn(
        'h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        'w-[130px]'
      )}
    >
      {SORT_FIELDS.map((field) => (
        <option key={field.value} value={field.value}>{field.label}</option>
      ))}
    </select>
  )
}
