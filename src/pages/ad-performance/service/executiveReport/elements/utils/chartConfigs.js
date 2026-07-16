/**
 * Chart.js 공통 설정 유틸리티
 */

/**
 * 그라데이션 배경 생성 함수
 */
export const createGradientBackground = (context) => {
  const ctx = context.chart.ctx;
  const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  gradient.addColorStop(0.7, "rgba(255, 255, 255, 0)");
  return gradient;
};

/**
 * 라인 차트 데이터셋 생성
 */
export const createLineChartDataset = (label, data) => ({
  label,
  data,
  borderColor: "rgba(255, 255, 255, 0.7)",
  backgroundColor: createGradientBackground,
  borderWidth: 2,
  fill: true,
  tension: 0.4,
  pointBackgroundColor: "white",
  pointBorderColor: "rgba(255, 255, 255, 0.5)",
  pointBorderWidth: 0.5,
  pointRadius: 0,
  pointHoverRadius: 1.5,
});

/**
 * 라인 차트 옵션 생성
 */
export const createLineChartOptions = (tooltipLabelFormatter) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      cornerRadius: 4,
      displayColors: false,
      callbacks: {
        title: function (context) {
          const index = context[0].dataIndex;
          const labels = context[0].chart.data.labels;
          return `날짜: ${labels[index]}`;
        },
        label: tooltipLabelFormatter,
      },
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 1.5,
      backgroundColor: "white",
      borderColor: "rgba(255, 255, 255, 0.5)",
      borderWidth: 0.5,
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
});

/**
 * 매출 차트 데이터 생성
 */
export const createSalesChartData = (labels, data) => ({
  labels,
  datasets: [createLineChartDataset("일별 매출", data)],
});

/**
 * 공헌이익 차트 데이터 생성
 */
export const createProfitChartData = (labels, data) => ({
  labels,
  datasets: [createLineChartDataset("일별 공헌이익", data)],
});

/**
 * 매출 차트 옵션
 */
export const salesChartOptions = createLineChartOptions((context) => {
  return `매출: ${context.parsed.y.toLocaleString()}원`;
});

/**
 * 공헌이익 차트 옵션
 */
export const profitChartOptions = createLineChartOptions((context) => {
  return `공헌이익: ${context.parsed.y.toLocaleString()}원`;
});

/**
 * 바 차트 데이터셋 생성
 */
export const createBarChartDataset = (label, data, color) => ({
  label,
  data,
  backgroundColor: color,
  borderColor: color,
  borderWidth: 1,
  borderRadius: 4,
  barThickness: 'flex',
  maxBarThickness: 40,
});

/**
 * 바 차트 옵션 생성
 */
export const createBarChartOptions = (tooltipLabelFormatter) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "white",
      bodyColor: "white",
      cornerRadius: 4,
      displayColors: false,
      callbacks: {
        title: function (context) {
          const index = context[0].dataIndex;
          const labels = context[0].chart.data.labels;
          return `날짜: ${labels[index]}`;
        },
        label: tooltipLabelFormatter,
      },
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      beginAtZero: true,
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
});

/**
 * 매출 바 차트 데이터 생성
 */
export const createSalesBarChartData = (labels, data) => ({
  labels,
  datasets: [createBarChartDataset("일별 매출", data, "rgba(59, 130, 246, 0.8)")],
});

/**
 * 광고비 바 차트 데이터 생성
 */
export const createAdCostBarChartData = (labels, data) => ({
  labels,
  datasets: [createBarChartDataset("일별 광고비", data, "rgba(239, 68, 68, 0.8)")],
});

/**
 * 공헌이익 바 차트 데이터 생성
 */
export const createProfitBarChartData = (labels, data) => ({
  labels,
  datasets: [createBarChartDataset("일별 공헌이익", data, "rgba(34, 197, 94, 0.8)")],
});

/**
 * 매출 바 차트 옵션
 */
export const salesBarChartOptions = createBarChartOptions((context) => {
  return `매출: ${context.parsed.y.toLocaleString()}원`;
});

/**
 * 광고비 바 차트 옵션
 */
export const adCostBarChartOptions = createBarChartOptions((context) => {
  return `광고비: ${context.parsed.y.toLocaleString()}원`;
});

/**
 * 공헌이익 바 차트 옵션
 */
export const profitBarChartOptions = createBarChartOptions((context) => {
  return `공헌이익: ${context.parsed.y.toLocaleString()}원`;
});
