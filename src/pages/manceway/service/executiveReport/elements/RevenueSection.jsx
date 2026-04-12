import SalesRevenueCard from './SalesRevenueCard';
import SimpleMetricCard from './SimpleMetricCard';
import Button from '../../../components/ui/Button';
import './RevenueSection.css';

/**
 * 매출 실적 추이 섹션 컴포넌트
 * 권한에 따라 매출과 공헌이익 대시보드를 표시합니다
 */
const RevenueSection = ({
  customDateRange,
  selectedPeriod,
  chartData,
  dashboardData,
  onShowFeeDetail,
  isAdmin = false,
  tableTotals = null, // S등급용 테이블 합계 데이터
  useTableTotals = false, // 파일판매처별 모드에서 true
  // 세부 권한
  hasRevenueCards = true,
  hasTotalRevenueChart = true,
  hasTotalMarginChart = true,
  hasProductRevenueChart = true,
  hasProductMarginChart = true,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 조회기간: 사용자가 선택한 기간 표시
  const dateRangeText =
    customDateRange.startDate && customDateRange.endDate
      ? `${formatDate(customDateRange.startDate)} ~ ${formatDate(customDateRange.endDate)}`
      : selectedPeriod !== "기간 선택"
      ? selectedPeriod
      : "최근 7일";

  return (
    <div className="revenue-section">
      <div className="revenue-section-header">
        <div className="header-left">
          <h2 className="revenue-section-title">
            매출 실적 추이
            <span className="date-range-display">
              <span className="date-range-label">조회기간</span>
              <span className="date-range-value">{dateRangeText}</span>
            </span>
          </h2>
        </div>
        <div className="ad-fee-inline">
          <span className="ad-fee-title" title="돌려받는 금액">대행료</span>
          <span className="ad-fee-value">
            {dashboardData?.totalAgencyFee
              ? `${dashboardData.totalAgencyFee.toLocaleString()}원`
              : "0원"}
          </span>
          <Button variant="secondary" size="small" onClick={onShowFeeDetail}>
            자세히보기
          </Button>
        </div>
      </div>
      {/* 매출 카드 표시 권한 체크 */}
      {hasRevenueCards && (
        (isAdmin || useTableTotals) ? (
          /* S등급 또는 파일판매처별 모드: 총매출, ROAS, 광고비, 공헌이익 - 2x2 그리드 */
          /* tableTotals 사용 (선택한 판매처만 필터링됨) */
          <div className="revenue-cards-admin">
            <SimpleMetricCard
              title="총매출"
              value={tableTotals?.totalSales || 0}
              unit="원"
              variant="primary"
            />
            <SimpleMetricCard
              title="ROAS"
              value={tableTotals?.roas || "0.0"}
              unit="%"
              variant="primary"
            />
            <SimpleMetricCard
              title="총광고비"
              value={tableTotals?.totalAdCost || 0}
              unit="원"
              variant="primary"
            />
            <SimpleMetricCard
              title="공헌이익"
              value={tableTotals?.contributionProfit || 0}
              unit="원"
              variant="primary"
            />
          </div>
        ) : (
          /* 일반 사용자: 기존 2개 카드 레이아웃 */
          <div className="revenue-cards-new">
            {/* 총 매출 차트 권한 체크 */}
            {hasTotalRevenueChart && (
              <SalesRevenueCard
                title={dashboardData?.salesLabel || "월 예상매출"}
                monthlyAmount={dashboardData?.estimatedSales || 0}
                chartData={chartData.salesChartData}
                chartOptions={chartData.salesChartOptions}
                avgLabel="평균매출"
                avgValue={dashboardData?.avgSales || 0}
                growthLabel="전월대비 매출"
                growthValue={parseFloat(dashboardData?.salesGrowth || 0)}
              />
            )}
            {/* 총 마진(공헌이익) 차트 권한 체크 */}
            {hasTotalMarginChart && (
              <SalesRevenueCard
                title={dashboardData?.isCurrentMonth ? "월 예상 공헌이익" : "총 공헌이익"}
                monthlyAmount={dashboardData?.totalContributionProfit || 0}
                chartData={chartData.profitChartData}
                chartOptions={chartData.profitChartOptions}
                avgLabel="평균 공헌이익"
                avgValue={dashboardData?.avgContributionProfit || 0}
                growthLabel="전월대비 공헌이익"
                growthValue={parseFloat(dashboardData?.profitGrowth || 0)}
              />
            )}
          </div>
        )
      )}
    </div>
  );
};

export default RevenueSection;
