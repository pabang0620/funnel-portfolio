/**
 * 도메인 관리 관련 API 함수들 (더미 데이터 버전)
 * 도메인별 구글 태그 설정, 전환 코드 관리 및 도메인 목록 관리
 */

// 더미 태그 설정 데이터
const dummyTagSettings = {
  'example1.com': {
    googleTagId: 'GTM-XXXXXX1',
    conversionCode: 'AW-123456789/abcdefg',
    googleTagId2: '',
    conversionCode2: '',
    googleTagId3: '',
    conversionCode3: '',
    accountName: '메인 계정',
    nickname: '메인 사이트',
  },
  'example2.com': {
    googleTagId: 'GTM-XXXXXX2',
    conversionCode: 'AW-987654321/hijklmn',
    googleTagId2: 'GTM-YYYYYY2',
    conversionCode2: 'AW-222222222/xyz',
    googleTagId3: '',
    conversionCode3: '',
    accountName: '서브 계정',
    nickname: '서브 사이트',
  },
  'example3.com': {
    googleTagId: 'GTM-XXXXXX3',
    conversionCode: 'AW-111222333/opqrstu',
    googleTagId2: '',
    conversionCode2: '',
    googleTagId3: '',
    conversionCode3: '',
    accountName: '이벤트 계정',
    nickname: '이벤트 사이트',
  },
  'demo-site.kr': {
    googleTagId: 'GTM-DEMO123',
    conversionCode: 'AW-555666777/demo',
    googleTagId2: '',
    conversionCode2: '',
    googleTagId3: '',
    conversionCode3: '',
    accountName: '데모 계정',
    nickname: '데모 사이트',
  },
}

// 더미 도메인 목록
const dummyDomains = ['example1.com', 'example2.com', 'example3.com', 'demo-site.kr']

/**
 * 모든 도메인의 태그 설정 조회
 * @returns {Promise<Object>} 도메인별 태그 설정 데이터
 */
export const getTagSettings = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: dummyTagSettings,
      })
    }, 500)
  })
}

/**
 * 도메인별 태그 설정 저장 (신규 생성 또는 수정)
 * @param {string} domainUrl - 도메인 URL
 * @param {Object} settings - 저장할 태그 설정
 * @param {boolean} isNew - 신규 생성 여부
 * @returns {Promise<Object>} 저장 결과
 */
export const saveTagSettings = async (domainUrl, settings, isNew = false) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: isNew
          ? `도메인 ${domainUrl}이 추가되었습니다.`
          : `도메인 ${domainUrl}의 설정이 저장되었습니다.`,
        data: {
          domainUrl,
          ...settings,
        },
      })
    }, 500)
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
