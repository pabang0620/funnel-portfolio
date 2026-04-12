import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin } from '../lib/api'

const UserContext = createContext()

// 포트폴리오 데모용 mock 유저 (항상 로그인 상태)
const DEMO_USER = {
  id: 1,
  email: 'admin@funnelmance.com',
  name: '관리자',
  team: '운영팀',
  status: 'approved',
  admin: true,
  created_at: '2025-01-01T00:00:00Z'
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEMO_USER.email) // email (ID)
  const [currentUserInfo, setCurrentUserInfo] = useState(DEMO_USER) // 전체 사용자 정보
  const [isAdmin, setIsAdmin] = useState(DEMO_USER.admin)
  const [selectedUser, setSelectedUser] = useState(null)

  // 로그인 시 사용자 정보 설정
  const login = async (email, password) => {
    try {
      // 백엔드 API 호출
      const { access_token, token_type, user } = await apiLogin(email, password)

      // 상태 설정
      setCurrentUser(user.email)
      setCurrentUserInfo(user)
      setIsAdmin(user.admin)
      setSelectedUser(user.admin ? null : user.email)

      // localStorage에 저장
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('token_type', token_type)
      localStorage.setItem('currentUser', user.email)
      localStorage.setItem('isAdmin', user.admin.toString())
      localStorage.setItem('currentUserInfo', JSON.stringify(user))
    } catch (error) {
      // 에러 메시지 재전송
      throw error
    }
  }

  // 로그아웃
  const logout = () => {
    setCurrentUser(null)
    setCurrentUserInfo(null)
    setIsAdmin(false)
    setSelectedUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentUserInfo')
    localStorage.removeItem('isAdmin')
  }

  // 컴포넌트 마운트 시 로컬 스토리지에서 복원 (없으면 mock 유저 유지)
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('currentUserInfo')

    if (savedUserInfo) {
      try {
        const user = JSON.parse(savedUserInfo)
        setCurrentUser(user.email)
        setCurrentUserInfo(user)
        setIsAdmin(user.admin)
        setSelectedUser(user.admin ? null : user.email)
      } catch (error) {
        // 파싱 실패 시 mock 유저 유지
      }
    }
    // localStorage에 저장된 값이 없으면 초기 mock 유저 상태 유지
  }, [])

  // admin이 유저를 선택할 때
  const selectUser = (email) => {
    if (isAdmin) {
      setSelectedUser(email)
    }
  }

  const value = {
    currentUser,
    currentUserInfo,
    isAdmin,
    selectedUser,
    login,
    logout,
    selectUser
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
