import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Rubric, RubricItem } from '../types/index'

interface RubricEditorProps {
  curriculumId: string
  open: boolean
  onClose: () => void
  onSaved: (rubric: Rubric) => void
}

type EditableItem = Omit<RubricItem, 'idx'>

const SCORES = [5, 4, 3, 2, 1]

export default function RubricEditor({ curriculumId, open, onClose, onSaved }: RubricEditorProps) {
  const EMPTY_5 = Array(5).fill(null).map(() => ({ group: '', label: '', type: 'score' as const }))
  const [items, setItems] = useState<EditableItem[]>(EMPTY_5)

  function addItem() {
    setItems(prev => [...prev, { group: '', label: '', type: 'score' as const }])
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, patch: Partial<EditableItem>) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, ...patch } : item))
  }

  function handleSave() {
    const rubric: Rubric = {
      id: `rubric-${curriculumId}`,
      curriculum_id: curriculumId,
      items: items.map((item, idx) => ({ ...item, idx })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onSaved(rubric)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">루브릭 편집</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-36">그룹</th>
                <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500">항목</th>
                <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-24">유형</th>
                <th className="py-2 w-8"></th>
                {SCORES.map(s => (
                  <th key={s} className="text-center py-2 w-8 text-xs font-medium text-gray-500">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1.5 pr-3">
                    <input
                      type="text"
                      value={item.group}
                      onChange={e => updateItem(i, { group: e.target.value })}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                      placeholder="그룹명"
                    />
                  </td>
                  <td className="py-1.5 pr-3">
                    <input
                      type="text"
                      value={item.label ?? ''}
                      onChange={e => updateItem(i, { label: e.target.value })}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                      placeholder="항목명"
                    />
                  </td>
                  <td className="py-1.5 pr-3">
                    <select
                      value={item.type}
                      onChange={e => updateItem(i, { type: e.target.value as 'score' | 'text' })}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                    >
                      <option value="score">점수</option>
                      <option value="text">텍스트</option>
                    </select>
                  </td>
                  <td className="py-1.5 pr-1">
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-gray-300 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                  {item.type === 'score'
                    ? SCORES.map(s => (
                        <td key={s} className="text-center py-1.5">
                          <span className="w-6 h-6 inline-flex items-center justify-center rounded-full border border-gray-200 text-xs text-gray-400">{s}</span>
                        </td>
                      ))
                    : <td colSpan={SCORES.length} className="py-1.5 text-xs text-gray-400 italic text-center">텍스트 입력</td>
                  }
                </tr>
              ))}
            </tbody>
          </table>
          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 항목 추가
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">
            취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
