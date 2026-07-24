import { useState, useEffect, useMemo } from "react";
import Layout from "../../components/Layout";
import Breadcrumb from "../../components/Breadcrumb";
import CalendarDateFilter from "./elements/CalendarDateFilter";
import MediaInputStatusBar from "./elements/MediaInputStatusBar";
import CustomSelect from "../../components/ui/CustomSelect";
import Modal from "../../components/ui/Modal";
import SalesAdChart from "./elements/SalesAdChart";
import AdMetricsChart from "./elements/AdMetricsChart";
import WeeklyPerformanceTable from "./elements/WeeklyPerformanceTable";
import DailyDetailTable from "./elements/DailyDetailTable";
import ChangesSummaryModal from "./elements/ChangesSummaryModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./Marketingreport.css";
import "../../components/common/DataTable.css";
import {
  getDailyDetailData,
  getMediaList,
  getProductList,
  updateDailyData,
  getOperationStatus,
  getTeamMediaAssignments,
  saveColumnOrder,
  getColumnOrder,
  saveWeeklyColumnOrder,
  getWeeklyColumnOrder,
  getAdStartDate,
} from "./api";
import * as XLSX from "xlsx";
import { groupDataByWeek, calculateCPC, calculateCTR, calculateCVR, calculateROAS, calculateAvgOrderValue } from "./elements/utils/metricsUtils";
import { useAuth } from "../../contexts/AuthContext";
import { useStickyTableHeader } from "./hooks/useStickyTableHeader";
import { usePermissions } from "../../hooks/usePermissions";
import PermissionWrapper from "../../components/PermissionWrapper";

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController,
  ChartDataLabels
);

function MarketingReport() {
  // Clear stale localStorage on first load (version guard)
  const MR_STORAGE_VERSION = 'v2-2026apr';
  const mrStoredVersion = localStorage.getItem('marketing-report-version');
  if (mrStoredVersion !== MR_STORAGE_VERSION) {
    [
      'marketingReportDateRange',
      'marketingReportPeriod',
      'marketingReport_selectedMedia',
      'marketingReport_productTypeFilter',
      'marketingReport_favoriteProducts',
      'marketingReport_favoriteMedias',
      'marketingReport_selectedTeam',
    ].forEach(key => localStorage.removeItem(key));
    localStorage.setItem('marketing-report-version', MR_STORAGE_VERSION);
  }

  const { userId, userRole, userTeam, teamId, parentTeam } = useAuth();

  // 권한 관리
  const {
    hasPermission,
    isLoading: permissionsLoading,
    roleCode,
  } = usePermissions("marketing-report");

  const isAdmin = roleCode === "S";

  // Sticky 테이블 헤더 활성화
  useStickyTableHeader();

  // 상태 관리
  // 로컬스토리지에서 날짜 복구
  const getSavedDateRange = () => {
    const saved = localStorage.getItem("marketingReportDateRange");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { startDate: "", endDate: "" };
      }
    }
    return { startDate: "", endDate: "" };
  };

  const getSavedPeriod = () => {
    const saved = localStorage.getItem("marketingReportPeriod");
    return saved || "이번달";
  };

  const [customDateRange, setCustomDateRange] = useState(getSavedDateRange());
  const [selectedPeriod, setSelectedPeriod] = useState(getSavedPeriod());
  const [selectedMedia, setSelectedMedia] = useState(() => {
    console.log('============================================');
    console.log('🔍 [마케팅 리포트] selectedMedia 초기화');
    console.log('============================================');
    const saved = localStorage.getItem("marketingReport_selectedMedia");
    console.log('💾 localStorage 값:', saved);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('✅ 파싱 성공:', parsed);
        console.log('   타입:', typeof parsed);
        console.log('   배열 여부:', Array.isArray(parsed));
        console.log('   → localStorage 값 사용');
        console.log('============================================');
        return parsed;
      } catch (e) {
        console.error('❌ selectedMedia 파싱 실패:', e);
        console.log('============================================');
        return [0];
      }
    }
    console.log('⚠️ localStorage에 값 없음, 기본값 [0] 사용');
    console.log('============================================');
    return [0];
  });
  const [weekStartDropdownOpen, setWeekStartDropdownOpen] = useState(false);
  const [weekStartDay, setWeekStartDay] = useState("1일 시작");
  const [adStartDate, setAdStartDate] = useState(null);
  const [manualData, setManualData] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState([0]);

  // 자사/대행 필터 체크박스 상태
  const [productTypeFilter, setProductTypeFilter] = useState(() => {
    const saved = localStorage.getItem("marketingReport_productTypeFilter");
    if (saved) {
      return JSON.parse(saved);
    }
    return { inHouse: true, agency: true }; // 기본값: 둘 다 체크
  });

  // 제품 즐겨찾기 상태
  const [favoriteProducts, setFavoriteProducts] = useState(() => {
    const saved = localStorage.getItem("marketingReport_favoriteProducts");
    if (saved) {
      return JSON.parse(saved);
    }
    return []; // 기본값: 빈 배열
  });

  // 매체 즐겨찾기 상태
  const [favoriteMedias, setFavoriteMedias] = useState(() => {
    const saved = localStorage.getItem("marketingReport_favoriteMedias");
    if (saved) {
      return JSON.parse(saved);
    }
    return []; // 기본값: 빈 배열
  });

  // 데이터 로딩 상태
  const [dailyDetailData, setDailyDetailData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [mediaOptions, setMediaOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [operationStatus, setOperationStatus] = useState({});
  const [operationStatusLoaded, setOperationStatusLoaded] = useState(false);
  const [teamMediaIds, setTeamMediaIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calendarRefreshTrigger, setCalendarRefreshTrigger] = useState(0);

  // S, A 등급용 팀 선택 상태
  const [teamOptions, setTeamOptions] = useState([]);
  const [teamMediaAssignments, setTeamMediaAssignments] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(() => {
    console.log('============================================');
    console.log('🔍 [마케팅 리포트] selectedTeam 초기화');
    console.log('============================================');
    const saved = localStorage.getItem("marketingReport_selectedTeam");
    console.log('💾 localStorage 값:', saved);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('✅ 파싱 성공:', parsed);
        console.log('   타입:', typeof parsed);
        console.log('   배열 여부:', Array.isArray(parsed));
        console.log('   → localStorage 값 사용, 자동 선택 로직 건너뜀');
        console.log('============================================');
        return parsed;
      } catch (e) {
        console.error('❌ selectedTeam 파싱 실패:', e);
        console.log('============================================');
        return [0];
      }
    }
    console.log('⚠️ localStorage에 값 없음, 기본값 [0] 사용');
    console.log('============================================');
    return [0];
  }); // 초기값은 임시, useEffect에서 설정

  // localStorage에 값이 있으면 teamInitialized를 true로 시작
  const [teamInitialized, setTeamInitialized] = useState(() => {
    const saved = localStorage.getItem("marketingReport_selectedTeam");
    const hasStoredValue = saved !== null && saved !== undefined && saved !== 'null';
    console.log('🔍 [teamInitialized] localStorage 확인:', hasStoredValue ? '있음 (자동선택 건너뜀)' : '없음 (자동선택 실행)');
    return hasStoredValue;
  });

  // 컬럼 순서 상태 (기본값)
  const DEFAULT_COLUMN_ORDER = ['impressions', 'clicks', 'adCost', 'cpc', 'ctr', 'conversions', 'revenue', 'avgOrderValue', 'cvr', 'roas'];
  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMN_ORDER);

  // 주간 성과 컬럼 순서 상태 (기본값)
  const DEFAULT_WEEKLY_COLUMN_ORDER = ['clicks', 'adCost', 'cpc', 'ctr', 'conversions', 'revenue', 'cvr', 'roas'];
  const [weeklyColumnOrder, setWeeklyColumnOrder] = useState(DEFAULT_WEEKLY_COLUMN_ORDER);

  // 초기 날짜 범위 자동 설정 (로컬스토리지에 값이 없을 때만)
  useEffect(() => {
    if (!customDateRange.startDate && !customDateRange.endDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();

      setCustomDateRange({
        startDate: `${year}-${String(month).padStart(2, '0')}-01`,
        endDate: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
      });
    }
  }, []);

  // 날짜 범위 로컬스토리지 저장
  useEffect(() => {
    if (customDateRange.startDate && customDateRange.endDate) {
      localStorage.setItem("marketingReportDateRange", JSON.stringify(customDateRange));
    }
  }, [customDateRange]);

  // 선택 기간 로컬스토리지 저장
  useEffect(() => {
    localStorage.setItem("marketingReportPeriod", selectedPeriod);
  }, [selectedPeriod]);

  // 컬럼 순서 로드
  useEffect(() => {
    const loadColumnOrder = async () => {
      if (!userId) return;
      try {
        const response = await getColumnOrder(userId);
        if (response.success && response.data?.columnOrder) {
          setColumnOrder(response.data.columnOrder);
        }
      } catch (err) {
        console.error('일별 컬럼 순서 로드 실패:', err);
        // 기본값 유지
      }
    };

    loadColumnOrder();
  }, [userId]);

  // 주간 성과 컬럼 순서 로드
  useEffect(() => {
    const loadWeeklyColumnOrder = async () => {
      if (!userId) return;
      try {
        const response = await getWeeklyColumnOrder(userId);
        if (response.success && response.data?.columnOrder) {
          setWeeklyColumnOrder(response.data.columnOrder);
        }
      } catch (err) {
        console.error('주간 성과 컬럼 순서 로드 실패:', err);
        // 기본값 유지
      }
    };

    loadWeeklyColumnOrder();
  }, [userId]);

  // 매체 및 제품 옵션 로드
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [
          mediaResponse,
          productResponse,
          operationResponse,
          teamMediaResponse,
        ] = await Promise.all([
          getMediaList(),
          getProductList(),
          getOperationStatus(),
          getTeamMediaAssignments(),
        ]);

        setMediaOptions(mediaResponse.data);
        setProductOptions(productResponse.data);
        if (operationResponse.success) {
          setOperationStatus(operationResponse.data);
        }
        setOperationStatusLoaded(true);

        // 팀 매체 할당 정보 처리
        if (teamMediaResponse.success) {
          const teamsData = teamMediaResponse.data;

          // S, A, B, C 등급용: 팀 옵션 및 팀별 매체 할당 맵 생성
          if (["S", "A", "B", "C"].includes(userRole)) {
            const options = [{ id: 0, name: "전체" }];
            const assignments = {};
            let userTeamId = 0; // 사용자 팀 ID (A등급용)

            console.log(`[팀 로딩] userRole: ${userRole}, userTeam: "${userTeam}"`);

            teamsData.forEach((parentTeam) => {
              // 자식 팀 ID 수집
              const childIds = (parentTeam.children || []).map(child => child.id);

              // 부모 팀 추가
              options.push({
                id: parentTeam.id,
                name: parentTeam.name,
                isParent: true,
                childIds: childIds, // collapsible 기능을 위한 childIds 추가
              });
              assignments[parentTeam.id] = parentTeam.mediaIds || [];

              // 사용자 팀 ID 찾기 (대소문자 무시, 공백 제거 후 비교)
              const normalizedUserTeam = userTeam?.trim().toLowerCase();
              const normalizedParentName = parentTeam.name?.trim().toLowerCase();

              if (normalizedParentName === normalizedUserTeam) {
                userTeamId = parentTeam.id;
                console.log(`[팀 매칭 성공] 부모 팀 "${parentTeam.name}" (ID: ${parentTeam.id})`);
              }

              // 자식 팀 추가
              if (parentTeam.children && parentTeam.children.length > 0) {
                parentTeam.children.forEach((childTeam) => {
                  options.push({
                    id: childTeam.id,
                    name: childTeam.name,
                    parentId: parentTeam.id,
                    parentName: parentTeam.name,
                    isChild: true,
                  });
                  assignments[childTeam.id] = childTeam.mediaIds || [];

                  // 사용자 팀 ID 찾기 (대소문자 무시, 공백 제거 후 비교)
                  const normalizedChildName = childTeam.name?.trim().toLowerCase();

                  if (normalizedChildName === normalizedUserTeam) {
                    userTeamId = childTeam.id;
                    console.log(`[팀 매칭 성공] 자식 팀 "${childTeam.name}" (ID: ${childTeam.id})`);
                  }
                });
              }
            });

            setTeamOptions(options);
            setTeamMediaAssignments(assignments);

            // 팀 초기값 설정 (한 번만)
            if (!teamInitialized) {
              if (userRole === "S") {
                // S등급: 전체
                setSelectedTeam([0]);
              } else if (["A", "B", "C"].includes(userRole)) {
                // A, B, C등급: 본인 팀
                if (userTeamId !== 0) {
                  setSelectedTeam([userTeamId]);
                  console.log(`[팀 자동 선택] ${userRole} 등급 - 팀: ${userTeam} (ID: ${userTeamId})`);
                } else {
                  // userTeamId를 못 찾은 경우, 전체 선택
                  setSelectedTeam([0]);
                  console.warn(`[팀 자동 선택 실패] ${userRole} 등급 - userTeam: "${userTeam}" 매칭 실패, 전체 선택됨`);
                }
              } else {
                setSelectedTeam([0]);
              }
              setTeamInitialized(true);
            }
          }

          // B, C 등급용: 현재 사용자 팀의 mediaIds 추출
          if (userTeam) {
            let foundMediaIds = [];

            // 계층 구조에서 현재 사용자 팀 찾기
            for (const parentTeam of teamsData) {
              if (parentTeam.name === userTeam) {
                foundMediaIds = parentTeam.mediaIds || [];
                break;
              }
              // 자식 팀에서 찾기
              const childTeam = parentTeam.children?.find(
                (child) => child.name === userTeam
              );
              if (childTeam) {
                foundMediaIds = childTeam.mediaIds || [];
                break;
              }
            }

            setTeamMediaIds(foundMediaIds);

          }
        }
      } catch (err) {
        console.error("옵션 로드 실패:", err);
        // 기본값 유지
      }
    };

    loadOptions();
  }, [userTeam, userRole]);

  // 팀 specialOptions 생성 (부모 팀별 그룹)
  const teamSpecialOptions = useMemo(() => {
    if (teamOptions.length === 0) return {};

    const options = {};

    // "전체": 모든 실제 팀 ID (0은 제외)
    const allTeamIds = teamOptions
      .filter(opt => opt.id !== 0)  // "전체" 옵션 제외
      .map(opt => opt.id);
    options["전체"] = allTeamIds;

    // 각 부모 팀별로 자식 팀 ID 그룹 생성
    teamOptions.forEach(opt => {
      if (opt.isParent && opt.childIds && opt.childIds.length > 0) {
        options[opt.name] = opt.childIds;
      }
    });

    return options;
  }, [teamOptions]);

  // 선택된 매체/제품 ID를 반환하는 헬퍼 함수 (이제 selectedMedia/selectedProduct가 ID 배열임)
  const getSelectedMediaId = () => {
    return Array.isArray(selectedMedia) ? selectedMedia[0] : selectedMedia;
  };

  const getSelectedProductId = () => {
    return Array.isArray(selectedProduct)
      ? selectedProduct[0]
      : selectedProduct;
  };

  // ID에서 이름을 찾는 헬퍼 함수 (표시용, 자식 매체는 부모 이름 포함)
  const getMediaNameById = (id) => {
    if (id === 0) return "전체";
    const media = mediaOptions.find((m) => m.id === id);
    if (!media) return "전체";
    // 자식 매체이고 parentName이 있으면 함께 표시
    if (media.isChild && media.parentName) {
      return `${media.parentName} - ${media.name}`;
    }
    return media.name;
  };

  // ID에서 실제 매체명만 찾는 헬퍼 함수 (운영 상태 체크용, 부모 이름 제외)
  const getRealMediaNameById = (id) => {
    if (id === 0) return "전체";
    const media = mediaOptions.find((m) => m.id === id);
    if (!media) return "전체";
    return media.name; // 실제 매체명만 반환 (부모 이름 제외)
  };

  const getProductNameById = (id) => {
    if (id === 0) return "전체";
    const product = productOptions.find((p) => p.id === id);
    return product?.name || "전체";
  };

  // 허용된 매체 ID 목록 계산 (API 호출용)
  const getAllowedMediaIds = () => {
    const mediaId = getSelectedMediaId();
    if (mediaId !== 0) return null; // 특정 매체 선택 시 필터 불필요

    // B,C 등급: 매체 필터링 없음 (전체 매체 조회 가능)
    if (["B", "C"].includes(userRole)) {
      return null;
    }

    // S등급 + 전체 선택
    if (userRole === "S" && selectedTeam.includes(0)) {
      return null; // 전체 허용
    }

    // S,A 등급 + 특정 팀 선택 (다중 선택 지원)
    if (["S", "A"].includes(userRole) && selectedTeam.length > 0 && !selectedTeam.includes(0)) {
      const allMediaIds = new Set();

      selectedTeam.forEach(teamId => {
        const selectedTeamOption = teamOptions.find(t => t.id === teamId);

        if (selectedTeamOption?.isParent) {
          // 부모 팀: 본인 + 모든 자식 팀의 매체 수집 (중복 제거)
          (teamMediaAssignments[teamId] || []).forEach(id => allMediaIds.add(id));
          teamOptions
            .filter(t => t.parentId === teamId)
            .forEach(childTeam => {
              (teamMediaAssignments[childTeam.id] || []).forEach(id => allMediaIds.add(id));
            });
        } else {
          // 자식 팀: 해당 팀 매체만
          (teamMediaAssignments[teamId] || []).forEach(id => allMediaIds.add(id));
        }
      });

      return allMediaIds.size > 0 ? Array.from(allMediaIds) : null;
    }

    return null; // S,A 등급 + 전체 팀 → 필터 없음
  };

  // 팀 ID 목록 반환 (백엔드 팀 필터링용)
  const getAllowedTeamIds = () => {
    // B,C 등급: 팀 필터링 없음 (다른 팀 데이터도 조회 가능)
    if (["B", "C"].includes(userRole)) {
      return null;
    }

    // S등급 + 전체 선택
    if (userRole === "S" && selectedTeam.includes(0)) {
      return null; // 전체 허용
    }

    // S,A 등급 + 특정 팀 선택 (다중 선택 지원)
    if (["S", "A"].includes(userRole) && selectedTeam.length > 0 && !selectedTeam.includes(0)) {
      const allTeamIds = [];

      selectedTeam.forEach(teamId => {
        const selectedTeamOption = teamOptions.find(t => t.id === teamId);

        if (selectedTeamOption?.isParent) {
          // 부모 팀: 본인 + 모든 자식 팀 ID 수집
          allTeamIds.push(teamId);
          teamOptions
            .filter(t => t.parentId === teamId)
            .forEach(childTeam => {
              allTeamIds.push(childTeam.id);
            });
        } else {
          // 자식 팀: 해당 팀 ID만
          allTeamIds.push(teamId);
        }
      });

      return [...new Set(allTeamIds)]; // 중복 제거
    }

    return null; // S,A 등급 + 전체 팀 → 필터 없음
  };

  // 일별 데이터 로드
  useEffect(() => {
    const loadDailyData = async () => {
      if (!customDateRange?.startDate || !customDateRange?.endDate) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await getDailyDetailData({
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
          selectedMediaId: getSelectedMediaId(),
          selectedProductId: getSelectedProductId(),
          allowedMediaIds: getAllowedMediaIds(),
          teamIds: getAllowedTeamIds(),
        });

        setDailyDetailData(response.data);

        // 주간 데이터 계산
        const weekly = groupDataByWeek(response.data, weekStartDay);
        setWeeklyData(weekly);
      } catch (err) {
        console.error("일별 데이터 로드 실패:", err);
        setError(err.message);
        setDailyDetailData([]);
        setWeeklyData([]);
      } finally {
        setLoading(false);
      }
    };

    loadDailyData();
  }, [
    customDateRange,
    selectedMedia,
    selectedProduct,
    weekStartDay,
    selectedTeam,
    teamMediaIds,
    userRole,
  ]);

  // 데이터가 있는 날짜 목록 (API에서 가져옴)
  const datesWithData = dailyDetailData
    .filter(
      (item) =>
        item.adCost ||
        item.revenue ||
        item.impressions ||
        item.clicks ||
        item.conversions
    )
    .map((item) => item.date);


  // 광고 시작일 조회 (제품 변경 시 - 매체 무관)
  useEffect(() => {
    const fetchAdStartDate = async () => {
      // 제품이 선택되지 않은 경우 (전체)
      if (!selectedProduct || selectedProduct.length === 0 || selectedProduct[0] === 0) {
        setAdStartDate(null);
        return;
      }

      try {
        // 매체는 전체여도 상관없음 (제품 기준으로 조회)
        const mediaIdToSend = selectedMedia && selectedMedia.length > 0 ? selectedMedia[0] : 0;

        const response = await getAdStartDate(selectedProduct[0], mediaIdToSend);

        if (response.success && response.data && response.data.startDate) {
          setAdStartDate(response.data.startDate);
        } else {
          setAdStartDate(null);
        }
      } catch (error) {
        console.error('광고 시작일 조회 실패:', error);
        setAdStartDate(null);
      }
    };

    fetchAdStartDate();
  }, [selectedProduct, selectedMedia]);


  useEffect(() => {
    localStorage.setItem(
      "marketingReport_productTypeFilter",
      JSON.stringify(productTypeFilter)
    );
  }, [productTypeFilter]);

  useEffect(() => {
    localStorage.setItem(
      "marketingReport_favoriteProducts",
      JSON.stringify(favoriteProducts)
    );
  }, [favoriteProducts]);

  useEffect(() => {
    localStorage.setItem(
      "marketingReport_favoriteMedias",
      JSON.stringify(favoriteMedias)
    );
  }, [favoriteMedias]);

  // 선택된 팀 localStorage 저장
  useEffect(() => {
    localStorage.setItem(
      "marketingReport_selectedTeam",
      JSON.stringify(selectedTeam)
    );
  }, [selectedTeam]);

  // 선택된 매체 localStorage 저장
  useEffect(() => {
    localStorage.setItem(
      "marketingReport_selectedMedia",
      JSON.stringify(selectedMedia)
    );
  }, [selectedMedia]);

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

  // 매체 즐겨찾기 토글 함수
  const handleToggleFavoriteMedia = (mediaId) => {
    setFavoriteMedias((prev) => {
      if (prev.includes(mediaId)) {
        return prev.filter((id) => id !== mediaId);
      } else {
        return [...prev, mediaId];
      }
    });
  };

  // 편집 관련 함수들
  const formatNumber = (value) => {
    if (value === "" || value === null || value === undefined) return "";
    return parseInt(value).toLocaleString();
  };

  const handleManualInput = (date, field, value) => {
    setManualData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value === "" ? null : parseInt(value),
      },
    }));
  };

  const handleSave = async () => {
    try {
      const response = await updateDailyData({
        manualData,
        userRole,
        userTeam,
        teamId,
        selectedMediaId: getSelectedMediaId(),
        selectedProductId: getSelectedProductId(),
      });

      if (response.success) {
        setShowSaveModal(false);
        setIsEditMode(false);
        setManualData({});
        alert(`저장되었습니다. (${response.updatedCount}건 업데이트)`);

        // 데이터 다시 로드
        const reloadResponse = await getDailyDetailData({
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
          selectedMediaId: getSelectedMediaId(),
          selectedProductId: getSelectedProductId(),
        });
        setDailyDetailData(reloadResponse.data);
        const weekly = groupDataByWeek(reloadResponse.data, weekStartDay);
        setWeeklyData(weekly);

        // 달력 빨간점 새로고침 트리거
        setCalendarRefreshTrigger((prev) => prev + 1);
      } else {
        alert(`저장 실패: ${response.message}`);
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setManualData({});
    setIsEditMode(false);
    setEditingCell(null);
  };

  // 컬럼 순서 변경 핸들러
  const handleColumnReorder = async (fromColumn, toColumn) => {
    const newOrder = [...columnOrder];
    const fromIndex = newOrder.indexOf(fromColumn);
    const toIndex = newOrder.indexOf(toColumn);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    // 배열에서 요소 이동
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    setColumnOrder(newOrder);

    // API로 저장
    try {
      await saveColumnOrder(userId, newOrder);
    } catch (err) {
      console.error('컬럼 순서 저장 실패:', err);
      // 에러 발생 시 롤백
      setColumnOrder(columnOrder);
    }
  };

  // 주간 성과 컬럼 순서 변경 핸들러
  const handleWeeklyColumnReorder = async (fromColumn, toColumn) => {
    const newOrder = [...weeklyColumnOrder];
    const fromIndex = newOrder.indexOf(fromColumn);
    const toIndex = newOrder.indexOf(toColumn);

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    // 배열에서 요소 이동
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    setWeeklyColumnOrder(newOrder);

    // API로 저장
    try {
      await saveWeeklyColumnOrder(userId, newOrder);
    } catch (err) {
      console.error('주간 성과 컬럼 순서 저장 실패:', err);
      // 에러 발생 시 롤백
      setWeeklyColumnOrder(weeklyColumnOrder);
    }
  };

  // 엑셀 다운로드 함수
  const handleExcelDownload = () => {
    if (!dailyDetailData || dailyDetailData.length === 0) {
      alert("다운로드할 No data.");
      return;
    }

    // 엑셀용 데이터 생성
    const excelData = dailyDetailData.map((item) => {
      const cpc = calculateCPC(item.adCost, item.clicks);
      const ctr = calculateCTR(item.clicks, item.impressions);
      const cvr = calculateCVR(item.conversions, item.clicks);
      const roas = calculateROAS(item.revenue, item.adCost);
      const avgOrderValue = calculateAvgOrderValue(item.revenue, item.conversions);

      return {
        날짜: item.date,
        광고비: item.adCost || 0,
        직접매출: item.revenue || 0,
        노출수: item.impressions || 0,
        클릭수: item.clicks || 0,
        CPC: cpc,
        "CTR(%)": ctr,
        구매건수: item.conversions || 0,
        객단가: avgOrderValue,
        "CVR(%)": cvr,
        "ROAS(%)": roas,
      };
    });

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 열 너비 설정
    worksheet["!cols"] = [
      { wch: 12 }, // 날짜
      { wch: 12 }, // 광고비
      { wch: 12 }, // 직접매출
      { wch: 10 }, // 노출수
      { wch: 10 }, // 클릭수
      { wch: 8 },  // CPC
      { wch: 8 },  // CTR
      { wch: 10 }, // 구매건수
      { wch: 10 }, // 객단가
      { wch: 8 },  // CVR
      { wch: 10 }, // ROAS
    ];

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "일별 상세 데이터");

    // 파일명 생성
    const productName = getProductNameById(selectedProduct[0]);
    const mediaName = getMediaNameById(selectedMedia[0]).replace(" - ", "_");
    const startDate = customDateRange.startDate?.replace(/-/g, "") || "";
    const endDate = customDateRange.endDate?.replace(/-/g, "") || "";
    const fileName = `마케팅리포트_${productName}_${mediaName}_${startDate}-${endDate}.xlsx`;

    // 다운로드
    XLSX.writeFile(workbook, fileName);
  };

  // 전역 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditMode && editingCell) {
        const target = event.target;
        const isTableCell = target.closest("td");
        const isInput = target.tagName === "INPUT";

        if (!isTableCell && !isInput) {
          setEditingCell(null);
        }
      }
    };

    const handleGlobalClick = () => {
      setWeekStartDropdownOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [isEditMode, editingCell]);

  // 제품 필터링 (자사/대행 체크박스에 따라)
  const filteredProductOptions = (() => {
    const filtered = productOptions.filter(product => {
      // "전체" 옵션은 항상 포함
      if (product.name === "전체" || product.id === 0) {
        return true;
      }

      const isAgency = product.name.startsWith("대행_");
      const isInHouse = !isAgency;

      // 둘 다 체크 안 된 경우 - "전체"만 표시
      if (!productTypeFilter.inHouse && !productTypeFilter.agency) {
        return product.name === "전체" || product.id === 0;
      }

      // 자사만 체크
      if (productTypeFilter.inHouse && !productTypeFilter.agency) {
        return isInHouse;
      }

      // 대행만 체크
      if (!productTypeFilter.inHouse && productTypeFilter.agency) {
        return isAgency;
      }

      // 둘 다 체크 - 모든 제품 표시
      return true;
    });

    // 전체 외에 선택 가능한 제품이 없는 경우 "없음" 추가
    if (filtered.length === 1 && filtered[0].id === 0) {
      filtered.push({ id: null, name: "없음" });
    }

    return filtered;
  })();

  // 매체 필터링 - 모든 직원이 모든 매체 볼 수 있음
  const filteredMediaOptions = mediaOptions;

  // 필터 패널 (팀/제품/매체/달력)
  const filterPanel = (
    <div className="filter-panel-container">
      {/* 팀/제품/매체 필터 박스 */}
      <div className="filter-box">
        {/* S, A, B, C 등급용 팀 선택 */}
        {["S", "A", "B", "C"].includes(userRole) && teamOptions.length > 0 && (
          <CustomSelect
            options={teamOptions}
            selectedValues={selectedTeam}
            onSelectionChange={(values) => {
              // 다중 선택 허용
              setSelectedTeam(values);
            }}
            label="팀"
            placeholder="팀"
            horizontal={true}
            multiple={true}
            useIdAsValue={true}
            collapsible={true}
            searchable={true}
            globalSpecialOptions={["전체"]}
            specialOptions={teamSpecialOptions}
          />
        )}

        {/* 제품 선택 */}
        <PermissionWrapper
          pageId="marketing-report"
          groupName="filter-panel"
          displayName="product-filter"
        >
          <CustomSelect
            options={filteredProductOptions}
            selectedValues={selectedProduct}
            onSelectionChange={(values) => {
              // 단일 선택으로 제한
              let newValue;
              if (values.length > 1) {
                newValue = [values[values.length - 1]];
              } else {
                newValue = values;
              }
              setSelectedProduct(newValue);
              // "전체" 선택 시 자사/대행 둘 다 체크
              if (newValue.length > 0 && (newValue[0] === null || newValue[0] === 0)) {
                setProductTypeFilter({ inHouse: true, agency: true });
              }
            }}
            placeholder={
              !productTypeFilter.inHouse && !productTypeFilter.agency
                ? "제품 유형을 선택해주세요"
                : "제품"
            }
            label="제품"
            horizontal={true}
            multiple={false}
            useIdAsValue={true}
            searchable={true}
            disabled={filteredProductOptions.length === 2 && filteredProductOptions.some(opt => opt.name === "없음")}
            enableFavorites={true}
            favoriteItems={favoriteProducts}
            onToggleFavorite={handleToggleFavoriteProduct}
          />
        </PermissionWrapper>

        {/* 자사/대행 필터 체크박스 - PermissionWrapper 밖으로 이동 */}
        <div className="product-type-filter">
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={productTypeFilter.inHouse}
              onChange={(e) => {
                setProductTypeFilter(prev => ({ ...prev, inHouse: e.target.checked }));
              }}
            />
            <span className="checkbox-label">자사</span>
          </label>
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={productTypeFilter.agency}
              onChange={(e) => {
                setProductTypeFilter(prev => ({ ...prev, agency: e.target.checked }));
              }}
            />
            <span className="checkbox-label">대행</span>
          </label>
        </div>

        {/* 매체/할당매체 선택 */}
        <PermissionWrapper
          pageId="marketing-report"
          groupName="filter-panel"
          displayName="media-filter"
        >
          <CustomSelect
            options={filteredMediaOptions}
            selectedValues={selectedMedia}
            onSelectionChange={(values) => {
              // 단일 선택으로 제한
              if (values.length > 1) {
                setSelectedMedia([values[values.length - 1]]);
              } else {
                setSelectedMedia(values);
              }
            }}
            label={selectedTeam.includes(0) || selectedTeam.length === 0 ? "매체" : "할당매체"}
            placeholder={selectedTeam.includes(0) || selectedTeam.length === 0 ? "매체" : "할당매체"}
            horizontal={true}
            multiple={false}
            useIdAsValue={true}
            collapsible={true}
            searchable={true}
            enableFavorites={true}
            favoriteItems={favoriteMedias}
            onToggleFavorite={handleToggleFavoriteMedia}
          />
        </PermissionWrapper>
      </div>

      {/* 달력 박스 */}
      <div className="filter-box">
        <CalendarDateFilter
          customDateRange={customDateRange}
          setCustomDateRange={setCustomDateRange}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          selectedMediaId={getSelectedMediaId()}
          selectedProductId={getSelectedProductId()}
          refreshTrigger={calendarRefreshTrigger}
          allowedMediaIds={getAllowedMediaIds()}
          teamIds={getAllowedTeamIds()}
        />
      </div>
    </div>
  );

  // 편집 버튼 패널 (오른쪽 패널용)
  const editButtonPanel = (
    <div className="filter-panel-container">
      {/* 편집 버튼 */}
      <PermissionWrapper
        pageId="marketing-report"
        groupName="edit-button"
        displayName="edit-button"
      >
        <div className="edit-button-group" style={{ marginTop: '16px' }}>
          {!isEditMode ? (
            <div className="edit-button-container">
              {(() => {
                // 선택된 매체가 부모 매체인지 확인 (ID로 조회)
                const selectedMediaOption = mediaOptions.find(
                  (m) => m.id === selectedMedia[0]
                );
                const isParentMedia = selectedMediaOption?.isParent === true;

                // 매체 운영 상태 확인 (현재 로그인한 팀의 상태만 체크)
                // ID 기반 키 사용 (제품명 변경에도 영향 없음)
                const operationKey = `${selectedProduct[0]}-${selectedMedia[0]}-${userTeam}`;

                // 현재 팀의 해당 제품-매체 조합이 중단됨인지 확인
                const isOperationStopped =
                  operationStatus[operationKey]?.statusValue === 0;

                // operationStatus가 로드될 때까지 편집 불가
                const isOperationStatusLoading = !operationStatusLoaded;

                // 본인에게 할당된 매체인지 체크
                const isAssignedMedia = (() => {
                  // 팀 선택한 경우: 선택한 팀의 매체인지 확인
                  if (["S", "A", "B", "C"].includes(userRole) && !selectedTeam.includes(0) && selectedTeam.length > 0) {
                    if (selectedMedia[0] === 0) {
                      return false; // 전체 선택은 수정 불가
                    }
                    // 선택한 모든 팀의 할당 매체인지 확인
                    const allMediaIds = new Set();
                    selectedTeam.forEach(teamId => {
                      const selectedTeamOption = teamOptions.find(t => t.id === teamId);
                      if (selectedTeamOption?.isParent) {
                        // 부모 팀: 본인 + 모든 자식 팀의 매체 수집
                        (teamMediaAssignments[teamId] || []).forEach(id => allMediaIds.add(id));
                        teamOptions
                          .filter(t => t.parentId === teamId)
                          .forEach(childTeam => {
                            (teamMediaAssignments[childTeam.id] || []).forEach(id => allMediaIds.add(id));
                          });
                      } else {
                        // 자식 팀: 해당 팀 매체만
                        (teamMediaAssignments[teamId] || []).forEach(id => allMediaIds.add(id));
                      }
                    });
                    return allMediaIds.has(selectedMedia[0]);
                  }

                  // S 등급은 모든 매체 수정 가능 (팀 선택 안 한 경우)
                  if (userRole === "S") {
                    return true;
                  }

                  // A, B, C 등급 (팀 선택 안 한 경우): 할당된 매체만 수정 가능
                  if (selectedMedia[0] === 0) {
                    return false; // 전체 선택은 수정 불가
                  }

                  // teamMediaIds에 선택된 매체가 포함되어 있는지 확인
                  return teamMediaIds.includes(selectedMedia[0]);
                })();

                const isEditDisabled =
                  selectedProduct.length !== 1 ||
                  selectedMedia.length !== 1 ||
                  selectedProduct[0] === 0 ||
                  selectedMedia[0] === 0 ||
                  isParentMedia ||
                  !isAssignedMedia ||
                  isOperationStopped ||
                  isOperationStatusLoading;

                // 안내 문구 결정
                let guideMessage = "";
                if (isOperationStatusLoading) {
                  guideMessage = "매체 운영 상태를 확인 중입니다...";
                } else if (selectedProduct[0] === 0 || selectedMedia[0] === 0) {
                  guideMessage = "Cannot edit while 'select all' is active";
                } else if (isParentMedia) {
                  guideMessage =
                    "Cannot edit when a parent media channel is selected. Please select a sub-channel";
                } else if (!isAssignedMedia) {
                  guideMessage = "본인에게 할당된 매체만 수정할 수 있습니다";
                } else if (
                  selectedProduct.length !== 1 ||
                  selectedMedia.length !== 1
                ) {
                  guideMessage = "제품과 매체를 각각 하나씩 선택해주세요";
                } else if (isOperationStopped) {
                  guideMessage =
                    "This media channel is paused. Data cannot be edited";
                }

                return (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="edit-btn edit-btn-edit"
                      style={{ width: "100%" }}
                      disabled={isEditDisabled}
                    >
                      수정
                    </button>
                    {/* 안내 문구 */}
                    {isEditDisabled && guideMessage && (
                      <div className="edit-button-guide">{guideMessage}</div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="edit-button-container horizontal">
              <button
                onClick={() => setShowSaveModal(true)}
                className="edit-btn edit-btn-primary"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="edit-btn edit-btn-secondary"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </PermissionWrapper>
    </div>
  );

  // 오른쪽 패널 (큰 화면용 - 필터 + 편집 버튼)
  const rightPanel = (
    <>
      {filterPanel}
      {editButtonPanel}
    </>
  );

  // 화면 크기 추적
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1400);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 1400);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 작은 화면에서는 rightPanel을 null로, 큰 화면에서는 기존대로
  const layoutRightPanel = isSmallScreen ? null : rightPanel;

  return (
    <Layout rightPanel={layoutRightPanel}>
      <div className="marketing-report-container">
        <div className="main-content">
          {/* Breadcrumb 네비게이션 */}
          <Breadcrumb />

          {/* 작은 화면: 상단 필터 패널 (편집 버튼 제외) */}
          {isSmallScreen && (
            <div className="top-filter-panel">
              {filterPanel}
            </div>
          )}

          {/* 팀별 매체 입력 현황 대시보드 (S, A, B, C 등급) */}
          {["S", "A", "B", "C"].includes(userRole) && teamInitialized && (
            <MediaInputStatusBar
              selectedTeam={selectedTeam}
              onMediaSelect={(mediaId, productId) => {
                setSelectedMedia([mediaId]);
                if (productId !== null && productId !== undefined) {
                  // 제품이 있으면 자동 선택
                  setSelectedProduct([productId]);
                }
              }}
            />
          )}

          {/* 제품 매체 운영 실적 보고서 제목 및 월 이동 */}
          <div className="title-navigation">
            {/* 광고 시작일 및 조회 기간 표시 */}
            <div className="date-range-display">
              {/* 시작일 표시 */}
              {adStartDate && (
                <div className="date-range-text">
                  <span className="date-range-label">시작일:</span>
                  <span className="date-range-value">
                    {(() => {
                      // "2026-01-26" 형식을 "2026.01.26"으로 변환
                      if (typeof adStartDate === 'string' && adStartDate.includes('-')) {
                        return adStartDate.replace(/-/g, '.');
                      }
                      // Date 객체로 파싱하는 경우
                      const date = new Date(adStartDate);
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      return `${year}.${month}.${day}`;
                    })()}
                  </span>
                </div>
              )}
              {(() => {
                if (customDateRange.startDate && customDateRange.endDate) {
                  const startDate = new Date(customDateRange.startDate);
                  const endDate = new Date(customDateRange.endDate);

                  const startYear = startDate.getFullYear();
                  const startMonth = startDate.getMonth() + 1;
                  const startDay = startDate.getDate();

                  const endYear = endDate.getFullYear();
                  const endMonth = endDate.getMonth() + 1;
                  const endDay = endDate.getDate();

                  // 전체 월인지 확인하는 함수
                  const isFullMonth = (year, month, day) => {
                    const lastDayOfMonth = new Date(year, month, 0).getDate();
                    return day === 1 || day === lastDayOfMonth;
                  };

                  const isStartFullMonth = isFullMonth(
                    startYear,
                    startMonth,
                    startDay
                  );
                  const isEndFullMonth = isFullMonth(endYear, endMonth, endDay);

                  // 전체 월이 아닌 경우만 조회기간 표시
                  if (!isStartFullMonth || !isEndFullMonth) {
                    let dateRangeText = "";
                    // 연도가 다른 경우
                    if (startYear !== endYear) {
                      dateRangeText = `${startYear}.${String(
                        startMonth
                      ).padStart(2, "0")}.${String(startDay).padStart(
                        2,
                        "0"
                      )} ~ ${endYear}.${String(endMonth).padStart(
                        2,
                        "0"
                      )}.${String(endDay).padStart(2, "0")}`;
                    }
                    // 같은 연도, 다른 월
                    else if (startMonth !== endMonth) {
                      dateRangeText = `${startYear}.${String(
                        startMonth
                      ).padStart(2, "0")}.${String(startDay).padStart(
                        2,
                        "0"
                      )} ~ ${startYear}.${String(endMonth).padStart(2, "0")}.${String(
                        endDay
                      ).padStart(2, "0")}`;
                    }
                    // 같은 연도, 같은 월
                    else {
                      dateRangeText = `${startYear}.${String(
                        startMonth
                      ).padStart(2, "0")}.${String(startDay).padStart(
                        2,
                        "0"
                      )} ~ ${startYear}.${String(endMonth).padStart(2, "0")}.${String(endDay).padStart(2, "0")}`;
                    }
                    return (
                      <div className="date-range-text">
                        <span className="date-range-label">조회기간:</span>
                        <span className="date-range-value">
                          {dateRangeText}
                        </span>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
            <div className="title-center-group">
              <button
                onClick={() => {
                  const currentDate = customDateRange.startDate
                    ? new Date(customDateRange.startDate)
                    : new Date();
                  const prevMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                  );
                  const lastDay = new Date(
                    prevMonth.getFullYear(),
                    prevMonth.getMonth() + 1,
                    0
                  );

                  setCustomDateRange({
                    startDate: `${prevMonth.getFullYear()}-${String(
                      prevMonth.getMonth() + 1
                    ).padStart(2, "0")}-01`,
                    endDate: `${prevMonth.getFullYear()}-${String(
                      prevMonth.getMonth() + 1
                    ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(
                      2,
                      "0"
                    )}`,
                  });
                  setSelectedPeriod(`${prevMonth.getMonth() + 1}월`);
                }}
                className="month-nav-button"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              <h1 className="main-title">
                {(() => {
                  // 선택된 제품과 매체 정보 (ID에서 이름 조회)
                  const productName =
                    selectedProduct.length > 0
                      ? getProductNameById(selectedProduct[0])
                      : "제품";
                  const mediaName =
                    selectedMedia.length > 0
                      ? getMediaNameById(selectedMedia[0])
                      : "매체";

                  // 둘 다 전체인 경우 하나만 표시
                  const displayName =
                    productName === "전체" && mediaName === "전체"
                      ? "전체"
                      : `${productName} ${mediaName}`;

                  // 날짜 범위 처리
                  if (customDateRange.startDate && customDateRange.endDate) {
                    const startDate = new Date(customDateRange.startDate);
                    const endDate = new Date(customDateRange.endDate);

                    const startYear = startDate.getFullYear();
                    const startMonth = startDate.getMonth() + 1;
                    const startDay = startDate.getDate();

                    const endYear = endDate.getFullYear();
                    const endMonth = endDate.getMonth() + 1;
                    const endDay = endDate.getDate();

                    // 전체 월인지 확인하는 함수
                    const isFullMonth = (year, month, day) => {
                      const lastDayOfMonth = new Date(year, month, 0).getDate();
                      return day === 1 || day === lastDayOfMonth;
                    };

                    const isStartFullMonth = isFullMonth(
                      startYear,
                      startMonth,
                      startDay
                    );
                    const isEndFullMonth = isFullMonth(
                      endYear,
                      endMonth,
                      endDay
                    );

                    // 전체 월이 아닌 경우 제목에서는 날짜 표시하지 않음 (조회기간에서만 표시)
                    if (!isStartFullMonth || !isEndFullMonth) {
                      return `${startYear}년 ${displayName} 운영 실적 보고서`;
                    }
                    // 전체 월인 경우 날짜 없이 표시
                    else {
                      // 연도가 다른 경우
                      if (startYear !== endYear) {
                        return `${startYear}년 ${startMonth}월 - ${endYear}년 ${endMonth}월 ${displayName} 운영 실적 보고서`;
                      }
                      // 같은 연도, 다른 월
                      else if (startMonth !== endMonth) {
                        return `${startYear}년 ${startMonth}-${endMonth}월 ${displayName} 운영 실적 보고서`;
                      }
                      // 같은 연도, 같은 월
                      else {
                        return `${startYear}년 ${String(startMonth).padStart(
                          2,
                          "0"
                        )}월 ${displayName} 운영 실적 보고서`;
                      }
                    }
                  } else {
                    // 날짜가 설정되지 않은 경우 현재 날짜 기준
                    const today = new Date();
                    const year = today.getFullYear();
                    const month = today.getMonth() + 1;
                    return `${year}년 ${String(month).padStart(
                      2,
                      "0"
                    )}월 ${displayName} 운영 실적 보고서`;
                  }
                })()}
              </h1>

              <button
                onClick={() => {
                  const currentDate = customDateRange.startDate
                    ? new Date(customDateRange.startDate)
                    : new Date();
                  const nextMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                  );
                  const lastDay = new Date(
                    nextMonth.getFullYear(),
                    nextMonth.getMonth() + 1,
                    0
                  );

                  setCustomDateRange({
                    startDate: `${nextMonth.getFullYear()}-${String(
                      nextMonth.getMonth() + 1
                    ).padStart(2, "0")}-01`,
                    endDate: `${nextMonth.getFullYear()}-${String(
                      nextMonth.getMonth() + 1
                    ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(
                      2,
                      "0"
                    )}`,
                  });
                  setSelectedPeriod(`${nextMonth.getMonth() + 1}월`);
                }}
                className="month-nav-button"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            {/* 주차 기준 선택 */}
            <div className="week-start-toggle">
              <label className="week-start-label">주차 기준</label>
              <div className="week-start-filter">
                <div
                  className="week-start-select"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setWeekStartDropdownOpen((prev) => !prev);
                  }}
                >
                  {weekStartDay === "1일 시작" ? "1일" : "월요일"}
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="dropdown-icon"
                  />
                </div>
                {weekStartDropdownOpen && (
                  <ul className="week-start-options">
                    <li
                      onClick={(e) => {
                        e.stopPropagation();
                        setWeekStartDay("1일 시작");
                        setWeekStartDropdownOpen(false);
                      }}
                      className={`week-option-item ${
                        weekStartDay === "1일 시작" ? "selected" : ""
                      }`}
                    >
                      1일
                    </li>
                    <li
                      onClick={(e) => {
                        e.stopPropagation();
                        setWeekStartDay("월요일 시작");
                        setWeekStartDropdownOpen(false);
                      }}
                      className={`week-option-item ${
                        weekStartDay === "월요일 시작" ? "selected" : ""
                      }`}
                    >
                      월요일
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 차트 영역 - 가로 배치 */}
          <PermissionWrapper
            pageId="marketing-report"
            groupName="charts"
            displayName="charts"
          >
            <div className="charts-container">
              <div className="chart-item">
                <SalesAdChart
                  customDateRange={customDateRange}
                  selectedMedia={[getMediaNameById(selectedMedia[0])]}
                  selectedProduct={[getProductNameById(selectedProduct[0])]}
                  userRole={userRole}
                  userTeam={userTeam}
                  dailyData={dailyDetailData}
                  weeklyData={weeklyData}
                  loading={loading}
                  error={error}
                />
              </div>
              <div className="chart-item">
                <AdMetricsChart
                  customDateRange={customDateRange}
                  selectedMedia={[getMediaNameById(selectedMedia[0])]}
                  selectedProduct={[getProductNameById(selectedProduct[0])]}
                  userRole={userRole}
                  userTeam={userTeam}
                  dailyData={dailyDetailData}
                  weeklyData={weeklyData}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </PermissionWrapper>

          {/* 주간 마케팅 성과 테이블 */}
          <PermissionWrapper
            pageId="marketing-report"
            groupName="tables"
            displayName="weekly-table"
          >
            <WeeklyPerformanceTable
              weekStartDay={weekStartDay}
              customDateRange={customDateRange}
              selectedMedia={[getMediaNameById(selectedMedia[0])]}
              selectedProduct={[getProductNameById(selectedProduct[0])]}
              userRole={userRole}
              userTeam={userTeam}
              weeklyData={weeklyData}
              loading={loading}
              error={error}
              onColumnReorder={handleWeeklyColumnReorder}
              columnOrder={weeklyColumnOrder}
            />
          </PermissionWrapper>

          {/* 일별 상세 데이터 테이블 */}
          <PermissionWrapper
            pageId="marketing-report"
            groupName="tables"
            displayName="daily-table"
          >
            <div className="daily-table-header">
              <button
                className="excel-download-btn"
                onClick={handleExcelDownload}
                disabled={!dailyDetailData || dailyDetailData.length === 0}
                title="엑셀 다운로드"
              >
                <FontAwesomeIcon icon={faFileExcel} />
                엑셀 다운로드
              </button>
            </div>
            <DailyDetailTable
              weekStartDay={weekStartDay}
              customDateRange={customDateRange}
              selectedMedia={[getMediaNameById(selectedMedia[0])]}
              selectedProduct={[getProductNameById(selectedProduct[0])]}
              userTeam={userTeam}
              isEditMode={isEditMode}
              editingCell={editingCell}
              manualData={manualData}
              setEditingCell={setEditingCell}
              handleCancel={handleCancel}
              handleManualInput={handleManualInput}
              formatNumber={formatNumber}
              dailyData={dailyDetailData}
              loading={loading}
              error={error}
              operationStatus={operationStatus}
              selectedProductId={selectedProduct[0]}
              selectedMediaId={selectedMedia[0]}
              onColumnReorder={handleColumnReorder}
              columnOrder={columnOrder}
            />

            {/* 편집 버튼 - 작은 화면일 때만 테이블 하단에 표시 */}
            {isSmallScreen && (
              <PermissionWrapper
                pageId="marketing-report"
                groupName="edit-button"
                displayName="edit-button"
              >
                <div className="edit-button-group" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  {!isEditMode ? (
                    <>
                      {(() => {
                        // 선택된 매체가 부모 매체인지 확인 (ID로 조회)
                        const selectedMediaOption = mediaOptions.find(
                          (m) => m.id === selectedMedia[0]
                        );
                        const isParentMedia = selectedMediaOption?.isParent === true;

                        // 매체 운영 상태 확인 (현재 로그인한 팀의 상태만 체크)
                        // ID 기반 키 사용 (제품명 변경에도 영향 없음)
                        const operationKey = `${selectedProduct[0]}-${selectedMedia[0]}-${userTeam}`;

                        // 현재 팀의 해당 제품-매체 조합이 중단됨인지 확인
                        const isOperationStopped =
                          operationStatus[operationKey]?.statusValue === 0;

                        // operationStatus가 로드될 때까지 편집 불가
                        const isOperationStatusLoading = !operationStatusLoaded;

                        // 본인에게 할당된 매체인지 체크
                        const isAssignedMedia = (() => {
                          // 팀 선택한 경우: 선택한 팀의 매체인지 확인
                          if (["S", "A", "B", "C"].includes(userRole) && !selectedTeam.includes(0) && selectedTeam.length > 0) {
                            if (selectedMedia[0] === 0) {
                              return false; // 전체 선택은 수정 불가
                            }
                            // 선택한 모든 팀의 할당 매체인지 확인
                            const allMediaIds = new Set();
                            selectedTeam.forEach(teamId => {
                              const selectedTeamOption = teamOptions.find(t => t.id === teamId);
                              if (selectedTeamOption?.isParent) {
                                // 부모 팀: 본인 + 모든 자식 팀의 매체 수집
                                (teamMediaAssignments[teamId] || []).forEach(id => allMediaIds.add(id));
                                teamOptions
                                  .filter(t => t.parentId === teamId)
                                  .forEach(childTeam => {
                                    (teamMediaAssignments[childTeam.id] || []).forEach(id => allMediaIds.add(id));
                                  });
                              } else {
                                // 자식 팀: 해당 팀 매체만
                                (teamMediaAssignments[teamId] || []).forEach(id => allMediaIds.add(id));
                              }
                            });
                            return allMediaIds.has(selectedMedia[0]);
                          }

                          // S 등급은 모든 매체 수정 가능 (팀 선택 안 한 경우)
                          if (userRole === "S") {
                            return true;
                          }

                          // A, B, C 등급 (팀 선택 안 한 경우): 할당된 매체만 수정 가능
                          if (selectedMedia[0] === 0) {
                            return false; // 전체 선택은 수정 불가
                          }

                          // teamMediaIds에 선택된 매체가 포함되어 있는지 확인
                          return teamMediaIds.includes(selectedMedia[0]);
                        })();

                        const isEditDisabled =
                          selectedProduct.length !== 1 ||
                          selectedMedia.length !== 1 ||
                          selectedProduct[0] === 0 ||
                          selectedMedia[0] === 0 ||
                          isParentMedia ||
                          !isAssignedMedia ||
                          isOperationStopped ||
                          isOperationStatusLoading;

                        return (
                          <button
                            onClick={() => setIsEditMode(true)}
                            className="edit-btn edit-btn-edit"
                            style={{
                              padding: "0.5rem 1rem",
                              fontSize: "0.875rem",
                              borderRadius: "6px",
                              border: "none",
                              cursor: isEditDisabled ? "not-allowed" : "pointer",
                              backgroundColor: isEditDisabled ? "#9ca3af" : "#3b82f6",
                              color: "white",
                              opacity: isEditDisabled ? 0.6 : 1
                            }}
                            disabled={isEditDisabled}
                            title={
                              isOperationStatusLoading ? "매체 운영 상태를 확인 중입니다..." :
                              selectedProduct[0] === 0 || selectedMedia[0] === 0 ? "Cannot edit while 'select all' is active" :
                              isParentMedia ? "Cannot edit when a parent media channel is selected. Please select a sub-channel" :
                              !isAssignedMedia ? "본인에게 할당된 매체만 수정할 수 있습니다" :
                              selectedProduct.length !== 1 || selectedMedia.length !== 1 ? "제품과 매체를 각각 하나씩 선택해주세요" :
                              isOperationStopped ? "This media channel is paused. Data cannot be edited" : ""
                            }
                          >
                            수정
                          </button>
                        );
                      })()}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="edit-btn edit-btn-primary"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: "#22c55e",
                          color: "white"
                        }}
                      >
                        저장
                      </button>
                      <button
                        onClick={handleCancel}
                        className="edit-btn edit-btn-secondary"
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          backgroundColor: "#cbced1",
                          color: "white"
                        }}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </PermissionWrapper>
            )}
          </PermissionWrapper>
        </div>

        {/* 변경사항 확인 모달 */}
        <ChangesSummaryModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
          manualData={manualData}
          originalData={dailyDetailData}
          userRole={userRole}
          userTeam={userTeam}
        />
      </div>
    </Layout>
  );
}

export default MarketingReport;
