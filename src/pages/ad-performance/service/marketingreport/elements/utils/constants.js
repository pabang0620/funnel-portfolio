/**
 * 마케팅 리포트 상수 정의
 */

// 매체 목록
export const MEDIA_LIST = [
  { id: 0, name: "전체" },
  { id: 1, name: "구글" },
  { id: 2, name: "메타" },
  { id: 3, name: "틱톡" },
  { id: 4, name: "GFA" },
  { id: 5, name: "쿠팡" },
  { id: 6, name: "네이버SA" }
];

// 매체 특수 옵션 매핑 (현재 사용하지 않음)
export const MEDIA_SPECIAL_OPTIONS = {};

// 제품 목록
export const PRODUCTS = [
  "알파덴탈",
  "베타케어",
  "감마헬스",
  "델타치과",
  "엡실론임플",
  "제타메드",
];

// CustomSelect 컴포넌트용 제품 목록
export const PRODUCT_LIST = [
  { id: 0, name: "전체" },
  ...PRODUCTS.map((product, index) => ({
    id: index + 1,
    name: product,
  }))
];
