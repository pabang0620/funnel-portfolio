import { useState } from 'react'
import { X } from 'lucide-react'
import type { Rubric, RubricScores } from '../types/index'

interface RubricScoreModalProps {
  rubric: Rubric
  employeeId: string
  employeeName: string
  open: boolean
  onClose: () => void
  onSaved?: (scores: RubricScores) => void
  allEmployees?: { id: string; name: string }[]
}

const SCORES = [5, 4, 3, 2, 1]

export default function RubricScoreModal({
  rubric, employeeName, open, onClose, onSaved,
}: RubricScoreModalProps) {
  const [scores, setScores] = useState<RubricScores>({})

  function setScore(idx: number, value: number | string) {
    setScores(prev => ({ ...prev, [String(idx)]: value }))
  }

  function handleSave() {
    onSaved?.(scores)
    onClose()
  }

  if (!open) return null

  const groups = Array.from(new Set(rubric.items.map(item => item.group))).filter(Boolean)

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">루브릭 평가</h2>
            <p className="text-xs text-gray-500 mt-0.5">{employeeName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {groups.map(group => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{group}</h3>
              <div className="space-y-3">
                {rubric.items.filter(item => item.group === group).map(item => (
                  <div key={item.idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{item.label || '항목 ' + (item.idx + 1)}</span>
                    </div>
                    {item.type === 'score' ? (
                      <div className="flex gap-2">
                        {SCORES.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setScore(item.idx, s)}
                            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                              scores[String(item.idx)] === s
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={(scores[String(item.idx)] as string) ?? ''}
                        onChange={e => setScore(item.idx, e.target.value)}
                        rows={3}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                        placeholder="의견을 입력하세요..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
