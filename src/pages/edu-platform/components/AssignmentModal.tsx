import { useState, useEffect } from 'react'
import { X, Loader2, Send, Pen, Save, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { mockService } from '@/data/edu-platform/mockService'
import RichTextEditor from './RichTextEditor'

interface AssignmentModalProps {
  assignmentId: string
  open: boolean
  onClose: () => void
  isAdmin: boolean
  courseId?: string
  viewStudentId?: string
  viewStudentName?: string
  onDeleted?: (id: string) => void
}

function MetaFields({ assignment }: { assignment: any }) {
  const start = assignment?.start_date ? assignment.start_date.slice(0, 10) : null
  const end = assignment?.deadline ? assignment.deadline.slice(0, 10) : null
  const period = start && end ? `${start} ~ ${end}` : start ? `${start} ~` : end ? `~ ${end}` : '—'
  return (
    <div className="flex items-start gap-8 pb-4 border-b border-gray-100">
      <div>
        <p className="text-xs font-medium text-gray-400 mb-0.5">과제명</p>
        <p className="text-sm font-semibold text-gray-900">{assignment?.title ?? '—'}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 mb-0.5">기간</p>
        <p className="text-sm text-gray-700">{period}</p>
      </div>
      {assignment?.passing_score && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-0.5">통과 점수</p>
          <p className="text-sm text-gray-700">{assignment.passing_score}점</p>
        </div>
      )}
    </div>
  )
}

export default function AssignmentModal({ assignmentId, open, onClose, isAdmin, viewStudentName, onDeleted }: AssignmentModalProps) {
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [mySubmission, setMySubmission] = useState<any>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editPassingScore, setEditPassingScore] = useState('')
  const [saving, setSaving] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [submissionEditMode, setSubmissionEditMode] = useState(false)

  useEffect(() => {
    if (!open || !assignmentId) return
    setLoading(true)
    setIsEditing(false)
    setSubmissionEditMode(false)
    setMySubmission(null)

    // Load from mock
    const found = mockService.getAssignments().find(a => a.id === assignmentId)
    if (found) {
      setAssignment({
        ...found,
        lecture: { name: found.lecture_name, curriculum_name: found.curriculum_name },
        enrollees: Array.from({ length: found.enrolled_count ?? 0 }),
      })
    }
    setLoading(false)
  }, [open, assignmentId])

  function enterEdit() {
    setEditTitle(assignment?.title ?? '')
    setEditDescription(assignment?.description ?? '')
    setEditStartDate(assignment?.start_date?.slice(0, 10) ?? '')
    setEditDeadline(assignment?.deadline?.slice(0, 10) ?? '')
    setEditPassingScore(assignment?.passing_score ? String(assignment.passing_score) : '')
    setIsEditing(true)
  }

  function saveEdit() {
    setSaving(true)
    const updated = mockService.updateAssignment(assignmentId, {
      title: editTitle,
      description: editDescription,
      start_date: editStartDate || undefined,
      deadline: editDeadline || undefined,
      passing_score: editPassingScore ? parseInt(editPassingScore) : null,
    })
    if (updated) {
      setAssignment((prev: any) => ({ ...prev, ...updated }))
    }
    setIsEditing(false)
    setSaving(false)
  }

  function handleDeleteConfirm() {
    mockService.deleteAssignment(assignmentId)
    setShowDeleteConfirm(false)
    onClose()
    if (onDeleted) onDeleted(assignmentId)
  }

  function handleSubmitText() {
    setMySubmission({
      id: `sub-${Date.now()}`,
      submitted_at: new Date().toISOString(),
      answers: { text_content: textContent },
      score: null,
    })
    setSubmissionEditMode(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full flex bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Main panel */}
        <div className="w-[680px] flex flex-col">
          {/* Delete Confirm Overlay */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10" onClick={() => setShowDeleteConfirm(false)}>
              <div className="bg-white rounded-xl w-80 shadow-xl p-6 mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <h3 className="text-sm font-bold text-gray-900">과제를 삭제하시겠습니까?</h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">이 작업은 되돌릴 수 없습니다.</p>
                <div className="flex gap-2">
                  <button onClick={handleDeleteConfirm}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    삭제
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-baseline gap-2 min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate">
                {assignment?.lecture?.name ?? '—'}
              </h2>
              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                · {assignment?.lecture?.curriculum_name ?? ''}
                {isAdmin && viewStudentName ? ` · ${viewStudentName}` : ''}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0 ml-4">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : isEditing ? (
              <div className="space-y-4 leading-relaxed">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">과제명</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div className="flex items-end gap-4 flex-wrap">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">기간</label>
                    <div className="flex items-center gap-2">
                      <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                      <span className="text-sm text-gray-400">~</span>
                      <input type="date" value={editDeadline} onChange={e => setEditDeadline(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">통과 점수</label>
                    <div className="flex items-center gap-1">
                      <input type="number" value={editPassingScore} onChange={e => setEditPassingScore(e.target.value)}
                        placeholder="예: 70"
                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
                      <span className="text-sm text-gray-500">점</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">내용</label>
                  <RichTextEditor content={editDescription} onChange={setEditDescription} editable={true} />
                </div>
              </div>
            ) : submissionEditMode ? (
              <div className="space-y-4 leading-relaxed">
                <RichTextEditor content={textContent} onChange={setTextContent} editable={true} showToc={false} />
              </div>
            ) : (
              <div className="space-y-5 leading-relaxed">
                <MetaFields assignment={assignment} />
                {assignment?.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">내용</p>
                    <RichTextEditor content={assignment.description ?? ''} editable={false} showToc={false} />
                  </div>
                )}
                {mySubmission && (
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-700"><CheckCircle2 className="w-3 h-3" />제출 완료</span>
                    <span>{new Date(mySubmission.submitted_at).toLocaleDateString('ko-KR')}</span>
                    {mySubmission.score != null && <span className="text-blue-600 font-semibold">{mySubmission.score}점</span>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - 관리자 수정/삭제 */}
          {isAdmin && !isEditing && (
            <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />삭제
              </button>
              <button onClick={enterEdit}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                <Pen className="w-3.5 h-3.5" /> 수정
              </button>
            </div>
          )}

          {isAdmin && isEditing && (
            <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                취소
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}저장
              </button>
            </div>
          )}

          {/* Footer - 수강생 */}
          {!isAdmin && !submissionEditMode && !mySubmission && (
            <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => { setTextContent(''); setSubmissionEditMode(true) }}
                className="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />과제 제출
              </button>
            </div>
          )}

          {!isAdmin && submissionEditMode && (
            <div className="flex-shrink-0 px-6 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button onClick={() => setSubmissionEditMode(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                취소
              </button>
              <button onClick={handleSubmitText} disabled={!textContent.trim()}
                className="bg-violet-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
                <Send className="w-3.5 h-3.5" />제출
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
