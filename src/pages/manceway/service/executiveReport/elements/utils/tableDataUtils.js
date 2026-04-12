/**
 * 테이블 데이터 처리 유틸리티 함수들
 */

/**
 * 채널명을 데이터 키로 매핑하는 함수 (부모 판매처용)
 * 백엔드에서 "${channelName}Sales", "${channelName}Ratio" 형식으로 반환함
 * @param {string} channelName - 채널 이름
 * @param {string} type - 'sales' 또는 'ratio'
 * @returns {string} 데이터 키
 */
export const getChannelDataKey = (channelName, type) => {
  if (type === "sales") {
    return `${channelName}Sales`;
  } else {
    return `${channelName}Ratio`;
  }
};

/**
 * 자식 판매처(파일 판매처) ID를 데이터 키로 매핑하는 함수
 * 백엔드에서 "mp${childId}Sales", "mp${childId}Ratio" 형식으로 반환함
 * 이름 중복 문제를 해결하기 위해 ID 기반 키 사용
 * @param {number} channelId - 파일 판매처 ID
 * @param {string} type - 'sales' 또는 'ratio'
 * @returns {string} 데이터 키
 */
export const getChildChannelDataKey = (channelId, type) => {
  if (type === "sales") {
    return `mp${channelId}Sales`;
  } else {
    return `mp${channelId}Ratio`;
  }
};

/**
 * 특정 채널의 총매출 계산
 */
export const calculateChannelTotal = (productList, selectedProducts, tableData, channelName) => {
  const salesKey = getChannelDataKey(channelName, "sales");
  return productList
    .filter((product) => selectedProducts.includes(product.id))
    .reduce((sum, product) => {
      const productData = tableData.find((item) => item.productId === product.id);
      return sum + (productData && productData[salesKey] ? productData[salesKey] : 0);
    }, 0);
};

/**
 * 전체 총매출 계산
 */
export const calculateTotalSales = (productList, selectedProducts, tableData) => {
  return productList
    .filter((product) => selectedProducts.includes(product.id))
    .reduce((sum, product) => {
      const productData = tableData.find((item) => item.productId === product.id);
      return sum + (productData ? productData.totalSales : 0);
    }, 0);
};

/**
 * 합계 계산 함수
 */
export const calculateTotal = (productList, selectedProducts, tableData, field) => {
  return productList
    .filter((product) => selectedProducts.includes(product.id))
    .reduce((sum, product) => {
      const productData = tableData.find((item) => item.productId === product.id);
      return sum + (productData ? productData[field] : 0);
    }, 0);
};

/**
 * 선택한 판매처의 총매출 계산
 * @param {Array} productList - 제품 목록
 * @param {Array} selectedProducts - 선택된 제품 ID 배열
 * @param {Array} tableData - 테이블 데이터
 * @param {Array} selectedChannels - 선택된 판매처 (이름 배열 또는 ID 배열)
 * @param {string} viewMode - 'channel' (판매처별) 또는 'fileChannel' (파일판매처별)
 * @param {Array} childSalesChannelList - 자식 판매처 목록 (fileChannel 모드용)
 * @returns {number} 선택한 판매처의 총매출
 */
export const calculateFilteredTotalSales = (
  productList,
  selectedProducts,
  tableData,
  selectedChannels,
  viewMode = 'channel',
  childSalesChannelList = []
) => {
  if (!selectedChannels || selectedChannels.length === 0) {
    return 0;
  }

  return productList
    .filter((product) => selectedProducts.includes(product.id))
    .reduce((sum, product) => {
      const productData = tableData.find((item) => item.productId === product.id);
      if (!productData) return sum;

      // 선택한 판매처의 매출만 합산
      let productTotal = 0;

      if (viewMode === 'fileChannel') {
        // 파일판매처별 모드: ID 기반 키 사용
        selectedChannels.forEach((childId) => {
          const salesKey = getChildChannelDataKey(childId, 'sales');
          productTotal += productData[salesKey] || 0;
        });
      } else {
        // 판매처별 모드: 이름 기반 키 사용
        selectedChannels.forEach((channelName) => {
          const salesKey = getChannelDataKey(channelName, 'sales');
          productTotal += productData[salesKey] || 0;
        });
      }

      return sum + productTotal;
    }, 0);
};

/**
 * 선택한 판매처 비율로 광고비 계산
 * 광고비는 판매처별로 나뉘지 않으므로, 선택한 판매처의 매출 비율만큼만 계산
 * @param {Array} productList - 제품 목록
 * @param {Array} selectedProducts - 선택된 제품 ID 배열
 * @param {Array} tableData - 테이블 데이터
 * @param {Array} selectedChannels - 선택된 판매처 (이름 배열 또는 ID 배열)
 * @param {string} viewMode - 'channel' (판매처별) 또는 'fileChannel' (파일판매처별)
 * @param {Array} childSalesChannelList - 자식 판매처 목록 (fileChannel 모드용)
 * @returns {number} 선택한 판매처 비율의 광고비
 */
export const calculateFilteredAdCost = (
  productList,
  selectedProducts,
  tableData,
  selectedChannels,
  viewMode = 'channel',
  childSalesChannelList = []
) => {
  if (!selectedChannels || selectedChannels.length === 0) {
    return 0;
  }

  let totalAdCostSum = 0;

  const filteredProducts = productList.filter((product) => selectedProducts.includes(product.id));

  filteredProducts.forEach((product) => {
      const productData = tableData.find((item) => item.productId === product.id);
      if (!productData) return;

      const totalSales = productData.totalSales || 0;
      const adCost = productData.adCost || 0;

      // 선택한 판매처의 매출만 합산
      let selectedSales = 0;

      if (viewMode === 'fileChannel') {
        selectedChannels.forEach((childId) => {
          const salesKey = getChildChannelDataKey(childId, 'sales');
          const sales = productData[salesKey] || 0;
          selectedSales += sales;
        });
      } else {
        selectedChannels.forEach((channelName) => {
          const salesKey = getChannelDataKey(channelName, 'sales');
          const sales = productData[salesKey] || 0;
          selectedSales += sales;
        });
      }

      // 광고비 계산
      let productAdCost;

      if (totalSales === 0) {
        // 매출이 0이면 광고비 전액 포함 (어느 판매처에서도 매출 없음)
        productAdCost = adCost;
      } else {
        // 선택한 판매처의 매출 비율만큼 광고비 계산
        const ratio = selectedSales / totalSales;
        productAdCost = adCost * ratio;
      }

      totalAdCostSum += productAdCost;
    });

  return totalAdCostSum;
};
