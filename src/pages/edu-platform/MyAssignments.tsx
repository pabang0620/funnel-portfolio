import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { mockService } from '@/data/edu-platform/mockService'
import AssignmentModal from './components/AssignmentModal'

export default function MyAssignments() {
  const assignments = mockService.getMyAssignments() as any[]
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const grouped = assignments.reduce((acc, a) => {
    const key = a.curriculum_name ?? '미분류'
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">내 과제</h1>
      {assignments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">등록된 과제가 없습니다.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([curriculum, items]) => (
            <div key={curriculum}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{curriculum}</h2>
              <div className="space-y-2">
                {(items as any[]).map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {a.lecture_name}{a.deadline ? ` · 마감 ${a.deadline.slice(0, 10)}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.submission_id ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                          제출완료{a.submission_score != null ? ` · ${a.submission_score}점` : ''}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">미제출</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedId && (
        <AssignmentModal
          assignmentId={selectedId}
          open={!!selectedId}
          onClose={() => setSelectedId(null)}
          isAdmin={false}
        />
      )}
    </div>
  )
}
