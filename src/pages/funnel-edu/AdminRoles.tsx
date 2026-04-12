import { useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { mockService } from '@/data/funnel-edu/mockService'

interface Admin {
  id: string
  employee_id: string
  name: string
  email: string
  team: string
  part: string
  created_at: string
}

export default function AdminRoles() {
  const [admins, setAdmins] = useState<Admin[]>(mockService.getAdminRoles() as Admin[])
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const allUsers = mockService.getUsers().filter(u => !admins.find(a => a.employee_id === u.id))
  const filteredUsers = allUsers.filter(u =>
    !search || u.name.includes(search) || u.email.includes(search)
  )

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAdd() {
    const added = mockService.addAdminRole(Array.from(selected)) as Admin[]
    setAdmins(prev => [...prev, ...added])
    setShowModal(false)
    setSelected(new Set())
    setSearch('')
  }

  function handleRemove(employeeId: string) {
    if (!confirm('관리자 권한을 제거하시겠습니까?')) return
    mockService.removeAdminRole(employeeId)
    setAdmins(prev => prev.filter(a => a.employee_id !== employeeId))
  }

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">권한 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">관리자 권한을 가진 사용자를 관리합니다</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 관리자 추가
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">이름</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">이메일</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">팀</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">파트</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">추가일</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{admin.name}</td>
                <td className="px-6 py-4 text-gray-500">{admin.email}</td>
                <td className="px-6 py-4 text-gray-500">{admin.team}</td>
                <td className="px-6 py-4 text-gray-500">{admin.part}</td>
                <td className="px-6 py-4 text-gray-400">{admin.created_at.slice(0, 10)}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleRemove(admin.employee_id)}
                    className="text-gray-300 hover:text-red-500 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">관리자 추가</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="이름 또는 이메일 검색"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">추가할 수 있는 사용자가 없습니다</p>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => toggleSelect(u.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer ${selected.has(u.id) ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selected.has(u.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {selected.has(u.id) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12"><path d="M10 3L5 8.5 2 5.5l-1 1L5 10.5 11 4l-1-1z"/></svg>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email} · {u.team}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">{selected.size}명 선택</span>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">
                  취소
                </button>
                <button onClick={handleAdd} disabled={selected.size === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
