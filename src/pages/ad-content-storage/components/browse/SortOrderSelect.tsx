import { cn } from '../../lib/utils'

interface SortOrderSelectProps {
  value: 'asc' | 'desc'
  onValueChange: (value: 'asc' | 'desc') => void
}

export function SortOrderSelect({ value, onValueChange }: SortOrderSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onValueChange(e.target.value as 'asc' | 'desc')}
      className={cn(
        'h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        'w-[130px]'
      )}
    >
      <option value="asc">오름차순</option>
      <option value="desc">내림차순</option>
    </select>
  )
}
