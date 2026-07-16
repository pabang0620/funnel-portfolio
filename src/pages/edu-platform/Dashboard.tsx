import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, TrendingUp, Users, Calendar } from 'lucide-react'
import { mockService } from '@/data/edu-platform/mockService'

function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function fmtTime(iso: string | null | undefined) {
  if (!iso) return '--:--'
  const d = new Date(iso)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function mapStatus(startAt?: string, endAt?: string): 'active' | 'done' | 'upcoming' {
  const now = new Date()
  if (endAt && new Date(endAt) < now) return 'done'
  if (startAt && new Date(startAt) <= now && (!endAt || new Date(endAt) >= now)) return 'active'
  return 'upcoming'
}

const STATUS_STYLE = {
  active: { dot: 'bg-green-500', text: 'text-green-700', label: '진행중' },
  done: { dot: 'bg-gray-400', text: 'text-gray-500', label: '완료' },
  upcoming: { dot: 'bg-blue-400', text: 'text-blue-600', label: '예정' },
}

function progressColor(value: number) {
  if (value >= 90) return 'bg-emerald-500'
  if (value >= 75) return 'bg-blue-500'
  if (value >= 50) return 'bg-amber-500'
  return 'bg-rose-400'
}

function ProgressBar({ value, tooltip, className = '' }: { value: number; tooltip?: string; className?: string }) {
  const capped = Math.min(value, 100)
  return (
    <div className={`h-2 rounded-full bg-gray-100 overflow-hidden ${className}`} title={tooltip}>
      <div className={`h-full rounded-full ${progressColor(capped)}`} style={{ width: `${capped}%` }} />
    </div>
  )
}

function AttendanceTrendChart({ data }: { data: { id?: string; curriculum_id?: string; week: string; rate: number }[] }) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setContainerW(e.contentRect.width)
    })
    ro.observe(containerRef.current)
    setContainerW(containerRef.current.clientWidth)
    return () => ro.disconnect()
  }, [])

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center h-full w-full" style={{ minHeight: 220 }}>
        <p className="text-sm text-gray-400">데이터가 없습니다</p>
      </div>
    )
  }

  const visibleCount = 3
  const perItem = containerW > 0 ? containerW / visibleCount : 200
  const svgW = data.length <= visibleCount ? containerW : data.length * perItem
  const H = 275
  const ml = 50, mr = 50, mt = 15, mb = 50
  const pw = svgW - ml - mr, ph = H - mt - mb

  const rates = data.map(d => d.rate)
  const minRate = Math.min(...rates)
  const maxRate = Math.max(...rates)
  const step = 10
  const yMin = Math.max(0, Math.floor((minRate - 10) / step) * step)
  const yMax = Math.min(100, Math.ceil((maxRate + 5) / step) * step)
  const yRange = yMax - yMin || 1

  const yTicks: number[] = []
  for (let v = yMin; v <= yMax; v += step) yTicks.push(v)

  const x = (i: number) => ml + (data.length > 1 ? (i / (data.length - 1)) * pw : pw / 2)
  const y = (v: number) => mt + ph - ((v - yMin) / yRange) * ph

  const points = data.map((d, i) => `${x(i).toFixed(1)},${y(d.rate).toFixed(1)}`).join(' ')
  const areaPoints = `${x(0).toFixed(1)},${(mt + ph).toFixed(1)} ${points} ${x(data.length - 1).toFixed(1)},${(mt + ph).toFixed(1)}`

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full w-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        출석률 추이
      </h3>
      <div ref={containerRef} className="overflow-x-auto mt-4">
        <svg viewBox={`0 0 ${svgW || 100} ${H}`} style={{ width: svgW || '100%', height: H, display: 'block' }}>
          {yTicks.map(v => (
            <line key={v} x1={ml} y1={y(v)} x2={ml + pw} y2={y(v)} stroke="#f3f4f6" strokeWidth={1} />
          ))}
          <polygon points={areaPoints} fill="url(#areaGrad)" />
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={x(i)} cy={y(d.rate)} r={2.5} fill="white" stroke="#3b82f6" strokeWidth={1.5}>
                <title>{d.week}: {d.rate}%</title>
              </circle>
              <text x={x(i)} y={y(d.rate) - 10} textAnchor="middle" style={{ fontSize: 13, fontWeight: 600, fill: '#2563eb' }}>{d.rate}%</text>
            </g>
          ))}
          {data.map((d, i) => (
            <text
              key={i}
              x={x(i)}
              y={H - mb + 22}
              textAnchor="middle"
              style={{ fontSize: 13, fill: '#6b7280', cursor: d.id ? 'pointer' : 'default' }}
              onClick={() => d.id && d.curriculum_id && navigate(`/edu-platform/curriculums/${d.curriculum_id}/lectures/${d.id}`)}
            >
              {d.week}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function BottomRankingChart({ attendanceData, assignmentData, onClickStudent }: {
  attendanceData: { id?: string; name: string; rate: number }[]
  assignmentData: { id?: string; name: string; rate: number }[]
  onClickStudent?: (id: string) => void
}) {
  const [tab, setTab] = useState<'attendance' | 'assignment'>('attendance')
  const data = tab === 'attendance' ? attendanceData : assignmentData

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col h-full w-full overflow-hidden">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-orange-500" />
          관리 필요 수강생
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setTab('attendance')} className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${tab === 'attendance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>출석</button>
          <button onClick={() => setTab('assignment')} className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${tab === 'assignment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>과제</button>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8 flex-1 flex items-center justify-center">50% 미만 수강생이 없습니다</p>
      ) : (
        <div className="flex flex-col gap-1.5 mt-3 px-1 flex-1 overflow-y-auto">
          {data.map((s) => {
            const barColor = s.rate < 70 ? 'bg-red-400' : s.rate < 80 ? 'bg-amber-400' : 'bg-blue-400'
            const textColor = s.rate < 70 ? 'text-red-600' : s.rate < 80 ? 'text-amber-600' : 'text-blue-600'
            return (
              <div
                key={s.name}
                className={`flex items-center gap-2 min-w-0 ${s.id ? 'cursor-pointer hover:bg-gray-50 rounded-md py-0.5' : ''}`}
                onClick={() => s.id && onClickStudent?.(s.id)}
              >
                <span className="text-xs text-gray-600 w-12 flex-shrink-0 truncate">{s.name}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden max-w-[90%]">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${s.rate}%` }} />
                </div>
                <span className={`text-xs font-bold w-9 flex-shrink-0 text-right ${textColor}`}>{s.rate}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()

  const dashData = mockService.getDashboard() as any
  const sessions = dashData.sessions ?? []
  const curriculums = dashData.curriculums ?? []

  const [calYear, setCalYear] = useState(() => new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth())

  const today = new Date()
  const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate())

  const [selectedStart, setSelectedStart] = useState<string | null>(todayStr)
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null)
  const [panelTitle, setPanelTitle] = useState('오늘의 강의')

  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(
    curriculums.length > 0 ? curriculums[0].id : null
  )

  const sessionsMap: Record<string, typeof sessions> = {}
  for (const s of sessions) {
    if (!s.start_at) continue
    const key = s.start_at.slice(0, 10)
    if (!sessionsMap[key]) sessionsMap[key] = []
    sessionsMap[key].push(s)
  }

  const detailData = selectedCurriculumId
    ? mockService.getDashboardCurriculumDetail(selectedCurriculumId) as any
    : null

  const weeklyAttendance = detailData?.weekly_attendance ?? []
  const bottomAttendance = detailData?.bottom_students_attendance ?? []
  const bottomAssignment = detailData?.bottom_students_assignment ?? []

  function panelEvents() {
    if (!selectedStart) return []
    const start = selectedStart
    const end = selectedEnd ?? selectedStart
    const result: any[] = []
    const cur = new Date(start)
    const endDate = new Date(end)
    while (cur <= endDate) {
      const key = fmt(cur.getFullYear(), cur.getMonth(), cur.getDate())
      const daySessions = sessionsMap[key] ?? []
      result.push(...daySessions.map((s: any) => ({
        ...s,
        status: mapStatus(s.start_at, s.end_at),
      })))
      cur.setDate(cur.getDate() + 1)
    }
    return result
  }

  function changeMonth(dir: number) {
    let m = calMonth + dir, y = calYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCalMonth(m)
    setCalYear(y)
  }

  function selectDate(dateStr: string) {
    if (!selectedStart || selectedEnd || dateStr === selectedStart) {
      setSelectedStart(dateStr)
      setSelectedEnd(null)
      const [, m, d] = dateStr.split('-')
      setPanelTitle(`${parseInt(m)}월 ${parseInt(d)}일 강의`)
    } else {
      const start = dateStr < selectedStart ? dateStr : selectedStart
      const end = dateStr < selectedStart ? selectedStart : dateStr
      setSelectedStart(start)
      setSelectedEnd(end)
      const [, sm, sd] = start.split('-')
      const [, em, ed] = end.split('-')
      setPanelTitle(`${parseInt(sm)}/${parseInt(sd)} - ${parseInt(em)}/${parseInt(ed)} 강의`)
    }
  }

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const calDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    dateStr: fmt(calYear, calMonth, i + 1),
  }))

  const events = panelEvents()

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-5">
      <h2 className="text-base font-bold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />일정</h2>
      <div className="grid grid-cols-3 gap-4">
        {/* Mini Calendar */}
        <div className="col-span-1 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3 pl-4">
            <h3 className="text-sm font-semibold text-gray-900">{calYear}년 {monthNames[calMonth]}</h3>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button onClick={() => changeMonth(1)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} className={`text-center text-[10px] font-semibold py-0.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {calDays.map(({ day, dateStr }) => {
              const dow = (firstDay + day - 1) % 7
              const isToday = dateStr === todayStr
              const isStart = dateStr === selectedStart
              const isEnd = dateStr === selectedEnd
              const isInRange = selectedStart && selectedEnd && dateStr > selectedStart && dateStr < selectedEnd
              const isSelected = isStart || isEnd
              const hasEvent = !!(sessionsMap[dateStr]?.length)
              return (
                <div
                  key={dateStr}
                  className={`relative flex flex-col items-center py-2.5 rounded-md cursor-pointer select-none ${isSelected ? 'bg-blue-500' : isInRange ? 'bg-blue-100' : isToday ? 'bg-gray-200 hover:bg-gray-300' : 'hover:bg-gray-50'}`}
                  onClick={() => selectDate(dateStr)}
                >
                  <span className={`text-xs ${isSelected ? 'text-white font-bold' : isInRange ? 'text-blue-700 font-medium' : isToday ? 'text-gray-600 font-bold' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-700'}`}>{day}</span>
                  {hasEvent && <span className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Session panel */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: '360px' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" />{panelTitle}</h3>
            <span className="text-xs text-gray-400">{events.length}건</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-xs text-gray-400 px-5 py-8 text-center">예정된 강의 없음</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {events.map((ev: any, i: number) => {
                  const st = STATUS_STYLE[ev.status as keyof typeof STATUS_STYLE]
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/edu-platform/curriculums/${ev.curriculum_id}/lectures/${ev.id}`)}
                    >
                      <span className={`flex items-center gap-1 text-xs font-medium flex-shrink-0 mr-2 ${st.text}`}>
                        <span className={`w-2 h-2 rounded-full ${st.dot} inline-block`} />{st.label}
                      </span>
                      <span className="text-xs font-mono text-gray-400 flex-shrink-0 mr-3">{fmtTime(ev.start_at)}</span>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate ml-2">{ev.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{ev.course_name}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {(ev.instructor_names ?? '').split(',').map((n: string) => n.trim()).filter(Boolean).map((name: string) => (
                          <span key={name} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{name}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: 현황 */}
      <h2 className="text-base font-bold text-gray-700 flex items-center gap-2 mt-14"><TrendingUp className="w-4 h-4 text-gray-500" />현황</h2>
      {curriculums.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex gap-3" style={{ minWidth: curriculums.length > 4 ? curriculums.length * 220 : undefined }}>
            {curriculums.map((cur: any) => {
              const isSelected = cur.id === selectedCurriculumId
              const progress = cur.lecture_count > 0 ? Math.round((cur.lectures_done / cur.lecture_count) * 100) : 0
              return (
                <div
                  key={cur.id}
                  onClick={() => setSelectedCurriculumId(cur.id)}
                  onDoubleClick={() => navigate(`/edu-platform/curriculums/${cur.id}`)}
                  className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all flex-shrink-0 ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  style={{ width: curriculums.length >= 4 ? 200 : `calc(${100 / 3}% - 8px)` }}
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-5">
                    <span className="text-lg font-bold text-gray-900 truncate">{cur.name}</span>
                    {cur.type && cur.type.split(',').map((t: string) => t.trim()).filter(Boolean).map((t: string) => (
                      <span key={t} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-10 flex-shrink-0">진도</span>
                      <div className="flex-1"><ProgressBar value={progress} /></div>
                      <span className="text-xs text-gray-600 w-10 text-right">{progress}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-10 flex-shrink-0">출석</span>
                      <div className="flex-1"><ProgressBar value={cur.attendance_rate} /></div>
                      <span className="text-xs text-gray-600 w-10 text-right">{cur.attendance_rate}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-10 flex-shrink-0">과제</span>
                      <div className="flex-1"><ProgressBar value={cur.submission_rate} /></div>
                      <span className="text-xs text-gray-600 w-10 text-right">{cur.submission_rate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-7">
                    <div className="flex flex-wrap gap-1">
                      {cur.instructors.map((name: string) => (
                        <span key={name} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">{name}</span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{cur.lectures_done}/{cur.lecture_count}강 · {cur.student_count}명</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedCurriculumId && (
        <div className="grid grid-cols-3 gap-4 items-stretch">
          <div className="col-span-2 flex">
            <AttendanceTrendChart data={weeklyAttendance} />
          </div>
          <div className="col-span-1 flex">
            <BottomRankingChart
              attendanceData={bottomAttendance}
              assignmentData={bottomAssignment}
              onClickStudent={id => navigate(`/edu-platform/students/${id}`)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
