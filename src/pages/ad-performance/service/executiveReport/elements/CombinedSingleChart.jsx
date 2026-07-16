import { Line } from 'react-chartjs-2';

/**
 * 자사+대행 통합 차트 컴포넌트 (Multi-line Chart)
 * 총매출, 총광고비, 총공헌이익을 하나의 차트에 표시
 */
const CombinedSingleChart = ({ combinedData }) => {
  // 차트 데이터 구성
  const chartData = {
    labels: combinedData.chartLabels || [],
    datasets: [
      {
        label: '총 매출',
        data: combinedData.chartSalesData || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: '총 광고비',
        data: combinedData.chartAdCostData || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: '총 공헌이익',
        data: combinedData.chartProfitData || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: '600',
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        padding: 12,
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
            size: 11,
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function (value) {
            return Math.round(value).toLocaleString('ko-KR') + '원';
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="combined-single-chart">
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
        자사 + 대행 통합 차트
      </h3>
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CombinedSingleChart;
