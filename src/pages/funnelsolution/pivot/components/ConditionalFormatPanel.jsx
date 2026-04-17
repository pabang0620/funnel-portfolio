import React, { useState, useRef, useEffect } from 'react'
import { Plus, X, Save, Star, Trash2 } from 'lucide-react'
import { DEFAULT_COLORS } from '../conditional-format'
import { getField } from '../lib/pivotFieldRegistry'

const OPERATORS = ['>=', '>', '=', '<', '<=', '!=']

// Simple popover using refs
function ColorPickerPopover({ currentColor, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="cf-color-swatch"
        style={{ backgroundColor: currentColor }}
        onClick={() => setOpen(v => !v)}
        title="색상 선택"
        type="button"
      />
      {open && (
        <div className="cf-color-popover">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`cf-color-option${currentColor === color ? ' cf-color-option--active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => { onChange(color); setOpen(false) }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ConditionalFormatPanel({ rules, onRulesChange, valueFields }) {
  function addRule() {
    const newRule = {
      id: String(Date.now()) + Math.random(),
      field: valueFields[0]?.field || '',
      operator: '>=',
      value: '',
      color: DEFAULT_COLORS[0],
    }
    onRulesChange([...rules, newRule])
  }

  function updateRule(id, patch) {
    onRulesChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  function deleteRule(id) {
    onRulesChange(rules.filter((r) => r.id !== id))
  }

  return (
    <div className="cf-panel">
      {/* 상단: 조건 추가 버튼 */}
      <div className="cf-panel-header">
        <button type="button" className="cf-add-btn" onClick={addRule}>
          <Plus size={13} />
          조건 추가
        </button>
      </div>

      {/* 규칙 목록 */}
      {rules.length === 0 ? (
        <p className="cf-empty">서식 조건을 추가하세요</p>
      ) : (
        <div className="cf-rules">
          {rules.map((rule) => (
            <div key={rule.id} className="cf-rule-row">
              {/* 필드 선택 */}
              <select
                className="pivot-filter-select"
                style={{ width: 120 }}
                value={rule.field}
                onChange={(e) => updateRule(rule.id, { field: e.target.value })}
              >
                {valueFields.map((vf) => {
                  const meta = getField(vf.field)
                  return (
                    <option key={vf.field} value={vf.field}>
                      {meta ? meta.label : vf.field}
                    </option>
                  )
                })}
              </select>

              {/* 연산자 선택 */}
              <select
                className="pivot-filter-select"
                style={{ width: 60 }}
                value={rule.operator}
                onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
              >
                {OPERATORS.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>

              {/* 값 입력 */}
              <input
                type="number"
                className="pivot-filter-input"
                style={{ width: 80 }}
                value={rule.value}
                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                placeholder="값"
              />

              {/* 색상 선택 */}
              <ColorPickerPopover
                currentColor={rule.color}
                onChange={(color) => updateRule(rule.id, { color })}
              />

              {/* 삭제 */}
              <button
                type="button"
                className="pivot-filter-remove-btn"
                onClick={() => deleteRule(rule.id)}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConditionalFormatPanel
