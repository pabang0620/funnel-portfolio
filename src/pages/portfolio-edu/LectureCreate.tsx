import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save, Loader2, X } from 'lucide-react'
import { mockService } from '@/data/portfolio-edu/mockService'
import RichTextEditor from './components/RichTextEditor'

export default function LectureCreate() {
  const { curriculumId } = useParams<{ curriculumId: string }>()
  const navigate = useNavigate()

  const curriculum = curriculumId ? mockService.getCurriculumById(curriculumId) : null

  const [lectureName, setLectureName] = useState('')
  const [typeTags, setTypeTags] = useState<string[]>([])
  const [typeInput, setTypeInput] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleTypeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      const val = typeInput.trim()
      if (val && !typeTags.includes(val)) setTypeTags(prev => [...prev, val])
      setTypeInput('')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lectureName.trim()) {
      setError('강의명을 입력하세요.')
      return
    }
    if (!curriculumId) return
    setLoading(true)

    let startAt: string | undefined
    let endAt: string | undefined
    if (date && startTime) startAt = new Date(`${date}T${startTime}`).toISOString()
    if (date && endTime) endAt = new Date(`${date}T${endTime}`).toISOString()

    const newLecture = mockService.createLecture(curriculumId, {
      lecture_number: 0,
      name: lectureName,
      type: typeTags.join(', '),
      description,
      start_at: startAt,
      end_at: endAt,
      status: 'scheduled',
    })

    setLoading(false)
    navigate(`/portfolio-edu/curriculums/${curriculumId}/lectures/${newLecture.id}`)
  }

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">새 강의 만들기</h1>
            {curriculum && <p className="text-xs text-gray-400">{curriculum.name}</p>}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl mx-auto px-8 py-8 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">강의명 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={lectureName}
                onChange={e => setLectureName(e.target.value)}
                placeholder="강의명을 입력하세요"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">유형</label>
              <div className="flex flex-wrap gap-1.5 items-center border border-gray-200 rounded-lg px-3 py-2 min-h-[40px]">
                {typeTags.map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => setTypeTags(prev => prev.filter(t => t !== tag))} className="cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <input
                  value={typeInput}
                  onChange={e => setTypeInput(e.target.value)}
                  onKeyDown={handleTypeKeyDown}
                  placeholder="Enter로 추가"
                  className="outline-none text-sm placeholder-gray-400 flex-1 min-w-[100px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">날짜</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">시작 시간</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">종료 시간</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">강의 내용</label>
              <RichTextEditor content={description} onChange={setDescription} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              저장
            </button>
            <button type="button" onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">
              취소
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
