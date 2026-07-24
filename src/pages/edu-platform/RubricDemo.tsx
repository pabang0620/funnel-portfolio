import { Trash2, ChevronDown, AlertTriangle } from 'lucide-react'

// ──────────────────────────────────────────────
// Sample data
// ──────────────────────────────────────────────
const SAMPLE_ITEMS = [
  { idx: 0, group: '커뮤니케이션', label: '의사소통 명확성', type: 'score' as const },
  { idx: 1, group: '커뮤니케이션', label: '팀 협업 태도', type: 'score' as const },
  { idx: 2, group: '기술역량', label: '코드 품질', type: 'score' as const },
  { idx: 3, group: '기술역량', label: '', type: 'score' as const },
  { idx: 4, group: '', label: '종합 의견', type: 'text' as const },
]

const SAMPLE_SCORES: Record<string, number | string> = {
  '0': 4,
  '1': 3,
  '2': 5,
  '3': 0,
  '4': '협업 의지가 매우 좋고 코드 리뷰에도 적극적으로 참여함.',
}

// ──────────────────────────────────────────────
// Section 1: Editor variants
// ──────────────────────────────────────────────

function CurrentEditorProblem() {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-800">현재 - 문제점</h3>
        <p className="text-sm text-gray-500 mt-0.5">현재 에디터 디자인의 두 가지 문제점을 강조 표시합니다.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 w-36">그룹명</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">항목명</th>
              {[5, 4, 3, 2, 1].map((n) => (
                <th key={n} className="text-center text-xs font-semibold text-gray-500 px-2 py-3 w-10">{n}</th>
              ))}
              <th className="px-3 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ITEMS.map((item) => {
              const isEmptyLabel = item.idx === 3
              const isTextWithScore = item.idx === 4

              return (
                <tr
                  key={item.idx}
                  className={`border-b border-gray-50 last:border-0 ${
                    isEmptyLabel ? 'bg-red-50' : isTextWithScore ? 'bg-amber-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-xs text-gray-500">{item.group}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${item.label ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                        {item.label || '(항목명 없음)'}
                      </span>
                      {isEmptyLabel && (
                        <span className="text-xs text-red-500 font-medium bg-red-100 px-1.5 py-0.5 rounded">항목명 없음</span>
                      )}
                      {isTextWithScore && (
                        <span className="text-xs text-amber-600 font-medium bg-amber-100 px-1.5 py-0.5 rounded">서술형인데 점수칸 노출</span>
                      )}
                    </div>
                  </td>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <td key={n} className="px-2 py-3 text-center">
                      <div className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs text-gray-400 mx-auto" />
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center">
                    <button className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <p className="text-sm font-semibold text-red-700 mb-1">문제점 요약</p>
        <ul className="text-xs text-red-600 flex flex-col gap-1 list-disc list-inside">
          <li><strong>항목명 없음 (idx 3)</strong>: 빈 행에도 5~1 점수 원이 그대로 노출되어 혼란을 줌</li>
          <li><strong>서술형 항목 (idx 4)</strong>: type이 text임에도 5~1 점수 칸이 노출되고, 타입을 변경할 UI가 없음</li>
        </ul>
      </div>
    </div>
  )
}

function EditorVariantA() {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-800">Variant A - 인라인 타입 토글</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          각 행에 타입 토글 칩을 추가하고, 빈 항목명에는 점수 원을 흐리게 처리합니다.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 w-36">그룹명</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">항목명</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 w-24">타입</th>
              {[5, 4, 3, 2, 1].map((n) => (
                <th key={n} className="text-center text-xs font-semibold text-gray-500 px-2 py-3 w-10">{n}</th>
              ))}
              <th className="px-3 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ITEMS.map((item) => {
              const isEmpty = item.label === ''
              const isText = item.type === 'text'

              return (
                <tr key={item.idx} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 text-xs text-gray-500">{item.group}</td>
                  <td className="px-4 py-3">
                    {isEmpty ? (
                      <div>
                        <span className="text-sm text-gray-300 italic">항목명을 입력하세요</span>
                        <p className="text-xs text-gray-400 italic mt-0.5">항목명을 먼저 입력하세요</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-800">{item.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isText ? (
                      <span className="bg-violet-100 text-violet-700 text-xs px-2 py-0.5 rounded-full cursor-pointer select-none font-medium">
                        서술형
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full cursor-pointer select-none font-medium">
                        5점 평가
                      </span>
                    )}
                  </td>
                  {isText ? (
                    <td colSpan={5} className="px-2 py-2">
                      <input
                        type="text"
                        readOnly
                        placeholder="서술형 항목 - 점수 없이 의견 입력"
                        className="w-full text-xs border border-gray-200 rounded-md px-3 py-1.5 text-gray-400 bg-gray-50 placeholder:text-gray-400 cursor-default"
                      />
                    </td>
                  ) : (
                    [5, 4, 3, 2, 1].map((n) => (
                      <td key={n} className="px-2 py-3 text-center">
                        <div
                          className={`w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs text-gray-400 mx-auto transition-opacity ${
                            isEmpty ? 'opacity-30' : ''
                          }`}
                        />
                      </td>
                    ))
                  )}
                  <td className="px-3 py-3 text-center">
                    <button className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EditorVariantB() {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-800">Variant B - 카드형 편집기</h3>
        <p className="text-sm text-gray-500 mt-0.5">테이블 대신 카드 형태로 각 항목을 표현합니다. 타입 드롭다운과 경고 메시지를 카드 내에 배치합니다.</p>
      </div>
      <div className="flex flex-col gap-2">
        {SAMPLE_ITEMS.map((item) => {
          const isEmpty = item.label === ''
          const isText = item.type === 'text'

          return (
            <div key={item.idx} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              {/* Top row */}
              <div className="flex items-center gap-3">
                {/* Group badge */}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium flex-shrink-0 min-w-[5rem] text-center">
                  {item.group || <span className="text-gray-300 italic">그룹 없음</span>}
                </span>

                {/* Label */}
                <span className={`flex-1 text-sm ${item.label ? 'text-gray-800 font-medium' : 'text-gray-300 italic'}`}>
                  {item.label || '항목명을 입력하세요'}
                </span>

                {/* Type dropdown chip */}
                <button className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  isText
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {isText ? '서술형' : '5점평가'}
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom row */}
              <div className="mt-2.5 pl-[5.5rem]">
                {isText ? (
                  <textarea
                    readOnly
                    rows={2}
                    placeholder="서술형 의견 입력란"
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-400 bg-gray-50 placeholder:text-gray-400 resize-none cursor-default"
                  />
                ) : isEmpty ? (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    항목명을 먼저 입력해주세요
                  </p>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className="w-7 h-7 rounded-full border-2 border-gray-200 text-xs flex items-center justify-center text-gray-400"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Section 2: Score modal variants
// ──────────────────────────────────────────────

function ScoreVariantA() {
  // Build group-separated structure
  const groups: { groupName: string; items: typeof SAMPLE_ITEMS }[] = []
  for (const item of SAMPLE_ITEMS) {
    const groupLabel = item.group || '(그룹 없음)'
    const existing = groups.find((g) => g.groupName === groupLabel)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.push({ groupName: groupLabel, items: [item] })
    }
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-800">Variant A - 그룹 구분선 방식 (테이블, 개선)</h3>
        <p className="text-sm text-gray-500 mt-0.5">rowSpan 제거, 그룹명을 서브헤더 행으로 분리하고 점수 원 크기를 키웠습니다.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">항목명</th>
              {[5, 4, 3, 2, 1].map((n) => (
                <th key={n} className="text-center text-xs font-semibold text-gray-500 px-2 py-3 w-14">{n}점</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(({ groupName, items }) => (
              <>
                {/* Group subheader row */}
                <tr key={`group-${groupName}`} className="bg-gray-100">
                  <td colSpan={6} className="px-5 py-2">
                    <span className="text-xs font-semibold text-gray-600">{groupName}</span>
                  </td>
                </tr>

                {/* Items in group */}
                {items.map((item) => {
                  const score = SAMPLE_SCORES[String(item.idx)]
                  const isText = item.type === 'text'

                  if (isText) {
                    return (
                      <tr key={item.idx} className="border-b border-gray-50 last:border-0">
                        <td colSpan={6} className="px-5 py-3">
                          <p className="text-xs text-gray-500 font-medium mb-1.5">{item.label} <span className="text-gray-400 font-normal">(서술형)</span></p>
                          <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 border border-gray-100">
                            {typeof score === 'string' ? score : ''}
                          </div>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={item.idx} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-3 text-sm text-gray-800">{item.label || <span className="text-gray-300 italic">항목명 없음</span>}</td>
                      {[5, 4, 3, 2, 1].map((n) => {
                        const selected = score === n
                        return (
                          <td key={n} className="px-2 py-3 text-center">
                            <div
                              className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-semibold mx-auto transition-colors ${
                                selected
                                  ? 'bg-blue-500 border-blue-500 text-white'
                                  : 'border-gray-200 text-gray-300'
                              }`}
                            >
                              {n}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ScoreVariantB() {
  // Build group cards with subtotals
  const groupMap: Map<string, { items: typeof SAMPLE_ITEMS; earned: number; possible: number }> = new Map()

  for (const item of SAMPLE_ITEMS) {
    const key = item.group || '종합 의견'
    if (!groupMap.has(key)) {
      groupMap.set(key, { items: [], earned: 0, possible: 0 })
    }
    const entry = groupMap.get(key)!
    entry.items.push(item)
    if (item.type === 'score') {
      const s = SAMPLE_SCORES[String(item.idx)]
      if (typeof s === 'number' && s > 0) entry.earned += s
      if (item.label) entry.possible += 5
    }
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-800">Variant B - 카드형 평가</h3>
        <p className="text-sm text-gray-500 mt-0.5">그룹별 카드로 묶어 소계를 표시하고, 점수 원을 카드 내 수평 배열합니다.</p>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from(groupMap.entries()).map(([groupName, { items, earned, possible }]) => {
          const hasScore = possible > 0
          return (
            <div key={groupName} className="bg-white rounded-xl border border-gray-200 p-4">
              {/* Card header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-800">{groupName}</span>
                {hasScore && (
                  <span className="text-xs font-semibold text-blue-600">
                    {earned} / {possible}점
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const score = SAMPLE_SCORES[String(item.idx)]
                  const isText = item.type === 'text'

                  if (isText) {
                    return (
                      <div key={item.idx}>
                        <p className="text-xs text-gray-500 mb-1.5">{item.label}</p>
                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                          {typeof score === 'string' ? score : <span className="text-gray-300 italic">의견 없음</span>}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={item.idx} className="flex items-center justify-between gap-3">
                      <span className={`text-sm flex-1 min-w-0 ${item.label ? 'text-gray-800' : 'text-gray-300 italic'}`}>
                        {item.label || '항목명 없음'}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {[5, 4, 3, 2, 1].map((n) => {
                          const selected = score === n
                          return (
                            <div
                              key={n}
                              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors ${
                                selected
                                  ? 'bg-blue-500 border-blue-500 text-white'
                                  : 'border-gray-200 text-gray-300'
                              }`}
                            >
                              {n}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Demo page
// ──────────────────────────────────────────────
export default function RubricDemo() {
  return (
    <div className="px-8 py-8 min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">평가집 디자인 시안</h1>
          <p className="text-sm text-gray-500 mt-1">편집기 3가지 + 평가 모달 2가지 variant</p>
        </div>

        {/* Section 1: Editor */}
        <section className="mb-14">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">평가지 편집 - 편집기</h2>
            <p className="text-sm text-gray-500 mt-1">관리자가 평가 항목을 구성하는 편집기의 3가지 variant입니다.</p>
          </div>

          <div className="flex flex-col gap-10">
            <CurrentEditorProblem />
            <EditorVariantA />
            <EditorVariantB />
          </div>
        </section>

        {/* Section 2: Score modal */}
        <section className="mb-14">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">수강생 평가 모달</h2>
            <p className="text-sm text-gray-500 mt-1">관리자가 수강생의 점수를 입력/확인하는 평가 뷰의 2가지 variant입니다.</p>
          </div>

          <div className="flex flex-col gap-10">
            <ScoreVariantA />
            <ScoreVariantB />
          </div>
        </section>
      </div>
    </div>
  )
}
