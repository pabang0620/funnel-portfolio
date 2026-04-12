// 제품 목록
export const PRODUCTS = [
  "알파덴탈",
  "베타케어",
  "감마헬스",
  "델타치과",
  "엡실론임플",
  "제타메드",
];

// CustomSelect 컴포넌트용 제품 목록 ("전체" 옵션 포함)
export const PRODUCT_LIST = [
  { id: 0, name: "전체" },
  ...PRODUCTS.map((product, index) => ({
    id: index + 1,
    name: product,
  }))
];

// 판매처 목록
export const SALES_CHANNEL_LIST = [
  { id: 0, name: "간소화" },
  { id: -1, name: "전체" },
  { id: 1, name: "카페24" },
  { id: 2, name: "쿠팡" },
  { id: 3, name: "스마트스토어" },
  { id: 4, name: "ARS" }
];

// 판매처 특수 옵션 매핑
export const SALES_CHANNEL_SPECIAL_OPTIONS = {
  "간소화": ["카페24", "쿠팡"],
  "전체": ["카페24", "쿠팡", "스마트스토어", "ARS"]
};

// 판매처 목록
export const MEDIA_LIST = [
  { id: 0, name: "전체" },
  { id: 1, name: "구글" },
  { id: 2, name: "메타" },
  { id: 3, name: "틱톡" },
  { id: 4, name: "GFA" },
  { id: 5, name: "쿠팡" },
  { id: 6, name: "네이버SA" }
];

// 판매처 특수 옵션 매핑
export const MEDIA_SPECIAL_OPTIONS = {
  "전체": ["구글", "메타", "틱톡", "GFA", "쿠팡", "네이버SA"]
};
