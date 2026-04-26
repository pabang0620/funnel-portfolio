/**
 * WorkStatus 페이지에서 사용하는 상수 및 유틸 함수 정의
 */

// 검색 필드 옵션 목록
export const searchList = [
  { id: "call_history", name: "콜내역", type: "select" },
  { id: "name_or_reserver", name: "신청자or예약자 이름", type: "text" },
  { id: "phone_or_reserver", name: "신청자or예약자 번호", type: "text" },
  { id: "visit_status", name: "방문상태", type: "select" },
  { id: "advertising_company_name", name: "매체", type: "select" },
  { id: "call_memo", name: "콜 메모", type: "text" },
];

// 테이블 컬럼 목록
export const columns = [
  "최종통화날짜",
  "콜내역",
  "방문상태",
  "지점",
  "유입날짜",
  "신청자 이름",
  "전화번호",
  "매체",
  "재통화날짜",
  "예약날짜",
  "담당자",
];

// 방문하지 않은 상태 목록
export const notVisitStatus = ["노쇼", "재통화요청", "개인일정취소", "상담종료"];

// 페이지당 항목 수
export const ITEMS_PER_PAGE = 10;

// 날짜 포맷 유틸리티
export const formatDate = (isoString) => {
  if (isoString) {
    return isoString.slice(0, 16).replace("T", " ");
  }
  return "";
};

// 콜내역 상태 클래스 결정
export const getClassForCallHistory = (callHistory, isNewStatus) => {
  if (isNewStatus) return "blue-status";
  if (["노쇼", "취소요청"].includes(callHistory)) return "red-status";
  if (callHistory === "예약") return "yellow-status";
  return "";
};

// 오늘 날짜 문자열 반환
export const getTodayString = () => {
  return new Date().toISOString().slice(0, 10);
};
