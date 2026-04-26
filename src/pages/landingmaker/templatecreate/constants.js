// 2단계 이상 템플릿용 하드코딩된 버튼 세트
export const STATIC_BUTTON_SETS = [
  // Blue - 2 sets
  {
    key: "blue-1",
    color: "blue",
    num: "1",
    label: "Blue-1",
    keepBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/keepBtn1.png",
    postBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/postBtn1.png",
  },
  {
    key: "blue-2",
    color: "blue",
    num: "2",
    label: "Blue-2",
    keepBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/keepBtn2.png",
    postBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/blue/postBtn2.png",
  },
  // Green - 1 set
  {
    key: "green-1",
    color: "green",
    num: "1",
    label: "Green-1",
    keepBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/green/keepBtn1.png",
    postBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/green/postBtn1.png",
  },
  // Orange - 2 sets
  {
    key: "orange-1",
    color: "orange",
    num: "1",
    label: "Orange-1",
    keepBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/keepBtn1.png",
    postBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/postBtn1.png",
  },
  {
    key: "orange-2",
    color: "orange",
    num: "2",
    label: "Orange-2",
    keepBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/keepBtn2.png",
    postBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/orange/postBtn2.png",
  },
  // Pink - 1 set
  {
    key: "pink-1",
    color: "pink",
    num: "1",
    label: "Pink-1",
    keepBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/pink/keepBtn1.png",
    postBtn:
      "https://d1k8m48tkgq306.cloudfront.net/landing-studio/button/pink/postBtn1.png",
  },
];

// 1단계 템플릿 목록
export const templates1Stage = [
  { id: 11, name: "기본형", desc: "이미지, 폼" },
  { id: 12, name: "설문형", desc: "이미지, 설문, 폼" },
  { id: 13, name: "설문2개형", desc: "이미지, 설문, 설문, 폼" },
];

// 2단계 템플릿 목록
export const templates2Stage = [
  {
    id: 21,
    name: "설문 → 폼",
    desc: "[페이지1] 이미지, 설문\n[페이지2] 이미지, 폼",
  },
  {
    id: 22,
    name: "이미지 → 설문+폼",
    desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문, 폼",
  },
  {
    id: 23,
    name: "이미지 → 폼",
    desc: "[페이지1] 이미지\n[페이지2] 이미지, 폼",
  },
  {
    id: 24,
    name: "설문2개 → 폼",
    desc: "[페이지1] 이미지, 설문, 설문\n[페이지2] 이미지, 폼",
  },
  {
    id: 25,
    name: "이미지 → 설문2개+폼",
    desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문, 설문, 폼",
  },
];

// 3단계 템플릿 목록
export const templates3Stage = [
  {
    id: 31,
    name: "이미지 → 설문 → 폼",
    desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문\n[페이지3] 이미지, 폼",
  },
  {
    id: 32,
    name: "설문 → 설문 → 폼",
    desc: "[페이지1] 이미지, 설문\n[페이지2] 이미지, 설문\n[페이지3] 이미지, 폼",
  },
  {
    id: 33,
    name: "이미지 → 설문2개 → 폼",
    desc: "[페이지1] 이미지\n[페이지2] 이미지, 설문, 설문\n[페이지3] 이미지, 폼",
  },
];

// 폼 디자인 스타일
export const formStyles = [
  {
    id: "gray",
    name: "Gray",
    features: ["회색 배경", "깔끔한 테두리"],
  },
  {
    id: "light",
    name: "Light",
    features: ["밝은 회색 배경", "부드러운 느낌"],
  },
  {
    id: "white",
    name: "White",
    features: ["흰색 배경", "그림자 효과"],
  },
  {
    id: "beige",
    name: "Beige",
    features: ["베이지 배경", "따뜻한 느낌"],
  },
  {
    id: "blue",
    name: "Blue",
    features: ["파란색 배경", "시원한 느낌"],
  },
  {
    id: "modern",
    name: "Modern",
    features: ["둥근 모서리", "그림자 효과"],
  },
  {
    id: "none",
    name: "None",
    features: ["배경 없음", "깔끔한 스타일"],
  },
  {
    id: "outline",
    name: "Outline",
    features: ["테두리 강조", "모던한 느낌"],
  },
  {
    id: "outline-square",
    name: "Square",
    features: ["각진 테두리", "깔끔한 느낌"],
  },
  {
    id: "outline-gray",
    name: "Gray Box",
    features: ["회색 배경", "테두리 강조"],
  },
];

// 기본 푸터 스타일 (단순한 디자인)
export const basicFooterStyles = [
  {
    id: "",
    name: "없음",
    features: ["푸터 표시 안함"],
    isLegacy: false,
  },
  {
    id: "footer-dark",
    name: "Dark",
    features: ["어두운 배경", "흰색 텍스트"],
    isLegacy: false,
  },
  {
    id: "footer-light",
    name: "Light",
    features: ["밝은 회색 배경", "테두리 포함"],
    isLegacy: false,
  },
  {
    id: "footer-blue",
    name: "Blue",
    features: ["파란색 배경", "흰색 텍스트"],
    isLegacy: false,
  },
  {
    id: "footer-minimal",
    name: "Minimal",
    features: ["투명 배경", "상단 라인만"],
    isLegacy: false,
  },
  {
    id: "footer-gray-border",
    name: "Gray",
    features: ["회색 테두리", "둥근 모서리"],
    isLegacy: false,
  },
  {
    id: "footer-navy",
    name: "Navy",
    features: ["네이비 배경", "둥근 모서리"],
    isLegacy: false,
  },
];

// 레거시 푸터 스타일 (복잡한 구조 - 타원형, 박스 in 박스, 구분선 등)
export const legacyFooterStyles = [
  {
    id: "footer-obsidian",
    name: "Obsidian",
    features: ["유의사항(타원형)", "어두운 배경", "중앙정렬"],
    isLegacy: true,
    isSpecial: false,
    domain: "eventclinic",
  },
  {
    id: "footer-capsule",
    name: "Capsule",
    features: ["박스 인 박스", "중앙정렬"],
    isLegacy: true,
    isSpecial: true,
    domain: "dentvents",
  },
  {
    id: "footer-chrome",
    name: "Chrome",
    features: ["회사명+구분선", "밝은 회색", "중앙정렬"],
    isLegacy: true,
    isSpecial: false,
    domain: "dentevent",
  },
  {
    id: "footer-concrete",
    name: "Concrete",
    features: ["중간 회색", "전체 너비", "중앙정렬"],
    isLegacy: true,
    isSpecial: false,
    domain: "dentaleventhub",
  },
  {
    id: "footer-pearl-left",
    name: "Pearl",
    features: ["유의사항 제목", "중간 회색", "왼쪽정렬"],
    isLegacy: true,
    isSpecial: false,
    domain: "eventiro",
  },
];

// 제휴사 안내 스타일
export const serviceInfoStyles = [
  {
    id: "",
    name: "없음",
    features: ["미표시"],
  },
  {
    id: "service-dark",
    name: "Dark",
    features: ["어두운 배경", "흰색 텍스트"],
  },
  {
    id: "service-light",
    name: "Light",
    features: ["밝은 회색 배경", "테두리 포함"],
  },
  {
    id: "service-white",
    name: "White",
    features: ["흰색 배경", "그림자 효과"],
  },
  {
    id: "service-beige",
    name: "Beige",
    features: ["베이지 배경", "따뜻한 느낌"],
  },
  {
    id: "service-blue",
    name: "Blue",
    features: ["파란색 배경", "그라데이션"],
  },
];

// 개인정보 동의 스타일
export const consentStyles = [
  { id: "dark", name: "Dark", features: ["검정 배경", "흰색 텍스트"] },
  {
    id: "light",
    name: "Light",
    features: ["밝은 회색 배경", "자연스러운 색상"],
  },
  { id: "white", name: "White", features: ["흰 배경", "그림자 효과"] },
  { id: "beige", name: "Beige", features: ["베이지 배경", "따뜻한 느낌"] },
  { id: "blue", name: "Blue", features: ["하늘색 배경", "시원한 느낌"] },
];

// 개인정보처리방침 스타일
export const privacyStyles = [
  {
    id: "style1",
    name: "강조형",
    subtitle: "스타일 1 - 전체 표시",
    features: ["회색 배경", "두꺼운 테두리", "큰 여백", "가장 눈에 잘 띔"],
  },
  {
    id: "style2",
    name: "표준형",
    subtitle: "스타일 2 - 간략 표시",
    features: ["흰 배경", "파란 테두리", "파란색 제목", "중간 강조"],
  },
  {
    id: "style3",
    name: "미니멀형",
    subtitle: "스타일 3 - 최소 표시",
    features: ["밝은 회색 배경", "테두리 없음", "작은 여백", "최소한 표시"],
  },
];

// 제휴사 안내 문구 스타일
export const partnerNoticeStyles = [
  {
    id: null,
    name: "숨김",
    subtitle: "표시 안 함",
    features: ["제휴사 안내 미표시"],
  },
  {
    id: "style1",
    name: "강조형",
    subtitle: "스타일 1 - 전체 안내",
    features: ["노란 배경", "두꺼운 테두리", "큰 여백", "강조 표시"],
  },
  {
    id: "style2",
    name: "표준형",
    subtitle: "스타일 2 - 간략 안내",
    features: ["연한 노란 배경", "가는 테두리", "중간 여백"],
  },
  {
    id: "style3",
    name: "미니멀형",
    subtitle: "스타일 3 - 최소 안내",
    features: ["매우 연한 배경", "테두리 없음", "작은 여백"],
  },
];

// 설문 색상 팔레트
export const surveyColors = [
  { label: "보라색", value: "#9b59b6" },
  { label: "남색", value: "#3498db" },
  { label: "초록색", value: "#27ae60" },
  { label: "주황색", value: "#ff8c42" },
  { label: "검정색", value: "#2c3e50" },
  { label: "핑크색", value: "#e91e63" },
];

// BIGC 연동 옵션
export const bigcOptions = ["연동 안 함", "성남", "대구"];

// 푸터 스타일 섹션 (기본 + 레거시)
export const footerStyleSections = [
  { title: "기본 푸터", styles: basicFooterStyles },
  { title: "레거시 푸터 (특수 디자인)", styles: legacyFooterStyles },
];
