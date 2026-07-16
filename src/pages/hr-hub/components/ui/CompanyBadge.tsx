interface CompanyBadgeProps {
  company: string
}

export function CompanyBadge({ company }: CompanyBadgeProps) {
  const label = company.slice(0, 2).toUpperCase()
  const className = 'bg-muted text-muted-foreground'

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
