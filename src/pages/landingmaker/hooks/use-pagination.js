/**
 * 페이지네이션 로직을 위한 커스텀 훅
 * 현재 페이지, 총 페이지 수를 기반으로 표시할 페이지 번호들과 생략 표시(ellipsis) 상태를 계산
 * LandingDataTable에서 테이블 하단의 페이지네이션 UI를 위해 사용
 */

/**
 * 페이지네이션 상태를 계산하는 훅
 * @param {Object} props - 페이지네이션 설정
 * @param {number} props.currentPage - 현재 페이지 번호 (1부터 시작)
 * @param {number} props.totalPages - 전체 페이지 수
 * @param {number} props.paginationItemsToDisplay - 한 번에 표시할 페이지 버튼 개수
 * @returns {Object} 페이지네이션 상태 객체
 * @returns {number[]} return.pages - 표시할 페이지 번호 배열
 * @returns {boolean} return.showLeftEllipsis - 왼쪽 생략 표시(...) 여부
 * @returns {boolean} return.showRightEllipsis - 오른쪽 생략 표시(...) 여부
 */
export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay
}) {
  function calculatePaginationRange() {
    if (totalPages <= paginationItemsToDisplay) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 현재 페이지가 속한 블록 계산 (예: 페이지 1-10은 블록 0, 11-20은 블록 1)
    const currentBlock = Math.floor((currentPage - 1) / paginationItemsToDisplay)

    // 블록의 시작과 끝 페이지 계산
    const blockStart = currentBlock * paginationItemsToDisplay + 1
    const blockEnd = Math.min((currentBlock + 1) * paginationItemsToDisplay, totalPages)

    return Array.from({ length: blockEnd - blockStart + 1 }, (_, i) => blockStart + i)
  }

  const pages = calculatePaginationRange()

  // Determine ellipsis display based on the actual pages shown
  const showLeftEllipsis = pages.length > 0 && pages[0] > 1

  const showRightEllipsis = pages.length > 0 && pages[pages.length - 1] < totalPages

  return {
    pages,
    showLeftEllipsis,
    showRightEllipsis
  }
}
