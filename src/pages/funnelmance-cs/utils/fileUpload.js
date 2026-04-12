/**
 * 파일 업로드 경로 생성 유틸리티
 */

/**
 * S3 업로드 경로 생성
 * @param {string} productName - 제품명
 * @param {string} userId - 사용자 ID
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @param {string} filename - 파일명
 * @returns {string} S3 키 (전체 경로)
 */
export function generateS3Path(productName, userId, date, filename) {
  return `${productName}/${userId}/${date}/${filename}`
}

/**
 * 파일 경로 파싱
 * @param {string} path - S3 경로
 * @returns {object} 파싱된 경로 정보
 */
export function parseS3Path(path) {
  const parts = path.split('/')

  if (parts.length < 4) {
    throw new Error('Invalid S3 path format')
  }

  return {
    productName: parts[0],
    userId: parts[1],
    date: parts[2], // YYYY-MM-DD
    filename: parts.slice(3).join('/') // 파일명에 /가 있을 수 있음
  }
}

/**
 * S3 폴더 존재 확인 (더미 구현)
 * 실제로는 S3 API 호출하지만, 지금은 항상 true 반환
 * @param {string} productName
 * @returns {boolean}
 */
export function checkS3FolderExists(productName) {
  return true
}

/**
 * 파일 업로드 전 검증
 * @param {File} file
 * @param {string} productName
 * @param {string} userId
 * @param {string} date - 날짜 (YYYY-MM-DD)
 * @returns {object} 검증 결과 및 업로드 경로
 */
export function validateFileUpload(file, productName, userId, date) {
  const errors = []

  // 파일 크기 체크 (예: 100MB 제한)
  const maxSize = 100 * 1024 * 1024
  if (file.size > maxSize) {
    errors.push(`파일 크기가 너무 큽니다 (최대 ${maxSize / 1024 / 1024}MB)`)
  }

  // 파일명 체크
  if (!file.name || file.name.trim() === '') {
    errors.push('파일명이 유효하지 않습니다')
  }

  // 제품명 체크
  if (!productName) {
    errors.push('제품을 선택해주세요')
  }

  // 사용자 ID 체크
  if (!userId) {
    errors.push('로그인이 필요합니다')
  }

  // 날짜 체크
  if (!date) {
    errors.push('날짜를 선택해주세요')
  }

  // S3 경로 생성
  const s3Path = errors.length === 0
    ? generateS3Path(productName, userId, date, file.name)
    : null

  return {
    valid: errors.length === 0,
    errors,
    s3Path,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type
    }
  }
}
