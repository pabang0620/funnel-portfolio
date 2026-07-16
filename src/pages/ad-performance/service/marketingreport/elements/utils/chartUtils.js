/**
 * 차트 관련 유틸리티 함수들
 */

import { generateWeekLabels } from './dateUtils';
import { filterData, aggregateWeeklyData } from '../../dummyData';

/**
 * 매출 및 광고비 소진 현황 차트 데이터 생성 함수
 * @param {string} weekStartDay - 주 시작 기준
 * @param {Object} customDateRange - 날짜 범위
 * @param {string[]} selectedMedia - 선택된 매체 목록
 * @returns {Object} Chart.js 데이터 객체
 */
export const generateSalesAdChart = (weekStartDay, customDateRange, selectedMedia) => {
  const labels = generateWeekLabels(weekStartDay, customDateRange);

  // 날짜 범위 설정
  let startDate, endDate;
  if (customDateRange && customDateRange.startDate) {
    startDate = customDateRange.startDate;
    endDate = customDateRange.endDate;
  } else {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    startDate = new Date(year, month, 1).toISOString().split('T')[0];
    endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  }

  // 데이터 필터링 및 집계
  const filteredData = filterData(selectedMedia, startDate, endDate);
  const date = new Date(startDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const weeklyData = aggregateWeeklyData(filteredData, weekStartDay, year, month);

  // 주차별 데이터 매핑
  const adCostData = labels.map((label) => {
    const weekData = weeklyData.find((w) => w.week === label);
    return weekData ? weekData.adCost : 0;
  });

  const revenueData = labels.map((label) => {
    const weekData = weeklyData.find((w) => w.week === label);
    return weekData ? weekData.revenue : 0;
  });

  const roasData = labels.map((label) => {
    const weekData = weeklyData.find((w) => w.week === label);
    return weekData ? weekData.roas : 0;
  });

  return {
    labels: labels,
    datasets: [
      {
        type: "line",
        label: "ROAS (%)",
        data: roasData,
        borderColor: "#A43737",
        backgroundColor: "#A43737",
        borderWidth: 2,
        yAxisID: "y1",
        pointStyle: "circle",
        pointRadius: 2,
      },
      {
        type: "bar",
        label: "광고비 (원)",
        data: adCostData,
        backgroundColor: "#2265ED",
        borderColor: "#2265ED",
        borderWidth: 1,
        yAxisID: "y",
        pointStyle: "rect",
      },
      {
        type: "bar",
        label: "직접매출합계 (원)",
        data: revenueData,
        backgroundColor: "#8BCEFF",
        borderColor: "#8BCEFF",
        borderWidth: 1,
        yAxisID: "y",
        pointStyle: "rect",
      },
    ],
  };
};

/**
 * 광고 세부 지표 차트 데이터 생성 함수
 * @param {string} weekStartDay - 주 시작 기준
 * @param {Object} customDateRange - 날짜 범위
 * @param {string[]} selectedMedia - 선택된 매체 목록
 * @returns {Object} Chart.js 데이터 객체
 */
export const generateAdMetricsChart = (weekStartDay, customDateRange, selectedMedia) => {
  const labels = generateWeekLabels(weekStartDay, customDateRange);

  // 날짜 범위 설정
  let startDate, endDate;
  if (customDateRange && customDateRange.startDate) {
    startDate = customDateRange.startDate;
    endDate = customDateRange.endDate;
  } else {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    startDate = new Date(year, month, 1).toISOString().split('T')[0];
    endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  }

  // 데이터 필터링 및 집계
  const filteredData = filterData(selectedMedia, startDate, endDate);
  const date = new Date(startDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const weeklyData = aggregateWeeklyData(filteredData, weekStartDay, year, month);

  // 주차별 데이터 매핑
  const cpcData = labels.map((label) => {
    const weekData = weeklyData.find((w) => w.week === label);
    return weekData ? weekData.cpc : 0;
  });

  const cvrData = labels.map((label) => {
    const weekData = weeklyData.find((w) => w.week === label);
    return weekData ? weekData.cvr : 0;
  });

  const ctrData = labels.map((label) => {
    const weekData = weeklyData.find((w) => w.week === label);
    return weekData ? weekData.ctr : 0;
  });

  return {
    labels: labels,
    datasets: [
      {
        type: "line",
        label: "전환율 (%)",
        data: cvrData,
        borderColor: "#A43737",
        backgroundColor: "#A43737",
        borderWidth: 2,
        yAxisID: "y1",
        pointStyle: "circle",
        pointRadius: 2,
      },
      {
        type: "line",
        label: "CTR (%)",
        data: ctrData,
        borderColor: "#2265ED",
        backgroundColor: "#2265ED",
        borderWidth: 2,
        yAxisID: "y1",
        pointStyle: "circle",
        pointRadius: 2,
      },
      {
        type: "bar",
        label: "CPC (원)",
        data: cpcData,
        backgroundColor: "#7ED4FF",
        borderColor: "#7ED4FF",
        borderWidth: 1,
        yAxisID: "y",
        pointStyle: "rect",
        barPercentage: 0.5,
      },
    ],
  };
};

/**
 * 차트 공통 옵션 (이중 Y축)
 */
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top",
      align: "end",
      labels: {
        boxWidth: 10,
        padding: 15,
        usePointStyle: true,
        pointRadius: 3,
      },
      margin: {
        bottom: 20,
      },
    },
    datalabels: {
      display: function(context) {
        // line 타입만 표시
        return context.dataset.type === 'line';
      },
      align: 'top',
      anchor: 'end',
      offset: 4,
      clip: false,
      color: '#1f2937',
      font: {
        size: 10,
        weight: 'bold',
      },
      formatter: function(value) {
        if (value === 0 || value === null) return '';
        return value.toFixed(1);
      },
    },
  },
  layout: {
    padding: {
      top: 20,
      right: 10,
      bottom: 0,
      left: 10,
    },
  },
  clip: false,
  elements: {
    point: {
      radius: 3,
      hoverRadius: 5,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: "#6b7280",
        font: {
          size: 11,
        },
      },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      beginAtZero: true,
      grid: {
        display: true,
        drawBorder: false,
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        callback: function (value) {
          return value.toLocaleString();
        },
        color: "#6b7280",
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      beginAtZero: true,
      grid: {
        display: false,
        drawBorder: false,
        drawOnChartArea: false,
      },
      ticks: {
        color: "#6b7280",
        font: {
          size: 11,
        },
      },
      border: {
        display: false,
      },
    },
  },
};
