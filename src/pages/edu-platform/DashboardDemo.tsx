import { useState } from 'react'
import {
  Calendar,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'

// ─── Sample Data ────────────────────────────────────────────────

const ADMIN_USER = '김재연'
const TODAY_DISPLAY = '2026년 4월 9일 목요일'

const TODAY_LECTURES = [
  { time: '09:00 - 10:30', curriculum: 'React 심화', lecture: '4강. 성능 최적화', instructor: '김민준', students: 15, status: 'done' as const },
  { time: '11:00 - 12:30', curriculum: 'Python 분석', lecture: '2강. 시각화', instructor: '박지훈', students: 22, status: 'active' as const },
  { time: '14:00 - 15:30', curriculum: 'AWS 인프라', lecture: '7강. 배포 자동화', instructor: '정유진', students: 18, status: 'upcoming' as const },
]


const EVENT_DAYS = new Set([2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28, 30])

const CURRICULUM_DATA: Record<string, {
  progress: number
  lectures: string
  students: number
  attendance: number
  weeklyAttendance: { week: string; rate: number }[]
  bottomStudents: { name: string; rate: number }[]
  bottomAssignments: { name: string; rate: number }[]
}> = {
  'React & TypeScript 심화': {
    progress: 58, lectures: '7/12', students: 15, attendance: 93,
    weeklyAttendance: [
      { week: '1주차', rate: 100 }, { week: '2주차', rate: 93 },
      { week: '3주차', rate: 87 }, { week: '4주차', rate: 93 },
      { week: '5주차', rate: 100 }, { week: '6주차', rate: 87 },
      { week: '7주차', rate: 93 },
    ],
    bottomStudents: [
      { name: '최승호', rate: 57 },
      { name: '오승민', rate: 71 },
      { name: '박지훈', rate: 79 },
      { name: '이서연', rate: 83 },
      { name: '한예림', rate: 86 },
    ],
    bottomAssignments: [
      { name: '최승호', rate: 40 },
      { name: '박지훈', rate: 60 },
      { name: '오승민', rate: 67 },
      { name: '이서연', rate: 80 },
      { name: '한예림', rate: 85 },
    ],
  },
  'Python 데이터 분석': {
    progress: 22, lectures: '4/18', students: 22, attendance: 88,
    weeklyAttendance: [
      { week: '1주차', rate: 95 }, { week: '2주차', rate: 86 },
      { week: '3주차', rate: 82 }, { week: '4주차', rate: 91 },
    ],
    bottomStudents: [
      { name: '최승호', rate: 50 },
      { name: '김수현', rate: 65 },
      { name: '오승민', rate: 72 },
      { name: '송다은', rate: 78 },
      { name: '박지훈', rate: 82 },
    ],
    bottomAssignments: [
      { name: '최승호', rate: 33 },
      { name: '오승민', rate: 50 },
      { name: '김수현', rate: 67 },
      { name: '송다은', rate: 75 },
      { name: '박지훈', rate: 83 },
    ],
  },
  'AWS 클라우드 인프라': {
    progress: 100, lectures: '9/9', students: 18, attendance: 95,
    weeklyAttendance: [
      { week: '1주차', rate: 100 }, { week: '2주차', rate: 94 },
      { week: '3주차', rate: 89 }, { week: '4주차', rate: 94 },
      { week: '5주차', rate: 100 }, { week: '6주차', rate: 89 },
      { week: '7주차', rate: 94 }, { week: '8주차', rate: 100 },
      { week: '9주차', rate: 94 },
    ],
    bottomStudents: [
      { name: '오승민', rate: 78 },
      { name: '이서연', rate: 83 },
      { name: '한예림', rate: 85 },
      { name: '박지훈', rate: 89 },
      { name: '김수현', rate: 89 },
    ],
    bottomAssignments: [
      { name: '오승민', rate: 70 },
      { name: '한예림', rate: 78 },
      { name: '이서연', rate: 80 },
      { name: '박지훈', rate: 89 },
      { name: '김수현', rate: 90 },
    ],
  },
  'UI/UX 디자인 시스템': {
    progress: 14, lectures: '2/14', students: 12, attendance: 85,
    weeklyAttendance: [
      { week: '1주차', rate: 92 }, { week: '2주차', rate: 83 },
    ],
    bottomStudents: [
      { name: '최승호', rate: 50 },
      { name: '오승민', rate: 67 },
      { name: '송다은', rate: 75 },
      { name: '정유진', rate: 83 },
      { name: '한예림', rate: 83 },
    ],
    bottomAssignments: [
      { name: '최승호', rate: 0 },
      { name: '오승민', rate: 50 },
      { name: '송다은', rate: 50 },
      { name: '정유진', rate: 100 },
      { name: '한예림', rate: 100 },
    ],
  },
}

const CURRICULUM_NAMES = Object.keys(CURRICULUM_DATA)

// ─── Shared helpers ─────────────────────────────────────────────

const STATUS_STYLE = {
  done: { bg: 'bg-green-50 text-green-700 border-green-200', label: '완료' },
  active: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: '진행중' },
  upcoming: { bg: 'bg-gray-50 text-gray-500 border-gray-200', label: '예정' },
}

const STATUS_EMOJI = { done: '✅', active: '🔵', upcoming: '⏳' }


function progressColor(value: number) {
  if (value >= 90) return 'bg-emerald-500'
  if (value >= 75) return 'bg-blue-500'
  if (value >= 50) return 'bg-amber-500'
  return 'bg-rose-400'
}

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-2 rounded-full bg-gray-100 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all ${progressColor(value)}`} style={{ width: `${value}%` }} />
    </div>
  )
}

// ─── MiniCalendar ───────────────────────────────────────────────

function MiniCalendar({ className = '' }: { className?: string }) {
  const year = 2026, month = 3
  const today = 9
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">2026년 4월</h3>
        <div className="flex gap-1">
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <div key={d} className={`text-center text-[10px] font-semibold py-0.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {days.map(d => {
          const dow = (firstDay + d - 1) % 7
          const isToday = d === today
          const hasEvent = EVENT_DAYS.has(d)
          return (
            <div key={d} className={`relative flex flex-col items-center py-1.5 rounded-md cursor-pointer select-none ${isToday ? 'bg-blue-500' : 'hover:bg-gray-50'}`}>
              <span className={`text-xs ${isToday ? 'text-white font-bold' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-700'}`}>{d}</span>
              {hasEvent && <span className={`absolute bottom-0 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-blue-400'}`} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Attendance Trend Line Chart (Pure SVG) ─────────────────────

function AttendanceTrendChart({ data }: { data: { week: string; rate: number }[] }) {
  const W = 400, H = 180
  const ml = 35, mr = 10, mt = 15, mb = 30
  const pw = W - ml - mr, ph = H - mt - mb

  const rates = data.map(d => d.rate)
  const minRate = Math.min(...rates)
  const maxRate = Math.max(...rates)
  const yMin = Math.max(0, Math.floor((minRate - 5) / 5) * 5)
  const yMax = Math.min(100, Math.ceil((maxRate + 5) / 5) * 5)
  const yRange = yMax - yMin || 1

  const yTicks: number[] = []
  for (let v = yMin; v <= yMax; v += 5) yTicks.push(v)

  const x = (i: number) => ml + (data.length > 1 ? (i / (data.length - 1)) * pw : pw / 2)
  const y = (v: number) => mt + ph - ((v - yMin) / yRange) * ph

  const points = data.map((d, i) => `${x(i).toFixed(1)},${y(d.rate).toFixed(1)}`).join(' ')
  const areaPoints = `${x(0).toFixed(1)},${(mt + ph).toFixed(1)} ${points} ${x(data.length - 1).toFixed(1)},${(mt + ph).toFixed(1)}`

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        출석률 추이
      </h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {yTicks.map(v => (
          <g key={v}>
            <line x1={ml} y1={y(v)} x2={ml + pw} y2={y(v)} stroke="#f3f4f6" strokeWidth={1} />
            <text x={ml - 5} y={y(v)} textAnchor="end" dominantBaseline="middle" style={{ fontSize: 10, fill: '#9ca3af' }}>{v}%</text>
          </g>
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
            <circle cx={x(i)} cy={y(d.rate)} r={3} fill="white" stroke="#3b82f6" strokeWidth={2} />
            <text x={x(i)} y={y(d.rate) - 10} textAnchor="middle" style={{ fontSize: 10, fontWeight: 600, fill: '#2563eb' }}>{d.rate}%</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H - mb + 16} textAnchor="middle" style={{ fontSize: 10, fill: '#9ca3af' }}>{d.week}</text>
        ))}
      </svg>
    </div>
  )
}

// ─── Bottom Students Horizontal Bar Chart ───────────────────────

function BottomRankingChart({ attendanceData, assignmentData }: { attendanceData: { name: string; rate: number }[]; assignmentData: { name: string; rate: number }[] }) {
  const [tab, setTab] = useState<'attendance' | 'assignment'>('attendance')
  const data = tab === 'attendance' ? attendanceData : assignmentData

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-orange-500" />
          하위 수강생
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setTab('attendance')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${tab === 'attendance' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >출석</button>
          <button
            onClick={() => setTab('assignment')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${tab === 'assignment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >과제</button>
        </div>
      </div>
      <div className="space-y-2.5">
        {data.map((s) => {
          const barColor = s.rate < 70 ? 'bg-red-400' : s.rate < 80 ? 'bg-amber-400' : 'bg-blue-400'
          const textColor = s.rate < 70 ? 'text-red-600' : s.rate < 80 ? 'text-amber-600' : 'text-blue-600'
          return (
            <div key={s.name} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-14 text-right truncate">{s.name}</span>
              <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${s.rate}%` }} />
              </div>
              <span className={`text-xs font-bold w-10 ${textColor}`}>{s.rate}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ─── Main Dashboard Demo ────────────────────────────────────────

export default function DashboardDemo() {
  const [selectedCurriculum, setSelectedCurriculum] = useState(CURRICULUM_NAMES[0])
  const currentData = CURRICULUM_DATA[selectedCurriculum]

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드 디자인 시안</h1>
          <p className="text-sm text-gray-500 mt-1">관리자 대시보드 - 커리큘럼 선택 시 차트 데이터 연동</p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-6 border border-gray-200">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">안녕하세요, {ADMIN_USER}님 👋</h2>
              <span className="text-sm text-gray-500">{TODAY_DISPLAY}</span>
            </div>

            {/* Calendar + Today lectures */}
            <div className="flex gap-4">
              <div className="w-64 shrink-0">
                <MiniCalendar />
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    오늘의 강의
                  </h3>
                  <span className="text-xs text-gray-400">{TODAY_LECTURES.length}건</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {TODAY_LECTURES.map((lec) => {
                    const st = STATUS_STYLE[lec.status]
                    return (
                      <div key={lec.time} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <span className="text-xs font-mono text-gray-400 w-12 flex-shrink-0">{lec.time.split(' - ')[0]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{lec.lecture}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{lec.curriculum} · {lec.instructor} · {lec.students}명</div>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${st.bg}`}>
                          {STATUS_EMOJI[lec.status]} {st.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Curriculum progress cards (clickable) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">커리큘럼 진행 현황</h3>
              <div className="grid grid-cols-4 gap-3">
                {CURRICULUM_NAMES.map(name => {
                  const cur = CURRICULUM_DATA[name]
                  const isSelected = name === selectedCurriculum
                  return (
                    <div
                      key={name}
                      onClick={() => setSelectedCurriculum(name)}
                      className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-800 truncate block">{name}</span>
                      <div className="text-2xl font-bold text-gray-900 my-2">{cur.progress}%</div>
                      <ProgressBar value={cur.progress} className="mb-2" />
                      <div className="text-xs text-gray-500">{cur.lectures}강 · {cur.students}명 · 출석 {cur.attendance}%</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Chart section title */}
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-700">{selectedCurriculum}</h3>
              <span className="text-xs text-gray-400">- 상세 현황</span>
            </div>

            {/* Charts row (driven by selected curriculum) */}
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-3">
                <AttendanceTrendChart data={currentData.weeklyAttendance} />
              </div>
              <div className="col-span-2">
                <BottomRankingChart attendanceData={currentData.bottomStudents} assignmentData={currentData.bottomAssignments} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
