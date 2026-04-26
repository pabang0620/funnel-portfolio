import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ShieldCheck,
  UserCircle,
  ChevronDown,
  UserRound,
  FolderOpen,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth'

const commonNavItems = [
  { to: '/portfolio-edu/curriculums', icon: BookOpen, label: '커리큘럼' },
  { to: '/portfolio-edu/resources', icon: FolderOpen, label: '교육자료실' },
]

const adminNavItems = [
  { to: '/portfolio-edu/students', icon: Users, label: '수강생 관리' },
  { to: '/portfolio-edu/admin-roles', icon: ShieldCheck, label: '권한 관리' },
]

const studentNavItems = [
  { to: '/portfolio-edu/my-assignments', icon: UserRound, label: '내 과제' },
]

export default function AdminLayout() {
  const { user, viewAsStudent, toggleViewAsStudent } = useAuthStore()
  const isAdmin = user?.is_admin ?? false
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [navHovered, setNavHovered] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const allItems = [
    ...(isAdmin && !viewAsStudent ? [{ to: '/portfolio-edu/dashboard', icon: LayoutDashboard, label: '대시보드' }] : []),
    ...commonNavItems,
    ...(isAdmin && !viewAsStudent ? adminNavItems : studentNavItems),
  ]

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 h-14 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto h-full flex items-center px-8">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Portfolio Edu</span>
          </div>

          <div className="ml-auto relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <UserCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                </div>
                <div className="px-4 py-2.5 text-xs text-gray-400 italic">
                  데모 버전 — 로그아웃 비활성화
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-[#f9fafb]">
        <Outlet />
      </main>

      {/* 왼쪽 중앙 고정 네비게이션 */}
      <div
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50"
        onMouseEnter={() => setNavHovered(true)}
        onMouseLeave={() => setNavHovered(false)}
      >
        <div className={`bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden py-2 transition-all duration-250 ease-in-out ${navHovered ? 'w-44' : 'w-12'}`}>
          {allItems.map((item, idx) => {
            const mainCount = (isAdmin && !viewAsStudent ? 1 : 0) + commonNavItems.length
            const adminSectionStart = isAdmin && !viewAsStudent && idx === mainCount
            const studentSectionStart = (!isAdmin || viewAsStudent) && idx === mainCount
            const showDivider = adminSectionStart || studentSectionStart
            return (
              <div key={item.to}>
                {showDivider && <div className="border-t border-gray-100 mx-3 my-1" />}
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center pl-4 py-3 text-sm transition-all duration-200 whitespace-nowrap ${
                      isActive ? 'text-gray-900 font-medium bg-gray-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className={`transition-all duration-200 overflow-hidden ${navHovered ? 'opacity-100 w-auto ml-2.5' : 'opacity-0 w-0 ml-0'}`}>
                    {item.label}
                  </span>
                </NavLink>
              </div>
            )
          })}
        </div>
      </div>

      {/* 수강생 모드 토글 */}
      {isAdmin && (
        <div
          onClick={toggleViewAsStudent}
          className="fixed left-4 bottom-6 z-50 bg-white border border-gray-200 rounded-xl shadow-md px-3 py-2.5 cursor-pointer hover:border-gray-300 transition-all select-none"
        >
          <div className="flex items-center gap-2.5">
            <UserRound className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${viewAsStudent ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`text-xs font-medium transition-colors ${viewAsStudent ? 'text-blue-600' : 'text-gray-500'}`}>
              {viewAsStudent ? '수강생 모드' : '관리자 모드'}
            </span>
            <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${viewAsStudent ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${viewAsStudent ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
