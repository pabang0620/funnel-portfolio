import { useMemo, useState, useCallback } from "react";
import { Chart } from "react-chartjs-2";
import { chartOptions } from "./utils/chartUtils";
import {
  generateChartMetrics,
  calculateAverages,
  transformToChartData,
} from "./utils/metricsUtils";
import "./AdMetricsChart.css";

// 경영리포트 표준 색상
const CHART_COLORS = {
  cvr: "#264653", // chart-5: Dark Blue (전환율)
  ctr: "#2A9D8F", // chart-2: Teal
  cpc: "#E76F51", // chart-1: Orange (Coral) (CPC)
};

/**
 * 광고 세부 지표 차트 컴포넌트
 * 전환율(CVR), CTR, CPC를 일별로 표시
 * 경영리포트 스타일 적용
 */
const AdMetricsChart = ({
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

    // 주간 데이터를 직접 사용 (이미 집계된 데이터)
    const labels = weeklyData.map((week) => week.week);
    const transformedData = weeklyData;

    // 계산 지표 생성
    const metrics = generateChartMetrics(transformedData);

    // 호버 시 opacity 적용
    const getOpacity = (index) => {
      if (activeIndex === null) return 1;
      return activeIndex === index ? 1 : 0.3;
    };

    const cpcColors = metrics.cpc.map((_, i) => {
      const opacity = getOpacity(i);
      return opacity === 1
        ? CHART_COLORS.cpc
        : `rgba(231, 111, 81, ${opacity})`;
    });

    return {
      labels,
      datasets: [
        {
          type: "line",
          label: "전환율 (%)",
          data: metrics.cvr,
          borderColor: CHART_COLORS.cvr,
          backgroundColor: CHART_COLORS.cvr,
          borderWidth: 2,
          yAxisID: "y1",
          pointStyle: "circle",
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1,
        },
        {
          type: "line",
          label: "CTR (%)",
          data: metrics.ctr,
          borderColor: CHART_COLORS.ctr,
          backgroundColor: CHART_COLORS.ctr,
          borderWidth: 2,
          yAxisID: "y1",
          pointStyle: "circle",
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1,
        },
        {
          type: "bar",
          label: "CPC (원)",
          data: metrics.cpc,
          backgroundColor: cpcColors,
          borderColor: CHART_COLORS.cpc,
          borderWidth: 0,
          borderRadius: 4,
          yAxisID: "y",
          barPercentage: 0.5,
        },
      ],
    };
  }, [weeklyData, activeIndex]);

  // 범례 없는 차트 옵션
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
            <h3 className="marketing-chart-title">광고 세부 지표</h3>
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
            <h3 className="marketing-chart-title">광고 세부 지표</h3>
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
            <h3 className="marketing-chart-title">광고 세부 지표</h3>
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
          <h3 className="marketing-chart-title">광고 세부 지표</h3>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <span
                className="chart-legend-icon"
                style={{
                  backgroundColor: CHART_COLORS.cvr,
                  borderRadius: "50%",
                }}
              />
              <span className="chart-legend-label">전환율 (%)</span>
            </div>
            <div className="chart-legend-item">
              <span
                className="chart-legend-icon"
                style={{
                  backgroundColor: CHART_COLORS.ctr,
                  borderRadius: "50%",
                }}
              />
              <span className="chart-legend-label">CTR (%)</span>
            </div>
            <div className="chart-legend-item">
              <span
                className="chart-legend-icon"
                style={{
                  backgroundColor: CHART_COLORS.cpc,
                  borderRadius: "2px",
                }}
              />
              <span className="chart-legend-label">CPC (원)</span>
            </div>
          </div>
        </div>
        <div
          className="chart-wrapper"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <Chart type="bar" data={chartData} options={customChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdMetricsChart;
