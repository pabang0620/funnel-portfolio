/**
 * 발행 완료 관련 API 함수들 (더미 데이터 버전)
 * 랜딩 페이지 발행 후 결과 정보 조회 및 관리
 */

/**
 * 발행된 랜딩 페이지의 상세 정보 조회
 * @param {string} adNumber - 조회할 랜딩 페이지의 광고 번호
 * @returns {Promise<Object>} 발행 정보 데이터
 */
export const getPublishInfo = async (adNumber) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          adNumber,
          url: `https://example1.com/landing/${adNumber}`,
          status: 'published',
          publishedAt: new Date().toISOString(),
          analytics: {
            googleTagId: 'GTM-XXXXXX1',
            conversionCode: 'AW-123456789/abcdefg',
            isConnected: true,
          },
          preview: {
            title: '여름 프로모션 랜딩페이지',
            thumbnail: 'https://picsum.photos/400/300',
          },
        },
      })
    }, 500)
  })
}
