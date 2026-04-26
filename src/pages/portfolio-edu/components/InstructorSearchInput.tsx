import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { mockService } from '@/data/portfolio-edu/mockService'

export interface Instructor {
  id: string
  name: string
  div: string
  team: string
  part: string
}

interface Props {
  value: Instructor[]
  onChange: (instructors: Instructor[]) => void
}

export default function InstructorSearchInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pool, setPool] = useState<Instructor[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const admins = mockService.getAdminsAsInstructors()
    setPool(admins)
  }, [])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filtered = pool.filter(p =>
    !value.find(v => v.id === p.id) &&
    (p.name.includes(query) || p.team.includes(query) || p.part.includes(query))
  )

  function select(instructor: Instructor) {
    onChange([...value, instructor])
    setQuery('')
    setHighlightedIndex(0)
    inputRef.current?.focus()
  }

  function remove(id: string) {
    onChange(value.filter(v => v.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[highlightedIndex]) {
      e.preventDefault()
      select(filtered[highlightedIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-1.5 items-center min-h-[32px]">
        {value.map(v => (
          <span key={v.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md">
            {v.name}
            <button type="button" onClick={() => remove(v.id)} className="hover:text-blue-900 cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); setHighlightedIndex(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? '강사 검색...' : ''}
          className="outline-none text-sm text-gray-700 placeholder-gray-400 flex-1 min-w-[100px] bg-transparent"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div ref={listRef} className="max-h-48 overflow-y-auto">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                onClick={() => select(p)}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer ${i === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.team} · {p.part}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
