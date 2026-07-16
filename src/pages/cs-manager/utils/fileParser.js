/**
 * 파일명에서 녹음 시간을 추출합니다.
 * 형식: {prefix}_{phone}_{timestamp}.{ext}
 * 예: hunt0000001943_01034370233_20251201121524.mp3
 * 
 * @param {string} filename - 파일명
 * @returns {Object|null} - { year, month, day, hour, minute, second, timestamp } 또는 null
 */
export function extractRecordingTime(filename) {
  // 파일 확장자 제거
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // 마지막 언더바를 기준으로 분리
  const parts = nameWithoutExt.split('_')
  
  if (parts.length < 2) {
    return null
  }
  
  // 마지막 부분이 타임스탬프 (YYYYMMDDHHmmss 형식)
  const timestamp = parts[parts.length - 1]
  
  // 14자리 숫자인지 확인
  if (!/^\d{14}$/.test(timestamp)) {
    return null
  }
  
  // 년, 월, 일, 시, 분, 초 추출
  const year = timestamp.substring(0, 4)
  const month = timestamp.substring(4, 6)
  const day = timestamp.substring(6, 8)
  const hour = timestamp.substring(8, 10)
  const minute = timestamp.substring(10, 12)
  const second = timestamp.substring(12, 14)
  
  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    timestamp
  }
}


/**
 * 파일명에서 유저명을 추출합니다.
 * 형식: hunt{userid}_... 또는 user{userid}_...
 * 
 * @param {string} filename - 파일명
 * @returns {string|null} - 유저명 또는 null
 */
export function extractUsername(filename) {
  // 파일 확장자 제거
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // 첫 번째 언더바까지의 부분
  const firstPart = nameWithoutExt.split('_')[0]
  
  // hunt 또는 user 접두사 제거
  if (firstPart.startsWith('hunt')) {
    return firstPart.replace('hunt', '')
  } else if (firstPart.startsWith('user')) {
    return firstPart.replace('user', '')
  }
  
  return null
}

/**
 * 저장 경로를 생성합니다.
 * 형식: 제품명/유저명/YYYY-MM-DD/음성파일
 *
 * @param {string} productName - 제품명 (수동 선택)
 * @param {string} username - 유저명
 * @param {string} date - 날짜 (YYYY-MM-DD 형식)
 * @param {string} filename - 원본 파일명
 * @returns {string} - 저장 경로
 */
export function generateStoragePath(productName, username, date, filename) {
  return `${productName}/${username}/${date}/${filename}`
}

/**
 * 저장 경로를 생성합니다 (시간 정보 객체 사용)
 * 형식: 제품명/유저명/YYYY-MM-DD/파일명
 *
 * @param {string} productName - 제품명
 * @param {string} username - 유저명
 * @param {Object} timeInfo - extractRecordingTime의 반환값
 * @param {string} filename - 원본 파일명
 * @returns {string} - 저장 경로
 */
export function generateStoragePathFromTimeInfo(productName, username, timeInfo, filename) {
  if (!timeInfo) {
    return `${productName}/${username}/${filename}`
  }

  const date = `${timeInfo.year}-${timeInfo.month}-${timeInfo.day}`
  return `${productName}/${username}/${date}/${filename}`
}

/**
 * 파일명 유효성을 검사합니다.
 * 
 * @param {string} filename - 파일명
 * @returns {{ isValid: boolean, error?: string }} - 유효성 검사 결과
 */
export function validateFilename(filename) {
  if (!filename) {
    return { isValid: false, error: '파일명이 없습니다.' }
  }
  
  // 기본 파일명 패턴 검사
  const pattern = /^(hunt|user)[0-9]+_[0-9]+_[0-9]{14}\.(mp3|wav|m4a)$/i
  
  if (!pattern.test(filename)) {
    return { 
      isValid: false, 
      error: '파일명 형식이 올바르지 않습니다. (예: user1942_01023990363_20251201115057.mp3)' 
    }
  }
  
  return { isValid: true }
}