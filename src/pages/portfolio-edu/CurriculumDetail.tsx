import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Save, X, AlertTriangle, Trash2, Pen, Plus,
  ClipboardList, BookOpen, Tag, User,
} from 'lucide-react'
import { mockService } from '@/data/portfolio-edu/mockService'
import type { Curriculum, Lecture, Rubric, CurriculumStudent } from './types/index'
import InstructorSearchInput from './components/InstructorSearchInput'
import type { Instructor } from './components/InstructorSearchInput'
import { useAuthStore } from './store/auth'
import RubricEditor from './components/RubricEditor'
import RubricScoreModal from './components/RubricScoreModal'
import RichTextEditor from './components/RichTextEditor'

function lectureStatus(startAt?: string, endAt?: string): 'completed' | 'ongoing' | 'scheduled' {
  const now = new Date()
  if (endAt && new Date(endAt) < now) return 'completed'
  if (startAt && new Date(startAt) <= now && (!endAt || new Date(endAt) >= now)) return 'ongoing'
  return 'scheduled'
}

export default function CurriculumDetail() {
  const { curriculumId } = useParams<{ curriculumId: string }>()
  const navigate = useNavigate()
  const { user, viewAsStudent } = useAuthStore()
  const isAdmin = (user?.is_admin ?? false) && !viewAsStudent

  const curriculum = curriculumId ? mockService.getCurriculumById(curriculumId) as Curriculum | null : null
  const lectures = curriculumId ? mockService.getLecturesByCurriculumId(curriculumId) as Lecture[] : []
  const studentsRaw = curriculumId ? mockService.getStudentsByCurriculumId(curriculumId) : []
  const students: CurriculumStudent[] = studentsRaw as CurriculumStudent[]

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editTagInput, setEditTagInput] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editInstructors, setEditInstructors] = useState<Instructor[]>([])
  const tagInputRef = useRef<HTMLInputElement>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [rubric, setRubric] = useState<Rubric | null>(null)
  const [rubricEditorOpen, setRubricEditorOpen] = useState(false)
  const [scoreModalStudent, setScoreModalStudent] = useState<CurriculumStudent | null>(null)

  if (!curriculum) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">커리큘럼을 찾을 수 없습니다.</p>
      </div>
    )
  }

  function handleEditClick() {
    setEditName(curriculum!.name)
    setEditTags((curriculum!.type || '').split(',').map(t => t.trim()).filter(Boolean))
    setEditDescription(curriculum!.description ?? '')
    setEditInstructors((curriculum!.instructors ?? []).map(i => ({
      id: i.id, name: i.name, div: '', team: i.team, part: i.part,
    })))
    setIsEditing(true)
  }

  function handleSave() {
    if (!curriculumId) return
    mockService.updateCurriculum(curriculumId, {
      name: editName,
      type: editTags.join(', '),
      description: editDescription,
      instructors: editInstructors.map(i => ({ id: i.id, name: i.name, team: i.team, part: i.part })),
    })
    setIsEditing(false)
    navigate(0)
  }

  function handleDelete() {
    if (!curriculumId) return
    mockService.deleteCurriculum(curriculumId)
    navigate('/portfolio-edu/curriculums')
  }

  const typeList = (curriculum.type || '').split(',').map(t => t.trim()).filter(Boolean)

  const statusColors = {
    completed: 'bg-gray-100 text-gray-500',
    ongoing: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-amber-100 text-amber-700',
  }
  const statusLabels = { completed: '완료', ongoing: '진행중', scheduled: '예정' }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{curriculum.name}</h1>
          {isAdmin && !isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <Pen className="w-3.5 h-3.5" /> 수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> 삭제
              </button>
            </div>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                취소
              </button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer">
                <Save className="w-3.5 h-3.5" /> 저장
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-80 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-bold text-gray-900">커리큘럼을 삭제하시겠습니까?</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">삭제</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer">취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-3 gap-8 items-start">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Curriculum info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" /> 커리큘럼 정보
            </h2>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="w-20 text-sm font-medium text-gray-500 flex items-center gap-1"><BookOpen className="w-3 h-3" />이름</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div className="flex items-start gap-4">
                  <label className="w-20 text-sm font-medium text-gray-500 flex items-center gap-1 pt-1"><Tag className="w-3 h-3" />종류</label>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 items-center cursor-text" onClick={() => tagInputRef.current?.focus()}>
                      {editTags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => setEditTags(prev => prev.filter(t => t !== tag))} className="cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                      <input
                        ref={tagInputRef}
                        value={editTagInput}
                        onChange={e => setEditTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const val = editTagInput.trim()
                            if (val && !editTags.includes(val)) setEditTags(prev => [...prev, val])
                            setEditTagInput('')
                          }
                        }}
                        placeholder="Enter 키로 추가"
                        className="outline-none text-sm placeholder-gray-400 flex-1 min-w-[100px] border-0"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <label className="w-20 text-sm font-medium text-gray-500 flex items-center gap-1 pt-1"><User className="w-3 h-3" />강사</label>
                  <div className="flex-1">
                    <InstructorSearchInput value={editInstructors} onChange={setEditInstructors} />
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <RichTextEditor content={editDescription} onChange={setEditDescription} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">종류</span>
                  <div className="flex flex-wrap gap-1.5">
                    {typeList.map(t => (
                      <span key={t} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-16 flex-shrink-0 pt-0.5">강사</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(curriculum.instructors ?? []).map(i => (
                      <span key={i.id} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">{i.name}</span>
                    ))}
                  </div>
                </div>
                {curriculum.description && (
                  <div className="border-t border-gray-100 pt-3">
                    <RichTextEditor content={curriculum.description} editable={false} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lectures */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-500" /> 강의 목록
                <span className="text-xs font-normal text-gray-400">({lectures.length}개)</span>
              </h2>
              {isAdmin && (
                <button
                  onClick={() => navigate(`/portfolio-edu/curriculums/${curriculumId}/lectures/create`)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> 강의 추가
                </button>
              )}
            </div>
            {lectures.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">등록된 강의가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {lectures.map(lecture => {
                  const status = lectureStatus(lecture.start_at, lecture.end_at)
                  const dateStr = lecture.start_at ? new Date(lecture.start_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '—'
                  return (
                    <div
                      key={lecture.id}
                      onClick={() => navigate(`/portfolio-edu/curriculums/${curriculumId}/lectures/${lecture.id}`)}
                      className="flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-mono text-gray-400 w-6 flex-shrink-0">{lecture.lecture_number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lecture.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{dateStr}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[status]}`}>
                        {statusLabels[status]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">통계</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">수강생</span>
                <span className="text-sm font-bold text-gray-900">{curriculum.student_count ?? 0}명</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">출석률</span>
                <span className="text-sm font-bold text-gray-900">{curriculum.attendance_rate ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">과제 제출률</span>
                <span className="text-sm font-bold text-gray-900">{curriculum.submission_rate ?? 0}%</span>
              </div>
            </div>
          </div>

          {/* Rubric */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">루브릭</h3>
              {isAdmin && (
                <button
                  onClick={() => setRubricEditorOpen(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {rubric ? '수정' : '만들기'}
                </button>
              )}
            </div>
            {rubric ? (
              <div className="space-y-1.5">
                {rubric.items.slice(0, 3).map(item => (
                  <div key={item.idx} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {item.label || item.group || '항목 ' + (item.idx + 1)}
                  </div>
                ))}
                {rubric.items.length > 3 && (
                  <p className="text-xs text-gray-400">외 {rubric.items.length - 3}개 항목</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">루브릭이 없습니다.</p>
            )}
          </div>

          {/* Students */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">수강생 ({students.length}명)</h3>
            <div className="space-y-2">
              {students.slice(0, 6).map(s => (
                <div
                  key={s.id}
                  onClick={() => rubric && setScoreModalStudent(s)}
                  className={`flex items-center justify-between ${rubric ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-1' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.team} · {s.part}</p>
                  </div>
                  {rubric && (
                    <span className="text-xs text-blue-600 hover:text-blue-800">평가</span>
                  )}
                </div>
              ))}
              {students.length > 6 && (
                <p className="text-xs text-gray-400 text-center pt-1">외 {students.length - 6}명</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Editor Modal */}
      {rubricEditorOpen && curriculumId && (
        <RubricEditor
          curriculumId={curriculumId}
          open={rubricEditorOpen}
          onClose={() => setRubricEditorOpen(false)}
          onSaved={r => setRubric(r)}
        />
      )}

      {/* Rubric Score Modal */}
      {scoreModalStudent && rubric && (
        <RubricScoreModal
          rubric={rubric}
          employeeId={scoreModalStudent.id}
          employeeName={scoreModalStudent.name}
          open={!!scoreModalStudent}
          onClose={() => setScoreModalStudent(null)}
        />
      )}
    </div>
  )
}
