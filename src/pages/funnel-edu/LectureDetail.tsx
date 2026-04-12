import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Plus, ClipboardList, Users } from 'lucide-react'
import { mockService } from '@/data/funnel-edu/mockService'
import { useAuthStore } from './store/auth'
import AssignmentModal from './components/AssignmentModal'
import RichTextEditor from './components/RichTextEditor'

function fmtDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function fmtTime(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function LectureDetail() {
  const { curriculumId, lectureId } = useParams<{ curriculumId: string; lectureId: string }>()
  const navigate = useNavigate()
  const { user, viewAsStudent } = useAuthStore()
  const isAdmin = (user?.is_admin ?? false) && !viewAsStudent

  const lecture = lectureId ? mockService.getLectureById(lectureId) : null
  const curriculum = curriculumId ? mockService.getCurriculumById(curriculumId) : null
  const assignments = lectureId ? mockService.getAssignmentsByLectureId(lectureId) : []

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [showNewAssignment, setShowNewAssignment] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const [newPassingScore, setNewPassingScore] = useState('')
  const [localAssignments, setLocalAssignments] = useState(assignments)

  if (!lecture) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">강의를 찾을 수 없습니다.</p>
      </div>
    )
  }

  function handleCreateAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !lectureId) return
    const newA = mockService.createAssignment({
      lecture_id: lectureId,
      curriculum_id: curriculumId ?? '',
      curriculum_name: curriculum?.name ?? '',
      lecture_name: lecture!.name,
      title: newTitle,
      description: newDesc,
      deadline: newDeadline || undefined,
      passing_score: newPassingScore ? parseInt(newPassingScore) : null,
    })
    setLocalAssignments(prev => [...prev, newA])
    setNewTitle('')
    setNewDesc('')
    setNewDeadline('')
    setNewPassingScore('')
    setShowNewAssignment(false)
  }

  const statusColors: Record<string, string> = {
    completed: 'bg-gray-100 text-gray-500',
    ongoing: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{lecture.name}</h1>
            <p className="text-xs text-gray-400">{curriculum?.name}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate(`/funnel-edu/curriculums/${curriculumId}/lectures/${lectureId}/attendance`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" /> 출결 관리
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* Lecture info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">강의 정보</h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">날짜</p>
                <p className="text-gray-900">{fmtDate(lecture.start_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">시간</p>
                <p className="text-gray-900">{fmtTime(lecture.start_at)} ~ {fmtTime(lecture.end_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">유형</p>
                <p className="text-gray-900">{lecture.type || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">수강생</p>
                <p className="text-gray-900">{lecture.student_count ?? 0}명</p>
              </div>
            </div>
            {lecture.description && (
              <div className="border-t border-gray-100 pt-4">
                <RichTextEditor content={lecture.description} editable={false} />
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-500" /> 과제
                <span className="text-xs font-normal text-gray-400">({localAssignments.length}개)</span>
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowNewAssignment(true)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> 과제 추가
                </button>
              )}
            </div>

            {showNewAssignment && (
              <form onSubmit={handleCreateAssignment} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">과제명</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="과제명을 입력하세요" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">마감일</label>
                    <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">통과 점수</label>
                    <input type="number" value={newPassingScore} onChange={e => setNewPassingScore(e.target.value)}
                      placeholder="예: 70"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">추가</button>
                  <button type="button" onClick={() => setShowNewAssignment(false)}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">취소</button>
                </div>
              </form>
            )}

            {localAssignments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">등록된 과제가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {localAssignments.map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAssignmentId(a.id)}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      {a.deadline && (
                        <p className="text-xs text-gray-400 mt-0.5">마감 {a.deadline.slice(0, 10)}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      제출 {a.submission_count ?? 0}/{a.enrolled_count ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">상태</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">상태</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[lecture.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {lecture.status === 'completed' ? '완료' : lecture.status === 'ongoing' ? '진행중' : '예정'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">출석률</span>
                <span className="font-bold text-gray-900">{lecture.attendance_rate ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">최대 정원</span>
                <span className="font-bold text-gray-900">{lecture.max_capacity ?? '—'}명</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedAssignmentId && (
        <AssignmentModal
          assignmentId={selectedAssignmentId}
          open={!!selectedAssignmentId}
          onClose={() => setSelectedAssignmentId(null)}
          isAdmin={isAdmin}
          courseId={curriculumId}
          onDeleted={id => setLocalAssignments(prev => prev.filter(a => a.id !== id))}
        />
      )}
    </div>
  )
}
