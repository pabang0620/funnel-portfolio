// Executive Report API 모듈
// 백엔드 API 호출을 위한 실제 HTTP 요청 함수들 (현재는 mockData 반환)

import { fetchWithAuth } from '../../utils/api';

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const USE_MOCK_DATA = true; // PORTFOLIO: always use mock data

// Mock 데이터
const mockMarketPlaces = [
  { id: 1, name: "카페24" },
  { id: 2, name: "쿠팡" },
  { id: 3, name: "쿠팡그로서리" },
  { id: 4, name: "스마트스토어" },
  { id: 5, name: "옥션" },
  { id: 6, name: "11번가" },
];

const mockProducts = [
  { id: 1, name: "알파덴탈" },
  { id: 2, name: "베타케어" },
  { id: 3, name: "감마헬스" },
  { id: 4, name: "델타치과" },
  { id: 5, name: "엡실론임플" },
  { id: 6, name: "제타메드" },
  { id: 7, name: "에타프로" },
];

// 랜덤 데이터 생성 헬퍼 함수들
const generateRandomSales = (min = 1000000, max = 10000000) =>
  Math.floor(Math.random() * (max - min) + min);

const generateRandomGrowth = () => (Math.random() * 40 - 20).toFixed(1); // -20% ~ +20%

const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return dates.slice(0, 30); // 최대 30일
};

// HTTP 요청 헬퍼 함수
const request = async (endpoint, options = {}) => {
  if (USE_MOCK_DATA) {
    // Mock 데이터 반환 (개발용)
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200)
    ); // 네트워크 지연 시뮬레이션
    return { success: true }; // Mock에서는 실제 요청하지 않음
  }

  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // 에러 응답이지만 JSON 데이터가 있으면 함께 전달
      const error = new Error(
        data.message || `HTTP error! status: ${response.status}`
      );
      error.response = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API 요청 실패: ${endpoint}`, error);
    throw error;
  }
};

/**
 * 판매처 목록 조회
 * @returns {Promise<{data: Array<{id: number, name: string}>}>}
 */
export const getMarketPlaces = async () => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: mockMarketPlaces };
  }
  return await request("/executiveReport/marketplaces");
};

/**
 * 판매상품 목록 조회
 * @returns {Promise<{data: Array<{id: number, name: string}>}>}
 */
export const getProducts = async () => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { data: mockProducts };
  }
  return await request("/executiveReport/products");
};

/**
 * 매체 목록 조회 (광고 매체)
 * @returns {Promise<{data: Array<{id: number, name: string}>}>}
 */
export const getAdMediaList = async () => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      data: [
        { id: 1, name: "구글" },
        { id: 2, name: "메타" },
        { id: 3, name: "틱톡" },
        { id: 4, name: "GFA" },
        { id: 5, name: "쿠팡" },
        { id: 6, name: "네이버SA" },
      ],
    };
  }
  return await request("/media/admedia");
};

/**
 * 매출 차트 데이터 조회 (임원용)
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
 * @param {string[]} params.marketPlaces - 선택된 판매처 목록
 * @param {string[]} params.products - 선택된 상품 목록
 * @returns {Promise<{data: {labels: string[], salesData: number[], profitData: number[]}}>}
 */
export const getSalesData = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const startDate = params?.startDate || '2026-04-01';
    const endDate = params?.endDate || '2026-04-30';
    const labels = generateDateRange(startDate, endDate);
    const salesData = labels.map(() => generateRandomSales(2000000, 5000000));
    const profitData = salesData.map((sales) =>
      Math.floor(sales * (0.25 + Math.random() * 0.15))
    ); // 25-40% 이익률

    return {
      data: {
        labels,
        salesData,
        profitData,
        totalSales: salesData.reduce((sum, val) => sum + val, 0),
        totalProfit: profitData.reduce((sum, val) => sum + val, 0),
        avgSales: Math.floor(
          salesData.reduce((sum, val) => sum + val, 0) / salesData.length
        ),
        salesGrowth: generateRandomGrowth(),
        profitGrowth: generateRandomGrowth(),
      },
    };
  }

  const queryParams = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    marketPlaces: params.marketPlaces.join(","),
    productIds: params.productIds.join(","), // ID 배열로 변경
  });

  return await request(`/executiveReport/sales-data?${queryParams}`);
};

/**
 * 광고 운영 수수료 조회 (임원용)
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @returns {Promise<{data: {totalFee: number, details: Array<{date: string, item: string, adCost: number, feeRate: number, fee: number, status: string}>}}>}
 */
export const getAdFee = async (params = {}) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 150));

    const adItems = [
      "네이버 광고",
      "구글 광고",
      "메타 광고",
      "카카오 광고",
      "틱톡 광고",
    ];
    const details = [];
    let totalFee = 0;

    // 최근 7일간 데이터 생성
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const item = adItems[Math.floor(Math.random() * adItems.length)];
      const adCost = generateRandomSales(500000, 3000000);
      const feeRate = 15 + Math.random() * 5; // 15-20%
      const fee = Math.floor(adCost * (feeRate / 100));
      totalFee += fee;

      details.push({
        date: date.toISOString().split("T")[0],
        item,
        adCost,
        feeRate: parseFloat(feeRate.toFixed(1)),
        fee,
        status: Math.random() > 0.1 ? "정상" : "검토중",
      });
    }

    return {
      data: {
        totalFee,
        details: details.sort((a, b) => new Date(b.date) - new Date(a.date)),
      },
    };
  }

  const queryParams = new URLSearchParams();
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  const endpoint = queryParams.toString()
    ? `/executiveReport/ad-fee?${queryParams}`
    : "/executiveReport/ad-fee";

  return await request(endpoint);
};

/**
 * 판매실적 테이블 데이터 조회
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
 * @param {string[]} params.marketPlaces - 선택된 판매처 목록
 * @param {string[]} params.products - 선택된 상품 목록
 * @param {string} params.userRole - 사용자 권한 (S: 임원, C: 일반)
 * @returns {Promise<{data: Array<{product: string, [channelName]: number, totalSales: number, ...}>}>}
 */
export const getTableData = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const startDate = params?.startDate || '2026-04-01';
    const endDate = params?.endDate || '2026-04-30';
    const isAdmin = params?.userRole === "S";
    const selectedProducts = params?.products || mockProducts.map((p) => p.name);
    const selectedMarketPlaces =
      params?.marketPlaces || mockMarketPlaces.map((m) => m.name);

    const tableData = selectedProducts.map((productName) => {
      const productObj = mockProducts.find((p) => p.name === productName);
      const item = { product: productName, productId: productObj ? productObj.id : null };
      let totalSales = 0;

      // 각 판매처별 매출 생성
      selectedMarketPlaces.forEach((marketplace) => {
        const sales = generateRandomSales();
        item[`${marketplace}Sales`] = sales;
        totalSales += sales;
      });

      item.totalSales = totalSales;

      // 판매처별 비율 계산
      selectedMarketPlaces.forEach((marketplace) => {
        item[`${marketplace}Ratio`] = (
          (item[`${marketplace}Sales`] / totalSales) *
          100
        ).toFixed(1);
      });

      // 관리자용 추가 데이터
      if (isAdmin) {
        item.salesMargin = Math.floor(totalSales * (0.2 + Math.random() * 0.3)); // 20-50% 마진
        item.contributionProfit = Math.floor(
          totalSales * (0.15 + Math.random() * 0.25)
        ); // 15-40% 공헌이익
        item.profitRate = (
          (item.contributionProfit / totalSales) *
          100
        ).toFixed(1); // 이익률
        item.adCost = Math.floor(totalSales * (0.05 + Math.random() * 0.15)); // 5-20% 광고비
        item.roas = ((totalSales / item.adCost) * 100).toFixed(1); // ROAS (%)
        item.salesCommission = Math.floor(
          totalSales * (0.02 + Math.random() * 0.08)
        ); // 2-10% 매출수수료
      }

      return item;
    });

    return { data: tableData };
  }

  return await request("/executiveReport/sales-table", {
    method: "POST",
    body: JSON.stringify({
      startDate: params.startDate,
      endDate: params.endDate,
      marketPlaces: params.marketPlaces,
      productIds: params.productIds, // ID 배열로 변경
      userRole: params.userRole,
    }),
  });
};

/**
 * 제품 상세 - 매출 실적 현황 데이터 조회
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {string} params.product - 선택된 제품
 * @param {string[]} params.marketPlaces - 선택된 판매처 목록
 * @param {string} params.userRole - 사용자 권한
 * @returns {Promise<{data: Array}>}
 */
export const getRevenuePerformance = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const dates = generateDateRange(params.startDate, params.endDate);
    const isAdmin = params.userRole === "S";

    const data = dates.map((date) => {
      const item = { date };
      let totalSales = 0;

      // 각 판매처별 매출
      params.marketPlaces.forEach((marketplace) => {
        const sales = generateRandomSales();
        item[marketplace] = sales;
        totalSales += sales;
      });

      item.totalSales = totalSales;

      if (isAdmin) {
        item.profit = Math.floor(totalSales * (0.2 + Math.random() * 0.2));
        item.profitRate = ((item.profit / totalSales) * 100).toFixed(1);
        item.adCost = Math.floor(totalSales * (0.05 + Math.random() * 0.1));
        item.roas = ((totalSales / item.adCost) * 100).toFixed(1); // ROAS (%)
      }

      return item;
    });

    return { data };
  }

  return await request("/executiveReport/product-detail/revenue-performance", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 제품 상세 - 매체별 실적 현황 데이터 조회
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {string} params.product - 선택된 제품
 * @param {number[]} params.mediaIds - 선택된 매체 ID 목록
 * @param {string} params.userRole - 사용자 권한
 * @returns {Promise<{data: Array}>}
 */
export const getMediaPerformance = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const dates = generateDateRange(params.startDate, params.endDate);
    const isAdmin = params.userRole === "S";

    const data = dates.map((date) => {
      const item = { date };
      let totalAdCost = 0;
      let totalSales = 0;

      // 각 매체별 데이터
      params.media.forEach((mediaName) => {
        const adCost = generateRandomSales(100000, 1000000);
        const sales = generateRandomSales(500000, 3000000);

        item[`${mediaName}AdCost`] = adCost;
        item[`${mediaName}Sales`] = sales;
        item[`${mediaName}ROAS`] = ((sales / adCost) * 100).toFixed(1); // ROAS (%)

        totalAdCost += adCost;
        totalSales += sales;
      });

      item.totalAdCost = totalAdCost;
      item.totalSales = totalSales;
      item.avgROAS = ((totalSales / totalAdCost) * 100).toFixed(1); // ROAS (%)

      if (isAdmin) {
        item.profit = Math.floor(totalSales * (0.25 + Math.random() * 0.15));
        item.profitRate = ((item.profit / totalSales) * 100).toFixed(1);
      }

      return item;
    });

    return { data };
  }

  return await request("/executiveReport/product-detail/media-performance", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 제품 상세 - 판매처별 실적 현황 데이터 조회
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {string} params.product - 선택된 제품
 * @param {string[]} params.marketPlaces - 선택된 판매처 목록
 * @returns {Promise<{data: Array}>}
 */
export const getChannelPerformance = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const dates = generateDateRange(params.startDate, params.endDate);

    const data = dates.map((date) => {
      const item = { date };
      let totalSales = 0;

      // 각 판매처별 매출
      params.marketPlaces.forEach((marketplace) => {
        const sales = generateRandomSales();
        const quantity = Math.floor(sales / (50000 + Math.random() * 100000)); // 단가 5만~15만원

        item[`${marketplace}Sales`] = sales;
        item[`${marketplace}Quantity`] = quantity;
        item[`${marketplace}AvgPrice`] = Math.floor(sales / quantity);

        totalSales += sales;
      });

      item.totalSales = totalSales;

      return item;
    });

    return { data };
  }

  return await request("/executiveReport/product-detail/channel-performance", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 월별 매출 차트 데이터 조회 (제품 상세용)
 * @param {Object} params - 조회 조건
 * @param {string} params.product - 선택된 제품
 * @param {string} params.year - 조회 연도
 * @returns {Promise<{data: {labels: string[], salesData: number[], profitData: number[]}}>}
 */
export const getMonthlyRevenue = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const months = [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ];
    const currentMonth = new Date().getMonth();
    const labels = months.slice(0, currentMonth + 1); // 현재 월까지만

    const salesData = labels.map(() => generateRandomSales(5000000, 20000000)); // 월별 500만~2000만원
    const profitData = salesData.map((sales) =>
      Math.floor(sales * (0.25 + Math.random() * 0.15))
    );

    return {
      data: {
        labels,
        salesData,
        profitData,
        totalYearSales: salesData.reduce((sum, val) => sum + val, 0),
        avgMonthlySales: Math.floor(
          salesData.reduce((sum, val) => sum + val, 0) / salesData.length
        ),
        salesGrowth: generateRandomGrowth(),
      },
    };
  }

  const queryParams = new URLSearchParams({
    productId: params.productId,
  });

  return await request(`/executiveReport/monthly-revenue?${queryParams}`);
};

/**
 * 일별 판매 상세 데이터 조회 (모달용)
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {string[]} params.marketPlaces - 선택된 판매처 목록
 * @param {string[]} params.products - 선택된 상품 목록
 * @returns {Promise<{data: Array}>}
 */
export const getDailySalesDetail = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dates = generateDateRange(params.startDate, params.endDate);

    const data = [];
    dates.forEach((date) => {
      params.products.forEach((product) => {
        params.marketPlaces.forEach((marketplace) => {
          data.push({
            date,
            product,
            marketplace,
            sales: generateRandomSales(100000, 2000000),
            quantity: Math.floor(Math.random() * 50) + 10,
            avgPrice: Math.floor(Math.random() * 100000) + 50000,
            orderCount: Math.floor(Math.random() * 30) + 5,
          });
        });
      });
    });

    return { data };
  }

  return await request("/executiveReport/daily-sales-detail", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 판매처별 상세 데이터 조회 (제품 상세 모달용)
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {string} params.product - 선택된 제품
 * @returns {Promise<{data: Array}>}
 */
export const getChannelDetail = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const dates = generateDateRange(params.startDate, params.endDate);

    const data = dates.map((date) => {
      const item = { date, product: params.product };

      mockMarketPlaces.forEach((marketplace) => {
        const sales = generateRandomSales(50000, 1000000);
        const quantity = Math.floor(sales / (30000 + Math.random() * 70000));

        item[marketplace.name] = {
          sales,
          quantity,
          avgPrice: Math.floor(sales / quantity),
          orderCount: Math.floor(quantity / (2 + Math.random() * 3)),
          conversionRate: (Math.random() * 5 + 1).toFixed(2) + "%",
        };
      });

      return item;
    });

    return { data };
  }

  return await request("/executiveReport/channel-detail", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 엑셀 업로드 (우측 패널)
 * @param {FormData} formData - 업로드할 파일 데이터
 * @param {string} action - 중복 시 처리 방식 ('overwrite' | 'append')
 * @returns {Promise<{success: boolean, message: string, isDuplicate?: boolean}>}
 */
export const uploadExcel = async (formData, action = null) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    const isSuccess = Math.random() > 0.2;

    if (isSuccess) {
      return {
        success: true,
        message: "엑셀 파일이 성공적으로 업로드되었습니다.",
        data: {
          processedRows: Math.floor(Math.random() * 1000) + 100,
          uploadTime: new Date().toISOString(),
        },
      };
    } else {
      throw new Error("파일 형식이 올바르지 않습니다.");
    }
  }

  // action 파라미터가 있으면 URL에 추가
  const endpoint = action
    ? `/api/executiveReport/upload-excel?action=${action}`
    : `/api/executiveReport/upload-excel`;

  // fetchWithAuth 사용 (토큰 만료 시 자동 로그인 페이지 이동)
  // FormData 사용 시 Content-Type은 자동으로 설정됨
  const response = await fetchWithAuth(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error! status: ${response.status}`);
    error.response = data;
    throw error;
  }

  return data;
};

/**
 * 대행료 상세 데이터 조회
 * 매체별 광고비와 대행료(광고비 x fee%)를 계산
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {string[]} params.products - 선택된 제품 목록
 * @param {string[]} params.media - 선택된 매체 목록
 * @returns {Promise<{success: boolean, data: {mediaList: Array, productData: Array, totalAgencyFee: number}}>}
 */
export const getAgencyFeeDetail = async (params) => {
  return await request("/executiveReport/agency-fee-detail", {
    method: "POST",
    body: JSON.stringify({
      startDate: params.startDate,
      endDate: params.endDate,
      productIds: params.productIds || [],
      media: params.media || [],
    }),
  });
};

/**
 * 팀 목록 조회
 * @returns {Promise<{data: Array<{id: number, name: string}>}>}
 */
export const getTeamList = async (parentsOnly = false) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      data: [
        { id: 1, name: "영업1팀" },
        { id: 2, name: "영업2팀" },
        { id: 3, name: "마케팅팀" },
        { id: 4, name: "기획팀" },
      ],
    };
  }
  const url = parentsOnly
    ? "/executiveReport/teams?parentsOnly=true"
    : "/executiveReport/teams";
  return await request(url);
};

/**
 * 제품 상세 - 팀별 실적 현황 데이터 조회
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일
 * @param {string} params.endDate - 종료일
 * @param {number} params.productId - 선택된 제품 ID
 * @param {number[]} params.teamIds - 선택된 팀 ID 목록
 * @param {string} params.userRole - 사용자 권한
 * @returns {Promise<{data: Array}>}
 */
export const getTeamPerformance = async (params) => {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const dates = generateDateRange(params.startDate, params.endDate);
    const isAdmin = params.userRole === "S";

    const data = dates.map((date) => {
      const item = { date };
      let totalSales = 0;

      // 각 팀별 매출
      params.teamIds.forEach((teamId) => {
        const sales = generateRandomSales();
        item[`team${teamId}Sales`] = sales;
        totalSales += sales;
      });

      item.totalSales = totalSales;

      // 각 팀별 비율 계산
      params.teamIds.forEach((teamId) => {
        const sales = item[`team${teamId}Sales`];
        item[`team${teamId}Ratio`] = totalSales > 0 ? ((sales / totalSales) * 100).toFixed(1) : "0.0";
      });

      if (isAdmin) {
        item.profit = Math.floor(totalSales * (0.2 + Math.random() * 0.2));
        item.profitRate = ((item.profit / totalSales) * 100).toFixed(1);
      }

      return item;
    });

    return { data };
  }

  return await request("/executiveReport/product-detail/team-performance", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 대행 판매 데이터 조회 (팀별/매체별)
 * @param {Object} params - 조회 조건
 * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
 * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
 * @param {number[]} params.productIds - 대행 제품 ID 배열
 * @param {string} params.viewMode - 보기 모드 ('team' | 'media')
 * @param {number[]} params.teamIds - 선택된 팀 ID (팀별 보기용)
 * @param {number[]} params.mediaIds - 선택된 매체 ID (매체별 보기용)
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getAgencySalesData = async (params) => {
  return await request("/executiveReport/agency-sales-data", {
    method: "POST",
    body: JSON.stringify(params),
  });
};

/**
 * 컬럼 설정 조회
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const getColumnSettings = async () => {
  return await request('/account/user-settings/executive-report-show', {
    method: 'GET',
  });
};

/**
 * 컬럼 설정 저장
 * @param {Object} settings - 컬럼 표시/숨김 설정
 * @returns {Promise<{success: boolean}>}
 */
export const saveColumnSettings = async (settings) => {
  return await request('/account/user-settings/executive-report-show', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
};
