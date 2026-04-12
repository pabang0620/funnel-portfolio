import { BookOpen, ClipboardList, Users } from 'lucide-react'

interface SampleCurriculum {
  id: string
  name: string
  type: string
  lectureCount: number
  assignmentCount: number
  lecturesDone: number
  lecturesOngoing: number
  lecturesUpcoming: number
  instructors: string[]
}

const SAMPLES: SampleCurriculum[] = [
  {
    id: '1',
    name: 'React & TypeScript 심화 과정',
    type: '프론트엔드',
    lectureCount: 12,
    assignmentCount: 5,
    lecturesDone: 7,
    lecturesOngoing: 2,
    lecturesUpcoming: 3,
    instructors: ['김민준', '이서연'],
  },
  {
    id: '2',
    name: 'Python 데이터 분석 부트캠프',
    type: '데이터사이언스',
    lectureCount: 18,
    assignmentCount: 8,
    lecturesDone: 4,
    lecturesOngoing: 1,
    lecturesUpcoming: 13,
    instructors: ['박지훈'],
  },
  {
    id: '3',
    name: 'AWS 클라우드 인프라 구축',
    type: '백엔드',
    lectureCount: 9,
    assignmentCount: 3,
    lecturesDone: 9,
    lecturesOngoing: 0,
    lecturesUpcoming: 0,
    instructors: ['정유진', '최승호', '한예림'],
  },
  {
    id: '4',
    name: 'UI/UX 디자인 시스템 입문',
    type: '디자인',
    lectureCount: 14,
    assignmentCount: 6,
    lecturesDone: 2,
    lecturesOngoing: 3,
    lecturesUpcoming: 9,
    instructors: ['오승민'],
  },
]

const TYPE_GRADIENT: Record<string, string> = {
  '프론트엔드': 'from-blue-500 to-indigo-600',
  '데이터사이언스': 'from-emerald-500 to-teal-600',
  '백엔드': 'from-violet-500 to-purple-600',
  '디자인': 'from-rose-500 to-pink-600',
}

const TYPE_BORDER: Record<string, string> = {
  '프론트엔드': 'border-blue-500',
  '데이터사이언스': 'border-emerald-500',
  '백엔드': 'border-violet-500',
  '디자인': 'border-rose-500',
}

const TYPE_BADGE_BG: Record<string, string> = {
  '프론트엔드': 'bg-blue-600 text-white',
  '데이터사이언스': 'bg-emerald-600 text-white',
  '백엔드': 'bg-violet-600 text-white',
  '디자인': 'bg-rose-600 text-white',
}

const TYPE_PILL: Record<string, string> = {
  '프론트엔드': 'bg-blue-50 text-blue-700 border border-blue-200',
  '데이터사이언스': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  '백엔드': 'bg-violet-50 text-violet-700 border border-violet-200',
  '디자인': 'bg-rose-50 text-rose-700 border border-rose-200',
}

function gradient(type: string) {
  return TYPE_GRADIENT[type] ?? 'from-gray-400 to-gray-600'
}

function borderColor(type: string) {
  return TYPE_BORDER[type] ?? 'border-gray-400'
}

function badgeBg(type: string) {
  return TYPE_BADGE_BG[type] ?? 'bg-gray-600 text-white'
}

function pillCls(type: string) {
  return TYPE_PILL[type] ?? 'bg-gray-50 text-gray-700 border border-gray-200'
}

// ──────────────────────────────────────────────
// Variant A — 컬러 헤더 카드
// ──────────────────────────────────────────────
function VariantACard({ c }: { c: SampleCurriculum }) {
  const progressPct = c.lectureCount > 0
    ? Math.round((c.lecturesDone / c.lectureCount) * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Gradient header */}
      <div className={`h-24 bg-gradient-to-br ${gradient(c.type)} relative flex items-end px-5 pb-3`}>
        <span className="inline-block bg-white/25 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
          {c.type}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pt-4 pb-5">
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-3">{c.name}</h3>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            강의 {c.lectureCount}개
          </span>
          <span className="text-gray-200">·</span>
          <span className="flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" />
            과제 {c.assignmentCount}개
          </span>
        </div>

        <div className="flex items-center gap-1 mb-4 flex-wrap">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          {c.instructors.map(name => (
            <span key={name} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{name}</span>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>진행률</span>
            <span className="font-medium text-gray-600">{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient(c.type)} rounded-full transition-all`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Variant B — 미니멀 리스트 스타일
// ──────────────────────────────────────────────
function VariantBCard({ c }: { c: SampleCurriculum }) {
  const progressPct = c.lectureCount > 0
    ? Math.round((c.lecturesDone / c.lectureCount) * 100)
    : 0

  return (
    <div className={`bg-white rounded-xl border border-gray-100 border-l-4 ${borderColor(c.type)} shadow-sm hover:shadow-md transition-shadow px-5 py-4 flex gap-4`}>
      {/* Left content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${pillCls(c.type)}`}>{c.type}</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-3 truncate">{c.name}</h3>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="text-base leading-none">📚</span>
            <span>강의 {c.lectureCount}개</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base leading-none">✅</span>
            <span>과제 {c.assignmentCount}개</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-base leading-none">👨‍🏫</span>
            <span>{c.instructors.join(', ')}</span>
          </span>
        </div>
      </div>

      {/* Right — circular percent */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 text-center">
        <span className="text-2xl font-bold text-gray-800 leading-none">{progressPct}</span>
        <span className="text-xs text-gray-400 mt-0.5">% 완료</span>
        <div className="mt-2 flex flex-col gap-0.5 text-xs">
          {c.lecturesDone > 0 && <span className="text-green-600">완료 {c.lecturesDone}</span>}
          {c.lecturesOngoing > 0 && <span className="text-blue-500">진행 {c.lecturesOngoing}</span>}
          {c.lecturesUpcoming > 0 && <span className="text-gray-400">예정 {c.lecturesUpcoming}</span>}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Variant C — 뱃지 강조 카드
// ──────────────────────────────────────────────
function VariantCCard({ c }: { c: SampleCurriculum }) {
  const total = c.lecturesDone + c.lecturesOngoing + c.lecturesUpcoming || 1
  const donePct = Math.round((c.lecturesDone / total) * 100)
  const ongoingPct = Math.round((c.lecturesOngoing / total) * 100)
  const upcomingPct = 100 - donePct - ongoingPct

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top row: title + badge */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <h3 className="text-xl font-bold text-gray-900 leading-snug flex-1 pr-3">{c.name}</h3>
        <span className={`flex-shrink-0 text-sm font-bold px-3 py-1 rounded-lg ${badgeBg(c.type)}`}>{c.type}</span>
      </div>

      {/* Stat pills */}
      <div className="flex gap-2 px-5 mb-4">
        <div className="flex-1 bg-blue-50 rounded-xl px-3 py-2 text-center">
          <p className="text-xl font-bold text-blue-700">{c.lectureCount}</p>
          <p className="text-xs text-blue-500 mt-0.5">강의</p>
        </div>
        <div className="flex-1 bg-orange-50 rounded-xl px-3 py-2 text-center">
          <p className="text-xl font-bold text-orange-600">{c.assignmentCount}</p>
          <p className="text-xs text-orange-400 mt-0.5">과제</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
          <p className="text-xl font-bold text-gray-700">{c.instructors.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">강사</p>
        </div>
      </div>

      {/* Instructors */}
      <div className="flex items-center gap-1.5 px-5 mb-4 flex-wrap">
        <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        {c.instructors.map(name => (
          <span key={name} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">{name}</span>
        ))}
      </div>

      {/* Segmented status bar */}
      <div className="px-5 pb-5">
        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mb-2">
          {donePct > 0 && (
            <div className="bg-green-400 rounded-l-full" style={{ width: `${donePct}%` }} />
          )}
          {ongoingPct > 0 && (
            <div className="bg-blue-400" style={{ width: `${ongoingPct}%` }} />
          )}
          {upcomingPct > 0 && (
            <div className="bg-gray-200 rounded-r-full" style={{ width: `${upcomingPct}%` }} />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />완료 {c.lecturesDone}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />진행 {c.lecturesOngoing}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200 inline-block" />예정 {c.lecturesUpcoming}</span>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Demo page
// ──────────────────────────────────────────────
export default function CurriculumCardDemo() {
  return (
    <div className="px-8 py-8 min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">커리큘럼 카드 디자인 시안</h1>
          <p className="text-sm text-gray-500 mt-1">3가지 variant를 비교하여 최적의 디자인을 선택하세요.</p>
        </div>

        {/* Variant A */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant A — 컬러 헤더 카드</h2>
            <p className="text-sm text-gray-500 mt-0.5">그라디언트 헤더 + 진행률 바. 시각적으로 강렬한 인상을 줍니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {SAMPLES.slice(0, 2).map(c => <VariantACard key={c.id} c={c} />)}
          </div>
        </section>

        {/* Variant B */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant B — 미니멀 리스트 스타일</h2>
            <p className="text-sm text-gray-500 mt-0.5">왼쪽 컬러 세로 바 + 납작한 형태. 목록이 많을 때 적합합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {SAMPLES.slice(2, 4).map(c => <VariantBCard key={c.id} c={c} />)}
          </div>
        </section>

        {/* Variant C */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant C — 뱃지 강조 카드</h2>
            <p className="text-sm text-gray-500 mt-0.5">큰 종류 뱃지 + 통계 pill + 세그먼트 바. 정보 밀도가 높습니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {SAMPLES.slice(0, 2).map(c => <VariantCCard key={c.id} c={c} />)}
          </div>
        </section>

        {/* All types preview */}
        <section className="mb-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">전체 종류 색상 미리보기 (Variant A)</h2>
            <p className="text-sm text-gray-500 mt-0.5">4가지 종류 모두 확인합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {SAMPLES.map(c => <VariantACard key={c.id} c={c} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
