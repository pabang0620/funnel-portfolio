import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, CheckCircle2, XCircle, Clock3, Search, Save } from 'lucide-react'
import { mockService } from '@/data/portfolio-edu/mockService'

interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  status: 'present' | 'late' | 'absent' | 'pending'
}

function generateAttendances(studentCount: number): AttendanceRecord[] {
  const names = ['김수현', '오지원', '신태우', '백혜지', '임준영', '이민호', '박서준', '최지아', '강도현', '윤예진']
  return Array.from({ length: Math.min(studentCount, names.length) }).map((_, i) => ({
    id: `att-${i}`,
    employee_id: `user-0${8 + i}`,
    employee_name: names[i] ?? `수강생 ${i + 1}`,
    status: (['present', 'present', 'present', 'late', 'absent'] as const)[i % 5],
  }))
}

export default function LectureAttendance() {
  const { curriculumId, lectureId } = useParams<{ curriculumId: string; lectureId: string }>()
  const navigate = useNavigate()

  const lecture = lectureId ? mockService.getLectureById(lectureId) : null
  const curriculum = curriculumId ? mockService.getCurriculumById(curriculumId) : null

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(
    generateAttendances(lecture?.student_count ?? 8)
  )
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)

  function updateStatus(id: string, status: 'present' | 'late' | 'absent') {
    setAttendances(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filtered = attendances.filter(a =>
    !search || a.employee_name.includes(search)
  )

  const presentCount = attendances.filter(a => a.status === 'present').length
  const lateCount = attendances.filter(a => a.status === 'late').length
  const absentCount = attendances.filter(a => a.status === 'absent').length

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">출결 관리</h1>
            <p className="text-xs text-gray-400">{curriculum?.name} · {lecture?.name}</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? '저장됨!' : '저장'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '전체', value: attendances.length, color: 'text-gray-900' },
            { label: '출석', value: presentCount, color: 'text-green-600' },
            { label: '지각', value: lateCount, color: 'text-amber-600' },
            { label: '결석', value: absentCount, color: 'text-red-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-64 mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름 검색"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Attendance list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">이름</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">출석</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">지각</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-gray-500">결석</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">{a.employee_name}</td>
                  {(['present', 'late', 'absent'] as const).map(s => (
                    <td key={s} className="text-center px-6 py-3">
                      <button
                        onClick={() => updateStatus(a.id, s)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all cursor-pointer ${
                          a.status === s
                            ? s === 'present' ? 'bg-green-100 text-green-600'
                              : s === 'late' ? 'bg-amber-100 text-amber-600'
                              : 'bg-red-100 text-red-500'
                            : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {s === 'present' ? <CheckCircle2 className="w-4 h-4" />
                          : s === 'late' ? <Clock3 className="w-4 h-4" />
                          : <XCircle className="w-4 h-4" />}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
