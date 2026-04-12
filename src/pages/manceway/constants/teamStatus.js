// 팀 상태 상수

export const TEAM_STATUS = {
  ACTIVE: 1,      // 활성화
  INACTIVE: 2     // 비활성화
};

export const TEAM_STATUS_TEXT = {
  [TEAM_STATUS.ACTIVE]: '활성',
  [TEAM_STATUS.INACTIVE]: '비활성'
};

export const TEAM_STATUS_OPTIONS = [
  { value: TEAM_STATUS.ACTIVE, label: TEAM_STATUS_TEXT[TEAM_STATUS.ACTIVE] },
  { value: TEAM_STATUS.INACTIVE, label: TEAM_STATUS_TEXT[TEAM_STATUS.INACTIVE] }
];

// 상태 코드를 텍스트로 변환
export const getTeamStatusText = (statusCode) => {
  return TEAM_STATUS_TEXT[statusCode] || '알 수 없음';
};

// 텍스트를 상태 코드로 변환
export const getTeamStatusCode = (statusText) => {
  const entry = Object.entries(TEAM_STATUS_TEXT).find(([code, text]) => text === statusText);
  return entry ? parseInt(entry[0]) : TEAM_STATUS.ACTIVE;
};