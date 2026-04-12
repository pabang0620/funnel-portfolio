/**
 * 차트 관련 유틸리티 함수들
 */

import { generateMonthLabels } from './dateUtils';

/**
 * 그라데이션 생성 함수
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {string} color1 - 그라데이션 시작 색상
 * @param {string} color2 - 그라데이션 종료 색상
 * @returns {CanvasGradient} 생성된 그라데이션
 */
export const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

/**
 * 차트 데이터 생성 함수
 * @param {Object|null} revenueData - 매출 데이터 (revenue, profit 배열 포함)
 * @param {Object|null} chartRef - 차트 ref 객체
 * @param {boolean} shouldHideProfit - 공헌이익을 숨길지 여부
 * @returns {Object} Chart.js 데이터 객체
 */
export const createChartData = (revenueData = null, chartRef = null, shouldHideProfit = false) => {
  const labels = generateMonthLabels();

  // 기본 더미 데이터 (API 연동 전까지)
  const defaultData = {
    revenue: [4500000, 5200000, 4800000, 3200000, 3500000], // 마지막은 예상매출
    profit: [1800000, 2100000, 1900000, 1300000, 1400000], // 마지막은 예상공헌이익
  };

  const actualData = revenueData || defaultData;

  // 브랜드 컬러 - Manceway 계열
  const brandPrimary = "#3b82f6"; // 브랜드 메인 블루
  const brandPrimaryLight = "#60a5fa"; // 밝은 블루
  const brandSecondary = "#bae6fd"; // 하늘색 (공헌이익용)
  const brandSecondaryLight = "#dbeafe"; // 더 밝은 하늘색
  const brandGray = "#94a3b8"; // 예상매출용 회색
  const brandGrayLight = "#cbd5e1"; // 밝은 회색
  const brandPrimaryGray = "#8faacf"; // 블루 + 회색끼 (예상매출)
  const brandPrimaryGrayLight = "#b8c9e4"; // 밝은 블루 + 회색끼
  const brandSecondaryGray = "#d0e4f7"; // 하늘색 + 회색끼 (예상공헌이익)
  const brandSecondaryGrayLight = "#e8f2fa"; // 밝은 하늘색 + 회색끼

  // 그라데이션이 있을 때와 없을 때 처리
  let revenueBackground, profitBackground;

  if (chartRef?.current) {
    const ctx = chartRef.current.ctx;
    revenueBackground = [
      createGradient(ctx, brandPrimaryLight, brandPrimary),
      createGradient(ctx, brandPrimaryLight, brandPrimary),
      createGradient(ctx, brandPrimaryLight, brandPrimary),
      createGradient(ctx, brandPrimaryLight, brandPrimary),
      createGradient(ctx, brandPrimaryGrayLight, brandPrimaryGray),
    ];
    profitBackground = [
      createGradient(ctx, brandSecondaryLight, brandSecondary),
      createGradient(ctx, brandSecondaryLight, brandSecondary),
      createGradient(ctx, brandSecondaryLight, brandSecondary),
      createGradient(ctx, brandSecondaryLight, brandSecondary),
      createGradient(ctx, brandSecondaryGrayLight, brandSecondaryGray),
    ];
  } else {
    // 폴백 - 단색
    revenueBackground = [
      brandPrimary,
      brandPrimary,
      brandPrimary,
      brandPrimary,
      brandPrimaryGray,
    ];
    profitBackground = [
      brandSecondary,
      brandSecondary,
      brandSecondary,
      brandSecondary,
      brandSecondaryGray,
    ];
  }

  // datasets 배열 생성 (공헌이익 조건부 포함)
  const datasets = [
    {
      label: "매출",
      data: actualData.revenue,
      backgroundColor: revenueBackground,
      borderColor: [
        brandPrimary,
        brandPrimary,
        brandPrimary,
        brandPrimary,
        brandPrimaryGray,
      ],
      borderWidth: 0,
      borderRadius: 0,
      borderSkipped: false,
      barThickness: 55,
    }
  ];

  // 공헌이익을 숨기지 않는 경우에만 추가
  if (!shouldHideProfit) {
    datasets.push({
      label: "공헌이익",
      data: actualData.profit,
      backgroundColor: profitBackground,
      borderColor: [
        brandSecondary,
        brandSecondary,
        brandSecondary,
        brandSecondary,
        brandSecondaryGray,
      ],
      borderWidth: 0,
      borderRadius: 0,
      borderSkipped: false,
      barThickness: 55,
    });
  }

  return {
    labels: labels,
    datasets: datasets,
  };
};

/**
 * 차트 옵션 설정
 */
export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index",
  },
  animation: {
    duration: 1000,
    easing: "easeOutCubic",
  },
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      position: "top",
      align: "end",
      labels: {
        usePointStyle: true,
        pointStyle: "rect",
        padding: 20,
        font: {
          size: 13,
          weight: "500",
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#374151",
      bodyColor: "#374151",
      borderColor: "#e5e7eb",
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      padding: 12,
      callbacks: {
        label: function (context) {
          return `${
            context.dataset.label
          }: ${context.parsed.y.toLocaleString()}원`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        font: function (context) {
          const label = context.chart.data.labels[context.index];
          return {
            size: 12,
            weight: label && label.includes("진행중") ? "bold" : "500",
          };
        },
        color: "#6b7280",
        padding: 10,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        callback: function (value) {
          return value.toLocaleString();
        },
        font: {
          size: 12,
        },
        color: "#6b7280",
        padding: 15,
      },
    },
  },
  elements: {
    bar: {
      borderRadius: 0,
    },
  },
};
