import {
  templates1Stage,
  templates2Stage,
  templates3Stage,
  formStyles,
  privacyStyles,
  basicFooterStyles,
  legacyFooterStyles,
  serviceInfoStyles,
  consentStyles,
} from './constants';

// 템플릿 페이지 수 계산
export const getPageCount = (template) => {
  if (!template) return 0;
  return Math.floor(template / 10);
};

// 설문 페이지 확인
export const getSurveyPages = (template) => {
  if (!template) return [];

  const surveyMapping = {
    12: [1], // 페이지 1에 설문 1개
    13: [1], // 페이지 1에 설문 2개
    21: [1], // 페이지 1에 설문
    22: [2], // 페이지 2에 설문
    24: [1], // 페이지 1에 설문 2개
    25: [2], // 페이지 2에 설문 2개
    31: [2], // 페이지 2에 설문
    32: [1, 2], // 페이지 1, 2에 설문
    33: [2], // 페이지 2에 설문 2개
  };

  return surveyMapping[template] || [];
};

// 설문 존재 여부 확인
export const hasSurvey = (template) => {
  return getSurveyPages(template).length > 0;
};

// 템플릿이 설문을 지원하는지 확인
export const templateHasSurvey = (templateId) => {
  const surveySupportedTemplates = [12, 13, 21, 22, 24, 25, 31, 32, 33];
  return surveySupportedTemplates.includes(templateId);
};

// templateKey에서 템플릿 단계 추출
export const getTemplateStage = (templateKey) => {
  if (!templateKey) return null;
  return Math.floor(templateKey / 10);
};

// 템플릿 단계 표시 텍스트
export const getTemplateStageText = (templateKey) => {
  const stage = getTemplateStage(templateKey);
  if (!stage) return null;
  return `${stage}단계`;
};

// 템플릿 이름 가져오기
export const getTemplateName = (templateId) => {
  const allTemplates = [
    ...templates1Stage,
    ...templates2Stage,
    ...templates3Stage,
  ];
  const template = allTemplates.find((t) => t.id === parseInt(templateId));
  return template ? template.name : templateId;
};

// 폼 스타일 이름 가져오기
export const getFormStyleName = (styleId) => {
  const style = formStyles.find((s) => s.id === styleId);
  return style ? style.name : styleId;
};

// 개인정보처리방침 스타일 이름 가져오기
export const getPrivacyStyleName = (styleId) => {
  const style = privacyStyles.find((s) => s.id === styleId);
  return style ? style.name : styleId;
};

// 푸터 스타일 이름 가져오기
export const getFooterStyleName = (className) => {
  if (!className) return "없음";

  // 정렬 정보 추출
  let alignment = "중앙";
  if (className.endsWith("-left")) alignment = "왼쪽";
  else if (className.endsWith("-right")) alignment = "오른쪽";

  // 기본 스타일 추출
  const baseClassName = className.replace(/-left|-right$/, "");
  const styleMapping = {
    "footer-dark": "Dark",
    "footer-light": "Light",
    "footer-blue": "Blue",
    "footer-minimal": "Minimal",
    "footer-gray-border": "Gray",
    "footer-navy": "Navy",
    "footer-obsidian": "Obsidian",
    "footer-capsule": "Capsule ⭐",
    "footer-chrome": "Chrome",
    "footer-concrete": "Concrete",
    "footer-pearl": "Pearl",
    "footer-graphite": "Graphite",
  };

  const style = styleMapping[baseClassName] || "미입력";
  return `${style} (${alignment})`;
};

// 제휴사 안내 스타일 이름 가져오기
export const getServiceInfoStyleName = (className) => {
  const style = serviceInfoStyles.find((s) => s.id === className);
  return style ? style.name : "없음";
};

// 개인정보 동의 스타일 이름 가져오기
export const getConsentStyleName = (styleId) => {
  const style = consentStyles.find((s) => s.id === styleId);
  return style ? style.name : styleId;
};

// 버튼 위치 이름 가져오기
export const getButtonPositionName = (position) => {
  return position === "fixed" ? "띄움형" : "일반형";
};

// 혜택 기간 타입 이름 가져오기
export const getBenefitPeriodTypeName = (type) => {
  const mapping = {
    week: "이번주",
    month: "이번달",
  };
  return mapping[type] || "사용 안 함";
};

// 버튼 색상 이름 가져오기
export const getButtonColorName = (color) => {
  const mapping = {
    blue: "Blue",
    green: "Green",
    orange: "Orange",
    pink: "Pink",
    red: "Red",
  };
  return mapping[color] || color || "미선택";
};

// 랜딩 객체에서 templateKey 찾기 (다양한 필드명 지원)
export const getTemplateKeyFromLanding = (landing) => {
  return (
    landing.templateKey ||
    landing.template ||
    landing.templateId ||
    landing.template_key ||
    landing.template_id ||
    null
  );
};
