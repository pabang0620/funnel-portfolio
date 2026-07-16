import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search, ChevronRight, BookOpen } from 'lucide-react'
import { mockService } from '@/data/edu-platform/mockService'

interface Student {
  id: string
  name: string
  email: string
  team?: string
  part?: string
  attendance_rate: number
  submission_rate?: number
}

export default function Students() {
  const { studentId } = useParams<{ studentId?: string }>()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const allStudents = (mockService.getStudents() as unknown) as Student[]
  const filtered = allStudents.filter(s =>
    !search || s.name.includes(search) || s.email.includes(search)
  )

  const selectedStudent = studentId
    ? mockService.getStudentById(studentId) as (Student & { curriculums: object[] }) | null
    : null

  if (studentId && selectedStudent) {
    return <StudentDetail student={selectedStudent} onBack={() => navigate(-1)} />
  }

  return (
    <div className="px-8 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">수강생 관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">총 {allStudents.length}명</p>
      </div>

      <div className="relative w-64 mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름, 이메일 검색"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">이름</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">팀</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">이메일</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">출석률</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500">과제 제출률</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(s => (
              <tr
                key={s.id}
                onClick={() => navigate(`/edu-platform/students/${s.id}`)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 text-gray-500">
                  {s.team && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{s.team}</span>}
                </td>
                <td className="px-6 py-4 text-gray-500">{s.email}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-medium ${s.attendance_rate >= 80 ? 'text-green-600' : s.attendance_rate >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                    {s.attendance_rate}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-medium text-gray-700">{s.submission_rate ?? 82}%</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StudentDetail({ student, onBack }: { student: any; onBack: () => void }) {
  const curriculums = student.curriculums ?? []

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 cursor-pointer">
        <ChevronRight className="w-4 h-4 rotate-180" /> 목록으로
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{student.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {student.team && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{student.team}</span>}
              {student.part && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{student.part}</span>}
            </div>
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{student.attendance_rate}%</p>
              <p className="text-xs text-gray-400 mt-0.5">출석률</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{student.submission_rate}%</p>
              <p className="text-xs text-gray-400 mt-0.5">과제 제출률</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-500" /> 수강 커리큘럼
        </h2>
        <div className="space-y-4">
          {curriculums.map((c: any, i: number) => {
            const progress = c.total_lectures > 0 ? Math.round((c.attended_lectures / c.total_lectures) * 100) : 0
            return (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.attended_lectures}/{c.total_lectures}강</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">출석 {progress}%</span>
                  <span className="text-xs text-gray-400">
                    과제 {c.submitted_assignments}/{c.total_assignments}개
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
