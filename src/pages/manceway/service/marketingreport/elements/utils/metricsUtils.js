/**
 * 마케팅 리포트 지표 계산 유틸리티 함수들
 */

/**
 * CPC (Cost Per Click) 계산
 * @param {number} adCost - 광고비
 * @param {number} clicks - 클릭수
 * @returns {number} CPC 값
 */
export const calculateCPC = (adCost, clicks) => {
  return clicks > 0 ? Math.round(adCost / clicks) : 0;
};

/**
 * CTR (Click Through Rate) 계산
 * @param {number} clicks - 클릭수
 * @param {number} impressions - 노출수
 * @returns {number} CTR 값 (%)
 */
export const calculateCTR = (clicks, impressions) => {
  return impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0;
};

/**
 * CVR (Conversion Rate) 계산
 * @param {number} conversions - 구매건수
 * @param {number} clicks - 클릭수
 * @returns {number} CVR 값 (%)
 */
export const calculateCVR = (conversions, clicks) => {
  return clicks > 0 ? parseFloat(((conversions / clicks) * 100).toFixed(2)) : 0;
};

/**
 * ROAS (Return On Ad Spend) 계산
 * @param {number} revenue - 매출
 * @param {number} adCost - 광고비
 * @returns {number} ROAS 값 (%)
 */
export const calculateROAS = (revenue, adCost) => {
  return adCost > 0 ? parseFloat(((revenue / adCost) * 100).toFixed(1)) : 0;
};

/**
 * 객단가 (Average Order Value) 계산
 * @param {number} revenue - 매출
 * @param {number} conversions - 구매건수
 * @returns {number} 객단가
 */
export const calculateAvgOrderValue = (revenue, conversions) => {
  return conversions > 0 ? Math.round(revenue / conversions) : 0;
};

/**
 * 기본 지표로부터 모든 계산 지표를 생성
 * @param {Object} data - 기본 지표 객체
 * @param {number} data.adCost - 광고비
 * @param {number} data.revenue - 매출
 * @param {number} data.impressions - 노출수
 * @param {number} data.clicks - 클릭수
 * @param {number} data.conversions - 구매건수
 * @returns {Object} 모든 지표를 포함한 객체
 */
export const calculateAllMetrics = (data) => {
  const { adCost, revenue, impressions, clicks, conversions } = data;
  
  return {
    ...data,
    cpc: calculateCPC(adCost, clicks),
    ctr: calculateCTR(clicks, impressions),
    cvr: calculateCVR(conversions, clicks),
    roas: calculateROAS(revenue, adCost),
    avgOrderValue: calculateAvgOrderValue(revenue, conversions),
  };
};

/**
 * 주차별 합계 계산
 * @param {Array} weekData - 주차별 일별 데이터 배열
 * @param {Object} manualData - 수동 입력 데이터 (선택사항)
 * @returns {Object} 주차 합계 객체
 */
export const calculateWeekTotals = (weekData, manualData = {}) => {
  const totals = {
    adCost: 0,
    revenue: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
  };

  weekData.forEach((dayData) => {
    const manual = manualData[dayData.date] || {};

    totals.adCost += manual.adCost !== undefined ? manual.adCost : dayData.adCost || 0;
    totals.revenue += manual.revenue !== undefined ? manual.revenue : dayData.revenue || 0;
    totals.impressions += manual.impressions !== undefined ? manual.impressions : dayData.impressions || 0;
    totals.clicks += manual.clicks !== undefined ? manual.clicks : dayData.clicks || 0;
    totals.conversions += manual.conversions !== undefined ? manual.conversions : dayData.conversions || 0;
  });

  return calculateAllMetrics(totals);
};

/**
 * 일별 데이터 배열에서 평균값 계산
 * @param {Array} dataArray - 일별 데이터 배열
 * @returns {Object} 평균값 객체
 */
export const calculateAverages = (dataArray) => {
  const validData = dataArray.filter(d => d.adCost > 0);
  
  if (validData.length === 0) {
    return {
      avgCpc: 0,
      avgCtr: 0,
      avgCvr: 0,
      avgRoas: 0,
    };
  }

  return {
    avgCpc: Math.round(validData.reduce((sum, val) => sum + calculateCPC(val.adCost, val.clicks), 0) / validData.length),
    avgCtr: parseFloat((validData.reduce((sum, val) => sum + calculateCTR(val.clicks, val.impressions), 0) / validData.length).toFixed(2)),
    avgCvr: parseFloat((validData.reduce((sum, val) => sum + calculateCVR(val.conversions, val.clicks), 0) / validData.length).toFixed(2)),
    avgRoas: parseFloat((validData.reduce((sum, val) => sum + calculateROAS(val.revenue, val.adCost), 0) / validData.length).toFixed(1)),
  };
};

/**
 * 차트 데이터용 일별 계산 지표 생성
 * @param {Array} dailyData - 일별 기본 데이터 배열
 * @returns {Object} 차트용 데이터 객체
 */
export const generateChartMetrics = (dailyData) => {
  return {
    cpc: dailyData.map(data => calculateCPC(data.adCost, data.clicks)),
    ctr: dailyData.map(data => calculateCTR(data.clicks, data.impressions)),
    cvr: dailyData.map(data => calculateCVR(data.conversions, data.clicks)),
    roas: dailyData.map(data => calculateROAS(data.revenue, data.adCost)),
  };
};

/**
 * 일별 데이터를 주차별로 그룹핑
 * @param {Array} dailyData - 일별 데이터 배열
 * @param {string} weekStartDay - 주차 시작 기준 ("1일 시작" or "월요일 시작")
 * @returns {Array} 주차별 그룹화된 데이터 배열
 */
export const groupDataByWeek = (dailyData, weekStartDay = "1일 시작") => {
  if (!dailyData || dailyData.length === 0) {
    return [];
  }

  const weeklyGroups = {};

  dailyData.forEach(record => {
    if (!record.date) return;

    const date = new Date(record.date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    let weekKey;
    
    if (weekStartDay === "월요일 시작") {
      // 월요일 시작 방식 - 첫 번째 완전한 월~일 주기가 2주차가 되는 방식
      const firstDay = new Date(date.getFullYear(), month - 1, 1);
      const firstDayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
      
      // 해당 월의 첫 번째 월요일 계산
      let firstMonday;
      if (firstDayOfWeek === 1) {
        // 월의 첫날이 월요일인 경우 - 1일이 월요일
        firstMonday = 1;
      } else if (firstDayOfWeek === 0) {
        // 월의 첫날이 일요일인 경우 - 2일이 월요일
        firstMonday = 2;
      } else {
        // 월의 첫날이 화요일~토요일인 경우
        firstMonday = 8 - firstDayOfWeek + 1;
      }
      
      let weekNumber;
      if (firstDayOfWeek === 1) {
        // 월의 첫날이 월요일인 경우: 완전한 주이므로 1주차부터 시작
        weekNumber = Math.floor((day - 1) / 7) + 1;
      } else {
        // 월의 첫날이 월요일이 아닌 경우: 첫 번째 완전한 주가 2주차
        if (day < firstMonday) {
          // 첫 번째 월요일 이전의 날들은 1주차
          weekNumber = 1;
        } else {
          // 첫 번째 월요일 이후는 2주차부터 시작
          weekNumber = Math.floor((day - firstMonday) / 7) + 2;
        }
      }
      weekKey = `${month}월 ${weekNumber}주`;
    } else {
      // 1일 시작 방식 (기존)
      const weekNumber = Math.ceil(day / 7);
      weekKey = `${month}월 ${weekNumber}주`;
    }
    
    if (!weeklyGroups[weekKey]) {
      weeklyGroups[weekKey] = {
        week: weekKey,
        adCost: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        dates: [],
      };
    }
    
    // 날짜 추가 (중복 방지)
    if (!weeklyGroups[weekKey].dates.includes(record.date)) {
      weeklyGroups[weekKey].dates.push(record.date);
    }
    
    // null 값 처리
    weeklyGroups[weekKey].adCost += Number(record.adCost) || 0;
    weeklyGroups[weekKey].revenue += Number(record.revenue) || 0;
    weeklyGroups[weekKey].impressions += Number(record.impressions) || 0;
    weeklyGroups[weekKey].clicks += Number(record.clicks) || 0;
    weeklyGroups[weekKey].conversions += Number(record.conversions) || 0;
  });

  // 계산된 지표와 날짜 범위 정보 추가하여 반환
  return Object.values(weeklyGroups).map(group => {
    // 날짜 정렬
    group.dates.sort();
    
    // 날짜 범위 문자열 생성
    if (group.dates.length > 0) {
      const startDate = new Date(group.dates[0]);
      const endDate = new Date(group.dates[group.dates.length - 1]);
      
      const formatDate = (date) => {
        return date.getDate();
      };
      
      const startDay = formatDate(startDate);
      const endDay = formatDate(endDate);
      
      group.period = group.dates.length === 1 ? `(${startDay}일)` : `(${startDay}~${endDay}일)`;
    } else {
      group.period = group.week;
    }
    
    return calculateAllMetrics(group);
  });
};

/**
 * 일별 데이터를 차트용 형태로 변환
 * @param {Array} dailyData - 일별 데이터 배열
 * @param {string} startDate - 시작일 
 * @param {string} endDate - 종료일
 * @returns {Object} 차트용 데이터 객체
 */
export const transformToChartData = (dailyData, startDate, endDate) => {
  if (!startDate || !endDate) {
    return { labels: [], datasets: [] };
  }

  // 날짜 범위 생성
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  // 날짜별 데이터 맵 생성
  const dataMap = new Map();
  dailyData.forEach(data => {
    if (data.date) {
      dataMap.set(data.date, data);
    }
  });

  // 라벨 생성
  const labels = dates.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  // 데이터 배열 생성
  const chartData = dates.map(date => {
    const data = dataMap.get(date);
    return data ? {
      adCost: Number(data.adCost) || 0,
      revenue: Number(data.revenue) || 0,
      impressions: Number(data.impressions) || 0,
      clicks: Number(data.clicks) || 0,
      conversions: Number(data.conversions) || 0
    } : {
      adCost: 0,
      revenue: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0
    };
  });

  return { labels, chartData };
};