import { useMemo } from 'react';

/**
 * 자사 데이터와 대행 데이터를 합산하는 Hook
 * @param {Array} tableData - 자사 데이터 배열 (sales-table API 결과)
 * @param {Array} agencyTableData - 대행 데이터 배열 (getAgencySalesData 결과)
 * @returns {Object} 합산된 데이터 및 차트 데이터
 */
const useCombinedData = (tableData, agencyTableData) => {
  return useMemo(() => {
    // 기본값 처리
    const inHouseData = Array.isArray(tableData) ? tableData : [];
    const agencyData = Array.isArray(agencyTableData) ? agencyTableData : [];

    // 데이터가 로드되지 않았으면 빈 객체 반환 (계산 방지)
    if (inHouseData.length === 0 || agencyData.length === 0) {
      return {
        totalSales: 0,
        totalAdCost: 0,
        totalProfit: 0,
        salesGrowth: 0,
        profitGrowth: 0,
        chartLabels: ['기간 합계'],
        chartSalesData: [0],
        chartAdCostData: [0],
        chartProfitData: [0],
      };
    }

    // 자사 데이터 합산 (대행 제품 제외)
    const inHouseOnlyData = inHouseData.filter(row => !row.product?.startsWith('대행_'));
    const inHouseSales = inHouseOnlyData.reduce((sum, row) => sum + (Number(row.totalSales) || 0), 0);
    const inHouseAdCost = inHouseOnlyData.reduce((sum, row) => sum + (Number(row.adCost) || 0), 0);
    const inHouseProfit = inHouseOnlyData.reduce((sum, row) => sum + (Number(row.contributionProfit) || 0), 0);

    // 대행 데이터 합산
    const agencyAdCost = agencyData.reduce((sum, row) => sum + (Number(row.totalAdCost) || 0), 0);      // 광고비 (총광고비/매출/공헌이익 계산용)
    const agencyFee = agencyData.reduce((sum, row) => sum + (Number(row.totalAgencyFee) || 0), 0);       // 대행료 (참고용, 현재 미사용)

    // 총합 계산
    // 매출 = 자사매출 + (대행 광고비 * 0.1)
    // 광고비 = 자사 광고비 + 대행 광고비
    // 공헌이익 = 자사공헌이익 + (대행 광고비 * 0.1)
    const totalSales = inHouseSales + (agencyAdCost * 0.1);
    const totalAdCost = inHouseAdCost + agencyAdCost;
    const totalProfit = inHouseProfit + (agencyAdCost * 0.1);

    // 전월대비 증감률은 0으로 설정 (tableData에는 증감률 정보 없음)
    const salesGrowth = 0;
    const profitGrowth = 0;

    // 차트 데이터 (기간 합계만 사용하므로 일별 데이터는 불필요)
    const chartLabels = ['기간 합계'];
    const chartSalesData = [totalSales];
    const chartAdCostData = [totalAdCost];
    const chartProfitData = [totalProfit];

    return {
      totalSales,
      totalAdCost,
      totalProfit,
      salesGrowth,
      profitGrowth,
      chartLabels,
      chartSalesData,
      chartAdCostData,
      chartProfitData,
    };
  }, [tableData, agencyTableData]);
};

export default useCombinedData;
