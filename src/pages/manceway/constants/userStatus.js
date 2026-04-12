// 사용자 상태 상수

export const USER_STATUS = {
  ACTIVE: 1,      // 활성화
  INACTIVE: 2,    // 비활성화
  RETIRED: 3      // 퇴사
};

export const USER_STATUS_TEXT = {
  [USER_STATUS.ACTIVE]: '활성',
  [USER_STATUS.INACTIVE]: '비활성',
  [USER_STATUS.RETIRED]: '퇴사'
};

export const USER_STATUS_OPTIONS = [
  { value: USER_STATUS.ACTIVE, label: USER_STATUS_TEXT[USER_STATUS.ACTIVE] },
  { value: USER_STATUS.INACTIVE, label: USER_STATUS_TEXT[USER_STATUS.INACTIVE] },
  { value: USER_STATUS.RETIRED, label: USER_STATUS_TEXT[USER_STATUS.RETIRED] }
];

// 상태 코드를 텍스트로 변환
export const getStatusText = (statusCode) => {
  return USER_STATUS_TEXT[statusCode] || '알 수 없음';
};

// 텍스트를 상태 코드로 변환
export const getStatusCode = (statusText) => {
  const entry = Object.entries(USER_STATUS_TEXT).find(([code, text]) => text === statusText);
  return entry ? parseInt(entry[0]) : USER_STATUS.ACTIVE;
};

// 사용자 등급 상수
export const USER_GRADE = {
  S: 'S',  // 임원
  A: 'A',  // 팀장  
  B: 'B',  // 중간관리자
  C: 'C'   // 팀원
};

export const USER_GRADE_TEXT = {
  [USER_GRADE.S]: 'S (임원)',
  [USER_GRADE.A]: 'A (팀장)',
  [USER_GRADE.B]: 'B (중간관리자)',
  [USER_GRADE.C]: 'C (팀원)'
};

export const USER_GRADE_OPTIONS = [
  { value: USER_GRADE.S, label: USER_GRADE_TEXT[USER_GRADE.S] },
  { value: USER_GRADE.A, label: USER_GRADE_TEXT[USER_GRADE.A] },
  { value: USER_GRADE.B, label: USER_GRADE_TEXT[USER_GRADE.B] },
  { value: USER_GRADE.C, label: USER_GRADE_TEXT[USER_GRADE.C] }
];