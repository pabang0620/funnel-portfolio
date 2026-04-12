/**
 * 날짜 유틸리티 함수들
 */

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 * @param {Date} date - 변환할 Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * 현재 달의 첫날과 마지막날을 가져옴
 * @returns {{startDate: string, endDate: string}} 현재 달의 시작일과 종료일
 */
export const getCurrentMonthRange = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    startDate: formatDate(firstDay),
    endDate: formatDate(lastDay),
  };
};

/**
 * 3개월 전부터 현재월까지의 월 라벨 생성 + 예상매출
 * 차트용 라벨로 사용됨
 * @returns {string[]} 월 라벨 배열 (예: ["9월", "10월", "11월", "12월(진행중)", "12월 예상"])
 */
export const generateMonthLabels = () => {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  const months = [];

  // 3개월 전부터 현재월까지
  for (let i = 3; i >= 1; i--) {
    const targetDate = new Date(currentYear, currentMonth - i, 1);
    const month = targetDate.getMonth() + 1;
    months.push(`${month}월`);
  }

  // 현재월 (진행중)
  months.push(`${currentMonth + 1}월(진행중)`);

  // 예상매출
  months.push(`${currentMonth + 1}월 예상`);

  return months;
};

/**
 * 선택된 날짜 범위에 따라 날짜 목록 생성 (YY.MM.DD 형식)
 * @param {{startDate: string, endDate: string}} customDateRange - 날짜 범위 객체
 * @returns {string[]} YY.MM.DD 형식의 날짜 문자열 배열
 */
export const generateDates = (customDateRange) => {
  const dates = [];

  // 선택된 날짜 범위에 따라 생성
  const startDate = new Date(customDateRange.startDate);
  const endDate = new Date(customDateRange.endDate);

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    const formatted = `${String(year).slice(2)}.${String(month).padStart(
      2,
      "0"
    )}.${String(day).padStart(2, "0")}`;
    dates.push(formatted);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
