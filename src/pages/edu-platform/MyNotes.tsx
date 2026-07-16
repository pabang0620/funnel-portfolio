import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { mockService } from '@/data/edu-platform/mockService'
import RichTextEditor from './components/RichTextEditor'

interface Note {
  lecture_id: string
  lecture_name: string
  curriculum_name: string
  content: string
  updated_at: string | null
}

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>(mockService.getNotes() as Note[])
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(
    notes.length > 0 ? notes[0].lecture_id : null
  )
  const [content, setContent] = useState(notes.length > 0 ? notes[0].content ?? '' : '')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const grouped = notes.reduce((acc, n) => {
    if (!acc[n.curriculum_name]) acc[n.curriculum_name] = []
    acc[n.curriculum_name].push(n)
    return acc
  }, {} as Record<string, Note[]>)

  const selectedNote = notes.find(n => n.lecture_id === selectedLectureId)

  function selectLecture(note: Note) {
    setSelectedLectureId(note.lecture_id)
    setContent(note.content ?? '')
    setSavedAt(note.updated_at)
  }

  function handleSave() {
    if (!selectedLectureId) return
    setSaving(true)
    const result = mockService.saveNote(selectedLectureId, content) as { updated_at: string }
    setSavedAt(result.updated_at)
    setNotes(prev => prev.map(n => n.lecture_id === selectedLectureId
      ? { ...n, content, updated_at: result.updated_at }
      : n
    ))
    setSaving(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 flex gap-6 h-full">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">내 노트</h1>
        <div className="space-y-4">
          {Object.entries(grouped).map(([curriculum, notesInGroup]) => (
            <div key={curriculum}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{curriculum}</h2>
              <div className="space-y-1">
                {notesInGroup.map(n => (
                  <button
                    key={n.lecture_id}
                    onClick={() => selectLecture(n)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedLectureId === n.lecture_id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <p className="truncate">{n.lecture_name}</p>
                    {n.updated_at && (
                      <p className="text-xs text-gray-400 mt-0.5">{n.updated_at.slice(0, 10)}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-w-0">
        {selectedNote ? (
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  {selectedNote.lecture_name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedNote.curriculum_name}</p>
              </div>
              <div className="flex items-center gap-3">
                {savedAt && (
                  <span className="text-xs text-gray-400">{savedAt.slice(0, 16).replace('T', ' ')} 저장됨</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>강의를 선택하세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
