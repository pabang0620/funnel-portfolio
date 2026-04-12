import { useState } from 'react'
import { Search, Users, CheckCircle2, ChevronDown, ChevronRight, BookOpen, GraduationCap } from 'lucide-react'

interface Curriculum {
  name: string
  progress: number
  currentLecture: string | null
}

interface Student {
  id: string
  name: string
  team: string
  part: string
  attendance: number
  submission: number
  lastActive: string
  curriculums: Curriculum[]
}

const STUDENTS: Student[] = [
  {
    id: '1', name: '김수현', team: '개발팀', part: '프론트엔드',
    attendance: 95, submission: 88, lastActive: '2시간 전',
    curriculums: [
      { name: 'React & TypeScript 심화', progress: 58, currentLecture: '4강. 성능 최적화' },
      { name: 'Python 데이터 분석', progress: 22, currentLecture: '2강. 시각화' },
      { name: 'AWS 클라우드 인프라', progress: 100, currentLecture: null },
    ],
  },
  {
    id: '2', name: '이서연', team: '개발팀', part: '백엔드',
    attendance: 78, submission: 92, lastActive: '30분 전',
    curriculums: [
      { name: 'Python 데이터 분석', progress: 44, currentLecture: '8강. 모델링' },
      { name: 'AWS 클라우드 인프라', progress: 67, currentLecture: '6강. IAM' },
    ],
  },
  {
    id: '3', name: '박지훈', team: '마케팅팀', part: '퍼포먼스',
    attendance: 92, submission: 75, lastActive: '1일 전',
    curriculums: [
      { name: 'React & TypeScript 심화', progress: 33, currentLecture: '4강. 성능 최적화' },
    ],
  },
  {
    id: '4', name: '정유진', team: '디자인팀', part: 'UX',
    attendance: 100, submission: 100, lastActive: '5분 전',
    curriculums: [
      { name: 'UI/UX 디자인 시스템', progress: 14, currentLecture: '2강. 디자인 토큰' },
    ],
  },
  {
    id: '5', name: '최승호', team: '데이터팀', part: '분석',
    attendance: 65, submission: 50, lastActive: '3일 전',
    curriculums: [
      { name: 'Python 데이터 분석', progress: 11, currentLecture: '2강. 시각화' },
      { name: 'AWS 클라우드 인프라', progress: 33, currentLecture: '3강. EC2' },
    ],
  },
  {
    id: '6', name: '한예림', team: '개발팀', part: '프론트엔드',
    attendance: 88, submission: 95, lastActive: '1시간 전',
    curriculums: [
      { name: 'React & TypeScript 심화', progress: 75, currentLecture: '9강. 테스팅' },
      { name: 'UI/UX 디자인 시스템', progress: 14, currentLecture: '2강. 디자인 토큰' },
    ],
  },
  {
    id: '7', name: '오승민', team: '마케팅팀', part: '브랜드',
    attendance: 82, submission: 60, lastActive: '5시간 전',
    curriculums: [
      { name: 'UI/UX 디자인 시스템', progress: 43, currentLecture: '6강. 컴포넌트' },
    ],
  },
  {
    id: '8', name: '송다은', team: '디자인팀', part: 'UI',
    attendance: 97, submission: 90, lastActive: '15분 전',
    curriculums: [
      { name: 'UI/UX 디자인 시스템', progress: 71, currentLecture: '10강. 프로토타입' },
      { name: 'React & TypeScript 심화', progress: 8, currentLecture: '1강. React 기초' },
    ],
  },
]

const TEAM_COLORS: Record<string, string> = {
  '개발팀': 'bg-blue-50 text-blue-700',
  '마케팅팀': 'bg-purple-50 text-purple-700',
  '디자인팀': 'bg-pink-50 text-pink-700',
  '데이터팀': 'bg-orange-50 text-orange-700',
}

const CURRICULUM_COLORS: Record<string, string> = {
  'React & TypeScript 심화': 'bg-sky-100 text-sky-700',
  'Python 데이터 분석': 'bg-emerald-100 text-emerald-700',
  'AWS 클라우드 인프라': 'bg-violet-100 text-violet-700',
  'UI/UX 디자인 시스템': 'bg-rose-100 text-rose-700',
}

const CURRICULUM_BAR_COLORS: Record<string, string> = {
  'React & TypeScript 심화': 'bg-sky-500',
  'Python 데이터 분석': 'bg-emerald-500',
  'AWS 클라우드 인프라': 'bg-violet-500',
  'UI/UX 디자인 시스템': 'bg-rose-500',
}

function progressColor(value: number) {
  if (value >= 90) return 'text-green-600'
  if (value >= 75) return 'text-blue-600'
  if (value >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function progressBarColor(value: number) {
  if (value >= 90) return 'bg-green-500'
  if (value >= 75) return 'bg-blue-500'
  if (value >= 50) return 'bg-amber-400'
  return 'bg-red-500'
}

function attendanceColor(value: number) {
  if (value >= 90) return 'text-green-600'
  if (value >= 80) return 'text-amber-600'
  return 'text-red-600'
}

function SearchBar() {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="수강생 검색..."
        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white w-56 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        readOnly
      />
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  )
}

// ─── Variant A: 확장형 테이블 ──────────────────────────

function VariantA() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>수강생 관리</span>
          <span className="font-semibold text-gray-900">{STUDENTS.length}명</span>
        </div>
        <SearchBar />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">수강생</th>
              <th className="px-4 py-3 font-medium">팀</th>
              <th className="px-4 py-3 font-medium">수강 커리큘럼</th>
              <th className="px-4 py-3 font-medium text-center">출석</th>
              <th className="px-4 py-3 font-medium text-center">과제</th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS.map((s) => {
              const activeCurriculum = s.curriculums.find((c) => c.progress < 100)
              return (
                <tr
                  key={s.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors ${
                    s.attendance < 80 ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.part}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${TEAM_COLORS[s.team]}`}>
                      {s.team}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {s.curriculums.map((c) => (
                        <span
                          key={c.name}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${CURRICULUM_COLORS[c.name]}`}
                        >
                          {c.name.split(' ')[0]}
                          {c.progress === 100 && ' ✅'}
                        </span>
                      ))}
                    </div>
                    {activeCurriculum && (
                      <div className="text-xs text-gray-400">
                        현재: {activeCurriculum.currentLecture}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-sm font-semibold ${attendanceColor(s.attendance)}`}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-sm font-semibold ${attendanceColor(s.submission)}`}>
                      {s.submission}%
                    </span>
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

// ─── Variant B: 카드 + 커리큘럼 진행률 ──────────────────

function VariantB() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>수강생 관리</span>
        </div>
        <SearchBar />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {STUDENTS.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                <span className="text-gray-300">·</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TEAM_COLORS[s.team]}`}>
                  {s.team}
                </span>
              </div>
              <span className={`text-xs font-medium ${attendanceColor(s.attendance)}`}>
                출석 {s.attendance}%
              </span>
            </div>
            <div className="text-xs text-gray-400 mb-3">{s.part}</div>

            <div className="space-y-3">
              {s.curriculums.map((c) => (
                <div key={c.name}>
                  {c.progress === 100 ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-gray-500 line-through">{c.name}</span>
                      <span className="text-xs text-green-600 font-medium ml-auto">100%</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${CURRICULUM_COLORS[c.name]?.split(' ')[1] ?? 'text-gray-700'}`}>
                          {c.name}
                        </span>
                        <span className={`text-xs font-semibold ${progressColor(c.progress)}`}>
                          {c.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full ${CURRICULUM_BAR_COLORS[c.name] ?? progressBarColor(c.progress)}`}
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {c.currentLecture}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Variant C: 커리큘럼 중심 그룹 뷰 ──────────────────

function groupByCurriculum(students: Student[]) {
  const groups: Record<string, { student: Student; curriculum: Curriculum }[]> = {}
  for (const s of students) {
    for (const c of s.curriculums) {
      if (!groups[c.name]) groups[c.name] = []
      groups[c.name].push({ student: s, curriculum: c })
    }
  }
  return Object.entries(groups)
}

function VariantC() {
  const curriculumGroups = groupByCurriculum(STUDENTS)
  const [expandedCurriculums, setExpandedCurriculums] = useState<Set<string>>(
    new Set(['React & TypeScript 심화', 'Python 데이터 분석'])
  )

  const toggle = (name: string) => {
    setExpandedCurriculums((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <GraduationCap className="w-4 h-4" />
          <span>수강생 관리</span>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar />
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
            <button className="px-3 py-2 bg-white text-gray-500 hover:bg-gray-50">수강생별</button>
            <button className="px-3 py-2 bg-gray-900 text-white font-medium">커리큘럼별</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {curriculumGroups.map(([currName, entries]) => {
          const isOpen = expandedCurriculums.has(currName)
          const avgProgress = Math.round(
            entries.reduce((a, e) => a + e.curriculum.progress, 0) / entries.length
          )
          const colorClass = CURRICULUM_COLORS[currName] ?? ''

          return (
            <div key={currName} className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggle(currName)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`font-semibold text-sm px-2.5 py-0.5 rounded-full ${colorClass}`}>
                    {currName}
                  </span>
                  <span className="text-xs text-gray-400">{entries.length}명</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    평균 진행률{' '}
                    <span className={`font-semibold ${progressColor(avgProgress)}`}>
                      {avgProgress}%
                    </span>
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-5 py-2.5 font-medium">수강생</th>
                        <th className="px-4 py-2.5 font-medium">팀</th>
                        <th className="px-4 py-2.5 font-medium w-36">진도</th>
                        <th className="px-4 py-2.5 font-medium">현재 강의</th>
                        <th className="px-4 py-2.5 font-medium text-center">출석</th>
                        <th className="px-4 py-2.5 font-medium text-center">과제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map(({ student: s, curriculum: c }) => (
                        <tr
                          key={s.id}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-2.5 font-medium text-gray-900">{s.name}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TEAM_COLORS[s.team]}`}>
                              {s.team}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${CURRICULUM_BAR_COLORS[currName] ?? progressBarColor(c.progress)}`}
                                  style={{ width: `${c.progress}%` }}
                                />
                              </div>
                              <span className={`text-xs font-semibold w-8 text-right ${progressColor(c.progress)}`}>
                                {c.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-500">
                            {c.progress === 100 ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                수료 완료
                              </span>
                            ) : (
                              c.currentLecture
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-xs font-semibold ${attendanceColor(s.attendance)}`}>
                              {s.attendance}%
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-xs font-semibold ${attendanceColor(s.submission)}`}>
                              {s.submission}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Demo Page ───────────────────────────────────

export default function StudentsListDemo() {
  return (
    <div className="px-8 py-8 min-h-full bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900">수강생 목록 디자인 시안</h1>
          <p className="text-sm text-gray-500 mt-1">
            3가지 variant -- 커리큘럼/강의 진행 현황 포함. 각 수강생이 어떤 커리큘럼을 수강 중이고 어디까지 진행했는지 보여줍니다.
          </p>
        </div>

        <section className="mb-14">
          <SectionHeader
            title="Variant A: 확장형 테이블"
            description="커리큘럼 뱃지 + 현재 강의를 테이블 행에 인라인으로 표시합니다. 출석 저조 학생은 붉은 배경으로 강조합니다."
          />
          <VariantA />
        </section>

        <section className="mb-14">
          <SectionHeader
            title="Variant B: 카드 + 커리큘럼 진행률"
            description="각 카드에 수강 중인 커리큘럼별 진행률 바와 현재 강의를 표시합니다. 수료 완료 시 체크 표시."
          />
          <VariantB />
        </section>

        <section className="mb-14">
          <SectionHeader
            title="Variant C: 커리큘럼 중심 그룹 뷰"
            description="커리큘럼별로 수강생을 그룹화합니다. 각 커리큘럼 내에서 개별 학생의 진도와 현재 강의를 확인합니다."
          />
          <VariantC />
        </section>
      </div>
    </div>
  )
}
