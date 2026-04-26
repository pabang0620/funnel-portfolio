/**
 * 로그인 관련 API 함수들 (더미 데이터 버전)
 * 사용자 인증과 세션 관리를 담당
 */

/**
 * 사용자 로그인 API 호출
 * @param {Object} credentials - 로그인 정보
 * @param {string} credentials.username - 사용자명
 * @param {string} credentials.password - 비밀번호
 * @returns {Promise<Object>} 로그인 결과 (토큰, 사용자 정보 포함)
 */
export const loginUser = async (credentials) => {
  // 더미 데이터 반환
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          token: 'dummy-token-12345-abcdef',
          user: {
            user_id: 1,
            username: credentials.username || 'demo',
            name: '관리자',
            role: 1,
            hospital_name_id: null,
          },
        },
      })
    }, 500)
  })
}

/**
 * 사용자 로그아웃 API 호출
 * @returns {Promise<Object>} 로그아웃 결과
 */
export const logoutUser = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '로그아웃 되었습니다.',
      })
    }, 300)
  })
}
