import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Save, Loader2, X, BookOpen, Tag, User } from 'lucide-react'
import { mockService } from '@/data/funnel-edu/mockService'
import InstructorSearchInput from './components/InstructorSearchInput'
import type { Instructor } from './components/InstructorSearchInput'
import RichTextEditor from './components/RichTextEditor'

export default function CurriculumCreate() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [typeTags, setTypeTags] = useState<string[]>([])
  const [typeInput, setTypeInput] = useState('')
  const [description, setDescription] = useState('')
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const typeInputRef = useRef<HTMLInputElement>(null)

  function handleTypeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = typeInput.trim()
      if (val && !typeTags.includes(val)) {
        setTypeTags(prev => [...prev, val])
      }
      setTypeInput('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('커리큘럼명을 입력하세요.')
      return
    }
    setLoading(true)
    setError('')
    const newCurriculum = mockService.createCurriculum({
      name,
      type: typeTags.join(', '),
      description,
      instructors: instructors.map(i => i.id),
    })
    setLoading(false)
    navigate(`/funnel-edu/curriculums/${newCurriculum.id}`)
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-baseline gap-2 flex-1">
            <h1 className="text-xl font-bold text-gray-900">새 커리큘럼 만들기</h1>
            <span className="text-xs text-gray-500">커리큘럼 기본 정보를 입력하세요</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-8 py-8 flex gap-6 items-start max-w-7xl mx-auto">
          <div className="flex-1 min-w-0 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                커리큘럼 기본 정보
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-4 pl-3">
                  <label className="w-24 text-sm font-medium text-gray-500 flex-shrink-0 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />커리큘럼명 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="커리큘럼명을 입력하세요"
                      className="w-full py-1 text-sm font-semibold focus:outline-none bg-transparent placeholder-gray-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-3">
                  <label className="w-24 text-sm font-medium text-gray-500 flex-shrink-0 flex items-center gap-1">
                    <Tag className="w-3 h-3" />종류
                  </label>
                  <div className="flex-1">
                    <div
                      className="py-1 flex flex-wrap gap-1.5 items-center cursor-text bg-transparent"
                      onClick={() => typeInputRef.current?.focus()}
                    >
                      {typeTags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setTypeTags(prev => prev.filter(t => t !== tag)) }}
                            className="hover:text-blue-900 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        ref={typeInputRef}
                        type="text"
                        value={typeInput}
                        onChange={e => setTypeInput(e.target.value)}
                        onKeyDown={handleTypeKeyDown}
                        placeholder={typeTags.length === 0 ? '예) 기술교육, 필수교육 입력 후 Enter' : ''}
                        className="outline-none text-sm text-gray-700 placeholder-gray-400 flex-1 min-w-[120px] bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-3">
                  <label className="w-24 text-sm font-medium text-gray-500 flex-shrink-0 flex items-center gap-1">
                    <User className="w-3 h-3" />강사
                  </label>
                  <div className="flex-1">
                    <InstructorSearchInput value={instructors} onChange={setInstructors} />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <RichTextEditor content={description} onChange={setDescription} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-64 flex-shrink-0 sticky top-8 space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">입력 정보</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">커리큘럼명</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {name || <span className="text-gray-300 font-normal">미입력</span>}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">커리큘럼 종류</p>
                  <div className="flex flex-wrap gap-1.5">
                    {typeTags.length > 0
                      ? typeTags.map(t => (
                          <span key={t} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t}</span>
                        ))
                      : <span className="text-gray-300 text-xs">미입력</span>
                    }
                  </div>
                </div>
                {instructors.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">강사</p>
                    <div className="flex flex-wrap gap-1.5">
                      {instructors.map(i => (
                        <span key={i.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{i.name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-xs text-red-500 px-1">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                저장
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
