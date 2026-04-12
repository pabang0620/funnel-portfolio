/**
 * 테이블 컬럼 동적 생성 함수들
 */

import { filterColumnsByPermission } from '../../../../utils/permissionUtils';

// 컬럼별 계산식 툴팁 정의
const COLUMN_TOOLTIPS = {
  // 1번 테이블 (매출 실적 현황) - 데이터 출처: salesOrder + boxPrice
  총매출_1: "[salesOrder × boxPrice]\n주문수량 × 박스별 단가",
  직접매출: "[계산]\n자사 판매처(카페24)에서 발생한 매출",
  간접매출: "[계산]\n외부 판매처에서 발생한 매출",
  판매마진: "[salesOrder + boxPrice + productCode]\n매출 - 수수료(지불하는 금액) - 배송비 - 원가",
  공헌이익: "[계산]\n판매마진 - 광고비",
  이익률: "[계산]\n공헌이익 / 총매출 × 100",
  광고비_1: "[marketingDailyData.adCost]\n제품별 광고비 합계",
  ROAS_1: "[계산]\n총매출 / 광고비",
  대행료: "[돌려받는 금액]\n매체별 광고비 × 매체별 대행료율 합계",
  매출_판매처: "[salesOrder × boxPrice]\n주문수량 × 박스별 단가",
  비율: "[계산]\n판매처별 매출 / 총매출 × 100",

  // 2번 테이블 (매체별 실적현황) - 데이터 출처: marketingDailyData
  총매출_2: "[marketingDailyData.revenue]\n마케팅 데이터 매출 (매체별 합계)",
  광고비_2: "[marketingDailyData.adCost]\n마케팅 데이터 광고비",
  ROAS_2: "[계산]\n매체별 매출 / 매체별 광고비",

  // 3번 테이블 (판매처별 실적현황) - 데이터 출처: salesOrder + boxPrice
  판매건수: "[salesOrder.quantity]\n주문 건수",
  매출_3: "[salesOrder × boxPrice]\n주문수량 × 박스별 단가",

  // 4번 테이블 (팀별 실적현황) - 데이터 출처: salesOrder + boxPrice + team
  매출_팀: "[salesOrder × boxPrice]\n팀별 주문수량 × 박스별 단가",
  비율_팀: "[계산]\n팀별 매출 / 총매출 × 100",
};

/**
 * 1번 테이블 (매출 실적 현황) 컬럼 생성 - 동적 판매처 지원
 * @param {string[]} selectedChannels - 선택된 판매처 목록 (이름 배열)
 * @param {boolean} isAdmin - 관리자 여부
 * @param {Function} hasPermission - 권한 체크 함수
 * @param {string} pageId - 페이지 ID (권한 체크용)
 * @param {string} groupName - 그룹 이름 (권한 체크용, 기본값: 'table-columns')
 * @returns {Array[]} 테이블 컬럼 배열
 */
export const generateRevenueColumns = (selectedChannels, isAdmin, hasPermission = () => true, pageId = "executive-report-sales", groupName = "table-columns") => {

  // 기본 열 구조
  const baseColumns = [
    { title: "날짜", rowSpan: 2 },
    { title: "총매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.총매출_1 },
    { title: "직접 매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.직접매출 },
    { title: "간접 매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.간접매출 },
  ];

  // S등급이 아닌 경우: 광고비/ROAS를 총매출 다음에 배치
  const adCostRoasColumns = [
    { title: "광고비", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.광고비_1, className: "ad-cost" },
    { title: "ROAS", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.ROAS_1, className: "roas" },
  ];
  const filteredAdCostRoas = !isAdmin
    ? filterColumnsByPermission(adCostRoasColumns, hasPermission, pageId, isAdmin, groupName)
    : [];

  const channelColumns = [];
  const subChannelColumns = [];

  // 선택된 판매처에 따라 동적으로 열 추가
  if (selectedChannels && selectedChannels.length > 0) {
    selectedChannels.forEach(channelName => {
      channelColumns.push({ title: channelName, colSpan: 2 });
      subChannelColumns.push(
        { title: "매출", tooltip: COLUMN_TOOLTIPS.매출_판매처 },
        { title: "비율", tooltip: COLUMN_TOOLTIPS.비율 }
      );
    });
  }

  // 권한 기반 컬럼 정의 (S등급은 전체, 그 외는 광고비/ROAS 제외)
  const permissionBasedColumns = isAdmin
    ? [
        { title: "판매마진", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.판매마진, className: "margin" },
        { title: "공헌이익", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.공헌이익, className: "profit" },
        { title: "이익률", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.이익률, className: "profit-rate" },
        { title: "광고비", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.광고비_1, className: "ad-cost" },
        { title: "ROAS", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.ROAS_1, className: "roas" },
        { title: "대행료", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.대행료, className: "commission" },
      ]
    : [
        { title: "판매마진", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.판매마진, className: "margin" },
        { title: "공헌이익", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.공헌이익, className: "profit" },
        { title: "이익률", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.이익률, className: "profit-rate" },
        { title: "대행료", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.대행료, className: "commission" },
      ];

  // 권한 필터링
  const filteredColumns = filterColumnsByPermission(permissionBasedColumns, hasPermission, pageId, isAdmin, groupName);

  return [
    [...baseColumns, ...filteredAdCostRoas, ...channelColumns, ...filteredColumns],
    subChannelColumns,
  ];
};

/**
 * 박스별 데이터를 툴팁 형식 문자열로 변환
 * @param {Array} boxData - [{boxCount: 1, sales: 1000000}, ...]
 * @param {string} type - 'sales' 또는 'margin'
 * @returns {string} 툴팁 문자열
 */
const formatBoxDataTooltip = (boxData, type) => {
  if (!boxData || boxData.length === 0) return '';

  const title = type === 'sales' ? '박스별 매출' : '박스별 판매마진';
  const label = type === 'sales' ? 'sales' : 'margin';

  let tooltip = `${title}\n`;
  tooltip += '─────────────────\n';
  boxData.forEach(item => {
    const value = item[label].toLocaleString();
    tooltip += `${item.boxCount}박스: ${value}원\n`;
  });

  return tooltip;
};

/**
 * 1번 테이블 (매출 실적 현황) API 데이터를 테이블 형식으로 변환
 * @param {Array} apiData - API에서 받은 데이터
 * @param {string[]} selectedChannels - 선택된 판매처 이름 목록 (컬럼 순서 결정)
 * @param {boolean} isAdmin - 관리자 여부
 * @param {string} viewMode - 보기 모드 ('channel' | 'fileChannel')
 * @param {number[]|null} channelIds - 파일판매처 ID 배열 (viewMode가 'fileChannel'일 때만 사용)
 * @param {Function} hasPermission - 권한 체크 함수
 * @param {string} pageId - 페이지 ID (권한 체크용)
 * @param {string} groupName - 그룹 이름 (권한 체크용, 기본값: 'table-columns')
 * @returns {Array} 테이블 데이터 배열
 */
export const generateRevenueDataFromApi = (apiData, selectedChannels, isAdmin, viewMode = 'channel', channelIds = null, hasPermission = () => true, pageId = "executive-report-sales", groupName = "table-columns") => {

  if (!apiData || apiData.length === 0) {
    return [];
  }

  // S등급이 아닌 경우: 광고비/ROAS 컬럼 (총매출 다음에 배치)
  const adCostRoasColumns = [
    { title: "광고비", className: "ad-cost" },
    { title: "ROAS", className: "roas" },
  ];
  const filteredAdCostRoas = !isAdmin
    ? filterColumnsByPermission(adCostRoasColumns, hasPermission, pageId, isAdmin, groupName)
    : [];

  // 권한 기반 컬럼 정의 (S등급은 전체, 그 외는 광고비/ROAS 제외)
  const permissionBasedColumns = isAdmin
    ? [
        { title: "판매마진", className: "margin" },
        { title: "공헌이익", className: "profit" },
        { title: "이익률", className: "profit-rate" },
        { title: "광고비", className: "ad-cost" },
        { title: "ROAS", className: "roas" },
        { title: "대행료", className: "commission" },
      ]
    : [
        { title: "판매마진", className: "margin" },
        { title: "공헌이익", className: "profit" },
        { title: "이익률", className: "profit-rate" },
        { title: "대행료", className: "commission" },
      ];

  // 권한 필터링
  const filteredColumns = filterColumnsByPermission(permissionBasedColumns, hasPermission, pageId, isAdmin, groupName);

  return apiData.map((item) => {
    // 총매출 셀: 박스별 매출 데이터가 있으면 툴팁과 클릭 정보 추가
    let totalSalesCell;
    if (item.totalSales > 0) {
      const salesValue = item.totalSales.toLocaleString() + "원";
      if (item.salesByBox && item.salesByBox.length > 0) {
        const tooltip = formatBoxDataTooltip(item.salesByBox, 'sales');
        totalSalesCell = {
          value: salesValue,
          tooltip,
          clickable: true,
          salesByBox: item.salesByBox,
          productName: item.date, // 날짜 정보 표시
          totalSales: item.totalSales
        };
      } else {
        totalSalesCell = salesValue;
      }
    } else {
      totalSalesCell = "-";
    }

    const baseCells = [
      item.date,
      totalSalesCell,
      item.directRevenue > 0 ? item.directRevenue.toLocaleString() + "원" : "-",
      item.indirectRevenue > 0 ? item.indirectRevenue.toLocaleString() + "원" : "-"
    ];

    // S등급이 아닌 경우: 광고비/ROAS를 총매출 다음에 배치
    const adCostRoasCells = [];
    if (!isAdmin && filteredAdCostRoas.length > 0) {
      filteredAdCostRoas.forEach(col => {
        if (col.className === "ad-cost") {
          adCostRoasCells.push(item.adCost > 0 ? item.adCost.toLocaleString() + "원" : "-");
        } else if (col.className === "roas") {
          adCostRoasCells.push(item.roas && item.roas !== "0.0" ? item.roas + "%" : "-");
        }
      });
    }

    const channelCells = [];

    // 선택된 판매처에 따라 동적으로 데이터 추가
    if (selectedChannels && selectedChannels.length > 0) {
      selectedChannels.forEach((channelName, index) => {
        let sales, ratio;

        if (viewMode === 'fileChannel' && channelIds && channelIds[index]) {
          // 파일판매처별 모드: ID 기반 키 사용 (mp${id}Sales, mp${id}Ratio)
          const channelId = channelIds[index];
          sales = item[`mp${channelId}Sales`];
          ratio = item[`mp${channelId}Ratio`];
        } else {
          // 판매처별 모드: 이름 기반 키 사용 (${name}Sales, ${name}Ratio)
          sales = item[`${channelName}Sales`];
          ratio = item[`${channelName}Ratio`];
        }

        channelCells.push(
          sales > 0 ? sales.toLocaleString() + "원" : "-",
          ratio && ratio !== "0.0" ? ratio + "%" : "-"
        );
      });
    }

    // 권한 기반으로 데이터 셀 추가
    const additionalCells = [];

    // 판매마진 셀 미리 준비: 박스별 마진 데이터가 있으면 툴팁 추가
    let salesMarginCell;
    if (item.salesMargin > 0) {
      const marginValue = item.salesMargin.toLocaleString() + "원";
      if (item.marginByBox && item.marginByBox.length > 0) {
        const tooltip = formatBoxDataTooltip(item.marginByBox, 'margin');
        salesMarginCell = { value: marginValue, tooltip };
      } else {
        salesMarginCell = marginValue;
      }
    } else {
      salesMarginCell = "-";
    }

    filteredColumns.forEach(col => {
      switch (col.className) {
        case "margin":
          additionalCells.push(salesMarginCell);
          break;
        case "profit":
          additionalCells.push(item.contributionProfit > 0 ? item.contributionProfit.toLocaleString() + "원" : (item.contributionProfit < 0 ? item.contributionProfit.toLocaleString() + "원" : "-"));
          break;
        case "profit-rate":
          additionalCells.push(item.profitRate && item.profitRate !== "0.0" ? item.profitRate + "%" : "-");
          break;
        case "ad-cost":
          additionalCells.push(item.adCost > 0 ? item.adCost.toLocaleString() + "원" : "-");
          break;
        case "roas":
          additionalCells.push(item.roas && item.roas !== "0.0" ? item.roas + "%" : "-");
          break;
        case "commission":
          additionalCells.push(!isNaN(item.agencyFee) && item.agencyFee > 0 ? item.agencyFee.toLocaleString() + "원" : "-");
          break;
      }
    });

    return {
      cells: [...baseCells, ...adCostRoasCells, ...channelCells, ...additionalCells],
    };
  });
};

/**
 * 1번 테이블 (매출 실적 현황) 데이터 생성 - 더미 데이터용 (기존 호환성 유지)
 * @param {string[]} dates - 날짜 배열
 * @param {string[]} selectedChannels - 선택된 판매처 목록
 * @param {boolean} isAdmin - 관리자 여부
 * @returns {Array} 테이블 데이터 배열
 */
export const generateRevenueData = (dates, selectedChannels, isAdmin) => {
  return dates.map((date) => {
    const baseCells = [date, "-"]; // 날짜, 총매출

    const channelCells = [];

    // 선택된 판매처에 따라 동적으로 데이터 추가
    if (selectedChannels && selectedChannels.length > 0) {
      selectedChannels.forEach(() => {
        channelCells.push("-", "-"); // 매출, 비율
      });
    }

    const adminCells = isAdmin ? [
      "-", // 판매마진
      "-", // 공헌이익
      "-", // 이익률
      "-", // 광고비
      "-", // ROAS
      "-", // 대행료
    ] : [];

    return {
      cells: [...baseCells, ...channelCells, ...adminCells],
    };
  });
};

/**
 * 2번 테이블 (매체별 실적현황) 컬럼 생성 - 동적 매체 지원
 * @param {Array<{id: number, name: string}>} mediaList - 선택된 매체 목록 (ID, 이름 객체 배열)
 * @param {number[]} marketPlaceAsMediaIds - 판매처이면서 매체로 처리된 매체 ID 목록
 * @returns {Array[]} 테이블 컬럼 배열
 */
export const generateMediaColumns = (mediaList, marketPlaceAsMediaIds = []) => {
  // 기본 열 구조 (고정)
  const baseColumns = [
    { title: "날짜", rowSpan: 2 },
    { title: "총매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.총매출_2 },
    { title: "총광고비", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.광고비_2 },
  ];

  const mediaColumns = [];
  const subMediaColumns = [];

  // 선택된 매체에 따라 동적으로 열 추가
  if (mediaList && mediaList.length > 0) {
    mediaList.forEach(media => {
      // 판매처이면서 매체로 처리된 경우 스타일 및 툴팁 추가
      const isMarketPlaceMedia = marketPlaceAsMediaIds.includes(media.id);
      const mediaTooltip = isMarketPlaceMedia
        ? `🛒 ${media.name}은 판매처이면서 광고 매체입니다.\n\n📊 표시되는 매출:\n• 광고 수익 (마케팅 데이터)\n• 판매처 실제 주문 매출\n→ 두 값을 합산하여 표시합니다.`
        : null;

      mediaColumns.push({
        title: media.name, // 컬럼 헤더는 이름으로 표시
        colSpan: 2,
        tooltip: mediaTooltip,
        className: isMarketPlaceMedia ? 'marketplace-media' : undefined
      });
      subMediaColumns.push(
        {
          title: "광고비",
          tooltip: COLUMN_TOOLTIPS.광고비_2,
          className: isMarketPlaceMedia ? 'marketplace-media' : undefined
        },
        {
          title: "ROAS",
          tooltip: COLUMN_TOOLTIPS.ROAS_2,
          className: isMarketPlaceMedia ? 'marketplace-media' : undefined
        }
      );
    });
  }

  return [
    [...baseColumns, ...mediaColumns],
    subMediaColumns,
  ];
};

/**
 * 2번 테이블 (매체별 실적현황) API 데이터를 테이블 형식으로 변환
 * @param {Array} apiData - API에서 받은 데이터
 * @param {Array<{id: number, name: string}>} mediaList - 선택된 매체 목록 (ID, 이름 객체 배열)
 * @param {Array<number>} marketPlaceAsMediaIds - 판매처로도 처리되는 매체 ID 목록
 * @returns {Array} 테이블 데이터 배열
 */
export const generateMediaDataFromApi = (apiData, mediaList, marketPlaceAsMediaIds = []) => {
  if (!apiData || apiData.length === 0) {
    return [];
  }

  // 합계 계산
  let totalSalesSum = 0;
  let totalAdCostSum = 0;
  const mediaTotals = {};

  // 매체별 합계 초기화
  if (mediaList && mediaList.length > 0) {
    mediaList.forEach(media => {
      mediaTotals[media.id] = { adCost: 0, revenue: 0 };
    });
  }

  // 데이터 합계 계산
  apiData.forEach(item => {
    // 선택된 매체의 매출/광고비만 합산
    if (mediaList && mediaList.length > 0) {
      mediaList.forEach(media => {
        const adCost = item[`${media.id}_adCost`] || 0;
        const revenue = item[`${media.id}_revenue`] || 0;

        mediaTotals[media.id].adCost += adCost;
        mediaTotals[media.id].revenue += revenue;

        totalAdCostSum += adCost;
        totalSalesSum += revenue; // 선택된 매체 매출만 합산
      });
    }
  });

  // 합계 행 생성
  const summaryBaseCells = [
    "합계",
    totalSalesSum > 0 ? totalSalesSum.toLocaleString() + "원" : "-",
    totalAdCostSum > 0 ? totalAdCostSum.toLocaleString() + "원" : "-"
  ];

  const summaryMediaCells = [];
  if (mediaList && mediaList.length > 0) {
    mediaList.forEach(media => {
      const adCost = mediaTotals[media.id].adCost;
      const revenue = mediaTotals[media.id].revenue;
      // ROAS 계산: (매출 / 광고비) * 100
      const roas = adCost > 0 ? ((revenue / adCost) * 100).toFixed(1) : null;

      // 판매처이면서 매체인 경우 스타일 및 툴팁 추가
      const isMarketPlaceMedia = marketPlaceAsMediaIds.includes(media.id);
      const cellTooltip = isMarketPlaceMedia
        ? `🛒 ${media.name} 합계 (광고 + 판매처 합산)`
        : null;

      const adCostValue = adCost > 0 ? adCost.toLocaleString() + "원" : "-";
      const roasValue = roas && roas !== "0.0" ? roas + "%" : "-";

      if (isMarketPlaceMedia) {
        summaryMediaCells.push(
          { value: adCostValue, className: 'marketplace-media', tooltip: cellTooltip },
          { value: roasValue, className: 'marketplace-media', tooltip: cellTooltip }
        );
      } else {
        summaryMediaCells.push(adCostValue, roasValue);
      }
    });
  }

  const summaryRow = {
    cells: [...summaryBaseCells, ...summaryMediaCells],
    isTotal: true, // 합계 행 표시용 (DataTable의 total-row 클래스 적용)
  };

  // 일별 데이터 행 생성
  const dataRows = apiData.map((item) => {
    // 선택된 매체의 광고비만 합산
    let dailyAdCostSum = 0;
    if (mediaList && mediaList.length > 0) {
      mediaList.forEach(media => {
        dailyAdCostSum += item[`${media.id}_adCost`] || 0;
      });
    }

    const baseCells = [
      item.date,
      item.totalSales > 0 ? item.totalSales.toLocaleString() + "원" : "-",
      dailyAdCostSum > 0 ? dailyAdCostSum.toLocaleString() + "원" : "-"
    ];

    const mediaCells = [];

    // 선택된 매체에 따라 동적으로 데이터 추가 (ID 기준)
    if (mediaList && mediaList.length > 0) {
      mediaList.forEach(media => {
        // ID 기준으로 데이터 접근 (백엔드에서 이미 부모 매체 기준으로 합산됨)
        const adCost = item[`${media.id}_adCost`] || 0;
        const revenue = item[`${media.id}_revenue`] || 0;
        const roas = item[`${media.id}_roas`];

        // 판매처이면서 매체인 경우 스타일 및 툴팁 추가
        const isMarketPlaceMedia = marketPlaceAsMediaIds.includes(media.id);
        const cellTooltip = isMarketPlaceMedia
          ? `🛒 ${media.name} 매출 (광고 + 판매처 합산)`
          : null;

        const adCostValue = adCost > 0 ? adCost.toLocaleString() + "원" : "-";
        const roasValue = roas === '-' ? "-" : (roas && roas !== "0.0" ? roas + "%" : "-");

        // 판매처+매체인 경우 객체로 만들어서 className과 tooltip 추가
        if (isMarketPlaceMedia) {
          mediaCells.push(
            { value: adCostValue, className: 'marketplace-media', tooltip: cellTooltip },
            { value: roasValue, className: 'marketplace-media', tooltip: cellTooltip }
          );
        } else {
          mediaCells.push(adCostValue, roasValue);
        }
      });
    }

    return {
      cells: [...baseCells, ...mediaCells],
    };
  });

  // 합계 행을 최상단에 추가
  return [summaryRow, ...dataRows];
};

/**
 * 2번 테이블 (매체별 실적현황) 데이터 생성 - 더미 데이터용 (기존 호환성 유지)
 * @param {string[]} dates - 날짜 배열
 * @param {string[]} selectedMedia - 선택된 매체 목록
 * @returns {Array} 테이블 데이터 배열
 */
export const generateMediaData = (dates, selectedMedia) => {
  return dates.map((date) => {
    const baseCells = [date, "-"]; // 날짜, 총매출

    const mediaCells = [];

    // 선택된 매체에 따라 동적으로 데이터 추가
    if (selectedMedia && selectedMedia.length > 0) {
      selectedMedia.forEach(() => {
        mediaCells.push("-", "-"); // 광고비, 직전 ROAS
      });
    }

    return {
      cells: [...baseCells, ...mediaCells],
    };
  });
};

/**
 * 3번 테이블 (판매처별 실적현황) 컬럼 생성 - 동적 판매처 지원
 * @param {string[]} selectedChannels - 선택된 판매처 목록 (이름 배열)
 * @returns {Array[]} 테이블 컬럼 배열
 */
export const generateChannelColumns = (selectedChannels) => {
  const baseColumns = [{ title: "날짜", rowSpan: 2 }];

  const channelColumns = [];
  const subColumns = [];

  // 선택된 판매처에 따라 동적으로 열 추가
  if (selectedChannels && selectedChannels.length > 0) {
    selectedChannels.forEach(channelName => {
      channelColumns.push({ title: channelName, colSpan: 2 });
      subColumns.push(
        { title: "판매건수(집계/미집계)", tooltip: COLUMN_TOOLTIPS.판매건수 },
        { title: "매출", tooltip: COLUMN_TOOLTIPS.매출_3 }
      );
    });
  }

  return [
    [...baseColumns, ...channelColumns],
    subColumns
  ];
};

/**
 * 3번 테이블 (판매처별 실적현황) API 데이터를 테이블 형식으로 변환
 * @param {Array} apiData - API에서 받은 데이터
 * @param {string[]} selectedChannels - 선택된 판매처 이름 목록 (컬럼 순서 결정)
 * @param {string} viewMode - 보기 모드 ('channel' | 'fileChannel')
 * @param {number[]|null} channelIds - 파일판매처 ID 배열 (viewMode가 'fileChannel'일 때만 사용)
 * @returns {Array} 테이블 데이터 배열
 */
export const generateChannelDataFromApi = (apiData, selectedChannels, viewMode = 'channel', channelIds = null) => {
  if (!apiData || apiData.length === 0) {
    return [];
  }

  return apiData.map((item) => {
    const baseCells = [item.date];

    const channelCells = [];

    // 선택된 판매처에 따라 동적으로 데이터 추가
    if (selectedChannels && selectedChannels.length > 0) {
      selectedChannels.forEach((channelName, index) => {
        let quantity, sales, noPriceQty;

        if (viewMode === 'fileChannel' && channelIds && channelIds[index]) {
          // 파일판매처별 모드: ID 기반 키 사용 (mp${id}Quantity, mp${id}Sales)
          const channelId = channelIds[index];
          quantity = item[`mp${channelId}Quantity`];
          sales = item[`mp${channelId}Sales`];
          noPriceQty = item[`mp${channelId}NoPriceQty`] || 0;
        } else {
          // 판매처별 모드: 이름 기반 키 사용 (${name}Quantity, ${name}Sales)
          quantity = item[`${channelName}Quantity`];
          sales = item[`${channelName}Sales`];
          noPriceQty = item[`${channelName}NoPriceQty`] || 0;
        }

        // noPriceDetails 가져오기 (박스 갯수별 상세 정보)
        let noPriceDetails;
        if (viewMode === 'fileChannel' && channelIds && channelIds[index]) {
          const channelId = channelIds[index];
          noPriceDetails = item[`mp${channelId}NoPriceDetails`] || [];
        } else {
          noPriceDetails = item[`${channelName}NoPriceDetails`] || [];
        }

        // 판매건수 표시: 미집계가 있을 때만 집계/미집계 형식으로 표시
        let quantityDisplay = "-";
        if (quantity > 0 || noPriceQty > 0) {
          const countPart = quantity > 0 ? quantity.toLocaleString() + "건" : "0건";
          if (noPriceQty > 0) {
            quantityDisplay = `${countPart}/${noPriceQty.toLocaleString()}건`;
          } else {
            quantityDisplay = countPart;
          }
        }

        // 가격 미등록 수량이 있으면 툴팁 정보 추가 (박스 갯수별 상세 포함)
        let quantityCell = quantityDisplay;
        if (noPriceQty > 0) {
          let tooltipText = "가격 미등록 데이터:\n";
          if (noPriceDetails && noPriceDetails.length > 0) {
            tooltipText += noPriceDetails.map(d => `  ${d.boxCount}박스 ${d.quantity}건`).join("\n");
          } else {
            tooltipText += `  ${noPriceQty}건`;
          }
          tooltipText += "\n\n※ 매출에 포함되지 않습니다.";
          quantityCell = { value: quantityDisplay, tooltip: tooltipText };
        }

        channelCells.push(
          quantityCell,
          sales > 0 ? sales.toLocaleString() + "원" : "-"
        );
      });
    }

    return {
      cells: [...baseCells, ...channelCells],
    };
  });
};

/**
 * 3번 테이블 (판매처별 실적현황) 데이터 생성 - 더미 데이터용 (기존 호환성 유지)
 * @param {string[]} dates - 날짜 배열
 * @param {string[]} selectedChannels - 선택된 판매처 목록
 * @returns {Array} 테이블 데이터 배열
 */
export const generateChannelData = (dates, selectedChannels) => {
  return dates.map((date) => {
    const baseCells = [date];

    const channelCells = [];

    // 선택된 판매처에 따라 동적으로 데이터 추가
    if (selectedChannels && selectedChannels.length > 0) {
      selectedChannels.forEach(() => {
        channelCells.push("-", "-"); // 판매건수, 매출
      });
    }

    return {
      cells: [...baseCells, ...channelCells]
    };
  });
};

/**
 * 4번 테이블 (팀별 실적현황) 컬럼 생성 - 동적 팀 지원
 * @param {string[]} selectedTeams - 선택된 팀 목록 (이름 배열)
 * @param {boolean} isAdmin - 관리자 여부
 * @returns {Array[]} 테이블 컬럼 배열
 */
export const generateTeamColumns = (selectedTeams, isAdmin) => {
  // 선택된 팀이 없으면 기본 컬럼만 반환 (단일 행)
  if (!selectedTeams || selectedTeams.length === 0) {
    return [
      [
        { title: "날짜" },
        { title: "총매출", tooltip: COLUMN_TOOLTIPS.매출_팀 },
      ]
    ];
  }

  // 기본 열 구조 (팀이 있을 때는 rowSpan 사용)
  const baseColumns = [
    { title: "날짜", rowSpan: 2 },
    { title: "총매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.매출_팀 },
  ];

  const teamColumns = [];
  const subTeamColumns = [];

  // 선택된 팀에 따라 동적으로 열 추가
  selectedTeams.forEach(teamName => {
    teamColumns.push({ title: teamName, colSpan: 2 });
    subTeamColumns.push(
      { title: "매출", tooltip: COLUMN_TOOLTIPS.매출_팀 },
      { title: "비율", tooltip: COLUMN_TOOLTIPS.비율_팀 }
    );
  });

  return [
    [...baseColumns, ...teamColumns],
    subTeamColumns,
  ];
};

/**
 * 날짜 범위에서 날짜 배열 생성
 * @param {string} startDate - 시작일 (YYYY-MM-DD)
 * @param {string} endDate - 종료일 (YYYY-MM-DD)
 * @returns {string[]} 날짜 배열 (M/D 형식)
 */
const generateDateRangeForTable = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return dates;
};

/**
 * 4번 테이블 (팀별 실적현황) API 데이터를 테이블 형식으로 변환
 * @param {Array} apiData - API에서 받은 데이터
 * @param {string[]} selectedTeams - 선택된 팀 이름 목록 (컬럼 순서 결정)
 * @param {boolean} isAdmin - 관리자 여부
 * @param {number[]} teamIds - 팀 ID 배열
 * @param {Object} customDateRange - 날짜 범위 { startDate, endDate }
 * @returns {Array} 테이블 데이터 배열
 */
export const generateTeamDataFromApi = (apiData, selectedTeams, isAdmin, teamIds, customDateRange) => {
  // API 데이터가 있으면 그대로 사용
  if (apiData && apiData.length > 0) {
    // 합계 계산
    let totalSalesSum = 0;
    const teamTotals = {};

    // 팀별 합계 초기화
    if (selectedTeams && selectedTeams.length > 0) {
      selectedTeams.forEach(teamName => {
        teamTotals[teamName] = { sales: 0 };
      });
    }

    // 데이터 합계 계산
    apiData.forEach(item => {
      totalSalesSum += item.total?.sales || 0;

      if (selectedTeams && selectedTeams.length > 0) {
        selectedTeams.forEach(teamName => {
          const teamData = item[teamName];
          teamTotals[teamName].sales += teamData?.sales || 0;
        });
      }
    });

    // 합계 행 생성
    const summaryBaseCells = [
      "합계",
      totalSalesSum > 0 ? totalSalesSum.toLocaleString() + "원" : "-"
    ];

    const summaryTeamCells = [];
    if (selectedTeams && selectedTeams.length > 0) {
      selectedTeams.forEach(teamName => {
        const sales = teamTotals[teamName].sales;
        const ratio = totalSalesSum > 0 ? ((sales / totalSalesSum) * 100).toFixed(1) : "0.0";

        summaryTeamCells.push(
          sales > 0 ? sales.toLocaleString() + "원" : "-",
          ratio && ratio !== "0.0" ? ratio + "%" : "-"
        );
      });
    }

    const summaryRow = {
      cells: [...summaryBaseCells, ...summaryTeamCells],
      isTotal: true,
    };

    // 일별 데이터 행 생성
    const dataRows = apiData.map((item) => {
      // total 객체에서 총매출 가져오기
      const totalSales = item.total?.sales || 0;

      const baseCells = [
        item.date,
        totalSales > 0 ? totalSales.toLocaleString() + "원" : "-"
      ];

      const teamCells = [];

      // 선택된 팀에 따라 동적으로 데이터 추가
      if (selectedTeams && selectedTeams.length > 0) {
        selectedTeams.forEach((teamName) => {
          // 팀 이름으로 직접 접근
          const teamData = item[teamName];
          const sales = teamData?.sales || 0;
          const ratio = teamData?.ratio || "0.0";

          teamCells.push(
            sales > 0 ? sales.toLocaleString() + "원" : "-",
            ratio && ratio !== "0.0" ? ratio + "%" : "-"
          );
        });
      }

      return {
        cells: [...baseCells, ...teamCells],
      };
    });

    // 합계 행을 최상단에 추가
    return [summaryRow, ...dataRows];
  }

  // API 데이터가 없으면 날짜 범위에 맞는 빈 행 생성
  if (!customDateRange?.startDate || !customDateRange?.endDate) {
    return [];
  }

  const dates = generateDateRangeForTable(customDateRange.startDate, customDateRange.endDate);

  return dates.map((date) => {
    const baseCells = [date, "-"];

    const teamCells = [];
    if (selectedTeams && selectedTeams.length > 0) {
      selectedTeams.forEach(() => {
        teamCells.push("-", "-");
      });
    }

    return {
      cells: [...baseCells, ...teamCells],
    };
  });
};
