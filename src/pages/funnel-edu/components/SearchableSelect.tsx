import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

interface OptionObject {
  label: string
  value: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: string[] | OptionObject[]
  placeholder: string
}

function normalizeOptions(options: string[] | OptionObject[]): OptionObject[] {
  return options.map(o => typeof o === 'string' ? { label: o, value: o } : o)
}

export default function SearchableSelect({ value, onChange, options, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const normalized = normalizeOptions(options)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0)
  }, [open])

  const filtered = normalized.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
  const selectedLabel = normalized.find(o => o.value === value)?.label

  function select(val: string) {
    onChange(val)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-blue-400 bg-white hover:border-gray-300 transition-colors"
      >
        <span className={value ? 'text-gray-700' : 'text-gray-400'}>{selectedLabel || placeholder}</span>
        <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0 ml-1" />
      </button>

      {open && (
        <div className="absolute z-50 left-0 top-full mt-1 min-w-full w-max bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="px-2 py-1.5 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="검색..."
                className="w-full pl-6 pr-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto">
            <div
              onClick={() => select('')}
              className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${!value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-500'}`}
            >
              {placeholder}
            </div>
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">검색 결과 없음</div>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => select(opt.value)}
                  className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-blue-50 ${value === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
