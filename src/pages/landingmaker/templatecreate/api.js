/**
 * 템플릿 생성 관련 API 함수들 (더미 데이터 버전)
 * 랜딩 페이지 생성, 수정, 조회 및 에셋 업로드 기능 제공
 */

// 더미 도메인 목록
const dummyDomains = ['example1.com', 'example2.com', 'example3.com', 'demo-site.kr']

// 더미 태그 설정
const dummyTagSettings = {
  'example1.com': {
    googleTagId: 'GTM-XXXXXX1',
    conversionCode: 'AW-123456789/abcdefg',
    nickname: '메인 사이트',
  },
  'example2.com': {
    googleTagId: 'GTM-XXXXXX2',
    conversionCode: 'AW-987654321/hijklmn',
    nickname: '서브 사이트',
  },
  'example3.com': {
    googleTagId: 'GTM-XXXXXX3',
    conversionCode: 'AW-111222333/opqrstu',
    nickname: '이벤트 사이트',
  },
}

// 더미 랜딩 페이지 상세 정보
const dummyLandingDetail = {
  adNumber: 'AD-001',
  title: '여름 프로모션 랜딩페이지',
  domainUrl: 'example1.com',
  templateType: '1',
  status: 'published',
  content: {
    headline: '특별 할인 프로모션',
    subheadline: '지금 바로 신청하세요!',
    description: '최대 50% 할인 혜택을 놓치지 마세요.',
    buttonText: '무료 상담 신청',
    buttonColor: '#FF5722',
  },
  images: {
    main: 'https://picsum.photos/800/600',
    sub: 'https://picsum.photos/400/300',
  },
  formFields: ['name', 'phone', 'email'],
  privacyPolicy: '개인정보 수집 및 이용에 동의합니다.',
  footer: '(주)랜딩메이커 | 대표: 홍길동 | 사업자번호: 123-45-67890',
  createdAt: '2025-01-20T10:00:00Z',
  updatedAt: '2025-01-22T15:30:00Z',
}

// 더미 에셋 목록
const dummyAssets = {
  postBtn: [
    { name: 'button1.png', url: 'https://picsum.photos/200/50' },
    { name: 'button2.png', url: 'https://picsum.photos/200/50' },
    { name: 'button3.png', url: 'https://picsum.photos/200/50' },
  ],
  footer: [
    { name: 'footer1.png', url: 'https://picsum.photos/800/100' },
    { name: 'footer2.png', url: 'https://picsum.photos/800/100' },
  ],
  background: [
    { name: 'bg1.jpg', url: 'https://picsum.photos/1920/1080' },
    { name: 'bg2.jpg', url: 'https://picsum.photos/1920/1080' },
  ],
}

// 더미 최근 랜딩 목록
const dummyRecentLandings = {
  'example1.com': [
    { adNumber: 'AD-001', title: '여름 프로모션', createdAt: '2025-01-20' },
    { adNumber: 'AD-003', title: '신규 서비스 런칭', createdAt: '2025-01-15' },
  ],
  'example2.com': [
    { adNumber: 'AD-002', title: '신규 서비스 소개', createdAt: '2025-01-18' },
    { adNumber: 'AD-005', title: '가을 세일', createdAt: '2025-01-22' },
  ],
  'example3.com': [
    { adNumber: 'AD-004', title: '제품 상세', createdAt: '2025-01-10' },
  ],
}

/**
 * 도메인별 태그 설정 조회
 * @returns {Promise<Object>} 도메인별 태그 설정 정보
 */
export const getTagSettings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: dummyTagSettings,
      })
    }, 400)
  })
}

/**
 * 새 랜딩 페이지 생성
 * @param {FormData} formData - 랜딩 페이지 생성 데이터
 * @returns {Promise<Object>} 생성된 랜딩 페이지 정보
 */
export const createLanding = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAdNumber = `AD-${String(Date.now()).slice(-6)}`
      resolve({
        success: true,
        data: {
          adNumber: newAdNumber,
          message: '랜딩 페이지가 생성되었습니다.',
        },
      })
    }, 800)
  })
}

/**
 * 기존 랜딩 페이지 수정
 * @param {string} adNumber - 수정할 랜딩 페이지의 광고 번호
 * @param {FormData} formData - 수정할 랜딩 페이지 데이터
 * @returns {Promise<Object>} 수정 결과
 */
export const updateLanding = async (adNumber, formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          adNumber,
          message: '랜딩 페이지가 수정되었습니다.',
        },
      })
    }, 600)
  })
}

/**
 * 특정 랜딩 페이지 상세 정보 조회
 * @param {string} adNumber - 조회할 랜딩 페이지의 광고 번호
 * @returns {Promise<Object>} 랜딩 페이지 상세 정보
 */
export const getLanding = async (adNumber) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          ...dummyLandingDetail,
          adNumber,
        },
      })
    }, 500)
  })
}

/**
 * 도메인별 에셋 파일 목록 조회
 * @param {string} domain - 도메인명
 * @param {string} type - 에셋 타입 (postBtn, footer 등)
 * @returns {Promise<Object>} 에셋 파일 목록
 */
export const uploadAsset = async (domain, type) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: dummyAssets[type] || [],
      })
    }, 400)
  })
}

/**
 * 사용 가능한 도메인 목록 조회
 * @returns {Promise<Object>} 도메인 목록 데이터
 */
export const getDomainList = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: dummyDomains,
      })
    }, 300)
  })
}

/**
 * 도메인별 최신 랜딩 정보 5개 조회
 * @returns {Promise<Object>} 도메인별 최신 랜딩 정보
 */
export const getRecentLandingsByDomain = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: dummyRecentLandings,
      })
    }, 400)
  })
}
