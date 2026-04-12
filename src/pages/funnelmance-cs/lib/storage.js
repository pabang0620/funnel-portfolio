/**
 * 로컬 스토리지 기반 파일 관리
 */

/**
 * 업로드된 파일 목록을 로컬 스토리지에서 가져옵니다
 * @returns {Array} 파일 목록
 */
export function getUploadedFiles() {
  try {
    const files = localStorage.getItem('uploadedFiles')
    return files ? JSON.parse(files) : []
  } catch (e) {
    console.error('파일 목록 로드 실패:', e)
    return []
  }
}

/**
 * 파일 정보를 로컬 스토리지에 저장합니다
 * @param {Object} fileInfo - 파일 정보
 * @param {string} fileInfo.name - 파일명
 * @param {string} fileInfo.path - 저장 경로
 * @param {string} fileInfo.product - 제품명
 * @param {string} fileInfo.username - 유저명
 * @param {number} fileInfo.size - 파일 크기
 * @param {string} fileInfo.uploadedAt - 업로드 시간
 * @param {Object} fileInfo.timeInfo - 녹음 시간 정보
 */
export function saveFileInfo(fileInfo) {
  try {
    const files = getUploadedFiles()
    const newFile = {
      id: Date.now().toString(),
      ...fileInfo,
      uploadedAt: new Date().toISOString()
    }

    files.push(newFile)
    localStorage.setItem('uploadedFiles', JSON.stringify(files))

    return newFile
  } catch (e) {
    console.error('파일 정보 저장 실패:', e)
    throw new Error('파일 정보 저장에 실패했습니다')
  }
}

/**
 * 사용자별 파일 목록을 가져옵니다
 * @param {string} username - 사용자명 (관리자인 경우 null이면 모든 파일)
 * @param {boolean} isAdmin - 관리자 여부
 * @returns {Array} 필터링된 파일 목록
 */
export function getUserFiles(username, isAdmin = false) {
  const files = getUploadedFiles()

  if (isAdmin && !username) {
    return files // 관리자는 모든 파일 볼 수 있음
  }

  return files.filter(file => file.username === username)
}

/**
 * 파일을 삭제합니다
 * @param {string} fileId - 파일 ID
 * @param {string} currentUser - 현재 사용자명
 * @param {boolean} isAdmin - 관리자 여부
 * @returns {boolean} 성공 여부
 */
export function deleteFile(fileId, currentUser, isAdmin = false) {
  try {
    const files = getUploadedFiles()
    const fileIndex = files.findIndex(file => file.id === fileId)

    if (fileIndex === -1) {
      throw new Error('파일을 찾을 수 없습니다')
    }

    const file = files[fileIndex]

    // 권한 확인 (관리자가 아닌 경우 본인 파일만 삭제 가능)
    if (!isAdmin && file.username !== currentUser) {
      throw new Error('파일 삭제 권한이 없습니다')
    }

    files.splice(fileIndex, 1)
    localStorage.setItem('uploadedFiles', JSON.stringify(files))

    return true
  } catch (e) {
    console.error('파일 삭제 실패:', e)
    throw e
  }
}

/**
 * 제품별 파일 통계를 가져옵니다
 * @param {string} username - 사용자명 (관리자인 경우 null이면 전체)
 * @param {boolean} isAdmin - 관리자 여부
 * @returns {Object} 제품별 통계
 */
export function getFileStats(username, isAdmin = false) {
  const files = getUserFiles(username, isAdmin)

  const stats = {}

  files.forEach(file => {
    if (!stats[file.product]) {
      stats[file.product] = {
        count: 0,
        totalSize: 0,
        users: new Set()
      }
    }

    stats[file.product].count++
    stats[file.product].totalSize += file.size || 0
    stats[file.product].users.add(file.username)
  })

  // Set을 배열로 변환
  Object.keys(stats).forEach(product => {
    stats[product].users = Array.from(stats[product].users)
  })

  return stats
}
