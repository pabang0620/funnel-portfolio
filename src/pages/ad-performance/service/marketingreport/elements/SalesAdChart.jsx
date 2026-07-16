import { useMemo, useState, useCallback } from "react";
import { Chart } from "react-chartjs-2";
import { chartOptions } from "./utils/chartUtils";
import { calculateROAS } from "./utils/metricsUtils";
import "./SalesAdChart.css";

// 경영리포트 표준 색상
const CHART_COLORS = {
  roas: "#E76F51",      // chart-1: Orange (Coral)
  adCost: "#E76F51",    // chart-1: Orange (Coral)
  revenue: "#2A9D8F",   // chart-2: Teal
};

/**
 * 직접매출 및 광고비 소진 현황 차트 컴포넌트
 * 경영리포트 스타일 적용
 */
const SalesAdChart = ({
  weekStartDay,
  customDateRange,
  selectedMedia,
  selectedProduct,
  dailyData,
  weeklyData,
  loading,
  error,
}) => {
  const [activeIndex, setActiveIndex] = useState(null);

  // 호버 핸들러
  const handleHover = useCallback((event, elements) => {
    if (elements.length > 0) {
      setActiveIndex(elements[0].index);
    } else {
      setActiveIndex(null);
    }
  }, []);

  // props로 받은 데이터로 차트 데이터 생성
  const chartData = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) {
      return null;
    }

    const labels = weeklyData.map((week) => week.week);
    const adCostData = weeklyData.map((data) => data.adCost);
    const revenueData = weeklyData.map((data) => data.revenue);
    const roasData = weeklyData.map((data) =>
      calculateROAS(data.revenue, data.adCost)
    );

    // 호버 시 opacity 적용
    const getOpacity = (index) => {
      if (activeIndex === null) return 1;
      return activeIndex === index ? 1 : 0.3;
    };

    const adCostColors = adCostData.map((_, i) => {
      const opacity = getOpacity(i);
      return opacity === 1 ? CHART_COLORS.adCost : `rgba(231, 111, 81, ${opacity})`;
    });

    const revenueColors = revenueData.map((_, i) => {
      const opacity = getOpacity(i);
      return opacity === 1 ? CHART_COLORS.revenue : `rgba(42, 157, 143, ${opacity})`;
    });

    return {
      labels,
      datasets: [
        {
          type: "line",
          label: "ROAS (%)",
          data: roasData,
          borderColor: CHART_COLORS.roas,
          backgroundColor: CHART_COLORS.roas,
          borderWidth: 2,
          yAxisID: "y1",
          pointStyle: "circle",
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1,
        },
        {
          type: "bar",
          label: "광고비 (원)",
          data: adCostData,
          backgroundColor: adCostColors,
          borderColor: CHART_COLORS.adCost,
          borderWidth: 0,
          borderRadius: 4,
          yAxisID: "y",
        },
        {
          type: "bar",
          label: "직접매출합계 (원)",
          data: revenueData,
          backgroundColor: revenueColors,
          borderColor: CHART_COLORS.revenue,
          borderWidth: 0,
          borderRadius: 4,
          yAxisID: "y",
        },
      ],
    };
  }, [weeklyData, activeIndex]);

  // 차트 옵션
  const customChartOptions = useMemo(
    () => ({
      ...chartOptions,
      onHover: handleHover,
      plugins: {
        ...chartOptions.plugins,
        legend: {
          display: false,
        },
      },
    }),
    [handleHover]
  );

  if (loading) {
    return (
      <div className="marketing-chart-item">
        <div className="marketing-chart-box">
          <div className="chart-header">
            <h3 className="marketing-chart-title">직접매출 및 광고비 소진 현황</h3>
          </div>
          <div className="chart-loading">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketing-chart-item">
        <div className="marketing-chart-box">
          <div className="chart-header">
            <h3 className="marketing-chart-title">직접매출 및 광고비 소진 현황</h3>
          </div>
          <div className="chart-error">오류: {error}</div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="marketing-chart-item">
        <div className="marketing-chart-box">
          <div className="chart-header">
            <h3 className="marketing-chart-title">직접매출 및 광고비 소진 현황</h3>
          </div>
          <div className="chart-no-data">날짜를 선택하세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-chart-item">
      <div className="marketing-chart-box">
        <div className="chart-header">
          <h3 className="marketing-chart-title">직접매출 및 광고비 소진 현황</h3>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span
                className="chart-legend-icon"
                style={{ backgroundColor: CHART_COLORS.roas, borderRadius: "50%" }}
              />
              <span className="chart-legend-label">ROAS (%)</span>
            </div>
            <div className="chart-legend-item">
              <span
                className="chart-legend-icon"
                style={{ backgroundColor: CHART_COLORS.adCost, borderRadius: "2px" }}
              />
              <span className="chart-legend-label">광고비 (원)</span>
            </div>
            <div className="chart-legend-item">
              <span
                className="chart-legend-icon"
                style={{ backgroundColor: CHART_COLORS.revenue, borderRadius: "2px" }}
              />
              <span className="chart-legend-label">직접매출합계 (원)</span>
            </div>
          </div>
        </div>
        <div className="chart-wrapper" onMouseLeave={() => setActiveIndex(null)}>
          <Chart type="bar" data={chartData} options={customChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default SalesAdChart;
