import { useState, useEffect, useCallback } from 'react';
import { getMonthlyRevenue } from '../../api';

/**
 * 월별 매출 차트 데이터 관리 훅
 * @param {number} selectedProductId - 선택된 제품 ID
 */
const useMonthlyChart = (selectedProductId) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // API 호출 함수
  const fetchData = useCallback(async () => {
    // selectedProductId가 null이면 '전체' 선택 상태
    if (!selectedProductId) {
      setChartData(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getMonthlyRevenue({
        productId: selectedProductId // ID로 변경
      });

      if (response.data) {
        setChartData({
          revenue: response.data.revenue || [],
          profit: response.data.profit || []
        });
      }
    } catch (error) {
      console.error('월별 차트 데이터 조회 오류:', error);
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProductId]);

  // 의존성 변경 시 API 호출
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { chartData, isLoading };
};

export default useMonthlyChart;
