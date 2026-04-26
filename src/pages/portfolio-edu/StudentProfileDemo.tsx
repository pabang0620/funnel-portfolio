import { User, BookOpen, ClipboardList, CheckCircle2, FileText, Calendar } from 'lucide-react'

const TODAY = '2025-02-15'

const STUDENT = {
  name: '김수현',
  team: '개발팀',
  part: '프론트엔드파트',
  email: 'suhyeon.kim@example.com',
  joinDate: '2022.03',
  enrolledCurriculums: 3,
  completedLectures: 14,
  totalLectures: 18,
  assignmentsSubmitted: 7,
  assignmentsTotal: 9,
  attendanceRate: 89,
}

interface Assignment {
  id: string
  title: string
  submitted: boolean
}

interface HistoryRow {
  curriculum: string
  lecture: string
  lectureId: string
  date: string
  attendance: string
  hasNote: boolean
  assignments: Assignment[]
}

const EDUCATION_HISTORY: HistoryRow[] = [
  {
    curriculum: 'React & TypeScript 심화',
    lecture: '1강. React 기초',
    lectureId: 'L001',
    date: '2025-01-10',
    attendance: 'present',
    hasNote: true,
    assignments: [
      { id: 'A001', title: 'React 컴포넌트 설계', submitted: true },
      { id: 'A002', title: 'Props & State 실습', submitted: true },
    ],
  },
  {
    curriculum: 'React & TypeScript 심화',
    lecture: '2강. Hooks 패턴',
    lectureId: 'L002',
    date: '2025-01-17',
    attendance: 'present',
    hasNote: true,
    assignments: [
      { id: 'A003', title: 'Custom Hook 구현', submitted: false },
    ],
  },
  {
    curriculum: 'React & TypeScript 심화',
    lecture: '3강. 상태관리',
    lectureId: 'L003',
    date: '2025-01-24',
    attendance: 'late',
    hasNote: false,
    assignments: [],
  },
  {
    curriculum: 'Python 데이터 분석',
    lecture: '1강. Pandas 기초',
    lectureId: 'L004',
    date: '2025-02-05',
    attendance: 'present',
    hasNote: true,
    assignments: [
      { id: 'A004', title: 'DataFrame 조작 실습', submitted: true },
    ],
  },
  {
    curriculum: 'Python 데이터 분석',
    lecture: '2강. 시각화',
    lectureId: 'L005',
    date: '2025-02-12',
    attendance: 'absent',
    hasNote: false,
    assignments: [
      { id: 'A005', title: 'Matplotlib 차트 그리기', submitted: false },
    ],
  },
]

const UPCOMING_LECTURES = [
  { curriculum: 'React & TypeScript 심화', lecture: '4강. 성능 최적화', date: '2025-02-21' },
  { curriculum: 'Python 데이터 분석', lecture: '3강. 머신러닝 기초', date: '2025-02-28' },
]

const PENDING_ASSIGNMENTS = [
  { curriculum: 'React & TypeScript 심화', lecture: '2강. Hooks 패턴', title: 'Custom Hook 구현', deadline: '2025-02-20' },
  { curriculum: 'Python 데이터 분석', lecture: '2강. 시각화', title: 'Matplotlib 차트 그리기', deadline: '2025-02-18' },
]

const ATTENDANCE_BADGE: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  late: 'bg-amber-100 text-amber-700',
  absent: 'bg-red-100 text-red-700',
}

const ATTENDANCE_LABEL: Record<string, string> = {
  present: '출석',
  late: '지각',
  absent: '결석',
}

// ──────────────────────────────────────────────
// D-day calculation
// ──────────────────────────────────────────────
function calcDday(deadline: string): number {
  const today = new Date(TODAY)
  const due = new Date(deadline)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function DdayBadge({ deadline }: { deadline: string }) {
  const d = calcDday(deadline)
  const label = d === 0 ? 'D-day' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`
  const color =
    d <= 3 ? 'text-red-500 font-bold' :
    d <= 7 ? 'text-orange-500 font-semibold' :
    'text-gray-400'
  return <span className={`text-xs ${color}`}>{label}</span>
}

// ──────────────────────────────────────────────
// Shared sub-components
// ──────────────────────────────────────────────
function AttendanceBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ATTENDANCE_BADGE[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {ATTENDANCE_LABEL[status] ?? status}
    </span>
  )
}

function NoteButton({ active }: { active: boolean }) {
  if (!active) {
    return (
      <button className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1 font-medium bg-gray-50 text-gray-300 border border-gray-100 cursor-default" disabled>
        <FileText className="w-3 h-3" />
        노트
      </button>
    )
  }
  return (
    <button className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1 font-medium bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors">
      <FileText className="w-3 h-3" />
      노트
    </button>
  )
}

function AssignmentButton({ assignment }: { assignment: Assignment }) {
  const truncated = assignment.title.length > 8 ? assignment.title.slice(0, 8) + '…' : assignment.title
  return (
    <div className="relative inline-flex">
      <button
        className="text-xs px-2 py-0.5 rounded-md flex items-center gap-1 font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
        title={assignment.title}
      >
        <ClipboardList className="w-3 h-3" />
        {truncated}
      </button>
      {!assignment.submitted && (
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full absolute -top-0.5 -right-0.5" />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Variant A — upcoming: two side-by-side alert cards
// ──────────────────────────────────────────────
function UpcomingCardsA() {
  return (
    <div className="flex gap-3 mb-5">
      {/* 예정 강의 */}
      <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          예정 강의
          <span className="ml-auto bg-blue-200 text-blue-800 text-xs px-1.5 rounded-full font-semibold">
            {UPCOMING_LECTURES.length}건
          </span>
        </p>
        <div className="flex flex-col">
          {UPCOMING_LECTURES.map((item, i) => (
            <div key={i}>
              {i > 0 && <div className="border-t border-blue-100 my-2" />}
              <p className="text-sm font-medium text-gray-800 leading-snug">{item.lecture}</p>
              <p className="text-xs text-blue-500 mt-0.5">{item.date} · {item.curriculum}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 미제출 과제 */}
      <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-2">
          <ClipboardList className="w-3.5 h-3.5" />
          미제출 과제
          <span className="ml-auto bg-red-200 text-red-800 text-xs px-1.5 rounded-full font-semibold">
            {PENDING_ASSIGNMENTS.length}건
          </span>
        </p>
        <div className="flex flex-col">
          {PENDING_ASSIGNMENTS.map((item, i) => {
            const d = calcDday(item.deadline)
            const chipCls = d <= 3
              ? 'bg-red-100 text-red-600'
              : 'bg-orange-100 text-orange-500'
            return (
              <div key={i}>
                {i > 0 && <div className="border-t border-red-100 my-2" />}
                <p className="text-sm font-medium text-gray-800 leading-snug">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${chipCls}`}>
                    D-{d}
                  </span>
                  마감 {item.deadline}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Shared table
// ──────────────────────────────────────────────
function HistoryTable() {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">커리큘럼</th>
          <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">강의명</th>
          <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">날짜</th>
          <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-4">출석</th>
          <th className="text-left text-xs font-semibold text-gray-400 pb-2 pr-3">학습노트</th>
          <th className="text-left text-xs font-semibold text-gray-400 pb-2">과제</th>
        </tr>
      </thead>
      <tbody>
        {EDUCATION_HISTORY.map((row, i) => (
          <tr key={i} className="border-b border-gray-50 last:border-0">
            <td className="py-2.5 pr-4 text-gray-600 text-xs">{row.curriculum}</td>
            <td className="py-2.5 pr-4 text-gray-800 font-medium">{row.lecture}</td>
            <td className="py-2.5 pr-4 text-gray-500 text-xs">{row.date}</td>
            <td className="py-2.5 pr-4"><AttendanceBadge status={row.attendance} /></td>
            <td className="py-2.5 pr-3">
              <NoteButton active={row.hasNote} />
            </td>
            <td className="py-2.5">
              <div className="flex flex-wrap gap-1">
                {row.assignments.map((a) => (
                  <AssignmentButton key={a.id} assignment={a} />
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ──────────────────────────────────────────────
// Variant A — 프로필 카드 + 통계 대시보드
// ──────────────────────────────────────────────
function VariantA() {
  const lecturePct = STUDENT.totalLectures > 0
    ? Math.round((STUDENT.completedLectures / STUDENT.totalLectures) * 100)
    : 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Top profile section */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">
              {STUDENT.name.slice(0, 1)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-gray-900">{STUDENT.name}</span>
              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                입사 {STUDENT.joinDate}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{STUDENT.team} · {STUDENT.part}</p>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {STUDENT.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-5 py-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{STUDENT.enrolledCurriculums}</p>
          <p className="text-xs text-gray-400 mt-0.5">수강 커리큘럼</p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{STUDENT.completedLectures}</p>
          <p className="text-xs text-gray-400 mt-0.5">완료 강의</p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{STUDENT.assignmentsSubmitted}</p>
          <p className="text-xs text-gray-400 mt-0.5">과제 제출</p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-2xl font-bold text-green-600">{STUDENT.attendanceRate}%</p>
          <p className="text-xs text-gray-400 mt-0.5">출석률</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="font-medium">강의 진행률</span>
          <span className="text-gray-800 font-semibold">{STUDENT.completedLectures} / {STUDENT.totalLectures}강 완료 ({lecturePct}%)</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${lecturePct}%` }}
          />
        </div>
      </div>

      {/* Education history */}
      <div className="px-6 py-5">
        <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          수강 이력
        </p>
        <UpcomingCardsA />
        {/* Timeline */}
        {(() => {
          const futureItems = [
            ...UPCOMING_LECTURES.map(l => ({ type: 'lecture' as const, date: l.date, title: l.lecture, sub: l.curriculum })),
            ...PENDING_ASSIGNMENTS.map(a => ({ type: 'assignment' as const, date: a.deadline, title: a.title, sub: a.lecture })),
          ].sort((a, b) => b.date.localeCompare(a.date))
          return (
            <>
              <div className="flex flex-col gap-0">
                {futureItems.map((item, i) => {
                  const isLastFuture = i === futureItems.length - 1
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="w-24 flex-shrink-0 text-right pt-1">
                        <span className="text-xs text-gray-400">{item.date}</span>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0 mt-1.5" />
                        <div className="w-px flex-1 border-l border-dashed border-gray-200 mt-1 mb-1" />
                      </div>
                      <div className={`flex-1 min-w-0 ${isLastFuture ? 'pb-2' : 'pb-3'}`}>
                        <div className="bg-white rounded-lg px-4 py-2.5 border border-dashed border-gray-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm font-medium leading-snug ${item.type === 'assignment' ? 'text-gray-700' : 'text-gray-600'}`}>{item.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                            </div>
                            {item.type === 'lecture'
                              ? <span className="bg-blue-50 text-blue-500 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">예정</span>
                              : <DdayBadge deadline={item.date} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs font-semibold text-gray-400 px-2">오늘 {TODAY}</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
              <div className="flex flex-col gap-0">
                {EDUCATION_HISTORY.map((row, i) => {
                  const isLast = i === EDUCATION_HISTORY.length - 1
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="w-24 flex-shrink-0 text-right pt-1">
                        <span className="text-xs text-gray-400">{row.date}</span>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0 mt-1.5" />
                        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1 mb-1" />}
                      </div>
                      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 leading-snug">{row.lecture}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{row.curriculum}</p>
                            </div>
                            <AttendanceBadge status={row.attendance} />
                          </div>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <NoteButton active={row.hasNote} />
                            {row.assignments.map((a) => (
                              <AssignmentButton key={a.id} assignment={a} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Variant B — 사이드바 + 메인 콘텐츠
// ──────────────────────────────────────────────
function VariantB() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex">
      {/* Left sidebar */}
      <div className="w-56 flex-shrink-0 bg-gray-50 border-r border-gray-100 px-5 py-6 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl font-bold text-indigo-600">{STUDENT.name.slice(0, 1)}</span>
          </div>
          <p className="text-sm font-bold text-gray-900">{STUDENT.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{STUDENT.part}</p>
        </div>

        <div className="border-t border-gray-200" />

        <div className="flex flex-col gap-3">
          {[
            { label: '팀', value: STUDENT.team, icon: <User className="w-3.5 h-3.5" /> },
            { label: '입사일', value: STUDENT.joinDate, icon: <Calendar className="w-3.5 h-3.5" /> },
            { label: '수강 커리큘럼', value: `${STUDENT.enrolledCurriculums}개`, icon: <BookOpen className="w-3.5 h-3.5" /> },
            { label: '완료 강의', value: `${STUDENT.completedLectures}/${STUDENT.totalLectures}강`, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
            { label: '과제 제출', value: `${STUDENT.assignmentsSubmitted}/${STUDENT.assignmentsTotal}`, icon: <ClipboardList className="w-3.5 h-3.5" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
              <div>
                <p className="text-xs text-gray-400 leading-none">{label}</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Todo list */}
        <div className="border-t border-gray-200" />
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
            할 일
            <span className="bg-gray-200 text-gray-600 text-xs px-1.5 rounded-full font-semibold normal-case">
              {UPCOMING_LECTURES.length + PENDING_ASSIGNMENTS.length}
            </span>
          </p>
          <div className="flex flex-col gap-2 mt-2">
            {UPCOMING_LECTURES.map((item, i) => (
              <div key={`lec-${i}`} className="flex items-start gap-1.5">
                <Calendar className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700 leading-snug">{item.lecture}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
              </div>
            ))}
            {PENDING_ASSIGNMENTS.map((item, i) => (
              <div key={`asgn-${i}`} className="flex items-start gap-1.5">
                <ClipboardList className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-700 leading-snug">{item.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <DdayBadge deadline={item.deadline} /> · {item.deadline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right main */}
      <div className="flex-1 min-w-0 px-6 py-6">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 rounded-xl px-4 py-4">
            <p className="text-3xl font-bold text-green-700 leading-none">{STUDENT.attendanceRate}%</p>
            <p className="text-xs text-green-600 mt-1.5 font-medium">출석률</p>
          </div>
          <div className="bg-orange-50 rounded-xl px-4 py-4">
            <p className="text-3xl font-bold text-orange-600 leading-none">
              {STUDENT.assignmentsSubmitted}
              <span className="text-base font-semibold text-orange-400">/{STUDENT.assignmentsTotal}</span>
            </p>
            <p className="text-xs text-orange-500 mt-1.5 font-medium">과제 완료</p>
          </div>
          <div className="bg-blue-50 rounded-xl px-4 py-4">
            <p className="text-3xl font-bold text-blue-700 leading-none">
              {STUDENT.completedLectures}
              <span className="text-base font-semibold text-blue-400">/{STUDENT.totalLectures}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1.5 font-medium">강의 완료</p>
          </div>
        </div>

        {/* History */}
        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          수강 이력
        </p>
        <HistoryTable />
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Variant C — 타임라인 스타일
// ──────────────────────────────────────────────
function VariantC() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-violet-600">{STUDENT.name.slice(0, 1)}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">{STUDENT.name}</span>
            <span className="text-xs text-gray-500">{STUDENT.team} · {STUDENT.part}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              출석률 {STUDENT.attendanceRate}%
            </span>
            <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <ClipboardList className="w-3 h-3" />
              과제 {STUDENT.assignmentsSubmitted}/{STUDENT.assignmentsTotal}
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              강의 {STUDENT.completedLectures}/{STUDENT.totalLectures}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 py-5">
        <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          수강 이력
        </p>
        {/* Future items merged into timeline */}
        {(() => {
          const futureItems = [
            ...UPCOMING_LECTURES.map(l => ({ type: 'lecture' as const, date: l.date, title: l.lecture, sub: l.curriculum })),
            ...PENDING_ASSIGNMENTS.map(a => ({ type: 'assignment' as const, date: a.deadline, title: a.title, sub: a.lecture })),
          ].sort((a, b) => b.date.localeCompare(a.date))

          return (
            <>
              <div className="flex flex-col gap-0">
                {futureItems.map((item, i) => {
                  const isLastFuture = i === futureItems.length - 1
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="w-24 flex-shrink-0 text-right pt-1">
                        <span className="text-xs text-gray-400">{item.date}</span>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-gray-300 flex-shrink-0 mt-1.5" />
                        {!isLastFuture && <div className="w-px flex-1 border-l border-dashed border-gray-200 mt-1 mb-1" />}
                        {isLastFuture && <div className="w-px flex-1 border-l border-dashed border-gray-200 mt-1 mb-0" />}
                      </div>
                      <div className="flex-1 min-w-0 pb-3">
                        <div className="bg-white rounded-lg px-4 py-2.5 border border-dashed border-gray-200">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm font-medium leading-snug ${item.type === 'assignment' ? 'text-gray-700' : 'text-gray-600'}`}>
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                            </div>
                            {item.type === 'lecture'
                              ? <span className="bg-blue-50 text-blue-500 text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">예정</span>
                              : <DdayBadge deadline={item.date} />
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Today divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs font-semibold text-gray-400 px-2">오늘 {TODAY}</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* Past history */}
              <div className="flex flex-col gap-0">
                {EDUCATION_HISTORY.map((row, i) => {
                  const isLast = i === EDUCATION_HISTORY.length - 1
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="w-24 flex-shrink-0 text-right pt-1">
                        <span className="text-xs text-gray-400">{row.date}</span>
                      </div>
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0 mt-1.5" />
                        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1 mb-1" />}
                      </div>
                      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                        <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 leading-snug">{row.lecture}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{row.curriculum}</p>
                            </div>
                            <AttendanceBadge status={row.attendance} />
                          </div>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <NoteButton active={row.hasNote} />
                            {row.assignments.map((a) => (
                              <AssignmentButton key={a.id} assignment={a} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )
        })()}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Demo page
// ──────────────────────────────────────────────
export default function StudentProfileDemo() {
  return (
    <div className="px-8 py-8 min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">수강생 프로필 디자인 시안</h1>
          <p className="text-sm text-gray-500 mt-1">3가지 variant를 비교하여 최적의 디자인을 선택하세요.</p>
        </div>

        {/* Variant A */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant A — 프로필 카드 + 통계 대시보드</h2>
            <p className="text-sm text-gray-500 mt-0.5">풀 너비 카드에 프로필, 4개 통계 박스, 진행률 바, 이력 테이블을 순서대로 배치합니다.</p>
          </div>
          <VariantA />
        </section>

        {/* Variant B */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant B — 사이드바 + 메인 콘텐츠</h2>
            <p className="text-sm text-gray-500 mt-0.5">왼쪽 사이드바에 기본 정보, 오른쪽에 통계 카드와 이력 테이블을 배치합니다.</p>
          </div>
          <VariantB />
        </section>

        {/* Variant C */}
        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Variant C — 타임라인 스타일</h2>
            <p className="text-sm text-gray-500 mt-0.5">헤더에 요약 pill 통계를 보여주고, 수강 이력을 타임라인 형태로 나열합니다.</p>
          </div>
          <VariantC />
        </section>
      </div>
    </div>
  )
}
