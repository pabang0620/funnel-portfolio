/**
 * 간단한 인증 관리 라이브러리
 */

// 현재 로그인된 사용자 정보
let currentUser = null

/**
 * 로그인 처리
 * @param {string} username - 사용자명
 * @param {string} password - 비밀번호 (현재는 단순 검증)
 * @returns {Object} - { success: boolean, user?: Object, error?: string }
 */
export function login(username, password) {
  // 간단한 하드코딩된 인증
  const users = [
    { username: 'admin', password: 'admin123', role: 'admin', name: '관리자' },
    { username: 'user1942', password: 'user123', role: 'user', name: '사용자 1942' },
    { username: 'user1943', password: 'user123', role: 'user', name: '사용자 1943' }
  ]

  const user = users.find(u => u.username === username && u.password === password)

  if (user) {
    currentUser = { ...user }
    delete currentUser.password // 비밀번호는 제거

    // 로컬 스토리지에 저장
    localStorage.setItem('currentUser', JSON.stringify(currentUser))

    return { success: true, user: currentUser }
  } else {
    return { success: false, error: '사용자명 또는 비밀번호가 잘못되었습니다' }
  }
}

/**
 * 로그아웃 처리
 */
export function logout() {
  currentUser = null
  localStorage.removeItem('currentUser')
}

/**
 * 현재 로그인된 사용자 정보 반환
 * @returns {Object|null} - 현재 사용자 정보 또는 null
 */
export function getCurrentUser() {
  if (currentUser) {
    return currentUser
  }

  // 로컬 스토리지에서 복원
  const saved = localStorage.getItem('currentUser')
  if (saved) {
    try {
      currentUser = JSON.parse(saved)
      return currentUser
    } catch {
      localStorage.removeItem('currentUser')
    }
  }

  return null
}

/**
 * 현재 사용자가 관리자인지 확인
 * @returns {boolean}
 */
export function isAdmin() {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

/**
 * 로그인 상태 확인
 * @returns {boolean}
 */
export function isLoggedIn() {
  return getCurrentUser() !== null
}
