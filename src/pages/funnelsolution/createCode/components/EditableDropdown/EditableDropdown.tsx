import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

interface Option {
  value: number | string
  label: string
}

interface EditableDropdownProps {
  options?: Option[]
  selectedValue: number | string
  onChange: (value: string) => void
  placeholder?: string
  onOptionsChange?: (updated: Option[]) => void
  readOnly?: boolean
}

const EditableDropdown = ({
  options = [],
  selectedValue,
  onChange,
  placeholder = '선택',
  onOptionsChange,
  readOnly = false,
}: EditableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [addInput, setAddInput] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedLabel = useMemo(() => {
    const found = options.find(o => String(o.value) === String(selectedValue))
    return found ? found.label : placeholder
  }, [options, selectedValue, placeholder])

  const handleSelect = useCallback((option: Option) => {
    onChange(String(option.value))
    setIsOpen(false)
  }, [onChange])

  const handleAdd = useCallback(() => {
    const trimmed = addInput.trim()
    if (!trimmed) return
    const newId = Date.now()
    const updated = [...options, { value: newId, label: trimmed }]
    onOptionsChange?.(updated)
    onChange(String(newId))
    setAddInput('')
    setIsOpen(false)
  }, [addInput, options, onOptionsChange, onChange])

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => !readOnly && setIsOpen(o => !o)}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: '6px',
          border: '1px solid #d1d5db', background: readOnly ? '#f9fafb' : '#fff',
          cursor: readOnly ? 'default' : 'pointer', fontSize: '13px',
          textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: selectedLabel === placeholder ? '#9ca3af' : '#111827',
        }}
      >
        <span>{selectedLabel}</span>
        {!readOnly && <span style={{ color: '#9ca3af', fontSize: '10px' }}>▼</span>}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
          background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)', marginTop: '4px',
          maxHeight: '240px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                  background: String(opt.value) === String(selectedValue) ? '#eff6ff' : 'transparent',
                  color: String(opt.value) === String(selectedValue) ? '#3b82f6' : '#111827',
                }}
                onMouseEnter={e => {
                  if (String(opt.value) !== String(selectedValue))
                    (e.currentTarget as HTMLElement).style.background = '#f9fafb'
                }}
                onMouseLeave={e => {
                  if (String(opt.value) !== String(selectedValue))
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
          {onOptionsChange && (
            <div style={{ padding: '8px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={addInput}
                onChange={e => setAddInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="새 항목 추가..."
                style={{
                  flex: 1, padding: '6px 8px', borderRadius: '4px',
                  border: '1px solid #e5e7eb', fontSize: '12px', outline: 'none',
                }}
              />
              <button
                onClick={handleAdd}
                style={{
                  padding: '6px 10px', borderRadius: '4px', border: 'none',
                  background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '12px',
                }}
              >
                추가
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EditableDropdown
