import CombinedGroupedBarChart from './CombinedGroupedBarChart';
import './RevenueSection.css';

/**
 * 자사+대행 통합 차트 섹션 컴포넌트
 * Grouped Bar Chart만 표시
 */
const CombinedRevenueSection = ({ combinedData, customDateRange, selectedPeriod }) => {

  console.log('[CombinedRevenueSection] combinedData:', combinedData);

  // 데이터가 없거나 로딩 중인 경우 처리
  if (!combinedData) {
    console.log('[CombinedRevenueSection] combinedData is null');
    return null;
  }

  // 데이터 로딩 완료 확인 (모든 값이 0이면 아직 로딩 중)
  const isDataLoaded = !(
    combinedData.totalSales === 0 &&
    combinedData.totalAdCost === 0 &&
    combinedData.totalProfit === 0
  );

  if (!isDataLoaded) {
    console.log('[CombinedRevenueSection] 데이터 로딩 중...');
    return (
      <div className="revenue-section" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.1rem', color: '#6b7280' }}>
          데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  // 날짜 포맷 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 조회기간 텍스트
  const dateRangeText =
    customDateRange?.startDate && customDateRange?.endDate
      ? `${formatDate(customDateRange.startDate)} ~ ${formatDate(customDateRange.endDate)}`
      : selectedPeriod !== "기간 선택"
      ? selectedPeriod
      : "최근 7일";

  return (
    <div className="revenue-section">
      {/* 헤더 */}
      <div className="revenue-section-header">
        <div className="header-left">
          <h2 className="revenue-section-title">
            자사 + 대행 통합 데이터
            <span className="date-range-display">
              <span className="date-range-label">조회기간</span>
              <span className="date-range-value">{dateRangeText}</span>
            </span>
          </h2>
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <CombinedGroupedBarChart combinedData={combinedData} />
    </div>
  );
};

export default CombinedRevenueSection;
