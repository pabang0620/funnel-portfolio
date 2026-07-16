import { useMemo } from 'react';
import { getChannelDataKey, getChildChannelDataKey, calculateTotalSales, calculateTotal, calculateFilteredTotalSales, calculateFilteredAdCost } from '../utils/tableDataUtils';
import { filterColumnsByPermission } from '../../../../utils/permissionUtils';

// className을 컬럼 키로 변환하는 헬퍼 함수
const getColumnKeyFromClassName = (className) => {
  const mapping = {
    'total-sales': '총매출',
    'direct-revenue': '직접매출',
    'direct-roas': '직접ROAS',
    'indirect-revenue': '간접매출',
    'margin': '판매마진',
    'profit': '공헌이익',
    'profit-rate': '이익률',
    'ad-cost': '광고비',
    'roas': 'ROAS',
    'commission': '대행료',
  };
  return mapping[className];
};

// 컬럼별 계산식 툴팁 정의
const COLUMN_TOOLTIPS = {
  총매출: "[salesOrder × boxPrice]\n주문수량 × 박스별 단가",
  직접매출: "[marketingDailyData.revenue]\n마케팅 채널에서 발생한 직접 매출",
  직접ROAS: "[계산]\n직접매출 / 광고비 × 100",
  간접매출: "[계산]\n총매출 - 직접매출 (외부 판매처 매출)",
  판매마진: "[salesOrder + boxPrice + productCode]\n매출 - 수수료(매출×수수료율) - 배송비 - 원가(수량×박스수×원가단가)",
  공헌이익: "[계산]\n판매마진 - 광고비",
  이익률: "[계산]\n공헌이익 / 총매출 × 100",
  광고비: "[marketingDailyData.adCost]\n마케팅 데이터 광고비 제품별 합계",
  ROAS: "[계산]\n총매출 / 광고비",
  대행료: "[marketingDailyData + adMedia.fee]\n매체별 광고비 × 매체별 대행료율 합계",
  매출: "[salesOrder × boxPrice]\n주문수량 × 박스별 단가",
  비율: "[계산]\n판매처별 매출 / 총매출 × 100",
};

/**
 * 파일 판매처 정렬 - "Cafe24(신) 유튜브쇼핑"을 항상 첫 번째로
 * @param {Array} channels - 파일 판매처 배열
 * @returns {Array} 정렬된 파일 판매처 배열
 */
const sortFileChannelsWithCafe24First = (channels) => {
  const PRIORITY_CHANNEL = "Cafe24(신) 유튜브쇼핑";
  const cafe24Channel = channels.find(ch => ch.name === PRIORITY_CHANNEL);
  const otherChannels = channels.filter(ch => ch.name !== PRIORITY_CHANNEL);
  return cafe24Channel ? [cafe24Channel, ...otherChannels] : channels;
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
    const value = (item[label] || 0).toLocaleString();
    tooltip += `${item.boxCount}박스: ${value}원\n`;
  });

  return tooltip;
};

/**
 * 선택된 판매처의 매출 비율 계산
 * @param {Object} productData - 제품 데이터
 * @param {Array} selectedChannels - 선택된 판매처 (이름 배열 또는 ID 배열)
 * @param {string} viewMode - 'channel' (판매처별) 또는 'fileChannel' (파일판매처별)
 * @param {Array} childSalesChannelList - 자식 판매처 목록 (fileChannel 모드용)
 * @returns {number} 선택된 판매처의 매출 비율 (0~1)
 */
const calculateSelectedChannelRatio = (productData, selectedChannels, viewMode, childSalesChannelList) => {
  if (!productData || !selectedChannels || selectedChannels.length === 0) {
    return 0;
  }

  // 파일판매처별 모드에서 "전체" 옵션 (id: -1) 필터링
  if (viewMode === 'fileChannel') {
    const validChannels = selectedChannels.filter(id => id !== -1);
    if (validChannels.length === 0) {
      return 0; // 유효한 판매처가 없으면 0 반환
    }
    selectedChannels = validChannels;
  }

  const totalSales = productData.totalSales || 0;
  if (totalSales === 0) return 1; // 매출이 0이면 전액 포함

  let selectedSales = 0;

  if (viewMode === 'fileChannel') {
    selectedChannels.forEach((childId) => {
      const salesKey = getChildChannelDataKey(childId, 'sales');
      selectedSales += productData[salesKey] || 0;
    });
  } else {
    selectedChannels.forEach((channelName) => {
      const salesKey = getChannelDataKey(channelName, 'sales');
      selectedSales += productData[salesKey] || 0;
    });
  }

  return selectedSales / totalSales;
};

/**
 * 테이블 데이터 처리 Custom Hook
 * 테이블 컬럼과 렌더링 데이터를 생성합니다
 */
export const useTableData = ({
  userRole,
  salesChannelList,
  selectedOptions1,
  selectedOptions2,
  productList,
  tableData,
  childSalesChannelList = [],
  selectedChildSalesChannels = [],
  viewMode = 'channel', // 'channel' | 'fileChannel'
  hasPermission = () => true, // 권한 체크 함수 (기본값: 모두 허용)
  columnVisibility = null, // 컬럼 표시/숨김 설정
}) => {
  const isAdmin = userRole === "S";
  const pageId = "executive-report-sales";

  // 테이블 컬럼 구성 (관리자/직원 구분, viewMode 구분)
  const tableColumns = useMemo(() => {
    // S등급이 아닌 경우 광고비/ROAS를 총매출 다음에 배치
    const adCostRoasColumns = [
      { title: "광고비", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.광고비, className: "ad-cost" },
      { title: "ROAS", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.ROAS, className: "roas" },
    ];
    const filteredAdCostRoas = !isAdmin
      ? filterColumnsByPermission(adCostRoasColumns, hasPermission, pageId, isAdmin)
      : [];

    // 파일판매처별 보기 모드
    if (viewMode === 'fileChannel') {
      // 선택된 파일 판매처(자식) 목록 - selectedChildSalesChannels 순서 유지 (드래그 앤 드롭 지원)
      const selectedFileChannels = selectedChildSalesChannels
        .map(id => childSalesChannelList.find(child => child.id === id))
        .filter(Boolean);

      // 기본 컬럼 (제품 제외)
      const basicColumns = [
        { title: "총매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.총매출, className: "total-sales" },
        { title: "직접 매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.직접매출, className: "direct-revenue" },
        { title: "직접 ROAS", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.직접ROAS, className: "direct-roas" },
        { title: "간접 매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.간접매출, className: "indirect-revenue" },
      ];

      // 사용자 설정 기반 기본 컬럼 필터링
      const visibleBasicColumns = columnVisibility
        ? basicColumns.filter(col => {
            const columnKey = getColumnKeyFromClassName(col.className);
            if (!columnKey) return true;
            return columnVisibility?.기본컬럼?.[columnKey] !== false;
          })
        : basicColumns;

      const firstRow = [
        { title: "제품", rowSpan: 2 },
        ...visibleBasicColumns,
      ];

      // S등급이 아닌 경우: 광고비/ROAS를 총매출 다음에 배치
      if (!isAdmin) {
        const visibleAdCostRoas = columnVisibility
          ? filteredAdCostRoas.filter(col => {
              const columnKey = getColumnKeyFromClassName(col.className);
              if (!columnKey) return true;
              return columnVisibility?.기본컬럼?.[columnKey] !== false;
            })
          : filteredAdCostRoas;
        visibleAdCostRoas.forEach(col => firstRow.push(col));
      }

      // 파일 판매처별 헤더 (각각 매출/비율 2개 컬럼)
      selectedFileChannels.forEach((channel) => {
        // 사용자 설정 기반 필터링 추가
        if (columnVisibility?.파일판매처?.[channel.name] === false) {
          return; // 숨김 처리된 판매처는 스킵
        }

        firstRow.push({
          title: channel.name,
          colSpan: 2,
          isParent: true,
        });
      });

      // 권한 기반 컬럼 정의 (S등급은 전체, 그 외는 광고비/ROAS 제외)
      const permissionBasedColumns = isAdmin
        ? [
            { title: "판매마진", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.판매마진, className: "margin" },
            { title: "공헌이익", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.공헌이익, className: "profit" },
            { title: "이익률", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.이익률, className: "profit-rate" },
            { title: "광고비", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.광고비, className: "ad-cost" },
            { title: "ROAS", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.ROAS, className: "roas" },
            { title: "대행료", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.대행료, className: "commission" },
          ]
        : [
            { title: "판매마진", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.판매마진, className: "margin" },
            { title: "공헌이익", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.공헌이익, className: "profit" },
            { title: "이익률", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.이익률, className: "profit-rate" },
            { title: "대행료", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.대행료, className: "commission" },
          ];

      // 권한 필터링하여 컬럼 추가
      const filteredColumns = filterColumnsByPermission(permissionBasedColumns, hasPermission, pageId, isAdmin);

      // 사용자 설정 기반 필터링 (columnVisibility)
      const visibleColumns = columnVisibility
        ? filteredColumns.filter(col => {
            const columnKey = getColumnKeyFromClassName(col.className);
            if (!columnKey) return true; // className이 없으면 표시
            return columnVisibility?.기본컬럼?.[columnKey] !== false;
          })
        : filteredColumns;

      visibleColumns.forEach(col => firstRow.push(col));

      const secondRow = [];
      selectedFileChannels.forEach((channel) => {
        // 숨김 처리된 판매처는 서브헤더도 스킵
        if (columnVisibility?.파일판매처?.[channel.name] === false) {
          return;
        }

        secondRow.push(
          { title: "매출", tooltip: COLUMN_TOOLTIPS.매출, isParentCell: true },
          { title: "비율", tooltip: COLUMN_TOOLTIPS.비율, isParentCell: true }
        );
      });

      return [firstRow, secondRow];
    }

    // 판매처별 보기 모드 (권한 기반)
    // 선택된 부모 판매처 목록 - selectedOptions1 순서 유지 (드래그 앤 드롭 지원)
    const selectedParentChannels = selectedOptions1
      .map(name => salesChannelList.find(channel => channel.name === name))
      .filter(Boolean);

    // 기본 컬럼 (제품 제외)
    const basicColumns = [
      { title: "총매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.총매출, className: "total-sales" },
      { title: "직접 매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.직접매출, className: "direct-revenue" },
      { title: "직접 ROAS", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.직접ROAS, className: "direct-roas" },
      { title: "간접 매출", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.간접매출, className: "indirect-revenue" },
    ];

    // 사용자 설정 기반 기본 컬럼 필터링
    const visibleBasicColumns = columnVisibility
      ? basicColumns.filter(col => {
          const columnKey = getColumnKeyFromClassName(col.className);
          if (!columnKey) return true;
          return columnVisibility?.기본컬럼?.[columnKey] !== false;
        })
      : basicColumns;

    // 첫 번째 행: 부모 판매처 헤더
    const firstRow = [
      { title: "제품", rowSpan: 2 },
      ...visibleBasicColumns,
    ];

    // S등급이 아닌 경우: 광고비/ROAS를 총매출 다음에 배치
    if (!isAdmin) {
      const visibleAdCostRoas = columnVisibility
        ? filteredAdCostRoas.filter(col => {
            const columnKey = getColumnKeyFromClassName(col.className);
            if (!columnKey) return true;
            return columnVisibility?.기본컬럼?.[columnKey] !== false;
          })
        : filteredAdCostRoas;
      visibleAdCostRoas.forEach(col => firstRow.push(col));
    }

    selectedParentChannels.forEach((parent) => {
      // 사용자 설정 기반 필터링 추가
      if (columnVisibility?.판매처?.[parent.name] === false) {
        return; // 숨김 처리된 판매처는 스킵
      }

      // 부모 판매처 헤더
      firstRow.push({
        title: parent.name,
        colSpan: 2,
        isParent: true,
      });
    });

    // 권한 기반 컬럼 정의 (S등급은 전체, 그 외는 광고비/ROAS 제외)
    const permissionBasedColumns = isAdmin
      ? [
          { title: "판매마진", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.판매마진, className: "margin" },
          { title: "공헌이익", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.공헌이익, className: "profit" },
          { title: "이익률", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.이익률, className: "profit-rate" },
          { title: "광고비", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.광고비, className: "ad-cost" },
          { title: "ROAS", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.ROAS, className: "roas" },
          { title: "대행료", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.대행료, className: "commission" },
        ]
      : [
          { title: "판매마진", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.판매마진, className: "margin" },
          { title: "공헌이익", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.공헌이익, className: "profit" },
          { title: "이익률", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.이익률, className: "profit-rate" },
          { title: "대행료", rowSpan: 2, tooltip: COLUMN_TOOLTIPS.대행료, className: "commission" },
        ];

    // 권한 필터링하여 컬럼 추가
    const filteredColumns = filterColumnsByPermission(permissionBasedColumns, hasPermission, pageId, isAdmin);

    // 사용자 설정 기반 필터링 (columnVisibility)
    const visibleColumns = columnVisibility
      ? filteredColumns.filter(col => {
          const columnKey = getColumnKeyFromClassName(col.className);
          if (!columnKey) return true; // className이 없으면 표시
          return columnVisibility?.기본컬럼?.[columnKey] !== false;
        })
      : filteredColumns;

    visibleColumns.forEach(col => firstRow.push(col));

    // 두 번째 행: 매출/비율 헤더
    const secondRow = [];
    selectedParentChannels.forEach((parent) => {
      // 숨김 처리된 판매처는 서브헤더도 스킵
      if (columnVisibility?.판매처?.[parent.name] === false) {
        return;
      }

      secondRow.push(
        { title: "매출", tooltip: COLUMN_TOOLTIPS.매출, isParentCell: true },
        { title: "비율", tooltip: COLUMN_TOOLTIPS.비율, isParentCell: true }
      );
    });

    return [firstRow, secondRow];
  }, [hasPermission, isAdmin, salesChannelList, selectedOptions1, childSalesChannelList, selectedChildSalesChannels, viewMode, columnVisibility]);

  // 테이블 데이터 렌더링용 데이터 구성
  const renderTableData = useMemo(() => {
    // S등급이 아닌 경우: 광고비/ROAS 컬럼 (총매출 다음에 배치)
    const adCostRoasColumns = [
      { title: "광고비", className: "ad-cost" },
      { title: "ROAS", className: "roas" },
    ];
    const filteredAdCostRoas = !isAdmin
      ? filterColumnsByPermission(adCostRoasColumns, hasPermission, pageId, isAdmin)
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

    // 권한 필터링하여 표시할 컬럼 결정
    const filteredColumns = filterColumnsByPermission(permissionBasedColumns, hasPermission, pageId, isAdmin);

    // 사용자 설정 기반 필터링 (columnVisibility)
    const visibleColumns = columnVisibility
      ? filteredColumns.filter(col => {
          const columnKey = getColumnKeyFromClassName(col.className);
          if (!columnKey) return true;
          return columnVisibility?.기본컬럼?.[columnKey] !== false;
        })
      : filteredColumns;

    // 파일판매처별 보기 모드
    if (viewMode === 'fileChannel') {
      // 선택된 파일 판매처(자식) 목록 - selectedChildSalesChannels 순서 유지 (드래그 앤 드롭 지원)
      const selectedFileChannels = selectedChildSalesChannels
        .map(id => childSalesChannelList.find(child => child.id === id))
        .filter(Boolean);

      // 제품 정렬: 대행 제품은 맨 아래에
      const sortedProducts = [...productList]
        .filter((product) => selectedOptions2.includes(product.id))
        .sort((a, b) => {
          const aIsAgency = a.name.startsWith("대행_");
          const bIsAgency = b.name.startsWith("대행_");
          if (aIsAgency && !bIsAgency) return 1;
          if (!aIsAgency && bIsAgency) return -1;
          return 0;
        });

      const dataRows = sortedProducts
        .map((product) => {
          const productData = tableData.find((item) => item.productId === product.id);
          const isAgencyProduct = product.name.startsWith("대행_");

          if (!productData) {
            // productData가 없는 경우 기본값
            const cells = [
              product.name,
              "-",
              "-", // 직접 매출
              "-", // 간접 매출
              ...Array((selectedFileChannels.length * 2) + filteredColumns.length + (filteredAdCostRoas.length)).fill("-")
            ];
            return { cells };
          }

          // 선택된 판매처의 매출 비율 계산
          const selectedRatio = calculateSelectedChannelRatio(
            productData,
            selectedChildSalesChannels,
            'fileChannel',
            childSalesChannelList
          );

          // 선택된 판매처의 총매출 계산
          let filteredTotalSales = 0;
          if (!isAgencyProduct) {
            selectedChildSalesChannels.forEach((childId) => {
              const salesKey = getChildChannelDataKey(childId, 'sales');
              filteredTotalSales += productData[salesKey] || 0;
            });
          }

          // 총매출 셀
          let totalSalesCell;
          if (isAgencyProduct) {
            totalSalesCell = "-";
          } else if (filteredTotalSales > 0) {
            const salesValue = filteredTotalSales.toLocaleString() + "원";
            if (productData.salesByBox && productData.salesByBox.length > 0) {
              const tooltip = formatBoxDataTooltip(productData.salesByBox, 'sales');
              totalSalesCell = { value: salesValue, tooltip };
            } else {
              totalSalesCell = salesValue;
            }
          } else {
            totalSalesCell = "-";
          }

          // 직접 매출과 간접 매출 계산
          const directRevenue = productData.directRevenue || 0;
          const indirectRevenue = filteredTotalSales > directRevenue ? filteredTotalSales - directRevenue : 0;

          const directRevenueCell = isAgencyProduct ? "-" : (directRevenue > 0 ? directRevenue.toLocaleString() + "원" : "-");
          const indirectRevenueCell = isAgencyProduct ? "-" : (indirectRevenue > 0 ? indirectRevenue.toLocaleString() + "원" : "-");

          const basicCells = [productData?.product || product.name];

          // 총매출 (기본값 true)
          if (columnVisibility?.기본컬럼?.['총매출'] !== false) {
            basicCells.push(totalSalesCell);
          }

          // 선택된 판매처 비율로 계산된 값들 (직접ROAS 계산을 위해 basicCells 구성 전에 filteredAdCost 계산)
          const filteredSalesMargin = isAgencyProduct ? 0 : Math.round((productData.salesMargin || 0) * selectedRatio);
          const filteredProfit = isAgencyProduct ? 0 : Math.round((productData.contributionProfit || 0) * selectedRatio);
          const filteredAdCost = Math.round((productData.adCost || 0) * selectedRatio);
          const filteredCommission = Math.round((productData.agencyFee || 0) * selectedRatio);
          const filteredProfitRate = filteredTotalSales > 0 ? (filteredProfit / filteredTotalSales * 100).toFixed(1) : "0.0";
          const filteredRoas = filteredAdCost > 0 ? (filteredTotalSales / filteredAdCost * 100).toFixed(1) : "0.0";

          // 직접매출 (기본값 true)
          if (columnVisibility?.기본컬럼?.['직접매출'] !== false) {
            basicCells.push(directRevenueCell);
          }

          // 직접ROAS (기본값 true)
          if (columnVisibility?.기본컬럼?.['직접ROAS'] !== false) {
            const directRoasCell = isAgencyProduct ? "-" : (filteredAdCost > 0 ? (directRevenue / filteredAdCost * 100).toFixed(1) + "%" : "-");
            basicCells.push(directRoasCell);
          }

          // 간접매출 (기본값 true)
          if (columnVisibility?.기본컬럼?.['간접매출'] !== false) {
            basicCells.push(indirectRevenueCell);
          }

          // S등급이 아닌 경우: 광고비/ROAS를 총매출 다음에 배치
          const adCostRoasCells = [];
          if (!isAdmin && filteredAdCostRoas.length > 0) {
            filteredAdCostRoas.forEach(col => {
              const columnKey = getColumnKeyFromClassName(col.className);
              if (columnVisibility?.기본컬럼?.[columnKey] === false) {
                return; // 숨김 처리된 컬럼은 스킵
              }

              if (col.className === "ad-cost") {
                adCostRoasCells.push(filteredAdCost.toLocaleString() + "원");
              } else if (col.className === "roas") {
                adCostRoasCells.push(filteredRoas + "%");
              }
            });
          }

          const channelCells = selectedFileChannels.reduce((acc, channel) => {
            // 숨김 처리된 판매처는 스킵
            if (columnVisibility?.파일판매처?.[channel.name] === false) {
              return acc;
            }

            if (isAgencyProduct) {
              acc.push("-");
              acc.push("-");
            } else if (productData) {
              const salesKey = getChildChannelDataKey(channel.id, "sales");
              const ratioKey = getChildChannelDataKey(channel.id, "ratio");
              acc.push(
                productData[salesKey] ? productData[salesKey].toLocaleString() + "원" : "-"
              );
              acc.push(productData[ratioKey] ? productData[ratioKey] + "%" : "-");
            } else {
              acc.push("-");
              acc.push("-");
            }
            return acc;
          }, []);

          // 판매마진 셀
          let salesMarginCell;
          if (isAgencyProduct) {
            salesMarginCell = "-";
          } else if (filteredSalesMargin > 0) {
            const marginValue = filteredSalesMargin.toLocaleString() + "원";
            if (productData.marginByBox && productData.marginByBox.length > 0) {
              const tooltip = formatBoxDataTooltip(productData.marginByBox, 'margin');
              salesMarginCell = { value: marginValue, tooltip };
            } else {
              salesMarginCell = marginValue;
            }
          } else {
            salesMarginCell = filteredSalesMargin.toLocaleString() + "원";
          }

          // 권한 기반으로 데이터 셀 추가
          const additionalCellsFile = [];
          visibleColumns.forEach(col => {
            switch (col.className) {
              case "margin":
                additionalCellsFile.push(isAgencyProduct ? "-" : salesMarginCell);
                break;
              case "profit":
                additionalCellsFile.push(isAgencyProduct ? "-" : filteredProfit.toLocaleString() + "원");
                break;
              case "profit-rate":
                additionalCellsFile.push(isAgencyProduct ? "-" : filteredProfitRate + "%");
                break;
              case "ad-cost":
                additionalCellsFile.push(filteredAdCost.toLocaleString() + "원");
                break;
              case "roas":
                additionalCellsFile.push(filteredRoas + "%");
                break;
              case "commission":
                additionalCellsFile.push(filteredCommission.toLocaleString() + "원");
                break;
              default:
                additionalCellsFile.push("-");
            }
          });

          return {
            cells: [...basicCells, ...adCostRoasCells, ...channelCells, ...additionalCellsFile],
            isAgencyProduct,
          };
        });

      // 파일판매처별 모드: 선택된 파일판매처만의 합계 계산
      // 전체 자식 판매처 수 계산
      const totalChildChannels = childSalesChannelList.length;
      // "전체" 옵션 (id: -1) 제외한 유효한 선택 수
      const validSelectedChildChannels = selectedChildSalesChannels.filter(id => id !== -1);
      const selectedChildChannelsCount = validSelectedChildChannels.length;
      const isAllSelected = totalChildChannels > 0 && selectedChildChannelsCount === totalChildChannels;

      // 모든 파일판매처를 선택한 경우: 백엔드 데이터의 전체 값 사용 (반올림 오차 방지)
      const totalSales = isAllSelected
        ? calculateTotalSales(productList, selectedOptions2, tableData)
        : calculateFilteredTotalSales(
            productList,
            selectedOptions2,
            tableData,
            selectedChildSalesChannels,
            'fileChannel',
            childSalesChannelList
          );

      // 직접 매출과 간접 매출 합계 계산
      const totalDirectRevenue = productList
        .filter((product) => selectedOptions2.includes(product.id) && !product.name.startsWith("대행_"))
        .reduce((sum, product) => {
          const productData = tableData.find((item) => item.productId === product.id);
          return sum + (productData?.directRevenue || 0);
        }, 0);

      const totalIndirectRevenue = totalSales > totalDirectRevenue ? totalSales - totalDirectRevenue : 0;

      const basicTotalCells = ["합계"];

      // 총매출 (기본값 true)
      if (columnVisibility?.기본컬럼?.['총매출'] !== false) {
        basicTotalCells.push(totalSales !== 0 ? totalSales.toLocaleString() + "원" : "-");
      }

      // 직접매출 (기본값 true)
      if (columnVisibility?.기본컬럼?.['직접매출'] !== false) {
        basicTotalCells.push(totalDirectRevenue !== 0 ? totalDirectRevenue.toLocaleString() + "원" : "-");
      }

      // 직접ROAS 합계 (기본값 true)
      if (columnVisibility?.기본컬럼?.['직접ROAS'] !== false) {
        const totalAdCostForDirectRoas = isAllSelected
          ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
          : calculateFilteredAdCost(productList, selectedOptions2, tableData, selectedChildSalesChannels, 'fileChannel', childSalesChannelList);
        const totalDirectRoas = totalAdCostForDirectRoas > 0 ? (totalDirectRevenue / totalAdCostForDirectRoas * 100).toFixed(1) : 0;
        basicTotalCells.push(parseFloat(totalDirectRoas) !== 0 ? totalDirectRoas + "%" : "-");
      }

      // 간접매출 (기본값 true)
      if (columnVisibility?.기본컬럼?.['간접매출'] !== false) {
        basicTotalCells.push(totalIndirectRevenue !== 0 ? totalIndirectRevenue.toLocaleString() + "원" : "-");
      }

      // S등급이 아닌 경우: 광고비/ROAS 합계를 총매출 다음에 배치
      const adCostRoasTotalCells = [];
      if (!isAdmin && filteredAdCostRoas.length > 0) {
        // 파일판매처별 모드: 선택된 파일판매처 비율로 광고비 계산
        const totalAdCost = isAllSelected
          ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
          : calculateFilteredAdCost(
              productList,
              selectedOptions2,
              tableData,
              selectedChildSalesChannels,
              'fileChannel',
              childSalesChannelList
            );

        filteredAdCostRoas.forEach(col => {
          const columnKey = getColumnKeyFromClassName(col.className);
          if (columnVisibility?.기본컬럼?.[columnKey] === false) {
            return; // 숨김 처리된 컬럼은 스킵
          }

          if (col.className === "ad-cost") {
            adCostRoasTotalCells.push(totalAdCost !== 0 ? Math.round(totalAdCost).toLocaleString() + "원" : "-");
          } else if (col.className === "roas") {
            const avgRoas = totalAdCost !== 0 ? ((totalSales / totalAdCost) * 100).toFixed(1) : 0;
            adCostRoasTotalCells.push(parseFloat(avgRoas) !== 0 ? avgRoas + "%" : "-");
          }
        });
      }

      const channelTotalCells = selectedFileChannels.reduce((acc, channel) => {
        // 숨김 처리된 판매처는 스킵
        if (columnVisibility?.파일판매처?.[channel.name] === false) {
          return acc;
        }

        // 파일판매처별은 ID 기반 키 사용 (이름 중복 문제 해결)
        const salesKey = getChildChannelDataKey(channel.id, "sales");
        const channelTotal = productList
          .filter((product) => selectedOptions2.includes(product.id))
          .reduce((sum, product) => {
            const productData = tableData.find((item) => item.productId === product.id);
            return sum + (productData && productData[salesKey] ? productData[salesKey] : 0);
          }, 0);

        const ratio = totalSales !== 0 ? ((channelTotal / totalSales) * 100).toFixed(1) : 0;

        acc.push(channelTotal !== 0 ? channelTotal.toLocaleString() + "원" : "-");
        acc.push(parseFloat(ratio) !== 0 ? ratio + "%" : "-");

        return acc;
      }, []);

      // 권한 기반으로 합계 셀 추가 (파일판매처별 모드: 선택된 파일판매처 비율로 계산)
      const additionalTotalCells = [];

      // 선택된 파일판매처 비율로 각 필드 계산
      const calculateFilteredField = (field) => {
        // 전체 선택 시: 직접 합계 사용 (반올림 오차 방지)
        if (isAllSelected) {
          return calculateTotal(productList, selectedOptions2, tableData, field);
        }

        // 일부 선택 시: 비율 계산
        return productList
          .filter((product) => selectedOptions2.includes(product.id))
          .reduce((sum, product) => {
            const productData = tableData.find((item) => item.productId === product.id);
            if (!productData) return sum;

            const totalProductSales = productData.totalSales || 0;
            const productFieldValue = productData[field] || 0;

            if (totalProductSales === 0) return sum;

            // 선택한 파일판매처의 매출 합산
            let selectedSales = 0;
            selectedChildSalesChannels.forEach((childId) => {
              const salesKey = getChildChannelDataKey(childId, 'sales');
              selectedSales += productData[salesKey] || 0;
            });

            // 선택한 판매처의 매출 비율만큼 필드값 계산
            const ratio = selectedSales / totalProductSales;
            return sum + (productFieldValue * ratio);
          }, 0);
      };

      visibleColumns.forEach(col => {
        switch (col.className) {
          case "margin": {
            const totalMargin = calculateFilteredField("salesMargin");
            additionalTotalCells.push(!isNaN(totalMargin) && totalMargin !== 0 ? Math.round(totalMargin).toLocaleString() + "원" : "-");
            break;
          }
          case "profit": {
            // 공헌이익 = 판매마진 - 광고비 (프론트엔드에서 직접 계산)
            const totalMargin = calculateFilteredField("salesMargin");
            const totalAdCost = isAllSelected
              ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
              : calculateFilteredAdCost(
                  productList,
                  selectedOptions2,
                  tableData,
                  selectedChildSalesChannels,
                  'fileChannel',
                  childSalesChannelList
                );
            const totalProfit = totalMargin - totalAdCost;
            additionalTotalCells.push(!isNaN(totalProfit) && totalProfit !== 0 ? Math.round(totalProfit).toLocaleString() + "원" : "-");
            break;
          }
          case "profit-rate": {
            // 공헌이익 = 판매마진 - 광고비 (프론트엔드에서 직접 계산)
            const totalMargin = calculateFilteredField("salesMargin");
            const totalAdCost = isAllSelected
              ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
              : calculateFilteredAdCost(
                  productList,
                  selectedOptions2,
                  tableData,
                  selectedChildSalesChannels,
                  'fileChannel',
                  childSalesChannelList
                );
            const totalProfit = totalMargin - totalAdCost;
            const avgProfitRate = totalSales !== 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0;
            additionalTotalCells.push(!isNaN(parseFloat(avgProfitRate)) && parseFloat(avgProfitRate) !== 0 ? avgProfitRate + "%" : "-");
            break;
          }
          case "ad-cost": {
            const totalAdCost = isAllSelected
              ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
              : calculateFilteredAdCost(
                  productList,
                  selectedOptions2,
                  tableData,
                  selectedChildSalesChannels,
                  'fileChannel',
                  childSalesChannelList
                );
            additionalTotalCells.push(!isNaN(totalAdCost) && totalAdCost !== 0 ? Math.round(totalAdCost).toLocaleString() + "원" : "-");
            break;
          }
          case "roas": {
            const totalAdCost = isAllSelected
              ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
              : calculateFilteredAdCost(
                  productList,
                  selectedOptions2,
                  tableData,
                  selectedChildSalesChannels,
                  'fileChannel',
                  childSalesChannelList
                );
            const avgRoas = totalAdCost !== 0 ? ((totalSales / totalAdCost) * 100).toFixed(1) : 0;
            additionalTotalCells.push(!isNaN(parseFloat(avgRoas)) && parseFloat(avgRoas) !== 0 ? avgRoas + "%" : "-");
            break;
          }
          case "commission": {
            const totalAgencyFee = calculateFilteredField("agencyFee");
            additionalTotalCells.push(!isNaN(totalAgencyFee) && totalAgencyFee !== 0 ? Math.round(totalAgencyFee).toLocaleString() + "원" : "-");
            break;
          }
        }
      });

      const totalRow = {
        isTotal: true,
        cells: [...basicTotalCells, ...adCostRoasTotalCells, ...channelTotalCells, ...additionalTotalCells],
      };

      return [...dataRows, totalRow];
    }

    // 판매처별 보기 모드 - selectedOptions1 순서 유지 (드래그 앤 드롭 지원)
    const selectedParentChannels = selectedOptions1
      .map(name => salesChannelList.find(channel => channel.name === name))
      .filter(Boolean);

    // 제품 정렬: 대행 제품은 맨 아래에
    const sortedProducts = [...productList]
      .filter((product) => selectedOptions2.includes(product.id))
      .sort((a, b) => {
        const aIsAgency = a.name.startsWith("대행_");
        const bIsAgency = b.name.startsWith("대행_");
        if (aIsAgency && !bIsAgency) return 1;
        if (!aIsAgency && bIsAgency) return -1;
        return 0;
      });

    const dataRows = sortedProducts
      .map((product) => {
        const productData = tableData.find((item) => item.productId === product.id);
        const isAgencyProduct = product.name.startsWith("대행_");

        if (!productData) {
          // productData가 없는 경우 기본값
          const cells = [
            product.name,
            "-",
            "-", // 직접 매출
            "-", // 간접 매출
            ...Array((selectedParentChannels.length * 2) + filteredColumns.length + (filteredAdCostRoas.length)).fill("-")
          ];
          return { cells };
        }

        // 선택된 판매처의 매출 비율 계산
        const selectedRatio = calculateSelectedChannelRatio(
          productData,
          selectedOptions1,
          'channel',
          []
        );

        // 선택된 판매처의 총매출 계산
        let filteredTotalSales = 0;
        if (!isAgencyProduct) {
          selectedOptions1.forEach((channelName) => {
            const salesKey = getChannelDataKey(channelName, 'sales');
            filteredTotalSales += productData[salesKey] || 0;
          });
        }

        // 총매출 셀
        let totalSalesCell;
        if (isAgencyProduct) {
          totalSalesCell = "-";
        } else if (filteredTotalSales > 0) {
          const salesValue = filteredTotalSales.toLocaleString() + "원";
          if (productData.salesByBox && productData.salesByBox.length > 0) {
            const tooltip = formatBoxDataTooltip(productData.salesByBox, 'sales');
            totalSalesCell = { value: salesValue, tooltip };
          } else {
            totalSalesCell = salesValue;
          }
        } else {
          totalSalesCell = "-";
        }

        // 직접 매출과 간접 매출 계산
        const directRevenue = productData.directRevenue || 0;
        const indirectRevenue = filteredTotalSales > directRevenue ? filteredTotalSales - directRevenue : 0;

        const directRevenueCell = isAgencyProduct ? "-" : (directRevenue > 0 ? directRevenue.toLocaleString() + "원" : "-");
        const indirectRevenueCell = isAgencyProduct ? "-" : (indirectRevenue > 0 ? indirectRevenue.toLocaleString() + "원" : "-");

        const basicCells = [productData?.product || product.name];

        // 총매출 (기본값 true)
        if (columnVisibility?.기본컬럼?.['총매출'] !== false) {
          basicCells.push(totalSalesCell);
        }

        // 선택된 판매처 비율로 계산된 값들 (직접ROAS 계산을 위해 basicCells 구성 전에 filteredAdCost 계산)
        const filteredSalesMargin = isAgencyProduct ? 0 : Math.round((productData.salesMargin || 0) * selectedRatio);
        const filteredProfit = isAgencyProduct ? 0 : Math.round((productData.contributionProfit || 0) * selectedRatio);
        const filteredAdCost = Math.round((productData.adCost || 0) * selectedRatio);
        const filteredCommission = Math.round((productData.agencyFee || 0) * selectedRatio);
        const filteredProfitRate = filteredTotalSales > 0 ? (filteredProfit / filteredTotalSales * 100).toFixed(1) : "0.0";
        const filteredRoas = filteredAdCost > 0 ? (filteredTotalSales / filteredAdCost * 100).toFixed(1) : "0.0";

        // 직접매출 (기본값 true)
        if (columnVisibility?.기본컬럼?.['직접매출'] !== false) {
          basicCells.push(directRevenueCell);
        }

        // 직접ROAS (기본값 true)
        if (columnVisibility?.기본컬럼?.['직접ROAS'] !== false) {
          const directRoasCell = isAgencyProduct ? "-" : (filteredAdCost > 0 ? (directRevenue / filteredAdCost * 100).toFixed(1) + "%" : "-");
          basicCells.push(directRoasCell);
        }

        // 간접매출 (기본값 true)
        if (columnVisibility?.기본컬럼?.['간접매출'] !== false) {
          basicCells.push(indirectRevenueCell);
        }

        // S등급이 아닌 경우: 광고비/ROAS를 총매출 다음에 배치
        const adCostRoasCells2 = [];
        if (!isAdmin && filteredAdCostRoas.length > 0) {
          filteredAdCostRoas.forEach(col => {
            const columnKey = getColumnKeyFromClassName(col.className);
            if (columnVisibility?.기본컬럼?.[columnKey] === false) {
              return; // 숨김 처리된 컬럼은 스킵
            }

            if (col.className === "ad-cost") {
              adCostRoasCells2.push(filteredAdCost.toLocaleString() + "원");
            } else if (col.className === "roas") {
              adCostRoasCells2.push(filteredRoas + "%");
            }
          });
        }

        const channelCells = selectedParentChannels.reduce((acc, channel) => {
          // 숨김 처리된 판매처는 스킵
          if (columnVisibility?.판매처?.[channel.name] === false) {
            return acc;
          }

          if (isAgencyProduct) {
            acc.push("-");
            acc.push("-");
          } else if (productData) {
            const salesKey = getChannelDataKey(channel.name, "sales");
            const ratioKey = getChannelDataKey(channel.name, "ratio");
            acc.push(
              productData[salesKey] ? productData[salesKey].toLocaleString() + "원" : "-"
            );
            acc.push(productData[ratioKey] ? productData[ratioKey] + "%" : "-");
          } else {
            acc.push("-");
            acc.push("-");
          }
          return acc;
        }, []);

        // 판매마진 셀
        let salesMarginCell;
        if (isAgencyProduct) {
          salesMarginCell = "-";
        } else if (filteredSalesMargin > 0) {
          const marginValue = filteredSalesMargin.toLocaleString() + "원";
          if (productData.marginByBox && productData.marginByBox.length > 0) {
            const tooltip = formatBoxDataTooltip(productData.marginByBox, 'margin');
            salesMarginCell = { value: marginValue, tooltip };
          } else {
            salesMarginCell = marginValue;
          }
        } else {
          salesMarginCell = filteredSalesMargin.toLocaleString() + "원";
        }

        // 권한 기반으로 데이터 셀 추가
        const additionalCells = [];
        visibleColumns.forEach(col => {
          switch (col.className) {
            case "margin":
              additionalCells.push(isAgencyProduct ? "-" : salesMarginCell);
              break;
            case "profit":
              additionalCells.push(isAgencyProduct ? "-" : filteredProfit.toLocaleString() + "원");
              break;
            case "profit-rate":
              additionalCells.push(isAgencyProduct ? "-" : filteredProfitRate + "%");
              break;
            case "ad-cost":
              additionalCells.push(filteredAdCost.toLocaleString() + "원");
              break;
            case "roas":
              additionalCells.push(filteredRoas + "%");
              break;
            case "commission":
              additionalCells.push(filteredCommission.toLocaleString() + "원");
              break;
            default:
              additionalCells.push("-");
          }
        });

        return {
          cells: [...basicCells, ...adCostRoasCells2, ...channelCells, ...additionalCells],
          isAgencyProduct,
        };
      });

    // 판매처별 모드: 선택된 판매처만의 합계 계산
    const totalParentChannels = salesChannelList.length;
    const selectedParentChannelsCount = selectedOptions1.length;
    const isAllChannelsSelected = totalParentChannels > 0 && selectedParentChannelsCount === totalParentChannels;

    // 모든 판매처를 선택한 경우: 백엔드 데이터의 전체 값 사용 (반올림 오차 방지)
    const totalSales = isAllChannelsSelected
      ? calculateTotalSales(productList, selectedOptions2, tableData)
      : calculateFilteredTotalSales(
          productList,
          selectedOptions2,
          tableData,
          selectedOptions1,
          'channel',
          []
        );

    // 직접 매출과 간접 매출 합계 계산
    const totalDirectRevenue2 = productList
      .filter((product) => selectedOptions2.includes(product.id) && !product.name.startsWith("대행_"))
      .reduce((sum, product) => {
        const productData = tableData.find((item) => item.productId === product.id);
        return sum + (productData?.directRevenue || 0);
      }, 0);

    const totalIndirectRevenue2 = totalSales > totalDirectRevenue2 ? totalSales - totalDirectRevenue2 : 0;

    const basicTotalCells = ["합계"];

    // 총매출 (기본값 true)
    if (columnVisibility?.기본컬럼?.['총매출'] !== false) {
      basicTotalCells.push(totalSales !== 0 ? totalSales.toLocaleString() + "원" : "-");
    }

    // 직접매출 (기본값 true)
    if (columnVisibility?.기본컬럼?.['직접매출'] !== false) {
      basicTotalCells.push(totalDirectRevenue2 !== 0 ? totalDirectRevenue2.toLocaleString() + "원" : "-");
    }

    // 직접ROAS 합계 (기본값 true)
    if (columnVisibility?.기본컬럼?.['직접ROAS'] !== false) {
      const totalAdCostForDirectRoas = isAllChannelsSelected
        ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
        : calculateFilteredAdCost(productList, selectedOptions2, tableData, selectedOptions1, 'channel', []);
      const totalDirectRoas = totalAdCostForDirectRoas > 0 ? (totalDirectRevenue2 / totalAdCostForDirectRoas * 100).toFixed(1) : 0;
      basicTotalCells.push(parseFloat(totalDirectRoas) !== 0 ? totalDirectRoas + "%" : "-");
    }

    // 간접매출 (기본값 true)
    if (columnVisibility?.기본컬럼?.['간접매출'] !== false) {
      basicTotalCells.push(totalIndirectRevenue2 !== 0 ? totalIndirectRevenue2.toLocaleString() + "원" : "-");
    }

    // S등급이 아닌 경우: 광고비/ROAS 합계를 총매출 다음에 배치
    const adCostRoasTotalCells2 = [];
    if (!isAdmin && filteredAdCostRoas.length > 0) {
      const totalAdCost = isAllChannelsSelected
        ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
        : calculateFilteredAdCost(
            productList,
            selectedOptions2,
            tableData,
            selectedOptions1,
            'channel',
            []
          );

      filteredAdCostRoas.forEach(col => {
        const columnKey = getColumnKeyFromClassName(col.className);
        if (columnVisibility?.기본컬럼?.[columnKey] === false) {
          return; // 숨김 처리된 컬럼은 스킵
        }

        if (col.className === "ad-cost") {
          adCostRoasTotalCells2.push(totalAdCost !== 0 ? Math.round(totalAdCost).toLocaleString() + "원" : "-");
        } else if (col.className === "roas") {
          const avgRoas = totalAdCost !== 0 ? ((totalSales / totalAdCost) * 100).toFixed(1) : 0;
          adCostRoasTotalCells2.push(parseFloat(avgRoas) !== 0 ? avgRoas + "%" : "-");
        }
      });
    }

    const channelTotalCells = selectedParentChannels.reduce((acc, channel) => {
      // 숨김 처리된 판매처는 스킵
      if (columnVisibility?.판매처?.[channel.name] === false) {
        return acc;
      }

      const salesKey = getChannelDataKey(channel.name, "sales");

      const channelTotal = productList
        .filter((product) => selectedOptions2.includes(product.id))
        .reduce((sum, product) => {
          const productData = tableData.find((item) => item.productId === product.id);
          return sum + (productData && productData[salesKey] ? productData[salesKey] : 0);
        }, 0);

      const ratio = totalSales !== 0 ? ((channelTotal / totalSales) * 100).toFixed(1) : 0;

      acc.push(channelTotal !== 0 ? channelTotal.toLocaleString() + "원" : "-");
      acc.push(parseFloat(ratio) !== 0 ? ratio + "%" : "-");

      return acc;
    }, []);

    // 권한 기반으로 합계 셀 추가 (판매처별 모드: 선택된 판매처 비율로 계산)
    const additionalTotalCells2 = [];

    // 선택된 판매처 비율로 각 필드 계산
    const calculateFilteredChannelField = (field) => {
      // 전체 선택 시: 직접 합계 사용 (반올림 오차 방지)
      if (isAllChannelsSelected) {
        return calculateTotal(productList, selectedOptions2, tableData, field);
      }

      // 일부 선택 시: 비율 계산
      return productList
        .filter((product) => selectedOptions2.includes(product.id))
        .reduce((sum, product) => {
          const productData = tableData.find((item) => item.productId === product.id);
          if (!productData) return sum;

          const totalProductSales = productData.totalSales || 0;
          const productFieldValue = productData[field] || 0;

          if (totalProductSales === 0) return sum;

          // 선택한 판매처의 매출 합산
          let selectedSales = 0;
          selectedOptions1.forEach((channelName) => {
            const salesKey = getChannelDataKey(channelName, 'sales');
            selectedSales += productData[salesKey] || 0;
          });

          // 선택한 판매처의 매출 비율만큼 필드값 계산
          const ratio = selectedSales / totalProductSales;
          return sum + (productFieldValue * ratio);
        }, 0);
    };

    visibleColumns.forEach(col => {
      switch (col.className) {
        case "margin": {
          const totalMargin = calculateFilteredChannelField("salesMargin");
          additionalTotalCells2.push(!isNaN(totalMargin) && totalMargin !== 0 ? Math.round(totalMargin).toLocaleString() + "원" : "-");
          break;
        }
        case "profit": {
          // 공헌이익 = 판매마진 - 광고비 (프론트엔드에서 직접 계산)
          const totalMargin = calculateFilteredChannelField("salesMargin");
          const totalAdCost = isAllChannelsSelected
            ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
            : calculateFilteredAdCost(
                productList,
                selectedOptions2,
                tableData,
                selectedOptions1,
                'channel',
                []
              );
          const totalProfit = totalMargin - totalAdCost;
          additionalTotalCells2.push(!isNaN(totalProfit) && totalProfit !== 0 ? Math.round(totalProfit).toLocaleString() + "원" : "-");
          break;
        }
        case "profit-rate": {
          // 공헌이익 = 판매마진 - 광고비 (프론트엔드에서 직접 계산)
          const totalMargin = calculateFilteredChannelField("salesMargin");
          const totalAdCost = isAllChannelsSelected
            ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
            : calculateFilteredAdCost(
                productList,
                selectedOptions2,
                tableData,
                selectedOptions1,
                'channel',
                []
              );
          const totalProfit = totalMargin - totalAdCost;
          const avgProfitRate = totalSales !== 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0;
          additionalTotalCells2.push(!isNaN(parseFloat(avgProfitRate)) && parseFloat(avgProfitRate) !== 0 ? avgProfitRate + "%" : "-");
          break;
        }
        case "ad-cost": {
          const totalAdCost = isAllChannelsSelected
            ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
            : calculateFilteredAdCost(
                productList,
                selectedOptions2,
                tableData,
                selectedOptions1,
                'channel',
                []
              );
          additionalTotalCells2.push(!isNaN(totalAdCost) && totalAdCost !== 0 ? Math.round(totalAdCost).toLocaleString() + "원" : "-");
          break;
        }
        case "roas": {
          const totalAdCost = isAllChannelsSelected
            ? calculateTotal(productList, selectedOptions2, tableData, "adCost")
            : calculateFilteredAdCost(
                productList,
                selectedOptions2,
                tableData,
                selectedOptions1,
                'channel',
                []
              );
          const avgRoas = totalAdCost !== 0 ? ((totalSales / totalAdCost) * 100).toFixed(1) : 0;
          additionalTotalCells2.push(!isNaN(parseFloat(avgRoas)) && parseFloat(avgRoas) !== 0 ? avgRoas + "%" : "-");
          break;
        }
        case "commission": {
          const totalAgencyFee = calculateFilteredChannelField("agencyFee");
          additionalTotalCells2.push(!isNaN(totalAgencyFee) && totalAgencyFee !== 0 ? Math.round(totalAgencyFee).toLocaleString() + "원" : "-");
          break;
        }
      }
    });

    const totalRow = {
      isTotal: true,
      cells: [...basicTotalCells, ...adCostRoasTotalCells2, ...channelTotalCells, ...additionalTotalCells2],
    };

    return [...dataRows, totalRow];
  }, [productList, selectedOptions2, tableData, salesChannelList, selectedOptions1, isAdmin, childSalesChannelList, selectedChildSalesChannels, viewMode, hasPermission, columnVisibility]);

  return {
    tableColumns,
    renderTableData,
  };
};
