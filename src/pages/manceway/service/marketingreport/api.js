/**
 * Marketing Report Service API - PORTFOLIO: Mock data version
 */

const MOCK_MEDIA = [
  { id: 1, name: '구글', teamId: 1 },
  { id: 2, name: '메타', teamId: 1 },
  { id: 3, name: '틱톡', teamId: 1 },
  { id: 4, name: 'GFA', teamId: 1 },
  { id: 5, name: '쿠팡', teamId: 1 },
  { id: 6, name: '네이버SA', teamId: 1 },
];

const MOCK_PRODUCTS = [
  { id: 1, name: '알파덴탈', type: 'own' },
  { id: 2, name: '베타케어', type: 'own' },
  { id: 3, name: '감마헬스', type: 'own' },
  { id: 4, name: '델타임플', type: 'agency' },
];

const generateRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generateRandomFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const generateDailyData = (startDate, endDate, mediaId, productId) => {
  const result = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      mediaId: mediaId || 1,
      productId: productId || 1,
      adCost: generateRandomInt(300000, 2000000),
      sales: generateRandomInt(1000000, 8000000),
      roas: generateRandomFloat(200, 600),
      impressions: generateRandomInt(10000, 100000),
      clicks: generateRandomInt(500, 5000),
      ctr: generateRandomFloat(0.5, 5.0),
      cpc: generateRandomInt(100, 500),
      conversions: generateRandomInt(10, 200),
    });
  }
  return result;
};

/**
 * 매체 목록 조회
 */
export const getMediaList = async () => {
  return { success: true, data: MOCK_MEDIA };
};

/**
 * 제품 목록 조회
 */
export const getProductList = async () => {
  return { success: true, data: MOCK_PRODUCTS };
};


/**
 * 데이터 존재 여부 조회 (달력 빨간점 표시용)
 * @param {Object} params - 조회 조건
 * @param {number} params.year - 연도
 * @param {number} params.month - 월
 * @param {number} params.selectedMediaId - 선택된 매체 ID
 * @param {number} params.selectedProductId - 선택된 제품 ID
 * @param {number[]} params.allowedMediaIds - 허용된 매체 ID 목록 (B,C등급 또는 S,A등급 팀 선택 시)
 * @param {number[]} params.teamIds - 팀 ID 목록 (하위팀 선택 시 해당 팀 데이터만 조회)
 * @returns {Promise<{data: {year: number, month: number, datesWithData: string[]}}>}
 */
export const getDataAvailability = async (params) => {
  // Generate random dates with data in the given month
  const datesWithData = [];
  const daysInMonth = new Date(params.year, params.month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    if (Math.random() > 0.3) {
      datesWithData.push(`${params.year}-${String(params.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
  }
  return { success: true, data: { year: params.year, month: params.month, datesWithData } };
};

/**
 * 일별 상세 데이터 조회
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {number} params.selectedMediaId - 선택된 매체 ID
 * @param {number} params.selectedProductId - 선택된 제품 ID
 * @param {number[]} params.allowedMediaIds - 허용된 매체 ID 목록 (B,C등급 또는 S,A등급 팀 선택 시)
 * @param {number[]} params.teamIds - 팀 ID 목록 (하위팀 선택 시 해당 팀 데이터만 조회)
 * @returns {Promise<{data: Array}>}
 */
export const getDailyDetailData = async (params) => {
  const data = generateDailyData(params.startDate, params.endDate, params.selectedMediaId, params.selectedProductId);
  return { success: true, data };
};

/**
 * 일별 데이터 수정
 * @param {Object} data - 수정할 데이터
 * @param {Object} data.manualData - 수정된 데이터 맵
 * @param {string} data.userRole - 사용자 권한
 * @param {string} data.userTeam - 사용자 팀
 * @param {number} data.selectedMediaId - 선택된 매체 ID
 * @param {number} data.selectedProductId - 선택된 제품 ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateDailyData = async (data) => {
  return { success: true, message: '저장되었습니다.' };
};

/**
 * 편집 이력 조회
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {number} params.selectedMediaId - 선택된 매체 ID (선택사항)
 * @param {number} params.selectedProductId - 선택된 제품 ID (선택사항)
 * @returns {Promise<{data: Array}>}
 */
export const getEditHistory = async (params) => {
  return { success: true, data: [] };
};

/**
 * 팀 매체 할당 정보 조회
 * @returns {Promise<{data: Array}>} 팀 목록 (각 팀의 mediaIds 포함)
 */
export const getTeamMediaAssignments = async () => {
  return { success: true, data: [
    { id: 1, name: '경영팀', mediaIds: [1, 2, 3, 4, 5, 6] },
  ]};
};

/**
 * 매체 운영 상태 조회
 * @returns {Promise<{data: Object}>} 운영 상태 데이터 (key: "제품ID-매체ID-팀명", value: {status, statusValue})
 */
export const getOperationStatus = async () => {
  return { success: true, data: {} };
};

/**
 * 마케팅 리포트 데이터 조회 (기존 API - 호환성 유지)
 * @param {Object} params - 조회 조건
 * @returns {Promise<Object>} 마케팅 리포트 데이터
 */
export const getMarketingReport = async (params) => {
  return { success: true, data: [] };
};

/**
 * 컬럼 순서 저장
 * @param {string} userId - 사용자 ID
 * @param {string[]} columnOrder - 컬럼 순서 배열
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const saveColumnOrder = async () => ({ success: true });
export const getColumnOrder = async () => ({ success: true, data: { columnOrder: [] } });
export const saveWeeklyColumnOrder = async () => ({ success: true });
export const getWeeklyColumnOrder = async () => ({ success: true, data: { columnOrder: [] } });

export const getTeamMediaInputStatus = async (teamIds) => {
  const teamIdArray = Array.isArray(teamIds) ? teamIds : [teamIds];
  if (teamIdArray.length === 0 || teamIdArray.includes(0)) {
    return { success: true, data: { mediaStatus: [], summary: { total: 0, normal: 0, missing: 0, paused: 0, inactive: 0 } } };
  }
  return {
    success: true,
    data: {
      mediaStatus: MOCK_MEDIA.map(m => ({ mediaId: m.id, mediaName: m.name, status: 'normal', statusValue: 1 })),
      summary: { total: MOCK_MEDIA.length, normal: MOCK_MEDIA.length, missing: 0, paused: 0, inactive: 0 }
    }
  };
};

export const getAdStartDate = async () => ({ success: true, data: { startDate: '2025-01-01' } });
