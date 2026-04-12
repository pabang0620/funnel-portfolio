import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users } from 'lucide-react'
import { mockService } from '@/data/funnel-edu/mockService'
import { useAuthStore } from './store/auth'
import type { Curriculum } from './types/index'

function hashColor(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash)
}

const COLOR_PALETTES = [
  { gradient: 'from-blue-500 to-indigo-600', badge: 'bg-white/25 text-white' },
  { gradient: 'from-emerald-500 to-teal-600', badge: 'bg-white/25 text-white' },
  { gradient: 'from-violet-500 to-purple-600', badge: 'bg-white/25 text-white' },
  { gradient: 'from-rose-500 to-pink-600', badge: 'bg-white/25 text-white' },
  { gradient: 'from-amber-500 to-orange-500', badge: 'bg-white/25 text-white' },
  { gradient: 'from-cyan-500 to-sky-600', badge: 'bg-white/25 text-white' },
]

function getColorPalette(type: string) {
  return COLOR_PALETTES[hashColor(type) % COLOR_PALETTES.length]
}

export default function Curriculums() {
  const navigate = useNavigate()
  const { user, viewAsStudent } = useAuthStore()
  const isAdmin = (user?.is_admin ?? false) && !viewAsStudent
  const [search, setSearch] = useState('')
  const [filterTypes, setFilterTypes] = useState<string[]>([])

  const curriculums: Curriculum[] = mockService.getCurriculums()

  const allTypes = Array.from(new Set(
    curriculums.flatMap(c => (c.type || '').split(',').map(t => t.trim()).filter(Boolean))
  )).sort()

  const filtered = curriculums.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterTypes.length > 0) {
      const cTypes = (c.type || '').split(',').map(t => t.trim())
      if (!filterTypes.some(ft => cTypes.includes(ft))) return false
    }
    return true
  })

  return (
    <div className="px-8 py-8 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">커리큘럼 목록</h1>
            <p className="text-sm text-gray-500 mt-0.5">총 {curriculums.length}개의 커리큘럼이 운영 중입니다</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate('/funnel-edu/curriculums/create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> 새 커리큘럼 만들기
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-shrink-0 w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="커리큘럼명 검색"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          {allTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilterTypes(prev =>
                prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
              )}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                filterTypes.includes(t)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-x-5 gap-y-8 items-start">
          {filtered.map(curriculum => {
            const types = (curriculum.type || '').split(',').map(t => t.trim()).filter(Boolean)
            const palette = getColorPalette(types[0] ?? curriculum.name)
            const done = curriculum.lectures_done ?? 0
            const ongoing = curriculum.lectures_ongoing ?? 0
            const upcoming = curriculum.lectures_upcoming ?? 0
            const total = done + ongoing + upcoming || 1
            const donePct = Math.round((done / total) * 100)
            const ongoingPct = Math.round((ongoing / total) * 100)
            const upcomingPct = 100 - donePct - ongoingPct

            return (
              <div
                key={curriculum.id}
                onClick={() => navigate(`/funnel-edu/curriculums/${curriculum.id}`)}
                className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all select-none overflow-hidden"
              >
                <div className={`h-24 bg-gradient-to-br ${palette.gradient} relative flex items-end px-4 pb-3`}>
                  <div className="flex flex-wrap gap-1">
                    {types.map(t => (
                      <span key={t} className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${palette.badge}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">{curriculum.name}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>강의 {curriculum.lecture_count ?? 0}개</span>
                    <span className="text-gray-200">·</span>
                    <span>과제 {curriculum.assignment_count ?? 0}개</span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-4">
                    <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1 flex-1">
                      {(curriculum.instructors?.length ?? 0) === 0
                        ? <span className="text-sm text-gray-400">미배정</span>
                        : curriculum.instructors!.map((i) => (
                            <span key={i.id} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                              {i.name}
                            </span>
                          ))
                      }
                    </div>
                  </div>

                  <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-gray-100 mb-2">
                    {donePct > 0 && <div className="bg-green-400" style={{ width: `${donePct}%` }} />}
                    {ongoingPct > 0 && <div className="bg-blue-400" style={{ width: `${ongoingPct}%` }} />}
                    {upcomingPct > 0 && <div className="bg-gray-200" style={{ width: `${upcomingPct}%` }} />}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {done > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />완료 {done}</span>}
                    {ongoing > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />진행중 {ongoing}</span>}
                    {upcoming > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />예정 {upcoming}</span>}
                    {done === 0 && ongoing === 0 && upcoming === 0 && <span>강의 없음</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
