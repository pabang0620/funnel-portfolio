import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

interface Option {
  value: number | string
  label: string
}

interface CustomDropdownProps {
  options: Option[]
  selectedValue: number | string | number[]
  onChange: (value: number | string | number[]) => void
  placeholder?: string
  search?: boolean
  optionChecked?: boolean
  dropdownKey?: string
}

const CustomDropdown = ({
  options,
  selectedValue,
  onChange,
  placeholder = '선택',
  search = false,
  optionChecked = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [checkedValues, setCheckedValues] = useState<(number | string)[]>(
    Array.isArray(selectedValue) ? selectedValue : []
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (optionChecked && Array.isArray(selectedValue)) {
      setCheckedValues(selectedValue)
    }
  }, [selectedValue, optionChecked])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options
    return options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [options, searchTerm])

  const displayLabel = useMemo(() => {
    if (optionChecked && Array.isArray(selectedValue)) {
      const labels = options
        .filter(o => (selectedValue as number[]).includes(o.value as number))
        .map(o => o.label)
      return labels.length > 0 ? labels.join(', ') : placeholder
    }
    const found = options.find(o => String(o.value) === String(selectedValue))
    return found ? found.label : placeholder
  }, [options, selectedValue, placeholder, optionChecked])

  const handleSelect = useCallback((option: Option) => {
    if (optionChecked) {
      const val = option.value as number
      const next = checkedValues.includes(val)
        ? checkedValues.filter(v => v !== val)
        : [...checkedValues, val]
      setCheckedValues(next)
      onChange(next as number[])
    } else {
      onChange(option.value)
      setIsOpen(false)
      setSearchTerm('')
    }
  }, [checkedValues, onChange, optionChecked])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: '6px',
          border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer',
          fontSize: '13px', textAlign: 'left', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          color: displayLabel === placeholder ? '#9ca3af' : '#111827',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {displayLabel}
        </span>
        <span style={{ marginLeft: '4px', color: '#9ca3af', fontSize: '10px' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)', marginTop: '4px',
          maxHeight: '240px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          {search && (
            <div style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="검색..."
                autoFocus
                style={{
                  width: '100%', padding: '6px 8px', borderRadius: '4px',
                  border: '1px solid #e5e7eb', fontSize: '12px', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
                결과 없음
              </div>
            ) : filteredOptions.map(opt => {
              const isSelected = optionChecked
                ? checkedValues.includes(opt.value as number)
                : String(opt.value) === String(selectedValue)
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    color: isSelected ? '#3b82f6' : '#111827',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f9fafb'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  {optionChecked && (
                    <input type="checkbox" checked={isSelected} readOnly style={{ margin: 0 }} />
                  )}
                  {opt.label}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomDropdown
