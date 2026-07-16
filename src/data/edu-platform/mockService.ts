import coursesRaw from './courses.json'
import assignmentsRaw from './assignments.json'
import usersRaw from './users.json'
import rolesRaw from './roles.json'

// ─── Types ───────────────────────────────────────────────────────

export interface Curriculum {
  id: string
  name: string
  description: string
  type: string
  created_at: string
  updated_at: string
  created_by?: string
  instructors?: { id: string; name: string; team: string; part: string }[]
  lecture_count?: number
  lectures_done?: number
  lectures_ongoing?: number
  lectures_upcoming?: number
  assignment_count?: number
  student_count?: number
  attendance_rate?: number
  submission_rate?: number
  thumbnail?: string
}

export interface Lecture {
  id: string
  curriculum_id: string
  lecture_number: number
  name: string
  type?: string
  description?: string
  start_at?: string
  end_at?: string
  status: string
  max_capacity?: number
  student_count?: number
  enrolled_count?: number
  attendance_rate?: number
  created_at?: string
}

export interface Assignment {
  id: string
  lecture_id: string
  curriculum_id: string
  curriculum_name: string
  lecture_name: string
  title: string
  description?: string
  start_date?: string
  deadline?: string
  passing_score?: number | null
  created_at: string
  updated_at: string
  submission_count?: number
  enrolled_count?: number
}

export interface User {
  id: string
  email: string
  name: string
  is_admin: boolean
  team?: string
  part?: string
}

export interface AdminRole {
  id: string
  employee_id: string
  name: string
  email: string
  team: string
  part: string
  created_at: string
}

export interface Resource {
  id: string
  title: string
  content: string | null
  type: string | null
  thumbnail_url: string | null
  created_by: string | null
  created_by_name: string | null
  updated_by: string | null
  updated_by_name: string | null
  created_at: string
  updated_at: string
}

// ─── In-memory stores ────────────────────────────────────────────

let curriculums: Curriculum[] = [...(coursesRaw as Curriculum[])]
let assignments: Assignment[] = [...(assignmentsRaw as Assignment[])]
let users: User[] = [...(usersRaw as User[])]
let adminRoles: AdminRole[] = [...(rolesRaw as AdminRole[])]

// Generate mock lectures from curriculum data
function generateLectures(): Lecture[] {
  const lectures: Lecture[] = []
  const now = new Date()

  curriculums.forEach(cur => {
    const total = cur.lecture_count ?? 0
    const done = cur.lectures_done ?? 0
    const ongoing = cur.lectures_ongoing ?? 0

    for (let i = 1; i <= total; i++) {
      let status = 'scheduled'
      let startAt: string | undefined
      let endAt: string | undefined

      const baseDate = new Date(cur.created_at)
      baseDate.setDate(baseDate.getDate() + (i - 1) * 7)

      const lectureStart = new Date(baseDate)
      lectureStart.setHours(10, 0, 0, 0)
      const lectureEnd = new Date(baseDate)
      lectureEnd.setHours(12, 0, 0, 0)

      if (i <= done) {
        status = 'completed'
      } else if (i === done + 1 && ongoing > 0) {
        status = 'ongoing'
        lectureStart.setTime(now.getTime() - 30 * 60 * 1000)
        lectureEnd.setTime(now.getTime() + 60 * 60 * 1000)
      }

      startAt = lectureStart.toISOString()
      endAt = lectureEnd.toISOString()

      const types = cur.type.split(',').map(t => t.trim())
      lectures.push({
        id: `lec-${cur.id}-${i}`,
        curriculum_id: cur.id,
        lecture_number: i,
        name: getLectureName(cur.name, i),
        type: types[0] ?? '',
        description: `${cur.name}의 ${i}번째 강의입니다.`,
        start_at: startAt,
        end_at: endAt,
        status,
        max_capacity: 30,
        student_count: cur.student_count ?? 0,
        enrolled_count: cur.student_count ?? 0,
        attendance_rate: status === 'completed' ? Math.floor(80 + Math.random() * 20) : 0,
        created_at: cur.created_at,
      })
    }
  })

  return lectures
}

function getLectureName(curriculumName: string, num: number): string {
  const lectureNames: Record<string, string[]> = {
    'React & TypeScript 심화 과정': [
      'React 19 신규 기능 개요', '컴포넌트 설계 원칙', '성능 최적화 실습',
      'TypeScript 고급 타입', 'Zustand 상태관리', 'React Query 심화',
      '폼 처리 & 검증', '테스트 전략', 'CI/CD 파이프라인', '프로젝트 구조화',
      '코드 스플리팅', '최종 프로젝트 발표',
    ],
    'Python 데이터 분석 부트캠프': [
      'pandas 기초', '데이터 정제 실습', '시각화', '통계 분석 기초',
      '머신러닝 입문', '회귀 분석', '분류 모델', '클러스터링',
      '실무 프로젝트', '최종 발표',
    ],
  }

  const names = lectureNames[curriculumName]
  if (names && names[num - 1]) {
    return `${num}강. ${names[num - 1]}`
  }
  return `${num}강. 강의 ${num}`
}

let _lectures: Lecture[] | null = null
function getLectures(): Lecture[] {
  if (!_lectures) _lectures = generateLectures()
  return _lectures
}

// Mock resources
let resources: Resource[] = [
  {
    id: 'res-001',
    title: '개인정보보호 및 보안 교육 가이드',
    content: '<p>개인정보보호법과 ISMS-P 기준에 따른 교육 자료입니다.</p>',
    type: '공지',
    thumbnail_url: 'https://picsum.photos/seed/security-guide/800/400',
    created_by: 'user-005',
    created_by_name: '최승호',
    updated_by: 'user-005',
    updated_by_name: '최승호',
    created_at: '2026-03-10T09:00:00Z',
    updated_at: '2026-03-10T09:00:00Z',
  },
  {
    id: 'res-002',
    title: '디지털 마케팅 트렌드 2026 자료집',
    content: '<p>2026년 디지털 마케팅 최신 트렌드를 정리한 자료입니다.</p>',
    type: '가이드',
    thumbnail_url: 'https://picsum.photos/seed/marketing-guide/800/400',
    created_by: 'user-006',
    created_by_name: '이서연',
    updated_by: 'user-006',
    updated_by_name: '이서연',
    created_at: '2026-03-15T09:00:00Z',
    updated_at: '2026-03-15T09:00:00Z',
  },
  {
    id: 'res-003',
    title: '신입사원 온보딩 체크리스트',
    content: '<p>신입사원이 입사 첫 달에 완료해야 할 항목들을 정리한 체크리스트입니다.</p>',
    type: '자료',
    thumbnail_url: 'https://picsum.photos/seed/onboarding-checklist/800/400',
    created_by: 'user-001',
    created_by_name: '한예림',
    updated_by: 'user-001',
    updated_by_name: '한예림',
    created_at: '2026-04-01T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'res-004',
    title: 'AI 기초 개념 정리 — 머신러닝과 딥러닝',
    content: '<p>머신러닝과 딥러닝의 핵심 개념을 비개발자도 이해할 수 있게 정리한 가이드입니다.</p>',
    type: '가이드',
    thumbnail_url: null,
    created_by: 'user-003',
    created_by_name: '박지훈',
    updated_by: 'user-003',
    updated_by_name: '박지훈',
    created_at: '2026-02-20T09:00:00Z',
    updated_at: '2026-02-20T09:00:00Z',
  },
  {
    id: 'res-005',
    title: 'Edu Platform 교육자료실 사용 가이드',
    content: '<p>Edu Platform 교육자료실의 주요 기능과 사용 방법을 안내합니다.</p>',
    type: '공지',
    thumbnail_url: 'https://picsum.photos/seed/edu-platform-guide/800/400',
    created_by: 'user-001',
    created_by_name: '한예림',
    updated_by: 'user-001',
    updated_by_name: '한예림',
    created_at: '2026-04-05T09:00:00Z',
    updated_at: '2026-04-05T09:00:00Z',
  },
  {
    id: 'res-006',
    title: '2026년 상반기 교육 계획 안내',
    content: '<p>2026년 상반기 전사 교육 계획과 신청 방법을 안내합니다.</p>',
    type: '공지',
    thumbnail_url: null,
    created_by: 'user-001',
    created_by_name: '한예림',
    updated_by: 'user-001',
    updated_by_name: '한예림',
    created_at: '2026-01-08T09:00:00Z',
    updated_at: '2026-01-08T09:00:00Z',
  },
]

// Mock notes
const notes: Record<string, string> = {}

// ─── Curriculum CRUD ─────────────────────────────────────────────

export const mockService = {
  // Curriculums
  getCurriculums(): Curriculum[] {
    return curriculums
  },

  getCurriculumById(id: string): Curriculum | null {
    return curriculums.find(c => c.id === id) ?? null
  },

  createCurriculum(data: {
    name: string
    type: string
    description: string
    instructors: string[]
  }): Curriculum {
    const instructorObjs = data.instructors.map(iid => {
      const u = users.find(u => u.id === iid)
      return u ? { id: u.id, name: u.name, team: u.team ?? '', part: u.part ?? '' } : { id: iid, name: iid, team: '', part: '' }
    })
    const newCurriculum: Curriculum = {
      id: `cur-${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-001',
      instructors: instructorObjs,
      lecture_count: 0,
      lectures_done: 0,
      lectures_ongoing: 0,
      lectures_upcoming: 0,
      assignment_count: 0,
      student_count: 0,
      attendance_rate: 0,
      submission_rate: 0,
    }
    curriculums = [...curriculums, newCurriculum]
    _lectures = null // reset lecture cache
    return newCurriculum
  },

  updateCurriculum(id: string, data: Partial<Curriculum>): Curriculum | null {
    const idx = curriculums.findIndex(c => c.id === id)
    if (idx === -1) return null
    const updated = { ...curriculums[idx], ...data, updated_at: new Date().toISOString() }
    curriculums = curriculums.map(c => c.id === id ? updated : c)
    return updated
  },

  deleteCurriculum(id: string): boolean {
    const len = curriculums.length
    curriculums = curriculums.filter(c => c.id !== id)
    _lectures = null
    return curriculums.length < len
  },

  // Lectures
  getLecturesByCurriculumId(curriculumId: string): Lecture[] {
    return getLectures().filter(l => l.curriculum_id === curriculumId)
  },

  getLectureById(lectureId: string): Lecture | null {
    return getLectures().find(l => l.id === lectureId) ?? null
  },

  createLecture(curriculumId: string, data: Omit<Lecture, 'id' | 'curriculum_id'>): Lecture {
    const existing = getLectures().filter(l => l.curriculum_id === curriculumId)
    const newLecture: Lecture = {
      ...data,
      id: `lec-${curriculumId}-${Date.now()}`,
      curriculum_id: curriculumId,
      lecture_number: existing.length + 1,
    }
    if (!_lectures) _lectures = generateLectures()
    _lectures = [..._lectures, newLecture]
    // Update curriculum lecture_count
    curriculums = curriculums.map(c => {
      if (c.id !== curriculumId) return c
      return { ...c, lecture_count: (c.lecture_count ?? 0) + 1, lectures_upcoming: (c.lectures_upcoming ?? 0) + 1 }
    })
    return newLecture
  },

  // Assignments
  getAssignments(): Assignment[] {
    return assignments
  },

  getAssignmentsByLectureId(lectureId: string): Assignment[] {
    return assignments.filter(a => a.lecture_id === lectureId)
  },

  getAssignmentsByCurriculumId(curriculumId: string): Assignment[] {
    return assignments.filter(a => a.curriculum_id === curriculumId)
  },

  createAssignment(data: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>): Assignment {
    const newAssignment: Assignment = {
      ...data,
      id: `asgn-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submission_count: 0,
    }
    assignments = [...assignments, newAssignment]
    return newAssignment
  },

  updateAssignment(id: string, data: Partial<Assignment>): Assignment | null {
    const idx = assignments.findIndex(a => a.id === id)
    if (idx === -1) return null
    const updated = { ...assignments[idx], ...data, updated_at: new Date().toISOString() }
    assignments = assignments.map(a => a.id === id ? updated : a)
    return updated
  },

  deleteAssignment(id: string): boolean {
    const len = assignments.length
    assignments = assignments.filter(a => a.id !== id)
    return assignments.length < len
  },

  // Users / Students
  getUsers(): User[] {
    return users
  },

  getUserById(id: string): User | null {
    return users.find(u => u.id === id) ?? null
  },

  getStudents(): User[] {
    return users.filter(u => !u.is_admin)
  },

  getStudentById(id: string): (User & { attendance_rate: number; submission_rate: number; curriculums: object[] }) | null {
    const u = users.find(u => u.id === id)
    if (!u) return null
    return {
      ...u,
      attendance_rate: 89,
      submission_rate: 82,
      curriculums: curriculums.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        status: 'enrolled',
        attendance: Math.floor(80 + Math.random() * 20),
        total_lectures: c.lecture_count ?? 0,
        attended_lectures: c.lectures_done ?? 0,
        total_assignments: c.assignment_count ?? 0,
        submitted_assignments: Math.floor((c.assignment_count ?? 0) * 0.8),
      })),
    }
  },

  getStudentsByCurriculumId(curriculumId: string): object[] {
    const cur = curriculums.find(c => c.id === curriculumId)
    if (!cur) return []
    return users.filter(u => !u.is_admin).slice(0, cur.student_count ?? 5).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      team: u.team,
      part: u.part,
      attended_count: Math.floor(5 + Math.random() * 5),
      total_lecture_count: cur.lecture_count ?? 0,
    }))
  },

  // Admin Roles
  getAdminRoles(): AdminRole[] {
    return adminRoles
  },

  getAdminsAsInstructors(): { id: string; name: string; div: string; team: string; part: string }[] {
    return adminRoles.map(r => ({
      id: r.employee_id,
      name: r.name,
      div: '',
      team: r.team,
      part: r.part,
    }))
  },

  addAdminRole(employeeIds: string[]): AdminRole[] {
    const newRoles: AdminRole[] = employeeIds
      .filter(id => !adminRoles.find(r => r.employee_id === id))
      .map(id => {
        const u = users.find(u => u.id === id)
        return {
          id: `role-${Date.now()}-${id}`,
          employee_id: id,
          name: u?.name ?? id,
          email: u?.email ?? '',
          team: u?.team ?? '',
          part: u?.part ?? '',
          created_at: new Date().toISOString(),
        }
      })
    adminRoles = [...adminRoles, ...newRoles]
    return newRoles
  },

  removeAdminRole(employeeId: string): boolean {
    const len = adminRoles.length
    adminRoles = adminRoles.filter(r => r.employee_id !== employeeId)
    return adminRoles.length < len
  },

  // Resources
  getResources(params?: { search?: string; type?: string[] }): { data: Resource[]; total: number } {
    let filtered = [...resources]
    if (params?.search) {
      const s = params.search.toLowerCase()
      filtered = filtered.filter(r => r.title.toLowerCase().includes(s) || (r.content ?? '').toLowerCase().includes(s))
    }
    if (params?.type && params.type.length > 0) {
      filtered = filtered.filter(r => params.type!.includes(r.type ?? ''))
    }
    return { data: filtered, total: filtered.length }
  },

  getResourceById(id: string): Resource | null {
    return resources.find(r => r.id === id) ?? null
  },

  createResource(data: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'created_by_name' | 'updated_by' | 'updated_by_name'>): Resource {
    const newResource: Resource = {
      ...data,
      id: `res-${Date.now()}`,
      created_by: 'user-001',
      created_by_name: '한예림',
      updated_by: 'user-001',
      updated_by_name: '한예림',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    resources = [newResource, ...resources]
    return newResource
  },

  updateResource(id: string, data: Partial<Resource>): Resource | null {
    const idx = resources.findIndex(r => r.id === id)
    if (idx === -1) return null
    const updated = {
      ...resources[idx],
      ...data,
      updated_by: 'user-001',
      updated_by_name: '한예림',
      updated_at: new Date().toISOString(),
    }
    resources = resources.map(r => r.id === id ? updated : r)
    return updated
  },

  deleteResource(id: string): boolean {
    const len = resources.length
    resources = resources.filter(r => r.id !== id)
    return resources.length < len
  },

  // Notes
  getNotes(): object[] {
    const allLectures = getLectures()
    return allLectures.slice(0, 6).map(l => {
      const cur = curriculums.find(c => c.id === l.curriculum_id)
      return {
        lecture_id: l.id,
        lecture_name: l.name,
        curriculum_name: cur?.name ?? '',
        content: notes[l.id] ?? '',
        updated_at: notes[l.id] ? new Date().toISOString() : null,
      }
    })
  },

  saveNote(lectureId: string, content: string): object {
    notes[lectureId] = content
    return { lecture_id: lectureId, content, updated_at: new Date().toISOString() }
  },

  // My assignments
  getMyAssignments(): object[] {
    return assignments.slice(0, 8).map(a => ({
      ...a,
      submission_id: Math.random() > 0.4 ? `sub-${a.id}` : null,
      submission_score: Math.random() > 0.5 ? Math.floor(70 + Math.random() * 30) : null,
    }))
  },

  // Dashboard
  getDashboard(): object {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const allLectures = getLectures()

    const sessions = allLectures.slice(0, 8).map((l, i) => {
      const cur = curriculums.find(c => c.id === l.curriculum_id)
      const baseDate = new Date(todayStr)
      baseDate.setHours(9 + i * 2, 0, 0, 0)
      const endDate = new Date(baseDate)
      endDate.setHours(baseDate.getHours() + 1, 30, 0, 0)
      return {
        id: l.id,
        curriculum_id: l.curriculum_id,
        course_name: cur?.name ?? '',
        lecture_number: l.lecture_number,
        name: l.name,
        start_at: baseDate.toISOString(),
        end_at: endDate.toISOString(),
        enrolled_count: l.enrolled_count ?? 0,
        student_count: l.student_count ?? 0,
        instructor_names: cur?.instructors?.map(i => i.name).join(', ') ?? '',
      }
    })

    const dashboardCurriculums = curriculums.slice(0, 5).map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      instructors: c.instructors?.map(i => i.name) ?? [],
      lecture_count: c.lecture_count ?? 0,
      lectures_done: c.lectures_done ?? 0,
      student_count: c.student_count ?? 0,
      attendance_rate: c.attendance_rate ?? 0,
      submission_rate: c.submission_rate ?? 0,
    }))

    return { sessions, curriculums: dashboardCurriculums }
  },

  getDashboardCurriculumDetail(curriculumId: string): object {
    const weeks = ['1주차', '2주차', '3주차', '4주차', '5주차', '6주차', '7주차', '8주차']
    const rates = [88, 92, 85, 94, 90, 87, 93, 91]
    const allLectures = getLectures().filter(l => l.curriculum_id === curriculumId)

    const weekly_attendance = weeks.slice(0, allLectures.length || 6).map((w, i) => ({
      id: allLectures[i]?.id,
      curriculum_id: curriculumId,
      week: w,
      rate: rates[i] ?? 85,
    }))

    const bottom_students_attendance = [
      { id: 'user-008', name: '김수현', rate: 45 },
      { id: 'user-009', name: '오지원', rate: 38 },
      { id: 'user-010', name: '신태우', rate: 48 },
    ]

    const bottom_students_assignment = [
      { id: 'user-011', name: '백혜지', rate: 33 },
      { id: 'user-008', name: '김수현', rate: 42 },
      { id: 'user-012', name: '임준영', rate: 47 },
    ]

    return { weekly_attendance, bottom_students_attendance, bottom_students_assignment }
  },
}
