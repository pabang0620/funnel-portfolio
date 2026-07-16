import { useMemo } from 'react';
import {
  createSalesChartData,
  createProfitChartData,
  salesChartOptions,
  profitChartOptions,
} from '../utils/chartConfigs';

/**
 * 차트 데이터 생성 Custom Hook
 * API에서 받은 대시보드 데이터를 기반으로 차트 데이터를 생성합니다
 * @param {Object} dashboardData - API에서 받은 대시보드 데이터
 */
export const useChartData = (dashboardData) => {
  // API 데이터에서 차트 라벨과 데이터 추출
  // 백엔드 API는 chartLabels, chartSalesData, chartProfitData 반환
  const { labels, salesData, profitData } = useMemo(() => {
    // 백엔드 API 응답 구조에 맞춤 (chartLabels, chartSalesData, chartProfitData)
    if (dashboardData?.chartLabels && dashboardData?.chartSalesData) {
      return {
        labels: dashboardData.chartLabels,
        salesData: dashboardData.chartSalesData,
        profitData: dashboardData.chartProfitData || []
      };
    }

    // Mock 데이터 또는 대체 구조 지원 (labels, salesData, profitData)
    if (dashboardData?.labels && dashboardData?.salesData) {
      return {
        labels: dashboardData.labels,
        salesData: dashboardData.salesData,
        profitData: dashboardData.profitData || []
      };
    }

    // API 데이터가 없을 경우 빈 배열 반환
    return { labels: [], salesData: [], profitData: [] };
  }, [dashboardData]);

  // 매출 차트 데이터
  const salesChartData = useMemo(
    () => createSalesChartData(labels, salesData),
    [labels, salesData]
  );

  // 공헌이익 차트 데이터
  const profitChartData = useMemo(
    () => createProfitChartData(labels, profitData),
    [labels, profitData]
  );

  return {
    salesChartData,
    salesChartOptions,
    profitChartData,
    profitChartOptions,
  };
};
