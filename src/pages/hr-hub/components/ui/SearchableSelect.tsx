import React, { useState, useEffect, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'

export interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
  disabled?: boolean
  triggerRef?: RefObject<HTMLButtonElement | null>
  onSelect?: () => void
  className?: string
}

export function SearchableSelect({ value, onChange, options, placeholder, disabled, triggerRef, onSelect, className }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(-1)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const portalRef = useRef<HTMLDivElement>(null)

  function calcPosition() {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
      zIndex: 9999,
    })
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        ref.current && !ref.current.contains(target) &&
        portalRef.current && !portalRef.current.contains(target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setActiveIdx(-1) }, [query])

  const filtered = [{ value: '', label: placeholder }, ...options.filter(o => o.label.includes(query))]
  const selectedLabel = options.find(o => o.value === value)?.label

  function select(val: string) {
    onChange(val)
    setOpen(false)
    setQuery('')
    onSelect?.()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        calcPosition()
        setOpen(true)
        setActiveIdx(0)
      }
      return
    }
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIdx >= 0 && activeIdx < filtered.length) {
        select(filtered[activeIdx].value)
      }
    }
  }

  useEffect(() => {
    if (!listRef.current || activeIdx < 0) return
    const items = listRef.current.querySelectorAll('[data-idx]')
    const el = items[activeIdx] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const dropdown = open && (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onMouseDown={() => setOpen(false)} />
      <div ref={portalRef} style={dropdownStyle} className="bg-background border rounded-md shadow-md">
      <div className="p-1.5 border-b">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="검색..."
          className="w-full h-7 px-2 text-sm bg-muted rounded focus:outline-none"
        />
      </div>
      <div ref={listRef} className="max-h-48 overflow-y-auto py-1">
        {filtered.map((o, idx) => (
          <button
            key={o.value}
            data-idx={idx}
            type="button"
            onMouseDown={e => { e.preventDefault(); select(o.value) }}
            className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
              idx === activeIdx ? 'bg-muted' : 'hover:bg-muted'
            } ${
              (o.value === '' && !value) || (o.value && o.value === value)
                ? 'text-primary font-medium'
                : o.value === ''
                ? 'text-muted-foreground'
                : 'text-foreground'
            }`}
          >
            {o.label}
          </button>
        ))}
        {filtered.length === 1 && query && (
          <p className="px-3 py-2 text-xs text-muted-foreground">결과 없음</p>
        )}
      </div>
    </div>
    </>
  )

  return (
    <div ref={ref} className={`relative ${className ?? ''}`} onKeyDown={handleKeyDown}>
      <button
        ref={node => {
          (btnRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
          if (triggerRef) (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (open) {
            setOpen(false)
          } else {
            calcPosition()
            setQuery('')
            setActiveIdx(-1)
            setOpen(true)
          }
        }}
        className="h-8 px-2.5 border rounded-md text-sm bg-background text-foreground focus:outline-none focus:border-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 w-full"
      >
        <span className={selectedLabel ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedLabel ?? placeholder}
        </span>
        <span className="ml-auto text-muted-foreground text-xs">▾</span>
      </button>

      {createPortal(dropdown, document.body)}
    </div>
  )
}
