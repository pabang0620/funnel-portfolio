/**
 * 날짜 관련 유틸리티 함수들
 */

/**
 * 동적 주차 레이블 생성 함수
 * @param {string} weekStartDay - 주 시작 기준 ("1일 시작" 또는 "월요일 시작")
 * @param {Object} customDateRange - 사용자 지정 날짜 범위 {startDate, endDate}
 * @returns {string[]} 주차 라벨 배열 (예: ["11월 1주차", "11월 2주차", ...])
 */
export const generateWeekLabels = (weekStartDay, customDateRange) => {
  let startDate, endDate;

  // customDateRange가 있으면 해당 날짜 사용, 없으면 현재 날짜 사용
  if (customDateRange && customDateRange.startDate) {
    startDate = new Date(customDateRange.startDate);
    endDate = new Date(customDateRange.endDate);
  } else {
    const today = new Date();
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  const labels = [];
  const currentDate = new Date(startDate);

  // 선택된 기간의 모든 월을 순회
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    let maxWeekNumber;
    if (weekStartDay === "1일 시작") {
      // 1일~7일 = 1주차, 8일~14일 = 2주차 방식
      maxWeekNumber = Math.ceil(lastDayOfMonth / 7);
    } else {
      // 월요 시작: 기존 방식 (요일 기준)
      const monthStart = new Date(year, month - 1, 1);
      const monthStartDay = monthStart.getDay();
      const adjustedStartDay = monthStartDay === 0 ? 6 : monthStartDay - 1;
      maxWeekNumber = Math.ceil((lastDayOfMonth + adjustedStartDay) / 7);
    }

    // 해당 월의 모든 주 추가
    for (let i = 1; i <= maxWeekNumber; i++) {
      labels.push(`${month}월 ${i}주`);
    }

    // 다음 달로 이동
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);
  }

  return labels;
};
