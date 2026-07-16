import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { Input } from '../ui/input'

export default function SearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (location.pathname.endsWith('/search')) {
      const params = new URLSearchParams(location.search)
      setQuery(params.get('q') ?? '')
    }
  }, [location])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) return
    debounceRef.current = setTimeout(() => {
      navigate(`/file-hub/search?q=${encodeURIComponent(value.trim())}`)
    }, 300)
  }

  function handleClear() {
    setQuery('')
    navigate('/file-hub')
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="파일 검색..."
        className="pl-8 pr-8 h-8 text-sm"
      />
      {query && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={handleClear}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
