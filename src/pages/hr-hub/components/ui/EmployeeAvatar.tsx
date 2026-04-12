const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-yellow-100 text-yellow-700',
  'bg-red-100 text-red-700',
]

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

interface EmployeeAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmployeeAvatar({ name, size = 'md' }: EmployeeAvatarProps) {
  const colorIndex = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length

  const colorClass = COLORS[colorIndex]
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`${SIZE_CLASSES[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {initial}
    </div>
  )
}
