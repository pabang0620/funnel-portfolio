import { Bar } from 'react-chartjs-2';
import './RevenueSection.css';

/**
 * 자사+대행 통합 Grouped Bar Chart
 * 총매출, 총광고비, 총공헌이익을 하나의 차트에 표시
 */
const CombinedGroupedBarChart = ({ combinedData }) => {
  if (!combinedData) {
    return null;
  }

  // 차트 데이터 구성 (기간 합계)
  const chartData = {
    labels: ['기간 합계'],
    datasets: [
      {
        label: '총 매출',
        data: [combinedData.totalSales || 0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 60,
      },
      {
        label: '총 광고비',
        data: [combinedData.totalAdCost || 0],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 60,
      },
      {
        label: '총 공헌이익',
        data: [combinedData.totalProfit || 0],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 60,
      },
    ],
  };

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'top',
        font: {
          size: 10,
          weight: 'bold',
        },
        color: '#374151',
        formatter: function(value) {
          return Math.round(value).toLocaleString('ko-KR');
        },
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: '600',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rect',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += Math.round(context.parsed.y).toLocaleString('ko-KR') + '원';
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 13,
            weight: '500',
          },
          color: '#374151',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6b7280',
          callback: function (value) {
            // 천단위 구분 쉼표 추가 (소숫점 제거)
            return Math.round(value).toLocaleString('ko-KR');
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // 요약 통계
  const totalSales = combinedData.totalSales || 0;
  const totalAdCost = combinedData.totalAdCost || 0;
  const totalProfit = combinedData.totalProfit || 0;

  return (
    <div className="combined-grouped-bar-chart">
      {/* 요약 카드 */}
      <div className="summary-cards">
        <div className="summary-card sales">
          <div className="summary-label">총 매출</div>
          <div className="summary-value">{Math.round(totalSales).toLocaleString('ko-KR')}원</div>
        </div>
        <div className="summary-card ad-cost">
          <div className="summary-label">총 광고비</div>
          <div className="summary-value">{Math.round(totalAdCost).toLocaleString('ko-KR')}원</div>
        </div>
        <div className="summary-card profit">
          <div className="summary-label">총 공헌이익</div>
          <div className="summary-value">{Math.round(totalProfit).toLocaleString('ko-KR')}원</div>
        </div>
      </div>

      {/* Grouped Bar Chart */}
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CombinedGroupedBarChart;
