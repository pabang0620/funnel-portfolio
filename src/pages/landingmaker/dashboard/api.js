/**
 * 대시보드 관련 API 함수들 (더미 데이터 버전)
 * 랜딩 페이지 목록 조회, 삭제 및 대시보드 데이터 관리
 */

// 더미 랜딩 페이지 데이터
const dummyLandings = [
  {
    id: 1,
    adNumber: 'AD-001',
    title: '여름 프로모션 랜딩페이지',
    domainUrl: 'example1.com',
    status: 'published',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-22T15:30:00Z',
    views: 1250,
    conversions: 45,
  },
  {
    id: 2,
    adNumber: 'AD-002',
    title: '신규 서비스 소개',
    domainUrl: 'example2.com',
    status: 'draft',
    createdAt: '2025-01-18T09:00:00Z',
    updatedAt: '2025-01-19T11:20:00Z',
    views: 0,
    conversions: 0,
  },
  {
    id: 3,
    adNumber: 'AD-003',
    title: '신규 서비스 런칭 이벤트',
    domainUrl: 'example1.com',
    status: 'published',
    createdAt: '2025-01-15T14:00:00Z',
    updatedAt: '2025-01-21T09:45:00Z',
    views: 3420,
    conversions: 128,
  },
  {
    id: 4,
    adNumber: 'AD-004',
    title: '제품 상세 페이지',
    domainUrl: 'example3.com',
    status: 'published',
    createdAt: '2025-01-10T08:30:00Z',
    updatedAt: '2025-01-20T16:00:00Z',
    views: 890,
    conversions: 32,
  },
  {
    id: 5,
    adNumber: 'AD-005',
    title: '가을 세일 프로모션',
    domainUrl: 'example2.com',
    status: 'pending',
    createdAt: '2025-01-22T11:00:00Z',
    updatedAt: '2025-01-22T11:00:00Z',
    views: 0,
    conversions: 0,
  },
]

/**
 * 모든 랜딩 페이지 목록 조회
 * @returns {Promise<Object>} 랜딩 페이지 목록 데이터
 */
export const getAllLandings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: dummyLandings,
        total: dummyLandings.length,
      })
    }, 500)
  })
}

/**
 * 랜딩 페이지 삭제
 * @param {string} adNumber - 삭제할 랜딩 페이지의 광고 번호
 * @returns {Promise<Object>} 삭제 결과
 */
export const deleteLanding = async (adNumber) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `랜딩 페이지 ${adNumber}가 삭제되었습니다.`,
      })
    }, 300)
  })
}

/**
 * 도메인별 일괄 수정
 * @param {string} domainUrl - 수정할 도메인 URL
 * @param {Object} updates - 업데이트할 필드들
 * @returns {Promise<Object>} 업데이트 결과
 */
export const bulkUpdateByDomain = async (domainUrl, updates, userId = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `도메인 ${domainUrl}의 랜딩 페이지들이 업데이트되었습니다.`,
        updatedCount: 3,
      })
    }, 500)
  })
}

/**
 * 특정 도메인의 랜딩 페이지 목록 조회
 * @param {string} domainUrl - 조회할 도메인 URL
 * @returns {Promise<Object>} 해당 도메인의 랜딩 페이지 목록
 */
export const getLandingsByDomain = async (domainUrl) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = dummyLandings.filter((l) => l.domainUrl === domainUrl)
      resolve({
        success: true,
        data: filtered,
        total: filtered.length,
      })
    }, 400)
  })
}

/**
 * 도메인별 버튼 일괄수정 (템플릿 단계별)
 * @param {string} domainUrl - 수정할 도메인 URL
 * @param {string} stage - 템플릿 단계 ('1' | '23')
 * @param {Object} buttonSettings - 버튼 설정
 * @returns {Promise<Object>} 업데이트 결과
 */
export const bulkUpdateButtonsByDomain = async (domainUrl, stage, buttonSettings, userId = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `도메인 ${domainUrl}의 버튼들이 업데이트되었습니다.`,
        updatedCount: 5,
      })
    }, 500)
  })
}

/**
 * 대시보드 통계 데이터 조회
 * @returns {Promise<Object>} 대시보드 통계 정보
 */
export const fetchDashboardData = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          totalLandings: 25,
          publishedLandings: 18,
          draftLandings: 5,
          pendingLandings: 2,
          totalViews: 15680,
          totalConversions: 523,
          conversionRate: 3.33,
          recentLandings: dummyLandings.slice(0, 3),
        },
      })
    }, 600)
  })
}
