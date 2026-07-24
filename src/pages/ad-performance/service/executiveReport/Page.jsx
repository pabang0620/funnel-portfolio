import React, { useState, useMemo, useEffect } from "react";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import PermissionWrapper from "../../components/PermissionWrapper";
import {
  calculateTotal,
  calculateTotalSales,
  calculateFilteredTotalSales,
  calculateFilteredAdCost,
} from "./elements/utils/tableDataUtils";
import { getColumnSettings, saveColumnSettings } from "./api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./ExecutiveReport.css";
import "../../components/common/DataTable.css";

// Custom Hooks
import { useExecutiveReportData } from "./elements/hooks/useExecutiveReportData";
import { useChartData } from "./elements/hooks/useChartData";
import { useTableData } from "./elements/hooks/useTableData";
import { useAgencyTableData } from "./elements/hooks/useAgencyTableData";
import useRevenueTable from "./elements/hooks/useRevenueTable";
import useMediaTable from "./elements/hooks/useMediaTable";
import useChannelTable from "./elements/hooks/useChannelTable";
import useMonthlyChart from "./elements/hooks/useMonthlyChart";
import useTeamTable from "./elements/hooks/useTeamTable";
import { useStickyTableHeader } from "./elements/hooks/useStickyTableHeader";
import { usePermissions } from "../../hooks/usePermissions";
import { useAuth } from "../../contexts/AuthContext";
import useCombinedData from "./elements/hooks/useCombinedData";

// Sales View Components
import RevenueSection from "./elements/RevenueSection";
import CombinedRevenueSection from "./elements/CombinedRevenueSection";
import FilterControlBar, { ProductFilter } from "./elements/FilterControlBar";
import SalesDataTable from "./elements/SalesDataTable";
import FeeDetailModal from "./elements/FeeDetailModal";
import DailySalesDetailModal from "./elements/DailySalesDetailModal";
import SalesCalculationModal from "./elements/SalesCalculationModal";
import RightFilterPanel from "./elements/RightFilterPanel";
import ColumnSettingsModal from "./elements/ColumnSettingsModal";

// Product Detail View Components
import MonthlyRevenueChart from "./elements/productdetail/MonthlyRevenueChart";
import RevenuePerformanceTable from "./elements/productdetail/RevenuePerformanceTable";
import MediaPerformanceTable from "./elements/productdetail/MediaPerformanceTable";
import ChannelPerformanceTable from "./elements/productdetail/ChannelPerformanceTable";
import ChannelDetailModal from "./elements/productdetail/ChannelDetailModal";
import TeamPerformanceTable from "./elements/productdetail/TeamPerformanceTable";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ExecutiveReport() {
  // 모든 데이터 및 상태 관리
  const dataState = useExecutiveReportData();

  // 사용자 정보 (이름 확인용)
  const { userName } = useAuth();

  // 권한 관리 (판매 실적 현황 페이지)
  const {
    hasPermission,
    hasAnyPermission,
    isLoading: permissionsLoading,
    roleCode,
  } = usePermissions("executive-report-sales");

  // 권한 관리 (제품 상세 실적 페이지)
  const {
    hasPermission: hasProductDetailPermission,
    isLoading: productDetailPermissionsLoading,
  } = usePermissions("executive-report-product");

  // isAdmin 정의 (roleCode는 usePermissions에서 가져옴)
  const isAdmin = roleCode === "S";

  // 제품 선택 상태
  const selectedProductId =
    dataState.selectedSingleProduct.length > 0
      ? dataState.selectedSingleProduct[0]
      : null;

  // 특정 사용자 + 특정 제품 조합에서 S등급 권한 적용 (제품별실적현황 전용)
  // byj(userId=25, name=배윤정) + C_드농(productId=4) → S등급 권한
  const productDetailIsAdmin = isAdmin ||
    (dataState.userId === 25 && userName === "배윤정" && selectedProductId === 4);

  // 각 페이지별 접근 권한 체크
  const canAccessSales =
    isAdmin || hasPermission("executive-report-sales_page-access_page-view");
  const canAccessProductDetail =
    isAdmin ||
    hasProductDetailPermission(
      "executive-report-product_page-access_page-view"
    );

  // 두 페이지 중 하나도 접근 권한이 없으면 접근 거부
  const hasAnyPageAccess = canAccessSales || canAccessProductDetail;

  // 제품 상세 뷰 표시 여부 결정 (제품 선택 + 제품 상세 접근 권한)
  const showProductDetail =
    selectedProductId !== null && canAccessProductDetail;

  // StickyHeader 활성화 조건: 현재 보이는 뷰에 대한 권한이 있을 때만
  // - 판매실적현황 뷰 (제품 미선택): canAccessSales
  // - 제품 상세 실적 뷰 (제품 선택): showProductDetail
  const stickyHeaderEnabled =
    selectedProductId === null ? canAccessSales : showProductDetail;

  // Sticky 테이블 헤더 활성화 (제품/뷰모드/팀/매체 변경 시 재실행, 권한이 있을 때만)
  // tableViewMode, productTypeFilter, agencyViewMode, selectedTeams/Media 변경 시에도 헤더가 다시 복제되어야 함
  const stickyHeaderDependency = `${selectedProductId}-${dataState.tableViewMode}-${dataState.productTypeFilter}-${dataState.agencyViewMode}-${dataState.sortedTeamsKey}-${dataState.sortedMediaKey}`;
  useStickyTableHeader(stickyHeaderDependency, stickyHeaderEnabled);

  // 일별 판매 상세 모달 상태
  const [showDailySalesDetail, setShowDailySalesDetail] = useState(false);

  // 매출 계산식 모달 상태
  const [salesCalculationModal, setSalesCalculationModal] = useState({
    isOpen: false,
    salesByBox: [],
    productName: "",
    totalSales: 0,
  });

  // 제품 즐겨찾기 상태
  const [favoriteProducts, setFavoriteProducts] = useState(() => {
    const saved = localStorage.getItem("executiveReport_favoriteProducts");
    if (saved) {
      return JSON.parse(saved);
    }
    return []; // 기본값: 빈 배열
  });

  // 제품 즐겨찾기 localStorage 저장
  useEffect(() => {
    localStorage.setItem(
      "executiveReport_favoriteProducts",
      JSON.stringify(favoriteProducts)
    );
  }, [favoriteProducts]);

  // 컬럼 설정 로드
  useEffect(() => {
    const loadColumnSettings = async () => {
      try {
        const response = await getColumnSettings();
        if (response.success && response.data) {
          setColumnVisibility(response.data);
        } else {
          // 기본값 설정
          const defaultSettings = {
            기본컬럼: {
              '총매출': true,
              '직접매출': true,
              '간접매출': true,
              '판매마진': true,
              '공헌이익': true,
              '이익률': true,
              '광고비': true,
              'ROAS': true,
              '대행료': true,
            },
            판매처: {},
            파일판매처: {}
          };
          setColumnVisibility(defaultSettings);
        }
      } catch (error) {
        console.error('컬럼 설정 로드 실패:', error);
        // 기본값 설정
        const defaultSettings = {
          기본컬럼: {
            '총매출': true,
            '직접매출': true,
            '간접매출': true,
            '판매마진': true,
            '공헌이익': true,
            '이익률': true,
            '광고비': true,
            'ROAS': true,
            '대행료': true,
          },
          판매처: {},
          파일판매처: {}
        };
        setColumnVisibility(defaultSettings);
      }
    };

    loadColumnSettings();
  }, []);

  // 제품 즐겨찾기 토글 함수
  const handleToggleFavoriteProduct = (productId) => {
    setFavoriteProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // 제품 상세보기 테이블 아코디언 상태 (기본값: 닫힘)
  const [revenueTableExpanded, setRevenueTableExpanded] = useState(false);
  const [mediaTableExpanded, setMediaTableExpanded] = useState(false);
  const [channelTableExpanded, setChannelTableExpanded] = useState(false);
  const [teamTableExpanded, setTeamTableExpanded] = useState(false);

  // 이미지 저장 상태
  const [isSavingImage, setIsSavingImage] = useState(false);

  // 엑셀 다운로드 상태
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // 테이블 정렬 상태
  const [sortConfig, setSortConfig] = useState({
    columnIndex: null, // 정렬할 컬럼 인덱스
    direction: null, // 'asc' | 'desc' | null
  });

  // 컬럼 표시/숨김 설정 상태
  const [columnVisibility, setColumnVisibility] = useState(null);
  const [showColumnSettingsModal, setShowColumnSettingsModal] = useState(false);
  const [isSavingColumnSettings, setIsSavingColumnSettings] = useState(false);

  // 이미지 저장 핸들러
  const handleSaveAsImage = async () => {
    const container = document.querySelector('.executive-report-container');
    if (!container) {
      alert('Could not find the area to save.');
      return;
    }

    setIsSavingImage(true);

    // 원래 패딩 값 저장
    const originalPadding = container.style.padding;

    try {
      // 캡처 전 패딩 추가 (상하 20px, 좌우 40px)
      container.style.padding = '20px 40px';

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // 캡처 후 패딩 복원
      container.style.padding = originalPadding;

      // 날짜 범위로 파일명 생성
      const startDate = dataState.customDateRange.startDate || '';
      const endDate = dataState.customDateRange.endDate || '';
      const fileName = startDate && endDate
        ? `경영리포트_${startDate}_${endDate}.png`
        : `경영리포트_${new Date().toISOString().split('T')[0]}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      // 에러 발생 시에도 패딩 복원
      container.style.padding = originalPadding;
      console.error('이미지 저장 실패:', error);
      alert('이미지 저장에 실패했습니다.');
    } finally {
      setIsSavingImage(false);
    }
  };

  // 컬럼 설정 저장 핸들러
  const handleSaveColumnSettings = async (settings) => {
    setIsSavingColumnSettings(true);
    try {
      const response = await saveColumnSettings(settings);
      if (response.success) {
        setColumnVisibility(settings);
        setShowColumnSettingsModal(false);
      } else {
        alert('컬럼 설정 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('컬럼 설정 저장 실패:', error);
      alert('컬럼 설정 저장에 실패했습니다.');
    } finally {
      setIsSavingColumnSettings(false);
    }
  };

  // 엑셀 다운로드 핸들러
  const handleExportToExcel = () => {
    try {
      setIsExportingExcel(true);

      const isAgencyMode = dataState.productTypeFilter === 'agency';
      const tableData = isAgencyMode ? sortedAgencyTableData : sortedTableData;
      const columns = isAgencyMode ? agencyTable.tableColumns : tableColumns;

      // 헤더 생성 - columns는 [firstRow, secondRow] 2D 배열
      const firstRow = columns[0] || [];
      const secondRow = columns[1] || [];

      const excelRow1 = [];
      const excelRow2 = [];
      let secondRowIndex = 0;

      firstRow.forEach(col => {
        excelRow1.push(col.title || '');
        const span = col.colSpan || 1;
        for (let i = 1; i < span; i++) {
          excelRow1.push('');
        }
        if (span > 1) {
          for (let i = 0; i < span; i++) {
            excelRow2.push(secondRow[secondRowIndex]?.title || '');
            secondRowIndex++;
          }
        } else {
          excelRow2.push('');
        }
      });

      const headerRows = secondRow.length > 0 ? [excelRow1, excelRow2] : [excelRow1];

      // 데이터 변환
      const excelData = tableData.map(row => {
        return row.cells.map(cell => {
          if (typeof cell === 'object' && cell.value !== undefined) {
            return cell.value;
          }
          return cell;
        });
      });

      // 헤더 + 데이터 결합
      const wsData = [...headerRows, ...excelData];

      // 워크시트 생성
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // 워크북 생성
      const wb = XLSX.utils.book_new();
      const sheetName = isAgencyMode ? '대행제품' : '자사제품';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // 파일명 생성
      const today = new Date().toISOString().split('T')[0];
      const fileName = `경영리포트_${sheetName}_${today}.xlsx`;

      // 다운로드
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드에 실패했습니다.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 차트 데이터 생성 (API에서 받은 대시보드 데이터 기반)
  const chartData = useChartData(dataState.dashboardData);

  // 자사+대행 통합 데이터 생성 (tableData 사용)
  const combinedData = useCombinedData(
    dataState.tableData,
    dataState.agencyTableData
  );

  // 테이블 데이터 생성 (권한 기반)
  const { tableColumns, renderTableData } = useTableData({
    userRole: dataState.userRole,
    salesChannelList: dataState.salesChannelList,
    selectedOptions1: dataState.selectedOptions1,
    selectedOptions2: dataState.selectedOptions2,
    productList: dataState.productList,
    tableData: dataState.tableData,
    childSalesChannelList: dataState.childSalesChannelList,
    selectedChildSalesChannels: dataState.selectedChildSalesChannels,
    viewMode: dataState.tableViewMode,
    // 권한 함수 전달
    hasPermission: hasPermission,
    // 컬럼 표시/숨김 설정
    columnVisibility: columnVisibility,
  });

  // 대행 모드 판단
  const isAgencyMode = !dataState.tableProductTypeFilter.inHouse && dataState.tableProductTypeFilter.agency;

  // 대행 모드일 때 제품 리스트 필터링
  const filteredProductList = useMemo(() => {
    if (isAgencyMode) {
      // 대행 제품 + 특수 옵션("전체", "자사", "대행") 필터링
      return dataState.productList.filter(product =>
        product.name.startsWith('대행_') ||
        product.name === '전체' ||
        product.name === '자사' ||
        product.name === '대행'
      );
    } else {
      // 자사 제품만 필터링 (대행 제품 제외)
      return dataState.productList.filter(product => !product.name.startsWith('대행_'));
    }
  }, [isAgencyMode, dataState.productList]);

  // 대행 모드일 때 제품 특수 옵션 필터링
  const filteredProductSpecialOptions = useMemo(() => {
    const currentProductIds = filteredProductList.map(p => p.id);

    if (isAgencyMode) {
      // 대행 모드: "전체"만 표시 (자사/대행 옵션 제거)
      return {
        "전체": currentProductIds
      };
    }

    // 자사 모드: specialOptions에서 현재 탭의 제품만 포함하도록 필터링
    const filteredOptions = {};
    Object.entries(dataState.productSpecialOptions).forEach(([key, value]) => {
      // 현재 탭(자사)의 제품 ID만 포함
      filteredOptions[key] = value.filter(id => currentProductIds.includes(id));
    });

    return filteredOptions;
  }, [isAgencyMode, filteredProductList, dataState.productSpecialOptions]);

  // 대행 모드일 때 부모 팀만 필터링 (parentId가 null 또는 0인 팀)
  // 특수 옵션 제외 - 테이블용
  const parentTeamList = useMemo(() => {
    return dataState.teamList.filter(team => !team.parentId || team.parentId === 0);
  }, [dataState.teamList]);

  // 부모 팀 + 특수 옵션 (드롭다운용)
  const parentTeamListWithSpecial = useMemo(() => {
    return [
      { id: -1, name: "전체" },
      ...parentTeamList
    ];
  }, [parentTeamList]);

  // 대행 모드일 때 부모 매체만 필터링 (parentId가 null인 매체)
  // 특수 옵션 제외 - 테이블용
  const parentMediaList = useMemo(() => {
    return dataState.mediaList.filter(media => !media.parentId);
  }, [dataState.mediaList]);

  // 부모 매체 + 특수 옵션 (드롭다운용)
  const parentMediaListWithSpecial = useMemo(() => {
    return [
      { id: -1, name: "전체" },
      { id: 0, name: "간소화" },
      ...parentMediaList
    ];
  }, [parentMediaList]);

  // 부모 팀 특수 옵션 (전체 선택)
  const parentTeamSpecialOptions = useMemo(() => {
    const allParentTeamIds = parentTeamListWithSpecial
      .filter(t => t.id !== -1)
      .map(t => t.id);
    return {
      "전체": allParentTeamIds
    };
  }, [parentTeamListWithSpecial]);

  // 부모 매체 특수 옵션 (전체 선택, 간소화)
  const parentMediaSpecialOptions = useMemo(() => {
    const allParentMediaIds = parentMediaListWithSpecial
      .filter(m => m.id !== -1 && m.id !== 0)
      .map(m => m.id);

    // 간소화: 구글, 메타, 네이버, 크리테오만 선택
    const simplifiedMediaNames = ['구글', '메타', '네이버', '크리테오'];
    const simplifiedMediaIds = parentMediaList
      .filter(m => simplifiedMediaNames.includes(m.name))
      .map(m => m.id);

    return {
      "전체": allParentMediaIds,
      "간소화": simplifiedMediaIds
    };
  }, [parentMediaListWithSpecial, parentMediaList]);

  // 대행 테이블 데이터 생성 (부모 팀/매체 리스트 사용)
  const agencyTable = useAgencyTableData({
    agencyTableData: dataState.agencyTableData,
    viewMode: dataState.agencyViewMode,
    teamList: parentTeamList,
    mediaList: parentMediaList,
    selectedTeams: dataState.selectedTeams,
    selectedMedia: dataState.selectedMedia,
    selectedProducts: dataState.selectedOptions2,
  });

  // 데이터 없는 행 필터링
  const filteredTableData = useMemo(() => {
    if (!dataState.hideEmptyRows) {
      return renderTableData;
    }

    return renderTableData.filter((row) => {
      // 합계 행은 항상 표시
      if (row.isTotal) {
        return true;
      }

      // 모든 데이터 컬럼을 체크 (제품명 제외)
      // 하나라도 유효한 값(0이 아닌 값)이 있으면 데이터가 있는 것으로 판단
      const hasData = row.cells.some((cell, index) => {
        // 첫 번째 컬럼(제품명)은 제외
        if (index === 0) return false;

        // 셀이 객체인 경우 value 속성 확인
        const cellValue = typeof cell === 'object' && cell.value !== undefined
          ? cell.value
          : cell;

        // "-", 빈 문자열, null, undefined는 데이터 없음
        if (cellValue === "-" || cellValue === "" || cellValue === null || cellValue === undefined) {
          return false;
        }

        // 숫자형 값인 경우 0이면 데이터 없음
        if (typeof cellValue === 'number') {
          return cellValue !== 0;
        }

        // 문자열인 경우 숫자 추출하여 0인지 확인
        if (typeof cellValue === 'string') {
          // 숫자만 추출 (% 또는 원 제거)
          const numericValue = parseFloat(cellValue.replace(/[^0-9.-]/g, ''));
          // NaN이거나 0이면 데이터 없음
          return !isNaN(numericValue) && numericValue !== 0;
        }

        // 그 외의 경우는 데이터 있음으로 간주
        return true;
      });

      return hasData;
    });
  }, [renderTableData, dataState.hideEmptyRows]);

  // 테이블 정렬
  const sortedTableData = useMemo(() => {
    if (sortConfig.columnIndex === null || sortConfig.direction === null) {
      return filteredTableData;
    }

    // 합계 행 분리
    const totalRows = filteredTableData.filter(row => row.isTotal);
    const dataRows = filteredTableData.filter(row => !row.isTotal);

    // 데이터 행 정렬
    const sorted = [...dataRows].sort((a, b) => {
      const cellA = a.cells[sortConfig.columnIndex];
      const cellB = b.cells[sortConfig.columnIndex];

      // 셀이 객체인 경우 value 추출
      const valueA = typeof cellA === 'object' && cellA.value !== undefined ? cellA.value : cellA;
      const valueB = typeof cellB === 'object' && cellB.value !== undefined ? cellB.value : cellB;

      // "-" 값 처리: 데이터 없는 행은 항상 하단에
      const isEmptyA = valueA === "-" || valueA === "" || valueA === null || valueA === undefined;
      const isEmptyB = valueB === "-" || valueB === "" || valueB === null || valueB === undefined;

      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1; // A가 비어있으면 뒤로
      if (isEmptyB) return -1; // B가 비어있으면 뒤로

      // 숫자 형태 문자열 변환 (1,234,567 → 1234567)
      const parseValue = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          // 콤마 제거 후 숫자로 변환
          const cleaned = val.replace(/,/g, '').replace(/%/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? val : num;
        }
        return val;
      };

      const parsedA = parseValue(valueA);
      const parsedB = parseValue(valueB);

      // 숫자 비교
      if (typeof parsedA === 'number' && typeof parsedB === 'number') {
        return sortConfig.direction === 'asc' ? parsedA - parsedB : parsedB - parsedA;
      }

      // 문자열 비교
      const strA = String(parsedA);
      const strB = String(parsedB);
      return sortConfig.direction === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });

    // 합계 행을 맨 아래에 추가
    return [...sorted, ...totalRows];
  }, [filteredTableData, sortConfig]);

  // 대행 테이블 데이터 없는 행 필터링
  const filteredAgencyTableData = useMemo(() => {
    if (!dataState.hideEmptyRows) {
      return agencyTable.renderTableData;
    }

    const filtered = agencyTable.renderTableData.filter((row) => {
      // 합계 행은 항상 표시
      if (row.isTotal) {
        return true;
      }

      // 대행 테이블: cells[1]이 총광고비 (totalAdCost)
      // cells 구조: [제품명, 총광고비, ...팀/매체별데이터..., 대행료]
      const totalAdCostCell = row.cells[1];
      const cellValue = typeof totalAdCostCell === 'object' && totalAdCostCell.value !== undefined
        ? totalAdCostCell.value
        : totalAdCostCell;

      return cellValue !== "-";
    });

    return filtered;
  }, [agencyTable.renderTableData, dataState.hideEmptyRows]);

  // 대행 테이블 정렬
  const sortedAgencyTableData = useMemo(() => {
    if (sortConfig.columnIndex === null || sortConfig.direction === null) {
      return filteredAgencyTableData;
    }

    const totalRows = filteredAgencyTableData.filter(row => row.isTotal);
    const dataRows = filteredAgencyTableData.filter(row => !row.isTotal);

    const sorted = [...dataRows].sort((a, b) => {
      const cellA = a.cells[sortConfig.columnIndex];
      const cellB = b.cells[sortConfig.columnIndex];

      const valueA = typeof cellA === 'object' && cellA.value !== undefined ? cellA.value : cellA;
      const valueB = typeof cellB === 'object' && cellB.value !== undefined ? cellB.value : cellB;

      const isEmptyA = valueA === "-" || valueA === "" || valueA === null || valueA === undefined;
      const isEmptyB = valueB === "-" || valueB === "" || valueB === null || valueB === undefined;

      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1;
      if (isEmptyB) return -1;

      const parseValue = (val) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const cleaned = val.replace(/,/g, '').replace(/%/g, '');
          const num = parseFloat(cleaned);
          return isNaN(num) ? val : num;
        }
        return val;
      };

      const parsedA = parseValue(valueA);
      const parsedB = parseValue(valueB);

      if (typeof parsedA === 'number' && typeof parsedB === 'number') {
        return sortConfig.direction === 'asc' ? parsedA - parsedB : parsedB - parsedA;
      }

      const strA = String(parsedA);
      const strB = String(parsedB);
      return sortConfig.direction === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });

    return [...sorted, ...totalRows];
  }, [filteredAgencyTableData, sortConfig]);

  // S등급용 테이블 데이터 합계 계산
  const tableTotals = useMemo(() => {
    if (!dataState.productList.length || !dataState.selectedOptions2.length || !dataState.tableData.length) {
      return { totalSales: 0, totalAdCost: 0, contributionProfit: 0, roas: "0.0" };
    }

    // 파일판매처별 모드: 선택한 파일판매처만 프론트엔드에서 필터링
    // (백엔드는 부모 판매처 전체를 보내기 때문)
    if (dataState.tableViewMode === 'fileChannel') {
      // "전체" 옵션 (-1) 제외한 유효한 선택 확인
      const validSelectedChannels = dataState.selectedChildSalesChannels.filter(id => id !== -1);

      if (validSelectedChannels.length === 0) {
        return { totalSales: 0, totalAdCost: 0, contributionProfit: 0, roas: "0.0" };
      }

      // 전체 선택이든 일부 선택이든 동일한 로직 사용 (매출 0인 제품 제외)
      const totalSales = calculateFilteredTotalSales(
        dataState.productList,
        dataState.selectedOptions2,
        dataState.tableData,
        validSelectedChannels,
        'fileChannel',
        dataState.childSalesChannelList
      );

      const totalAdCost = calculateFilteredAdCost(
        dataState.productList,
        dataState.selectedOptions2,
        dataState.tableData,
        validSelectedChannels,
        'fileChannel',
        dataState.childSalesChannelList
      );

      // 공헌이익 = 판매마진 - 광고비 (프론트엔드에서 직접 계산)
      const totalMargin = dataState.productList
        .filter((product) => dataState.selectedOptions2.includes(product.id))
        .reduce((sum, product) => {
          const productData = dataState.tableData.find((item) => item.productId === product.id);
          if (!productData) return sum;

          const totalProductSales = productData.totalSales || 0;
          const productMargin = productData.salesMargin || 0;

          if (totalProductSales === 0) return sum;

          // 선택한 파일판매처의 매출 합산
          let selectedSales = 0;
          validSelectedChannels.forEach((childId) => {
            const salesKey = `mp${childId}Sales`;
            selectedSales += productData[salesKey] || 0;
          });

          // 선택한 판매처의 매출 비율만큼 판매마진 계산
          const ratio = selectedSales / totalProductSales;
          return sum + (productMargin * ratio);
        }, 0);

      const contributionProfit = totalMargin - totalAdCost;

      const roas = totalAdCost !== 0 ? ((totalSales / totalAdCost) * 100).toFixed(1) : "0.0";
      return {
        totalSales,
        totalAdCost: Math.round(totalAdCost),
        contributionProfit: Math.round(contributionProfit),
        roas
      };
    }

    // 판매처별 모드: 선택한 판매처만 프론트엔드에서 필터링
    if (dataState.selectedOptions1.length > 0) {
      const totalSales = calculateFilteredTotalSales(
        dataState.productList,
        dataState.selectedOptions2,
        dataState.tableData,
        dataState.selectedOptions1,
        'channel',
        dataState.salesChannelList
      );

      const totalAdCost = calculateFilteredAdCost(
        dataState.productList,
        dataState.selectedOptions2,
        dataState.tableData,
        dataState.selectedOptions1,
        'channel',
        dataState.salesChannelList
      );

      // 공헌이익 = 판매마진 - 광고비 (프론트엔드에서 직접 계산)
      const totalMargin = dataState.productList
        .filter((product) => dataState.selectedOptions2.includes(product.id))
        .reduce((sum, product) => {
          const productData = dataState.tableData.find((item) => item.productId === product.id);
          if (!productData) return sum;

          const totalProductSales = productData.totalSales || 0;
          const productMargin = productData.salesMargin || 0;

          if (totalProductSales === 0) {
            // 매출이 0이면 판매마진 전액 포함
            return sum + productMargin;
          }

          // 선택한 판매처의 매출 합산
          let selectedSales = 0;
          dataState.selectedOptions1.forEach((channelName) => {
            const salesKey = `${channelName}Sales`;
            selectedSales += productData[salesKey] || 0;
          });

          // 선택한 판매처의 매출 비율만큼 판매마진 계산
          const ratio = selectedSales / totalProductSales;
          return sum + (productMargin * ratio);
        }, 0);

      const contributionProfit = totalMargin - totalAdCost;

      const roas = totalAdCost !== 0 ? ((totalSales / totalAdCost) * 100).toFixed(1) : "0.0";
      return {
        totalSales,
        totalAdCost: Math.round(totalAdCost),
        contributionProfit: Math.round(contributionProfit),
        roas
      };
    }

    // 판매처를 하나도 선택하지 않은 경우
    return { totalSales: 0, totalAdCost: 0, contributionProfit: 0, roas: "0.0" };
  }, [
    dataState.productList,
    dataState.selectedOptions2,
    dataState.tableData,
    dataState.tableViewMode,
    dataState.selectedOptions1,
    dataState.salesChannelList,
    dataState.selectedChildSalesChannels,
    dataState.childSalesChannelList,
  ]);

  // 제품 상세 뷰용 선택된 채널 목록 (viewMode에 따라 다름) - useMemo로 메모이제이션
  // channel 모드: 부모 판매처 이름 배열 (selectedOptions1은 이름 배열)
  // fileChannel 모드: 자식 판매처 ID 배열 (백엔드에서 ID 기반 키 사용)
  const productDetailSelectedChannels = useMemo(() => {
    if (dataState.productDetailViewMode === "channel") {
      return dataState.selectedOptions1;
    }
    // 파일판매처별 모드: ID 배열 반환 (selectedChildSalesChannels가 이미 ID 배열)
    return dataState.selectedChildSalesChannels;
  }, [
    dataState.productDetailViewMode,
    dataState.selectedOptions1,
    dataState.selectedChildSalesChannels,
  ]);

  // 제품 상세 뷰용 채널 리스트 - useMemo로 메모이제이션
  const productDetailChannelList = useMemo(() => {
    return dataState.productDetailViewMode === "channel"
      ? dataState.salesChannelList
      : dataState.childSalesChannelList;
  }, [
    dataState.productDetailViewMode,
    dataState.salesChannelList,
    dataState.childSalesChannelList,
  ]);

  const revenueTable = useRevenueTable(
    dataState.customDateRange,
    productDetailSelectedChannels,
    productDetailIsAdmin,
    selectedProductId,
    productDetailChannelList,
    dataState.productDetailViewMode,
    hasProductDetailPermission,
    "executive-report-product",
    "table1",
    revenueTableExpanded
  );
  // 제품 상세 보기용 매체 리스트 결정
  const productDetailMediaList = useMemo(() => {
    if (!selectedProductId) return dataState.mediaList;

    // 선택된 제품 찾기
    const selectedProduct = dataState.productList.find(p => p.id === selectedProductId);
    if (!selectedProduct) return dataState.mediaList;

    // 대행 제품이면 필터링된 매체 리스트, 자사 제품이면 전체 매체 리스트
    return selectedProduct.name.startsWith('대행_')
      ? dataState.mediaList
      : dataState.allMediaList;
  }, [selectedProductId, dataState.productList, dataState.mediaList, dataState.allMediaList]);

  // 제품 전환 시 유효하지 않은 매체 ID 제거
  useEffect(() => {
    if (selectedProductId && productDetailMediaList.length > 0) {
      const validMediaIds = productDetailMediaList.map(m => m.id);
      const currentSelectedMedia = dataState.selectedMedia;

      // 유효하지 않은 매체 ID 필터링
      const filteredMedia = currentSelectedMedia.filter(mediaId =>
        validMediaIds.includes(mediaId)
      );

      // 변경이 있으면 업데이트
      if (filteredMedia.length !== currentSelectedMedia.length) {
        dataState.setSelectedMedia(filteredMedia);
      }
    }
  }, [selectedProductId, productDetailMediaList]);

  // 대행 모드 매체별 보기 전환 시 유효하지 않은 매체 ID 제거
  useEffect(() => {
    if (isAgencyMode && dataState.agencyViewMode === 'media' && parentMediaList.length > 0) {
      // 유효한 매체 ID: 부모 매체 + 특수 옵션 (-1: 전체, 0: 간소화)
      const validMediaIds = [-1, 0, ...parentMediaList.map(m => m.id)];
      const currentSelectedMedia = dataState.selectedMedia;

      // 유효하지 않은 매체 ID 필터링
      const filteredMedia = currentSelectedMedia.filter(mediaId =>
        validMediaIds.includes(mediaId)
      );

      // 변경이 있으면 업데이트
      if (filteredMedia.length !== currentSelectedMedia.length) {
        dataState.setSelectedMedia(filteredMedia);
      }
    }
  }, [isAgencyMode, dataState.agencyViewMode, parentMediaList]);

  const mediaTable = useMediaTable(
    dataState.customDateRange,
    dataState.selectedMedia,
    selectedProductId,
    productDetailMediaList,
    mediaTableExpanded
  );
  const channelTable = useChannelTable(
    dataState.customDateRange,
    productDetailSelectedChannels,
    selectedProductId,
    productDetailChannelList,
    dataState.productDetailViewMode,
    channelTableExpanded
  );

  // 팀별 실적 데이터
  const teamTable = useTeamTable(
    dataState.customDateRange,
    dataState.selectedTeams,
    productDetailIsAdmin,
    selectedProductId,
    dataState.teamList,
    teamTableExpanded
  );

  // 월별 차트 데이터
  const { chartData: monthlyChartData } = useMonthlyChart(selectedProductId);

  // 컬럼 순서 변경 핸들러 (드래그 앤 드롭)
  const handleColumnReorder = (sourceChannelName, targetChannelName) => {
    // 대행 모드 체크
    if (isAgencyMode) {
      if (dataState.agencyViewMode === 'team') {
        // 팀별 보기 재정렬
        handleAgencyTeamReorder(sourceChannelName, targetChannelName);
      } else {
        // 매체별 보기 재정렬
        handleAgencyMediaReorder(sourceChannelName, targetChannelName);
      }
    } else {
      // 자사 모드 (기존 로직 유지)
      if (dataState.tableViewMode === 'channel') {
        // 판매처별 보기: selectedOptions1 재정렬
        const newOrder = [...dataState.selectedOptions1];
        const sourceIndex = newOrder.indexOf(sourceChannelName);
        const targetIndex = newOrder.indexOf(targetChannelName);

        if (sourceIndex !== -1 && targetIndex !== -1) {
          // 소스 항목 제거 후 타겟 위치에 삽입
          newOrder.splice(sourceIndex, 1);
          newOrder.splice(targetIndex, 0, sourceChannelName);
          dataState.setSelectedOptions1(newOrder);
          // 순서는 기존 localStorage 저장 effect에서 자동으로 저장됨
        }
      } else {
        // 파일판매처별 보기: selectedChildSalesChannels 재정렬
        // 이름으로 ID 찾기
        const sourceChannel = dataState.childSalesChannelList.find(ch => ch.name === sourceChannelName);
        const targetChannel = dataState.childSalesChannelList.find(ch => ch.name === targetChannelName);

        if (sourceChannel && targetChannel) {
          const newOrder = [...dataState.selectedChildSalesChannels];
          const sourceIndex = newOrder.indexOf(sourceChannel.id);
          const targetIndex = newOrder.indexOf(targetChannel.id);

          if (sourceIndex !== -1 && targetIndex !== -1) {
            newOrder.splice(sourceIndex, 1);
            newOrder.splice(targetIndex, 0, sourceChannel.id);
            dataState.setSelectedChildSalesChannels(newOrder);
            // 순서는 기존 localStorage 저장 effect에서 자동으로 저장됨
          }
        }
      }
    }
  };

  // 대행 모드 - 팀별 보기 재정렬 핸들러
  const handleAgencyTeamReorder = (sourceTeamName, targetTeamName) => {
    const sourceTeam = dataState.teamList.find(t => t.name === sourceTeamName);
    const targetTeam = dataState.teamList.find(t => t.name === targetTeamName);

    if (sourceTeam && targetTeam) {
      const newOrder = [...dataState.selectedTeams];
      const sourceIndex = newOrder.indexOf(sourceTeam.id);
      const targetIndex = newOrder.indexOf(targetTeam.id);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceTeam.id);
        dataState.setSelectedTeams(newOrder);
        // localStorage 저장은 useEffect에서 자동 처리
      }
    }
  };

  // 대행 모드 - 매체별 보기 재정렬 핸들러
  const handleAgencyMediaReorder = (sourceMediaName, targetMediaName) => {
    const sourceMedia = dataState.mediaList.find(m => m.name === sourceMediaName);
    const targetMedia = dataState.mediaList.find(m => m.name === targetMediaName);

    if (sourceMedia && targetMedia) {
      const newOrder = [...dataState.selectedMedia];
      const sourceIndex = newOrder.indexOf(sourceMedia.id);
      const targetIndex = newOrder.indexOf(targetMedia.id);

      if (sourceIndex !== -1 && targetIndex !== -1) {
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceMedia.id);
        dataState.setSelectedMedia(newOrder);
        // localStorage 저장은 useEffect에서 자동 처리
      }
    }
  };

  // 테이블 셀 클릭 핸들러 - 제품 선택 또는 매출 계산식 모달
  const handleCellClick = (rowIndex, cellIndex, cell, row) => {
    // 셀이 객체이고 salesByBox가 있으면 계산식 모달 표시
    if (
      cell &&
      typeof cell === "object" &&
      cell.salesByBox &&
      cell.salesByBox.length > 0
    ) {
      setSalesCalculationModal({
        isOpen: true,
        salesByBox: cell.salesByBox,
        productName: cell.productName || "",
        totalSales: cell.totalSales || 0,
      });
      return;
    }

    // 첫 번째 컬럼(제품명)만 클릭 가능
    if (cellIndex !== 0) return;

    const cellText =
      typeof cell === "string" ? cell : cell?.value || cell?.toString() || "";
    // 합계, -, % 등은 클릭 불가
    if (
      cellText.includes("합계") ||
      cellText === "-" ||
      cellText.includes("%")
    ) {
      return;
    }
    // 제품명으로 제품 ID 찾기
    const product = dataState.productList.find((p) => p.name === cellText);
    if (product && product.id) {
      // 우측 필터의 제품 선택 변경 → 제품 상세 뷰로 전환 (ID로)
      dataState.setSelectedSingleProduct([product.id]);
    }
  };

  // 우측 필터 패널
  const rightPanel = (
    <RightFilterPanel
      productList={dataState.productList}
      selectedSingleProduct={dataState.selectedSingleProduct}
      onProductChange={dataState.setSelectedSingleProduct}
      customDateRange={dataState.customDateRange}
      setCustomDateRange={dataState.setCustomDateRange}
      selectedPeriod={dataState.selectedPeriod}
      setSelectedPeriod={dataState.setSelectedPeriod}
      userId={dataState.userId}
      productTypeFilter={dataState.productTypeFilter}
      setProductTypeFilter={dataState.setProductTypeFilter}
      onSaveAsImage={handleSaveAsImage}
      isSavingImage={isSavingImage}
      isAdmin={isAdmin}
      favoriteProducts={favoriteProducts}
      onToggleFavorite={handleToggleFavoriteProduct}
    />
  );

  // 자사/대행/통합 탭 컴포넌트
  const productTypeSelector = (
    <div
      style={{
        display: 'flex',
        border: '2px solid #e4e4e7',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* 자사+대행 버튼 - S등급만 표시 */}
      {isAdmin && (
        <button
          onClick={() => {
            dataState.setProductTypeFilter('combined');
            // 테이블 필터는 자사+대행 모두 선택
            dataState.setTableProductTypeFilter({ inHouse: true, agency: true });
            // 모든 제품 선택
            const allProducts = dataState.productList
              .filter(p => p.name !== "전체" && p.name !== "자사" && p.name !== "대행")
              .map(p => p.id);
            if (allProducts.length > 0) {
              dataState.setSelectedOptions2(allProducts);
            }
          }}
          style={{
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: dataState.productTypeFilter === 'combined' ? '#3b82f6' : '#fff',
            color: dataState.productTypeFilter === 'combined' ? '#fff' : '#71717a',
            fontWeight: dataState.productTypeFilter === 'combined' ? '600' : '500',
            transition: 'all 0.15s ease',
          }}
        >
          자사+대행
        </button>
      )}
      <button
        onClick={() => {
          dataState.setProductTypeFilter('inHouse');
          // 테이블 필터도 자사만 선택
          dataState.setTableProductTypeFilter({ inHouse: true, agency: false });
          // 자사 제품만 선택
          const inHouseProducts = dataState.productList
            .filter(p => !p.name.startsWith("대행_") && p.name !== "전체" && p.name !== "자사" && p.name !== "대행")
            .map(p => p.id);
          if (inHouseProducts.length > 0) {
            dataState.setSelectedOptions2(inHouseProducts);
          }
        }}
        style={{
          padding: '0.5rem 1.25rem',
          fontSize: '0.875rem',
          border: 'none',
          borderLeft: isAdmin ? '2px solid #e4e4e7' : 'none',
          cursor: 'pointer',
          backgroundColor: dataState.productTypeFilter === 'inHouse' ? '#3b82f6' : '#fff',
          color: dataState.productTypeFilter === 'inHouse' ? '#fff' : '#71717a',
          fontWeight: dataState.productTypeFilter === 'inHouse' ? '600' : '500',
          transition: 'all 0.15s ease',
        }}
      >
        자사 제품
      </button>
      <button
        onClick={() => {
          dataState.setProductTypeFilter('agency');
          // 테이블 필터도 대행만 선택
          dataState.setTableProductTypeFilter({ inHouse: false, agency: true });
          // 대행 제품만 선택
          const agencyProducts = dataState.productList
            .filter(p => p.name.startsWith("대행_"))
            .map(p => p.id);
          if (agencyProducts.length > 0) {
            dataState.setSelectedOptions2(agencyProducts);
          }
        }}
        style={{
          padding: '0.5rem 1.25rem',
          fontSize: '0.875rem',
          border: 'none',
          borderLeft: '2px solid #e4e4e7',
          cursor: 'pointer',
          backgroundColor: dataState.productTypeFilter === 'agency' ? '#3b82f6' : '#fff',
          color: dataState.productTypeFilter === 'agency' ? '#fff' : '#71717a',
          fontWeight: dataState.productTypeFilter === 'agency' ? '600' : '500',
          transition: 'all 0.15s ease',
        }}
      >
        대행 제품
      </button>
    </div>
  );

  // 두 페이지 모두 접근 권한이 없는 경우
  if (
    !hasAnyPageAccess &&
    !permissionsLoading &&
    !productDetailPermissionsLoading
  ) {
    return (
      <Layout>
        <div className="executive-report-container">
          <Breadcrumb />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
            <h2 style={{ marginBottom: "1rem", color: "#333" }}>
              Access denied
            </h2>
            <p style={{ color: "#666", marginBottom: "0.5rem" }}>
              You do not have permission to access this page.
            </p>
            <p style={{ color: "#999", fontSize: "0.9rem" }}>
              관리자에게 권한을 요청해주세요.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout rightPanel={rightPanel}>
      {/* 로딩 오버레이 */}
      {dataState.isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p
            style={{
              marginTop: '1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#4b5563',
            }}
          >
            데이터 로딩 중...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      {selectedProductId !== null && !canAccessProductDetail ? (
        /* 제품 상세 접근 권한 없음 */
        <div className="executive-report-container">
          <Breadcrumb productSelector={productTypeSelector} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "400px",
              padding: "2rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
            <h2 style={{ marginBottom: "1rem", color: "#333" }}>
              No permission to view product detail performance
            </h2>
            <p style={{ color: "#666", marginBottom: "0.5rem" }}>
              You do not have permission to view product detail performance.
            </p>
            <p style={{ color: "#999", fontSize: "0.9rem" }}>
              관리자에게 권한을 요청해주세요.
            </p>
          </div>
        </div>
      ) : showProductDetail ? (
        /* 제품 상세 실적 뷰 */
        <div className="product-detail-container">
          {/* Breadcrumb 네비게이션 */}
          <Breadcrumb productSelector={productTypeSelector} />

          {/* 메인 + 필터 영역 */}
          <div className="table-filter-container">
            {/* 왼쪽: 메인 콘텐츠 */}
            <div className="flex-1">
              {/* 차트 영역 */}
              <PermissionWrapper
                pageId="executive-report-product"
                groupName="chart-box"
                displayName="chart-box"
              >
                <MonthlyRevenueChart
                  revenueData={monthlyChartData}
                  hasPermission={hasProductDetailPermission}
                  isAdmin={productDetailIsAdmin}
                />
              </PermissionWrapper>

              {/* 1. 매출 실적 현황 */}
              <RevenuePerformanceTable
                columns={revenueTable.columns}
                data={revenueTable.data}
                isAdmin={productDetailIsAdmin}
                selectedChannels={dataState.selectedOptions1}
                onChannelChange={dataState.setSelectedOptions1}
                salesChannelList={dataState.salesChannelList}
                salesChannelSpecialOptions={
                  dataState.salesChannelSpecialOptions
                }
                isLoading={revenueTable.isLoading}
                childSalesChannelList={dataState.childSalesChannelList}
                childSalesChannelSpecialOptions={
                  dataState.childSalesChannelSpecialOptions
                }
                selectedChildSalesChannels={
                  dataState.selectedChildSalesChannels
                }
                onChildSalesChannelChange={
                  dataState.setSelectedChildSalesChannels
                }
                viewMode={dataState.productDetailViewMode}
                onViewModeChange={dataState.setProductDetailViewMode}
                onCellClick={handleCellClick}
                isExpanded={revenueTableExpanded}
                onExpandChange={setRevenueTableExpanded}
              />

              {/* 2. 매체별 실적현황 */}
              <PermissionWrapper
                pageId="executive-report-product"
                groupName="table2"
                displayName="table2"
              >
                <MediaPerformanceTable
                  columns={mediaTable.columns}
                  data={mediaTable.data}
                  isAdmin={productDetailIsAdmin}
                  selectedMedia={dataState.selectedMedia}
                  onMediaChange={dataState.setSelectedMedia}
                  mediaList={productDetailMediaList}
                  mediaSpecialOptions={dataState.mediaSpecialOptions}
                  isExpanded={mediaTableExpanded}
                  onExpandChange={setMediaTableExpanded}
                />
              </PermissionWrapper>

              {/* 3. 판매처별 실적현황 */}
              <PermissionWrapper
                pageId="executive-report-product"
                groupName="table3"
                displayName="table3"
              >
                <ChannelPerformanceTable
                  columns={channelTable.columns}
                  data={channelTable.data}
                  selectedChannels={dataState.selectedOptions1}
                  onChannelChange={dataState.setSelectedOptions1}
                  onDetailClick={() => dataState.setShowChannelDetail(true)}
                  salesChannelList={dataState.salesChannelList}
                  salesChannelSpecialOptions={
                    dataState.salesChannelSpecialOptions
                  }
                  childSalesChannelList={dataState.childSalesChannelList}
                  childSalesChannelSpecialOptions={
                    dataState.childSalesChannelSpecialOptions
                  }
                  selectedChildSalesChannels={
                    dataState.selectedChildSalesChannels
                  }
                  onChildSalesChannelChange={
                    dataState.setSelectedChildSalesChannels
                  }
                  viewMode={dataState.productDetailViewMode}
                  onViewModeChange={dataState.setProductDetailViewMode}
                  isExpanded={channelTableExpanded}
                  onExpandChange={setChannelTableExpanded}
                />
              </PermissionWrapper>

              {/* 4. 팀별 실적현황 - 임시 주석 처리
              <PermissionWrapper
                pageId="executive-report-product"
                groupName="table4"
                displayName="table4"
              >
                <TeamPerformanceTable
                  columns={teamTable.columns}
                  data={teamTable.data}
                  isAdmin={productDetailIsAdmin}
                  selectedTeams={dataState.selectedTeams}
                  onTeamChange={dataState.setSelectedTeams}
                  teamList={dataState.teamList}
                  teamSpecialOptions={dataState.teamSpecialOptions}
                  isLoading={teamTable.isLoading}
                  onCellClick={handleCellClick}
                  isExpanded={teamTableExpanded}
                  onExpandChange={setTeamTableExpanded}
                />
              </PermissionWrapper>
              */}
            </div>
          </div>

          {/* 판매처별 상세 팝업 */}
          <ChannelDetailModal
            isOpen={dataState.showChannelDetail || false}
            onClose={() => dataState.setShowChannelDetail(false)}
            selectedProduct={dataState.selectedSingleProduct}
            customDateRange={dataState.customDateRange}
            selectedMarketPlaces={dataState.selectedOptions1}
            productList={dataState.productList}
          />

          {/* 매출 계산식 모달 */}
          <SalesCalculationModal
            isOpen={salesCalculationModal.isOpen}
            onClose={() =>
              setSalesCalculationModal((prev) => ({ ...prev, isOpen: false }))
            }
            salesByBox={salesCalculationModal.salesByBox}
            productName={salesCalculationModal.productName}
            totalSales={salesCalculationModal.totalSales}
          />
        </div>
      ) : (
        /* 판매실적현황 뷰 */
        <div className="executive-report-container">
          {/* Breadcrumb 네비게이션 */}
          <Breadcrumb productSelector={productTypeSelector} />

          {/* 하단: 테이블 + 오른쪽 필터 (모든 사용자) */}
          <div className="table-filter-container">
            {/* 왼쪽: 메인 콘텐츠 */}
            <div className="flex-1">
              {/* 자사+대행 통합 차트 섹션 */}
              {dataState.productTypeFilter === 'combined' && (
                <CombinedRevenueSection
                    combinedData={combinedData}
                    customDateRange={dataState.customDateRange}
                    selectedPeriod={dataState.selectedPeriod}
                  />
              )}

              {/* 매출 실적 섹션 - 자사 모드에서만 표시 */}
              {dataState.productTypeFilter === 'inHouse' && (
                <PermissionWrapper
                    pageId="executive-report-sales"
                    groupName="revenue-section"
                    displayName="revenue-section"
                  >
                    <RevenueSection
                      customDateRange={dataState.customDateRange}
                      selectedPeriod={dataState.selectedPeriod}
                      chartData={chartData}
                      dashboardData={dataState.dashboardData}
                      onShowFeeDetail={() => dataState.setShowFeeDetail(true)}
                      isAdmin={isAdmin}
                      tableTotals={tableTotals}
                      useTableTotals={isAdmin}
                    />
                  </PermissionWrapper>
              )}

              {/* 필터 영역: 제품(좌측) + 판매처/파일판매처명(우측) - 자사+대행 모드에서는 숨김 */}
              {dataState.productTypeFilter !== 'combined' && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                {/* 좌측: 제품 선택 */}
                <ProductFilter
                  productList={filteredProductList}
                  selectedProducts={dataState.selectedOptions2}
                  onProductChange={dataState.setSelectedOptions2}
                  productSpecialOptions={filteredProductSpecialOptions}
                  hideEmptyRows={dataState.hideEmptyRows}
                  setHideEmptyRows={dataState.setHideEmptyRows}
                />

                {/* 우측: 엑셀 다운로드 + 보기 모드 탭 + 판매처/파일판매처명/팀/매체 + 이미지 저장 */}
                <FilterControlBar
                  salesChannelList={
                    isAgencyMode
                      ? (dataState.agencyViewMode === 'team' ? parentTeamListWithSpecial : parentMediaListWithSpecial)
                      : dataState.salesChannelListWithSpecial
                  }
                  selectedSalesChannels={
                    isAgencyMode
                      ? (dataState.agencyViewMode === 'team' ? dataState.selectedTeams : dataState.selectedMedia)
                      : dataState.selectedOptions1
                  }
                  onSalesChannelChange={
                    isAgencyMode
                      ? (dataState.agencyViewMode === 'team' ? dataState.setSelectedTeams : dataState.setSelectedMedia)
                      : dataState.setSelectedOptions1
                  }
                  salesChannelSpecialOptions={
                    isAgencyMode
                      ? (dataState.agencyViewMode === 'team' ? parentTeamSpecialOptions : parentMediaSpecialOptions)
                      : dataState.salesChannelSpecialOptions
                  }
                  childSalesChannelList={dataState.childSalesChannelList}
                  childSalesChannelSpecialOptions={
                    dataState.childSalesChannelSpecialOptions
                  }
                  selectedChildSalesChannels={
                    dataState.selectedChildSalesChannels
                  }
                  onChildSalesChannelChange={
                    dataState.setSelectedChildSalesChannels
                  }
                  viewMode={
                    isAgencyMode
                      ? dataState.agencyViewMode
                      : dataState.tableViewMode
                  }
                  onViewModeChange={
                    isAgencyMode
                      ? dataState.setAgencyViewMode
                      : dataState.setTableViewMode
                  }
                  onExportToExcel={handleExportToExcel}
                  isExportingExcel={isExportingExcel}
                  isAdmin={isAdmin}
                  isAgencyMode={isAgencyMode}
                  onOpenColumnSettings={() => setShowColumnSettingsModal(true)}
                />
              </div>
              )}

              {/* 판매실적 테이블 - 자사+대행 모드에서는 숨김 */}
              {dataState.productTypeFilter !== 'combined' && (
              <>
              <SalesDataTable
                columns={
                  isAgencyMode
                    ? agencyTable.tableColumns
                    : tableColumns
                }
                data={
                  isAgencyMode
                    ? sortedAgencyTableData
                    : sortedTableData
                }
                isAdmin={isAdmin}
                onCellClick={handleCellClick}
                channelCount={
                  isAgencyMode
                    ? (dataState.agencyViewMode === 'team' ? dataState.selectedTeams.length : dataState.selectedMedia.length)
                    : dataState.selectedOptions1.length
                }
                onColumnReorder={handleColumnReorder}
                sortConfig={sortConfig}
                onSort={(columnIndex) => {
                  setSortConfig(prev => {
                    // 같은 컬럼 클릭 시: desc -> asc -> null (해제)
                    if (prev.columnIndex === columnIndex) {
                      if (prev.direction === 'desc') {
                        return { columnIndex, direction: 'asc' };
                      } else if (prev.direction === 'asc') {
                        return { columnIndex: null, direction: null };
                      }
                    }
                    // 다른 컬럼 클릭 시: desc부터 시작 (큰 값 먼저 = 내림차순)
                    return { columnIndex, direction: 'desc' };
                  });
                }}
              />

              {/* 자세히 보기 버튼 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "1rem",
                }}
              >
                <button
                  className="detail-view-btn"
                  onClick={() => setShowDailySalesDetail(true)}
                >
                  자세히 보기
                </button>
              </div>
              </>
              )}
            </div>
          </div>

          {/* 대행료 상세 팝업 */}
          <FeeDetailModal
            isOpen={dataState.showFeeDetail}
            onClose={() => dataState.setShowFeeDetail(false)}
            customDateRange={dataState.customDateRange}
            productList={dataState.productList}
            selectedProducts={dataState.selectedOptions2}
          />

          {/* 일별 판매 상세 모달 */}
          <DailySalesDetailModal
            isOpen={showDailySalesDetail}
            onClose={() => setShowDailySalesDetail(false)}
            selectedSalesChannels={dataState.selectedOptions1}
            customDateRange={dataState.customDateRange}
            selectedProducts={dataState.selectedOptions2}
            productList={dataState.productList}
          />

          {/* 매출 계산식 모달 */}
          <SalesCalculationModal
            isOpen={salesCalculationModal.isOpen}
            onClose={() =>
              setSalesCalculationModal((prev) => ({ ...prev, isOpen: false }))
            }
            salesByBox={salesCalculationModal.salesByBox}
            productName={salesCalculationModal.productName}
            totalSales={salesCalculationModal.totalSales}
          />

          {/* 컬럼 설정 모달 */}
          <ColumnSettingsModal
            isOpen={showColumnSettingsModal}
            onClose={() => setShowColumnSettingsModal(false)}
            columnVisibility={columnVisibility}
            onSave={handleSaveColumnSettings}
            isAdmin={isAdmin}
            hasPermission={hasPermission}
            isSaving={isSavingColumnSettings}
            selectedChannels={dataState.selectedOptions1.map(name =>
              dataState.salesChannelList.find(ch => ch.name === name)
            ).filter(Boolean)}
            selectedFileChannels={dataState.childSalesChannelList.filter(ch =>
              dataState.selectedChildSalesChannels.includes(ch.id)
            )}
            viewMode={dataState.tableViewMode}
          />
        </div>
      )}
    </Layout>
  );
}

export default ExecutiveReport;
