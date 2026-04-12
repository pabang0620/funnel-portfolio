import { Line, Bar } from 'react-chartjs-2';
import './SalesRevenueCard.css';

/**
 * 매출/공헌이익 차트 카드 컴포넌트
 * 차트와 메트릭을 표시하는 재사용 가능한 카드
 */
const SalesRevenueCard = ({
  title,
  monthlyAmount,
  chartData,
  chartOptions,
  avgLabel,
  avgValue,
  growthLabel,
  growthValue,
  chartType = 'line', // 'line' | 'bar'
}) => {
  const ChartComponent = chartType === 'bar' ? Bar : Line;

  return (
    <div className="revenue-box">
      <div className="revenue-box-content-separated">
        {/* 메인 섹션 */}
        <div className="revenue-main-section">
          <div className="revenue-main-top">
            <h3 className="revenue-section-label">{title}</h3>
            <div className="revenue-main-amount">
              <span className="amount-number">{monthlyAmount.toLocaleString()}</span>
              <span className="amount-unit">원</span>
            </div>
          </div>
          {/* 차트 */}
          <div className="revenue-main-chart-full">
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* 세부 메트릭 섹션 */}
        <div className="revenue-details-section">
          <div className="revenue-detail-box">
            <div className="detail-label">{avgLabel}</div>
            <div className="detail-value">
              <span className="amount-number-detail">{avgValue.toLocaleString()}</span>
              <span className="amount-unit-detail">원</span>
            </div>
          </div>
          <div className="revenue-detail-box">
            <div className="detail-label">{growthLabel}</div>
            <div
              className={`detail-value ${
                growthValue >= 0 ? "positive-growth" : "negative-growth"
              }`}
            >
              <span className="amount-number-detail">
                {growthValue > 0 ? "+" : ""}
                {growthValue}
              </span>
              <span className="amount-unit-detail">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesRevenueCard;
