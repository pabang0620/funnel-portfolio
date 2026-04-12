interface CompanyBadgeProps {
  company: string
}

export function CompanyBadge({ company }: CompanyBadgeProps) {
  const lower = company.toLowerCase()

  let label: string
  let className: string

  if (lower === 'funnels') {
    label = 'F'
    className = 'bg-blue-100 text-blue-700'
  } else if (lower === 'funnelmance') {
    label = 'FM'
    className = 'bg-blue-700 text-blue-100'
  } else {
    label = company.slice(0, 2).toUpperCase()
    className = 'bg-muted text-muted-foreground'
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
